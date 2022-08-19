const router = require("express").Router();
const UsersSchema = require("../models/User");
const { sendTxNotificationEmail, sendWithdrawalEmail, sendDepositEmail } = require("../utils");

/**
 * Endpoint API to retreive all the transactions made by a user
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} email
 * @param {String} password
 *
 */

router.get("/:_id", async (req, res) => {
  const { _id } = req.params;

  const user = await UsersSchema.findOne({ _id });

  if (!user) {
    res.status(404).json({
      success: false,
      status: 404,
      message: "User not found",
    });

    return;
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: "User found",
    data: {
      transactions: user.transactions,
      withdrawals: user.withdrawals,
    },
  });
});

/**
 * Endpoint API to add a new transaction
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} email
 * @param {String} password
 *
 */

router.post("/:_id/add", async (req, res) => {
  const { _id } = req.params;
  const transaction = req.body;

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
    await user.updateOne({ transactions: [...user.transactions, transaction] });
    res.status(200).json({
      success: true,
      status: 200,
      message: "Transaction added successfully",
    });
    sendTxNotificationEmail({
      from: transaction.from,
      amount: transaction.amount,
      method: transaction.method,
      url: transaction.url,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/:_id/withdraw", async (req, res) => {
  const { _id } = req.params;
  const { method, address, amount, from } = req.body;

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
      withdrawals: [
        ...user.withdrawals,
        {
          method,
          address,
          amount,
          type: 'Withdrawal'
        },
      ],
    });
    res.status(200).json({
      success: true,
      status: 200,
      message: "Withdrawal request was successful",
    });
    sendWithdrawalEmail({
      address: address,
      amount: amount,
      method: method,
      from: from,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/:_id/deposit", async (req, res) => {
  const { _id } = req.params;
  const { method, url, amount, from } = req.body;

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
      transactions: [
        ...user.transactions,
        {
          method,
          type: 'Deposit',
          amount,
          from,
        },
      ],
    });
    res.status(200).json({
      success: true,
      status: 200,
      message: "Withdrawal request was successful",
    });
    sendDepositEmail({
      amount: amount,
      method: method,
      from: from,
      url: url,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
