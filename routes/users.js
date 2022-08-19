const router = require("express").Router();
const userController = require("../controllers/user");
const private = require("../middlewares/privateRoute");
const UsersSchema = require("../models/User");
const {
  sendForgotPasswordEmail,
  hashPassword,
  sendVerificationEmail,
} = require("../utils");

router.get("/", userController.All);

router.put("/:email/edit", async (req, res) => {
  const { email } = req.params;

  //   check if any user exists
  const user = await UsersSchema.findOne({ email });

  // if user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user does not exist",
    });
  }

  const credentials = req.body;
  console.log(credentials);

  try {
    await UsersSchema.findOne({ email })
      .updateMany({
        ...credentials,
      })
      .then(() => {
        return res.status(200).json({
          success: true,
          message: "user details updated",
        });
      });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
});

router.delete("/:email/delete", async (req, res) => {
  const { email } = req.params;

  //   check if any user exists
  const user = await UsersSchema.findOne({ email });

  // if user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user does not exist",
    });
  }

  try {
    UsersSchema.deleteOne(user).then((_) => {
      return res.status(200).json({
        success: true,
        message: "user deleted",
      });
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
});

router.post("/:email/block", async (req, res) => {
  const { email } = req.params;

  //   check if any user exists
  const user = await UsersSchema.findOne({ email });

  // if user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user does not exist",
    });
  }

  try {
    user.updateOne({
      isDisabled: true,
    }).then((_) => {
      return res.status(200).json({
        success: true,
        message: "User Account Disabled",
      });
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
});

router.post("/:email/unblock", async (req, res) => {
  const { email } = req.params;

  //   check if any user exists
  const user = await UsersSchema.findOne({ email });

  // if user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user does not exist",
    });
  }

  try {
    user.updateOne({
      isDisabled: false,
    }).then((_) => {
      return res.status(200).json({
        success: true,
        message: "User Account Enabled",
      });
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log(email);

  //   check if any user exists
  const user = await UsersSchema.findOne({ email });

  // if user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user does not exist",
    });
  }

  try {
    // code goes here
    sendForgotPasswordEmail(email);

    return res.send({
      message: "message sent",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  //   check if any user exists
  const user = await UsersSchema.findOne({ email });

  // if user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user does not exist",
    });
  }

  const newHashedPassword = hashPassword(password);

  try {
    await UsersSchema.findOne({ email })
      .updateOne({
        password: newHashedPassword,
      })
      .then(() => {
        return res.status(200).json({
          success: true,
          message: "user details updated",
        });
      });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
});

router.post("/:_id/verify", async (req, res) => {
  const { _id } = req.params;
  const { url, from } = req.body;

  const user = await UsersSchema.findOne({ _id });

  if (!user) {
    res.status(404).json({
      success: false,
      status: 404,
      message: "User not found",
    });

    return;
  }

  try {
    await user.updateOne({
      verified: true,
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "User Verification Successful",
    });

    sendVerificationEmail({
      from: from,
      url: url,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
