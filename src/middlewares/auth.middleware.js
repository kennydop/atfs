const User = require("../models/User");
const ServerError = require("../utils/errors.utils");

function restrict(req, res, next) {
  console.log("USER", req.session.user);
  if (req.session.user) {
    next();
  } else {
    next(new ServerError("Unauthorized", 401));
  }
}

async function restrictToAdmin(req, res, next) {
  console.log("USER", req.session.user);
  if (req.session.user) {
    const user = await User.findById(req.session.user._id);
    if (user.isAdmin === true) {
      next();
    } else {
      next(new ServerError("Forbidden", 403));
    }
  } else {
    next(new ServerError("Unauthorized", 401));
  }
}

module.exports = { restrict, restrictToAdmin };
