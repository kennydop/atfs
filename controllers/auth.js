// auth.js
var hash = require("pbkdf2-password")();

// dummy db
var users = {
  tj: { name: "tj" },
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)
hash({ password: "foobar" }, function (err, pass, salt, hash) {
  if (err) throw err;
  // store the salt & hash in the "db"
  users.tj.salt = salt;
  users.tj.hash = hash;
});

// Authenticate using our plain-object database
function authenticate(name, pass, fn) {
  if (!module.parent) console.log("authenticating %s:%s", name, pass);
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(null, null);
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
    if (err) return fn(err);
    if (hash === user.hash) return fn(null, user);
    fn(null, null);
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
function registerUser(username, password, fn) {
  // Check if the username already exists
  if (users[username]) {
    return fn(null, null);
  }

  // Hash the password and create a new user
  hash({ password: password }, function (err, pass, salt, hash) {
    if (err) return fn(err);

    const newUser = {
      name: username,
      salt: salt,
      hash: hash,
    };

    users[username] = newUser;
    fn(null, newUser);
  });
}

module.exports = {
  authenticate,
  restrict,
  registerUser,
};
