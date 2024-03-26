const User = require("../models/User");
const Token = require("../models/Token");
const ServerError = require("../utils/errors.utils");
const { validateEmail, validatePassword } = require("../utils/validator.utils");
var Mailgen = require("mailgen");
const { sendEmail } = require("../utils/email.utils");
const { generateToken } = require("../utils/tokens.utils");

var hash = require("pbkdf2-password")();

// Authenticate using our plain-object database
async function authenticate(req, res, next) {
  const email = req.body.email;
  const pass = req.body.password;
  try {
    if (!module.parent) console.log("authenticating %s:%s", email, pass);
    // query the db for the given email
    const user = await User.findOne({
      email: email,
    });
    // if the user does not exist, return an error
    if (!user)
      return next(
        new ServerError(`User with email '${email}' does not exist`, 404)
      );

    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
      if (err) return next(err);
      if (hash === user.hash) {
        req.session.regenerate(function () {
          // Store the user's primary key
          // in the session store to be retrieved,
          // or in this case the entire user object
          req.session.user = user;
          req.session.success = `Authenticated as ${user.name}`;
        });
      }
      next(new ServerError("Invalid Password", 401), null);
    });
  } catch (error) {
    req.session.error = "Authentication failed. Please try again.";
    console.log(error);
    next(error);
  }
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
}

// Register a new user
async function registerUser(req, res, next) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Check if the email already exists
    const user = await User.findOne({
      email: email,
    });

    // if the user already exists, return an error
    if (user)
      return next(
        new ServerError(`User with email '${email}' already exists`, 409)
      );

    // if the user does not exist,
    // hash the password and create a new user
    if (!validateEmail(email))
      return next(new ServerError("Invalid email", 400));
    if (!validatePassword(password))
      return next(new ServerError("Invalid password", 400));

    hash({ password: password }, async function (err, pass, salt, hash) {
      if (err) return next(err);

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

      req.session.regenerate(function () {
        req.session.user = newUser;
        req.session.success = `Authenticated as ${newUser.name}`;
      });

      try {
        await sendVerificationEmail(newUser);
      } catch (e) {
        console.log(e);
      }

      res.status(201).send({
        message: "User created successfully",
        user: newUser,
      });
    });
  } catch (error) {
    req.session.error = "Registration failed. Please try again.";
    console.log(error);
    next(error);
  }
}

// generates and sends a verification link to a user's email
// verification link contain a token that expires in 10 minutes
async function sendVerificationEmail(user) {
  const gen_token = generateToken();

  const token = new Token({
    user: user._id,
    token: gen_token,
    // expires in 10 minutes
    expires: Date.now() + 600000,
    type: "email_verification",
  });

  token.save();
  const emailContent = generateVerificationEmailContent(user, gen_token);

  await sendEmail({
    to: user.email,
    subject: "Welcome to ATFS! Please verify your email address",
    html: emailContent,
  });
}

async function resendVerificationEmail(req, res, next) {
  const link_token = req.query.token;

  try {
    const token = await Token.findOne({
      token: link_token,
    });
    if (token === null)
      return res.redirect(`${process.env.CLIENT_URL}/verify-email?error=1`); // Invalid Link

    const user = await User.findById(token.user);
    if (user === null)
      return res.redirect(`${process.env.CLIENT_URL}/verify-email?error=1`); // Invalid Link

    if (user.emailVerified)
      return res.redirect(`${process.env.CLIENT_URL}/verify-email?error=4`); // Email already verified

    try {
      await sendVerificationEmail(user);
    } catch (e) {
      return res.redirect(`${process.env.CLIENT_URL}/verify-email?error=5`); // Error sending email
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

// Generates the HTML content for the verification email
function generateVerificationEmailContent(user, token) {
  const verificationLink = `${process.env.SERVER_URL}/auth/verify?token=${token}`;

  let mailGenerator = new Mailgen({
    theme: "cerberus",
    product: {
      name: "ATFS",
      link: process.env.CLIENT_URL,
    },
  });

  let email = {
    body: {
      name: user.name.split(" ")[0],
      intro: "Welcome to ATFS! We're excited to have you on board.",
      action: {
        instructions:
          "To complete your registration, please verify your email address by clicking the button below:",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: verificationLink,
        },
      },
      outro: "Welcome aboard!",
      signature: false,
    },
  };

  return mailGenerator.generate(email);
}

async function verifyEmail(req, res, next) {
  const link_token = req.query.token;

  try {
    // check if token exists
    const token = await Token.findOne({
      token: link_token,
    });
    if (token === null)
      return res.redirect(`${process.env.CLIENT_URL}/verify-email?error=1`); // Invalid Link
    // check if token is not used
    if (token.used)
      return res.redirect(`${process.env.CLIENT_URL}/verify-email?error=2`); // Link already used
    // check if token is not expired
    if (token.expires < Date.now())
      return res.redirect(`${process.env.CLIENT_URL}/verify-email?error=3`); // Link expired
    // mark token as used
    token.used = true;
    token.save();
    // verify user's email
    await User.findByIdAndUpdate(token.user, { emailVerified: true });
    // render success page
    res.redirect(`${process.env.CLIENT_URL}/verify-email?success=true`);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

module.exports = {
  authenticate,
  restrict,
  registerUser,
  verifyEmail,
  resendVerificationEmail,
};
