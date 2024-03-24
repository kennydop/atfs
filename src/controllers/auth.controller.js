const User = require("../models/User");
const ServerError = require("../utils/errors");
const { validateEmail, validatePassword } = require("../utils/validator");

var hash = require("pbkdf2-password")();

// Authenticate using our plain-object database
async function authenticate(email, pass, fn) {
  if (!module.parent) console.log("authenticating %s:%s", email, pass);
  // query the db for the given email
  const user = await User.findOne({
    email: email,
  });
  // if the user does not exist, return an error
  if (!user)
    return fn(
      new ServerError(`User with email '${email}' does not exist`, 404),
      null
    );

  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
    if (err) return fn(err);
    if (hash === user.hash) return fn(null, user);
    fn(new ServerError("Invalid Password", 401), null);
  });
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Register a new user
async function registerUser(name, email, password, fn) {
  // Check if the email already exists
  const user = await User.findOne({
    email: email,
  });

  // if the user already exists, return an error
  if (user)
    return fn(
      new ServerError(`User with email '${email}' already exists`, 409)
    );

  // if the user does not exist,
  // hash the password and create a new user
  if (!validateEmail(email)) return fn(new ServerError("Invalid email", 400));
  if (!validatePassword(password))
    return fn(new ServerError("Invalid password", 400));

  hash({ password: password }, function (err, pass, salt, hash) {
    if (err) return fn(err);

    const newUser = new User({
      name: name,
      email: email,
      salt: salt,
      hash: hash,
      profilePicture: `https://placeholder-avatars.herokuapp.com/?name=${encodeURIComponent(
        name
      )}&width=200&height=200&color=000&bg=fff&type=pattern`,
    });

    newUser.save();

    fn(null, newUser);
  });
}

module.exports = {
  authenticate,
  restrict,
  registerUser,
};
