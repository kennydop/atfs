var express = require("express");
var router = express.Router();

const authUtils = require("../controllers/auth");

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", function (req, res, next) {
  authUtils.authenticate(
    req.body.username,
    req.body.password,
    function (err, user) {
      if (err) return next(err);
      if (user) {
        // Regenerate session when signing in
        // to prevent fixation
        req.session.regenerate(function () {
          // Store the user's primary key
          // in the session store to be retrieved,
          // or in this case the entire user object
          req.session.user = user;
          req.session.success =
            "Authenticated as " +
            user.name +
            ' click to <a href="/logout">logout</a>. ' +
            ' You may now access <a href="/restricted">/restricted</a>.';
          res.redirect("back");
        });
      } else {
        req.session.error =
          "Authentication failed, please check your " +
          " username and password." +
          ' (use "tj" and "foobar")';
        res.redirect("/login");
      }
    }
  );
});

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.post("/signup", function (req, res, next) {
  authUtils.registerUser(
    req.body.username,
    req.body.password,
    function (err, user) {
      if (err) return next(err);
      if (user) {
        req.session.regenerate(function () {
          req.session.user = user;
          req.session.success = "Registration successful! You can now log in.";
          res.redirect("/");
        });
      } else {
        req.session.error = "Registration failed. Please try again.";
        res.redirect("/signup");
      }
    }
  );
});

router.get("/logout", function (req, res) {
  // destroy the user's session to log them out
  // will be re-created on next request
  req.session.destroy(function () {
    res.redirect("/");
  });
});

/* GET home page. */
router.get("/", authUtils.restrict, function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
