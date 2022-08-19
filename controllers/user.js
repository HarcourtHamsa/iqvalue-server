const User = require("../models/User");

const userController = {
  byId(req, res) {
    const { _id } = req.user;
    // returns a single user
    // based on the passed ID parameter
    User.findOne({ _id }).exec((err, user) => res.json(user));
  },
  All(req, res) {
    // returns all users
    User.find().exec((err, user) => res.json(user));
  },
};

module.exports = userController;
