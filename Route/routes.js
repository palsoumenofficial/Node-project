const express = require("express");
const router = express.Router();

//Routes Require Start
const { users,approveReject } = require("../Controller/users");
const { loginUser } = require("../Controller/login");
const { getActiveUsers, getChatHistory } = require("../Controller/chatController");

//Route Deifne(GET/POST) Start
router.get("/users", users);
router.post("/approveReject", approveReject);
router.get("/loginUser", loginUser);

router.get("/active-users", getActiveUsers);
router.get("/chat-history/:senderId/:receiverId", getChatHistory);

module.exports = router;