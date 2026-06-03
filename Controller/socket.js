const onlineUsers = new Map();

module.exports = (io, db) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);


    // ===============================
    // USER ONLINE STATUS
    // ===============================
    socket.on("user_online", (loginId) => {

      socket.loginId = loginId;

      onlineUsers.set(loginId, socket.id);

      io.emit("online_users", Array.from(onlineUsers.keys()));

    });


    // ===============================
    // JOIN PRIVATE ROOM
    // ===============================
    socket.on("join_room", ({ senderId, receiverId }) => {

      const roomId = [senderId, receiverId].sort().join("_");

      socket.join(roomId);

      console.log(`Joined room ${roomId}`);

    });


    // ===============================
    // TYPING INDICATOR
    // ===============================
    socket.on("typing", ({ senderId, receiverId }) => {

      const roomId = [senderId, receiverId].sort().join("_");

      socket.to(roomId).emit("user_typing", senderId);

    });


    // ===============================
    // SEND MESSAGE
    // ===============================
    socket.on("send_message", async (data) => {

      const { senderId, receiverId, message } = data;

      const roomId = [senderId, receiverId].sort().join("_");

      await db.query(
        `INSERT INTO user_messages (sender_id, receiver_id, message)
         VALUES ($1,$2,$3)`,
        [senderId, receiverId, message]
      );

      io.to(roomId).emit("receive_message", {
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        time: new Date()
      });

    });


    // ===============================
    // DISCONNECT USER
    // ===============================
    socket.on("disconnect", () => {

      if (socket.loginId) {

        onlineUsers.delete(socket.loginId);

        io.emit("online_users", Array.from(onlineUsers.keys()));

      }

      console.log("User disconnected");

    });

  });

};