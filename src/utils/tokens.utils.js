const crypto = require("crypto");

// Generates a token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  generateToken,
};
