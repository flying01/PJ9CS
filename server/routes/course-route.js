const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;
router.use((req, res, next) => {
  console.log("course route request....");
  next();
});

//get all courses
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});
//get courses by student
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let coursesFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

//get courses by instructor

router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  // console.log(_instructor_id);
  let coursesFound = await Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// get course by name
router.get("/findByname/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFond = await Course.find({ title: name })
      .populate("instructor", ["email", "username"])
      .exec();
    if (courseFond) return res.send(courseFond);
    else return res.send("Can not found this course");
  } catch (e) {
    return res.status(500).send(e);
  }
});

// get course by id
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFond = await Course.findOne({ _id })
      .populate("instructor", ["username", "email"])
      .exec();
    if (courseFond) return res.send(courseFond);
    else return res.send("Can not found this course");
  } catch (e) {
    return res.status(500).send(e);
  }
});

//new course
router.post("/", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  console.log(req.user);
  if (req.user.isStudent()) {
    return res.status(400).send("only instructor can be submit new course");
  }
  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });

    let savedCourse = await newCourse.save();
    return res.send({
      message: "new Course saved",
      savedCourse,
    });
  } catch (e) {
    return res.status(500).send("cann't submit course");
  }
});

//enroll course (find course by course_id)
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id });
    course.students.push(req.user._id);
    await course.save();
    return res.send("register course sucssece");
  } catch (e) {
    console.log(e);
  }
});

//update course
router.patch("/:_id", async (req, res) => {
  //check data ok.
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let { _id } = req.params;
  //confirm course id exist
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(400).send("not exist this course");
    }
    //must instructor can be doing
    if (courseFound.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({
        message: "course updated ok",
        updatedCourse,
      });
    } else {
      return res.status(403).send("must instrustor owner can be update");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

//delete course
router.delete("/:_id", async (req, res) => {
  //check data ok.
  //let { error } = courseValidation(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  let { _id } = req.params;
  //confirm course id exist
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(400).send("not exist this course");
    }
    //must instructor can be doing
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send("course deleted");
    } else {
      return res.status(403).send("must instrustor owner can be delete");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});
module.exports = router;
