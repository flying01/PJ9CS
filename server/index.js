const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const { auth } = require("./routes");
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

mongoose
  .connect("mongodb://192.168.100.109:27017/mernDB")
  .then(() => {
    console.log("connected MongoDB...");
  })
  .catch((e) => {
    console.log(e);
  });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/user", authRoute);
//req header 内部没有JWT, 视为未授权
app.use(
  "/api/course",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);
app.listen(8080, () => {
  console.log("Server Running at port 8080...");
});
