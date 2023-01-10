const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log(" auto route request");
  next();
});
//get all users
router.get("/", async (req, res) => {
  try {
    let usersFound = await User.find({})
      // .populate("instructor", ["username", "email"])
      .exec();
    return res.send(usersFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.post("/register", async (req, res) => {
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email });

  if (emailExist) return res.status(400).send("this email is exist");
  let { email, username, password, role } = req.body;
  let newUser = new User({ email, username, password, role });
  try {
    let savedUser = await newUser.save();
    return res.send({
      msg: "save okay",
      savedUser,
    });
  } catch (e) {
    return res.status(500).send("can't save register info..");
  }
});

router.post("/login", async (req, res) => {
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(400).send("htis user is not exist");
  }
  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);
    if (isMatch) {
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "login ok",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send("password is not right");
    }
  });
});
module.exports = router;
