const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");

const indexRouter = require("./src/routes/index.route");
const authRouter = require("./src/routes/auth.route");
const adminRouter = require("./src/routes/admin.route");
const fileRouter = require("./src/routes/file.route");
const errorHandler = require("./src/helpers/errorHandler");

if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  dotenv.config();
}

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Database connected!"))
  .catch((error) => console.log(error));

// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(logger("dev"));
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: process.env.COOKIE_SECRET,
  })
);
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "public")));

// Session-persisted message middleware
app.use(function (req, res, next) {
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = "";
  if (err) res.locals.message = '<p class="msg error">' + err + "</p>";
  if (msg) res.locals.message = '<p class="msg success">' + msg + "</p>";
  next();
});

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/file", fileRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorHandler);

module.exports = app;
