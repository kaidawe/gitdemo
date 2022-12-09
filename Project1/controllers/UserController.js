const User = require("../models/User");
const passport = require("passport");
const RequestService = require("../services/RequestService");

const UserOps = require("../data/UserOps");
const _userOps = new UserOps();

const path = require("path");
const { where } = require("../models/User");
const dataPath = path.join(__dirname, "../public/");




exports.Register = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  res.render("user/register", { errorMessage: "", user: {}, reqInfo: reqInfo });
};


exports.RegisterUser = async function (req, res) {
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  if (password == passwordConfirm) {

    let path = "";
    if(req.files != null)
    {
      path = dataPath+"/images/"+req.files.photo.name
      req.files.photo.mv(path) 
      path = "/images/"+req.files.photo.name
    }
    else{
      path = null;
    }

    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      interests: req.body.interests.split(","),
      imagePath: path
    });


    User.register(
      new User(newUser),
      req.body.password,
      function (err, account) {
        if (err) {
          let reqInfo = RequestService.reqHelper(req);
          return res.render("user/register", {
            user: newUser,
            errorMessage: err,
            reqInfo: reqInfo,
          });
        }

        
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secure/secure-area");
        });
      }
    );
  } else {
    let reqInfo = RequestService.reqHelper(req);
    res.render("user/register", {
      user: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
      },
      errorMessage: "Passwords do not match.",
      reqInfo: reqInfo,
    });
  }  
};


// Shows login form.
exports.Login = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  let errorMessage = req.query.errorMessage;

  res.render("user/login", {
    user: {},
    errorMessage: errorMessage,
    reqInfo: reqInfo,
  });
};

exports.LoginUser = async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/user/profile",
    failureRedirect: "/user/login?errorMessage=Invalid login.",
  })(req, res, next);
};

  // Log user out and direct them to the login screen.
exports.Logout = (req, res) => {
    req.logout((err) => {
      if (err) {
        console.log("logout error");
        return next(err);
      } else {

        let reqInfo = RequestService.reqHelper(req);
        res.render("user/login", {
          user: {},
          isLoggedIn: false,
          errorMessage: "",
          reqInfo: reqInfo,
        });
      }
    })
};


exports.Index = async function(request, response) {
    let reqInfo = RequestService.reqHelper(request)
    let profileInfo = null;
    let userInfo = await _userOps.getUserByUsername(reqInfo.username);
    
    // GETTING USERNAME FOR AUTH SO WE CAN EITHER SHOW OR NOT SHOW DELETE
    if(request.params.username){
      profileInfo = await _userOps.getUserByUsername(request.params.username)
    }
    else{
      profileInfo = userInfo
    };

    // SEARCH
    if(request.query.searchProfiles){
      profiles = await _userOps.searchProfiles(request.query.searchProfiles);
    }
    else{
      profiles = await _userOps.getAllProfiles();
    };
    
      if (profiles) {
        response.render("user/profiles", {
          profiles: profiles,
          profileInfo: profileInfo,
          reqInfo: reqInfo
        });
      } else {
        response.render("user/profiles", {
          profiles: [],
          profileInfo: profileInfo,
          reqInfo: reqInfo
        });
      };
};





exports.Profile = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);

    if (reqInfo.authenticated) {
      let roles = await _userOps.getRolesByUsername(reqInfo.username);
      let sessionData = req.session;
      sessionData.roles = roles;
      reqInfo.roles = roles;
      let userInfo = await _userOps.getUserByUsername(reqInfo.username);
      let profileInfo = null;
      if(req.params.username){
        profileInfo = await _userOps.getUserByUsername(req.params.username)
      }
      else{
        profileInfo = userInfo
      }


      profiles = await _userOps.getAllProfiles();

      return res.render("user/profile", {
        reqInfo: reqInfo,
        userInfo: userInfo,
        profileInfo: profileInfo,
        profiles: profiles,
        layout: "./layouts/side-bar-layout"
      });
    } else {
      res.redirect(
        "/user/login?errorMessage=You cannot view this page"
      );
    }
  };


exports.DeleteProfileById = async function (request, response) {
  const username = request.params.username;
  const userResult = await _userOps.getUserByUsername(username)
  const profileId = userResult.user._id;

  let reqInfo = RequestService.reqHelper(request, ["Admin"]);
  
  console.log(reqInfo);
  
  if(reqInfo.rolePermitted){
    let deletedProfile = await _userOps.deleteProfile(profileId);
    let profiles = await _userOps.getAllProfiles();
    if (deletedProfile) {
      response.render("user/profiles", {
        profiles: profiles,
        reqInfo: reqInfo
      });
    } else {
      response.redirect(
        "/user/login?errorMessage=You cannot view this page")
    }
  };
};



//GET EDIT
exports.Edit = async function (request, response) {
  const username = request.params.username;
  const profileId = request.params.id;
  console.log(request.params)
  let reqInfo = RequestService.reqHelper(request, ["Admin", "Manager"]);

  let { user } = await _userOps.getUserByUsername(username);

  if(reqInfo.rolePermitted || reqInfo.username == username){
    response.render("user/profile-form", {
      errorMessage: "",
      profile_id: profileId,
      reqInfo: reqInfo,
      user: user
    })
  } else{
      response.redirect(
        "/user/login?errorMessage=You cannot view this page"
      );
    }
  };


// POST EDIT
exports.EditProfile = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);

  const userFirstName = request.body.firstName;
  const userLastName = request.body.lastName;
  const userEmail = request.body.email;
  const userRoles = request.body.roles;
  let path = "";
  let profileInterests = request.body.interests.split(",");
  let username = request.body.username;

  const deleteProfilePic = request.body.deleteProfilePic;


  if(request.files != null)
  {
    path = dataPath+"/images/"+request.files.photo.name
    request.files.photo.mv(path) 
    path = "/images/"+request.files.photo.name
  }
  else{
    path = null;
  }

  let responseObj = await _userOps.updateUserByUserName(username, userFirstName, userLastName, userEmail, profileInterests, userRoles, path, deleteProfilePic);

  profiles = await _userOps.getAllProfiles();

  if (responseObj.errorMsg == "") {
    response.render("user/profile", {
      reqInfo: reqInfo,
      profileInfo: responseObj,
      profiles: profiles,
      layout: "./layouts/side-bar-layout"
    });
  }

  else {
    console.log("An error occured. Item not created.");
    response.render("profile-form", {
      profile: responseObj.obj,
      profiles: profiles,
      errorMessage: responseObj.errorMsg,
      layout: "./layouts/side-bar-layout"
    });
  }
};


exports.Comments = async function(req, res){
  let reqInfo = RequestService.reqHelper(req);

  const comment = {
    commentBody: req.body.comment,
    commentAuthor: reqInfo.username,
  };

  let profileInfo = await _userOps.addCommentToUser(
    comment,
    req.params.username
  );

  if (profileInfo.errorMessage == "") {
    res.render("user/profile", {
      reqInfo: reqInfo,
      profileInfo: profileInfo,
      profiles: profiles,
      layout: "./layouts/side-bar-layout"
    });
  }
  else {
    console.log("An error occured. Item not created.");
    res.render("user/profile", {
      reqInfo: reqInfo,
      profileInfo: profileInfo,
      profiles: profiles,
      layout: "./layouts/side-bar-layout"
    });
  }
}
