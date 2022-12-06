const express = require("express");
const userRouter = express.Router();
const UserController = require("../controllers/UserController");


userRouter.get("/", UserController.Index);

userRouter.get("/register", UserController.Register);
userRouter.post("/register", UserController.RegisterUser);

userRouter.get("/login", UserController.Login);
userRouter.post("/login", UserController.LoginUser);

userRouter.get("/profile", UserController.Profile);
userRouter.get("/profile/:username", UserController.Profile);

userRouter.get("/edit/:username", UserController.Edit);
userRouter.post("/edit/:username", UserController.EditProfile);

userRouter.get("/:username/delete", UserController.DeleteProfileById);
// userRouter.post("/comment/:id", UserController.Comment);

userRouter.get("/logout", UserController.Logout);

module.exports = userRouter;