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

  // checks the valid moves of chess pieces
  uniqueSocket.on("move", (move) => {
    try {
      // white ke time pe white chalega black ke time pe black
      if(chess.turn() === "w" && uniqueSocket.id === players.white) return;
      if(chess.turn() === "b" && uniqueSocket.id === players.black) return;

      // check if the move is valid / agar valid move hai to game state ko change karna hai!
      const result = chess.move(move);

      if(result) {
        currentPlayer = chess.turn();
        io.emit("move", move); // "move" event ko frontend ke liye emit kiya hai!
        io.emit("boardState", chess.fen()) // board ki nayi state frontend pe bhejega fen matlab chess pieces ki postions like konsa piece kaha hai
      } else {
        console.log("Invalid Move:", move);
        uniqueSocket.emit("invalidMove", move);

      }
    } catch(err) {
      console.log(err);
      uniqueSocket.emit("Invalid move: ", move)
    }
  })
});

server.listen(3000, () => {
  console.log("server is running on port 3000");
});
