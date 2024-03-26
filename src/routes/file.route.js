var express = require("express");
const { download, emailFile } = require("../controllers/file.controller");
var router = express.Router();

// records a file download
router.patch("/:id/download", download);

// send a file to an email
router.post("/:id/email", emailFile);

module.exports = router;
