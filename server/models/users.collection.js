const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  followedArtists: [
    {
      type: [String],
      default: [],
    }
  ],
  bio: {
    type: String,
    default: '',
  },
  town: {
    type: String,
    default: '',
  },
  socialMediaLinks: {
    instagram: {
      type: String,
      default: '',
    },
    facebook: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
    },
  },
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error("Error validating password: " + error.message);
  }
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
