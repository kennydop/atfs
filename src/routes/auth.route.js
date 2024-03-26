var express = require("express");
var router = express.Router();

const {
  authenticate,
  registerUser,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/auth.controller");

router.post("/login", authenticate);

router.post("/signup", registerUser);

router.get("/logout", function (req, res) {
  // destroy the user's session to log them out
  // will be re-created on next request
  req.session.destroy(function () {
    res.redirect("/");
  });
});

router.get("/resend-verification-email", resendVerificationEmail);

router.get("/verify", verifyEmail);

module.exports = router;
