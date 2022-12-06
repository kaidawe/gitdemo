const mongoose = require("mongoose");
const passportLocalmongoose = require("passport-local-mongoose");

const commentSchema = mongoose.Schema({
  commentAuthor: String,
  commentBody: String
})
// User Schema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
  },
  email: {
    type: String,
    index: true,
  },
  password: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  interests: {
    type: Array
  },
  roles: {
    type: Array,
  },
  comments: [
    commentSchema
  ],
  imagePath: {
    type: String,
  },
});

userSchema.plugin(passportLocalmongoose);
// Pass the Schema into Mongoose to use as our model
const User = mongoose.model("User", userSchema);

module.exports = User;