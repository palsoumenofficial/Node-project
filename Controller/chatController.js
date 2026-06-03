const db = require("../db");


exports.getActiveUsers = async (req, res) => {
  try {
    const stake_id = parseInt(req.query.stake_id);
    const result = await db.query(
      `SELECT login_id,user_name
       FROM stake_holder_login
       WHERE active_status = 1`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getChatHistory = async (req, res) => {

  const { senderId, receiverId } = req.params;

  const result = await db.query(
    `
    SELECT *
    FROM user_messages
    WHERE
    (sender_id=$1 AND receiver_id=$2)
    OR
    (sender_id=$2 AND receiver_id=$1)
    ORDER BY created_at
    `,
    [senderId, receiverId]
  );

  res.json(result.rows);

};