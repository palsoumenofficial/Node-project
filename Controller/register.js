const express = require("express");
const pool = require("../db"); // pg Pool connection

const router = express.Router();

router.post("/register", async (req, res) => {

  try {

    const { role, name, mobile, email, password } = req.body;

    // VALIDATION
    if (!role || !name || !mobile || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // ROLE MAPPING
    let stake_type;

    if (role === "Admin") {
      stake_type = 2;
    } else if (role === "User") {
      stake_type = 3;
    } else {
      return res.status(400).json({
        message: "Invalid role selected"
      });
    }

    // CHECK DUPLICATE EMAIL OR MOBILE
    const existingUser = await pool.query(
      `SELECT login_id 
       FROM stake_holder_login 
       WHERE login_email = $1 OR mobile_no = $2`,
      [email, mobile]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email or Mobile already exists"
      });
    }

    // INSERT DATA
    const insertQuery = `
      INSERT INTO stake_holder_login
      (login_email, user_name, mobile_no, password, stake_id, created_at, active_status, login_status)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
      RETURNING login_id
    `;

    const result = await pool.query(insertQuery, [
      email,
      name,
      mobile,
      password,
      stake_type,
      0,
      0
    ]);

    res.status(200).json({
      message: "User registered successfully ✅",
      login_id: result.rows[0].login_id
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;