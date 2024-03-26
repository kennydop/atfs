var express = require("express");
const { upload } = require("../controllers/file.controller");
var router = express.Router();
const { restrictToAdmin } = require("../middlewares/auth.middleware");

// uploads a documents with info
router.post("/upload", /*restrictToAdmin,*/ upload);

module.exports = router;
