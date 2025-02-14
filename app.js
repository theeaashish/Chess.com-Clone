const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

// socket functionality
io.on("connection", (uniqueSocket) => {
  console.log("connected");

  //   uniqueSocket.on("chessboard", () => {
  //     console.log("chessboard connected");
  //     io.emit("chess connection");
  //   })

  //   uniqueSocket.on("disconnect", () => {
  //     console.log("disconnected");
  //   }) // disconnects from server when user leaves the page


  // creates players 
  if (!players.white) {
    players.white = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "b");
  } else {
    uniqueSocket.emit("spectatorRole");
  }

  // deletes or disconnects players from the game

  uniqueSocket.on("disconnect", () => {
    if (uniqueSocket.id === players.white) {
      delete players.white;
    } else if (uniqueSocket.id === players.black) {
      delete players.black;
    }
  });
});

server.listen(3000, () => {
  console.log("server is running on port 3000");
});
