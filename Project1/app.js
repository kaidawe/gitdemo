"use strict";

//MongoDB connection setup
const { mongoose } = require("mongoose");
const uri =
"mongodb+srv://demo-user2:ZhENtDAE0eFv18ip@atlascluster.6a2legy.mongodb.net/yearbookDB?retryWrites=true&w=majority"

// set up default mongoose connection
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// store a reference to the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));


const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const logger = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cookieParser = require("cookie-parser");

const indexRouter = require("./routers/indexRouter");


const port = process.env.PORT || 3016;
const fileupload = require("express-fileupload");

const app = express();
app.use(fileupload());


app.use(cors({ origin: [/127.0.0.1*/, /localhost*/] }));

app.use(logger("dev"));

app.use(express.static("public"));


// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const session = require("express-session");

const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: uri, 
  collection: "sessions",
});

store.on("error", function (error) {
    console.log(error);
  });


app.use(
    require("express-session")({
      secret: "Once upon a time there was a slay queen",
      resave: true,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 20 },
      store: store,
    })
);

app.use(passport.initialize());
app.use(passport.session());
const User = require("./models/User");
console.log(User);
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set("view engine", "ejs");
// Enable layouts
app.use(expressLayouts);
// Set the default layout
app.set("layout", "./layouts/main-layout");

// Make views folder globally accessible
app.set("views", path.join(__dirname, "views"));


// index routes
app.use(indexRouter);

const userRouter = require("./routers/userRouter");
app.use("/user", userRouter);

// Secure routes
const secureRouter = require("./routers/secureRouter");
app.use("/secure", secureRouter);


// 404
app.get("*", function (req, res) {
  res.status(404).send('<h2 class="error">File Not Found</h2>');
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));