var express = require("express");
var router = express.Router();

const {
  authenticate,
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
} = require("../controllers/auth.controller");
const { restrict, decodeUser } = require("../middlewares/auth.middleware");
const ServerError = require("../utils/errors.utils");

router.post("/login", authenticate);

router.post("/signup", registerUser);

router.get("/logout", function (req, res) {
  // destroy the user's session to log them out
  // will be re-created on next request
  req.session.destroy(function () {
    res.redirect("/");
  });
});

router.get("/send-verification-email", decodeUser, function (req, res, next) {
  try {
    if (req.session.user) {
      sendVerificationEmail(req.session.user);
      res.json({
        success: true,
        message: "Verification email sent!",
      });
    } else if (req.query.token) {
      console.log("resending verification email");
      resendVerificationEmail(req, res, next);
    } else {
      next(new ServerError("Unauthorized", 401));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/verify", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

module.exports = router;
