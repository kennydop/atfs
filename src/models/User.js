const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 2,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: {
      type: String,
    },
    salt: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret, options) {
        delete ret.passwordResetToken;
        delete ret.hash;
        delete ret.salt;
        delete ret.updatedAt;
        delete ret.__v;
        delete ret.provider;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
