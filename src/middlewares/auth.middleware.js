const User = require("../models/User");
const ServerError = require("../utils/errors.utils");
const jwt = require("jsonwebtoken");

async function restrict(req, res, next) {
  const token = await req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.COOKIE_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      next(new ServerError("Unauthorized", 401));
    }

    req.session.user = user;
    next();
  } catch (error) {
    next(new ServerError("Unauthorized", 401));
  }
}

async function restrictToAdmin(req, res, next) {
  const token = await req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.COOKIE_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      next(new ServerError("Unauthorized", 401));
    }
    if (user.isAdmin !== true) {
      next(new ServerError("Unauthorized", 401));
    }

    req.session.user = user;
    next();
  } catch (error) {
    next(new ServerError("Unauthorized", 401));
  }
}

module.exports = { restrict, restrictToAdmin };
