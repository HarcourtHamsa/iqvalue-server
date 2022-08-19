const router = require("express").Router();
const UsersSchema = require("../models/User");
const { loginValidator, registerValidator } = require("../validator");
const {
  hashPassword,
  compareHashedPassword,
  createToken,
  sendEmail,
} = require("../utils");

/**
 * Endpoint API for users to create accounts
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} email
 * @param {String} password
 *
 */

router.post("/register", async (req, res) => {
  const { error } = registerValidator(req.body);
  const { firstName, lastName, email, password, country } = req.body;

  // error handling from JOI
  if (error) {
    res.status(400).json({ success: false, message: error.details[0].message });
    return;
  }

  //   check if any user has that username
  const v = await UsersSchema.findOne({ email });

  // if user exists
  if (v) {
    res.status(400).json({
      success: false,
      message: "Email address is already taken",
    });

    return;
  }

  await UsersSchema.create({
    firstName,
    lastName,
    email,
    password: hashPassword(password),
    country,
    amountDeposited: 0,
    profit: 0,
    balance: 0,
    referalBonus: 0,
    transactions: [],
    withdrawals: [],
    verified: false,
    isDisabled: false,
  })
    .then((data) => {
      return res.send(data);
    })
    .catch((error) => {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    });
});

/**
 * Endpoint API for users to login
 * @param {String} email
 * @param {String} password
 *
 */
router.post("/login", async (req, res) => {
  const { error } = loginValidator(req.body);
  const { email, password } = req.body;

  // error handling from JOI
  if (error) {
    res.status(400).json({ success: false, message: error.details[0].message });
    return;
  }

  try {
    //   check if any user has that username
    const v = await UsersSchema.findOne({ email });

    // if user exists but password is incorrect
    if (!v) {
      res.status(404).json({
        success: false,
        message: "user doesn't exist",
      });
    }

    // check if account is disabled
    if (v.isDisabled) {
      res.status(401).json({
        success: false,
        message: "Account is disabled",
      });

      return;
    }

    if (!compareHashedPassword(v.password, password)) {
      res.status(404).json({
        success: false,
        message: "invalid password",
      });
    }

    // create a token for the user
    const token = createToken({ _id: v._id });
    res.json({
      success: true,
      message: "login successful",
      token: token,
      data: v,
    });
  } catch (error) {
    // error handling from Mongoose
    console.log(error);
  }
});

module.exports = router;
