const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const db = require("./db");

const Routes = require("./route/routes");
const { loginUser, router } = require("./Controller/login");
const registerRoute = require("./Controller/register");
// const chatRoutes = require("./route/chatRoutes");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.use("/api", Routes);
app.post("/api/loginUser", loginUser);
app.use("/api", router);
app.use("/api", registerRoute);

// CHAT ROUTES
app.use("/api", Routes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

require("./Controller/socket")(io, db);

server.listen(3000, () => {
  console.log("Server running on 3000");
});