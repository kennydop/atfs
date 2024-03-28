const File = require("../models/File");
const User = require("../models/User");
const ServerError = require("../utils/errors.utils");
const { sendEmail } = require("../utils/email.utils");
const Mailgen = require("mailgen");

// records a file upload
async function upload(req, res, next) {
  try {
    const { uploadedBy, title, description, file, type, size } = req.body;
    const fileUpload = new File({
      uploadedBy,
      title,
      description,
      file,
      type,
      size,
    });
    await fileUpload.save();
    res.status(201).send({
      message: "File upload recorded",
      file: fileUpload,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

// records a file download
async function download(req, res, next) {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) {
      return next(new ServerError("File not found", 404));
    }
    file.downloads += 1;
    await file.save();
    res.status(200).send({
      message: "File download recorded",
      file,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function emailFile(req, res, next) {
  try {
    const { id } = req.params;
    const { email, uuid } = req.body;
    const uid = uuid ?? req.session.user._id;
    const file = await File.findById(id);
    if (!file) {
      return next(new ServerError("File not found", 404));
    }

    const fromUser = await User.findById(uid);
    let toUser = await User.findOne({ email });
    if (!fromUser) {
      return next(new ServerError("Forbidden", 403));
    }
    if (!toUser) {
      toUser = {
        name: email.split("@")[0],
      };
    }

    const sendingToSelf = fromUser.email === email;

    // const attachments = [
    //   {
    //     filename: file.title,
    //     path: file.file,
    //     cid: id,
    //   },
    // ];
    await sendEmail({
      to: email,
      subject: sendingToSelf
        ? "Your file"
        : `${fromUser.name} has shared a file with you`,
      html: generateFileEmailEmailContent(
        fromUser,
        toUser,
        file,
        sendingToSelf
      ),
      // attachments,
    });
    file.emailsSent += 1;
    await file.save();
    res.status(200).send({
      message: "File sent to email",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

function generateFileEmailEmailContent(fromUser, toUser, file, sendingToSelf) {
  let mailGenerator = new Mailgen({
    theme: "cerberus",
    product: {
      name: "ATFS",
      link: process.env.CLIENT_URL,
    },
  });

  let email = {
    body: {
      name: toUser.name.split(" ")[0],
      intro: sendingToSelf
        ? "Here is your file:"
        : `${fromUser.name.split(" ")[0]} has shared a file with you.`,
      action: {
        instructions: "To download the file, click the button below:",
        button: {
          color: "#836FFF",
          text: "Download file",
          link: `${file.file}`,
        },
      },
      signature: false,
    },
  };

  return mailGenerator.generate(email);
}

// fetches files in batches
async function fetchFiles(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const files = await File.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await File.countDocuments();
    res.status(200).send({
      files,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

// searches for files
async function searchFiles(req, res, next) {
  try {
    const { query } = req.query;
    const files = await File.find({
      $text: { $search: query },
    });
    res.status(200).send({
      files,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

module.exports = {
  upload,
  download,
  emailFile,
  fetchFiles,
  searchFiles,
};
