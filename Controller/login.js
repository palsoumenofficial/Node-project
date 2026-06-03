const pool = require("../db");
const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
require("dotenv").config();

// Temporary OTP storage (Use Redis in production)
const otpStore = {};

// Generate 6-digit OTP
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ==============================
// MAIL CONFIGURATION
// ==============================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// ==============================
// 1️⃣ LOGIN + SEND OTP API
// ==============================
const loginUser = async (req, res) => {

  try {

    const { loginEmail, password } = req.body;

    if (!loginEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required ❌"
      });
    }

    const result = await pool.query(
      `SELECT login_id, user_name, login_email, mobile_no, stake_id
       FROM stake_holder_login
       WHERE active_status = 1
       AND login_email = $1
       AND password = $2`,
      [loginEmail, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Username or Password ❌"
      });
    }

    const user = result.rows[0];
    const email = user.login_email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email missing ❌"
      });
    }

    const otp = generateOTP();

    // Store OTP + user data
    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
      user
    };

    // console.log("Generated OTP:", otp);

    await transporter.sendMail({
      from: `"Soumen Official" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Login OTP",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`
    });

    // INSERT OTP LOG
    const insertOtp = `
      INSERT INTO otp_sent_log
      (login_id, login_email, mobile_no, otp, created_on)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING login_id
    `;
    const values = await pool.query(insertOtp, [
      user.login_id,
      user.login_email,
      user.mobile_no,
      otp
    ]);
    
    res.json({
      success: true,
      message: "OTP sent successfully 📩",
      loginEmail: email
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Database error ❌"
    });

  }
};



// ==============================
// 2️⃣ VERIFY OTP API
// ==============================
router.post("/verifyOtp", (req, res) => {

  try {

    const { loginEmail, otp } = req.body;

    if (!loginEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required ❌"
      });
    }

    const storedOtpData = otpStore[loginEmail];

    if (!storedOtpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found ❌"
      });
    }

    if (Date.now() > storedOtpData.expires) {

      delete otpStore[loginEmail];

      return res.status(400).json({
        success: false,
        message: "OTP expired ⏳"
      });
    }

    if (storedOtpData.otp !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP ❌"
      });
    }

    // Extract user data
    const userData = storedOtpData.user;

    // Delete OTP after success
    delete otpStore[loginEmail];

    res.json({
      success: true,
      message: "OTP verified successfully ✅",
      user: userData
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error ❌"
    });

  }

});


// ==============================
// EXPORT ROUTES
// ==============================
module.exports = {
  loginUser,
  router
};