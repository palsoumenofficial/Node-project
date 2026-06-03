const pool = require("../db");

// 1. GET all Users
const users = async (req, res) => {
  const stake_id = parseInt(req.query.stake_id);
  // console.log(stake_id);
  try {
    const result = await pool.query(
      `SELECT login_id, user_name, login_email, mobile_no, stake_id, created_at, active_status, login_status
       FROM stake_holder_login
       WHERE stake_id = $1
       ORDER BY created_at ASC`,
      [stake_id + 1]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// 2.Approve/Reject
const approveReject = async(req,res) => {
  const action = req.body.action;
  const login_id = parseInt(req.body.id);
  
  try{
    if(action == "approve"){
      const result = await pool.query(
      `UPDATE stake_holder_login SET login_status = 1, active_status = 1
       WHERE login_id = $1`,
      [login_id]
    );
    }else if(action == "reject"){
      const result = await pool.query(
      `UPDATE stake_holder_login SET login_status = 0
       WHERE login_id = $1`,
      [login_id]
    );
    }else if(action == "active"){
      const result = await pool.query(
      `UPDATE stake_holder_login SET  active_status = 1
       WHERE login_id = $1`,
      [login_id]
    );
    }else if(action == "deactive"){
      const result = await pool.query(
      `UPDATE stake_holder_login SET active_status = 0
       WHERE login_id = $1`,
      [login_id]
    );
    }else{

    }

    res.status(200).json({
      success: true,
      message: "User approved successfully ✅"
    });
  }catch(err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  users,
  approveReject
};