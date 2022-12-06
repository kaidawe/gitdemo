const User = require("../models/User");

class UserOps {
  // Constructor
  UserOps() {}

  async getUserByEmail(email) {
    let user = await User.findOne({ email: email });
    if (user) {
      const response = { obj: user, errorMessage: "" };
      return response;
    } else {
      return null;
    }
  };


  async getUserByUsername(username) {
    let user = await User.findOne(
      { username: username },
      { _id: 1, username: 1, email: 1, firstName: 1, lastName: 1, interests: 1, roles: 1, imagePath: 1}
    );

    if (user) {

      const response = { user: user, errorMessage: "" };
      return response;
    } else {
      return null;
    }
  };


  async getRolesByUsername(username) {
    let user = await User.findOne({ username: username }, { _id: 1, roles: 1 });
    if (user.roles) {
      return user.roles;
    } else {
      return [];
    }
  }


  async getAllProfiles() {
    let users = await User.find().sort({ username: 1 });
    console.log(users)
    return users;
  };

  async searchProfiles(string) {
    const filter = {$or:[{firstName: {$regex: string, $options: "i"}},{lastName: {$regex: string, $options: "i"}}, {email:{$regex: string, $options: "i"}}]};
    let users = await User.find(filter).sort({ username: 1 });
    return users;
  };

  async deleteProfile(id) {
    console.log(`deleting user`);
    let result = await User.findByIdAndDelete(id);
    console.log(result);
    return result;
  };

  async updateUserByUserName(userName, userFirstName, lastName, email, interests, roles, imagePath) {
    console.log(`updating user`)

    const person = await this.getUserByUsername(userName)
    console.log(person);


    person.user.firstName = userFirstName;
    person.user.interests = interests;
    person.user.imagePath = imagePath;
    person.user.lastName = lastName;
    person.user.email = email;
    person.user.roles = roles;
  

    let result = await person.user.save();
    console.log("updated profile: ", result);

    return {
      user: result,
      errorMsg: "",
    };
  }
};


module.exports = UserOps;