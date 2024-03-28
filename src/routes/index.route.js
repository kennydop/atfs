var express = require("express");
const { fetchFiles, searchFiles } = require("../controllers/file.controller");
const { restrict } = require("../middlewares/auth.middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "ATFS" });
});

router.get("/me", restrict, function (req, res, next) {
  res.json({
    success: true,
    user: req.session.user,
  });
});

router.get("/feed", fetchFiles);

router.get("/search", searchFiles);

module.exports = router;
