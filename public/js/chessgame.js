// const { Chess } = require("chess.js");

const socket = io(); // Connects frontend with server

const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

if (!boardElement) {
  console.error("Chessboard element not found!");
} else {
  console.log("Chessboard found. Rendering...");
}

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// Render the chessboard
const renderBoard = () => {
  boardElement.innerHTML = ""; // Clear board

  chess.board().forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const square = createSquare(rowIndex, colIndex);

      if (cell) {
        const pieceElement = createPieceElement(cell, rowIndex, colIndex);
        square.appendChild(pieceElement);
      }

      boardElement.appendChild(square);
    });
  });
};

// Create a chessboard square
const createSquare = (rowIndex, colIndex) => {
  const square = document.createElement("div");
  square.classList.add(
    "square",
    (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
  );

  square.dataset.row = rowIndex;
  square.dataset.col = colIndex;

  // Allow dropping of pieces
  square.addEventListener("dragover", (e) => e.preventDefault());
  square.addEventListener("drop", (e) => handleDrop(e, square));

  return square;
};

// Create a chess piece element
const createPieceElement = (piece, rowIndex, colIndex) => {
  const pieceElement = document.createElement("div");
  pieceElement.classList.add("piece", piece.color === "w" ? "white" : "black");

  const pieceImg = document.createElement("img");
  pieceImg.src = getPieceImage(piece);
  pieceImg.classList.add("piece");
  pieceElement.appendChild(pieceImg);

  pieceElement.draggable = playerRole === piece.color; // Only allow player's own pieces to be draggable

  pieceElement.addEventListener("dragstart", (e) => handleDragStart(e, rowIndex, colIndex));
  pieceElement.addEventListener("dragend", handleDragEnd);

  return pieceElement;
};

// Handle drag start
const handleDragStart = (e, row, col) => {
  if (e.target.draggable) {
    draggedPiece = e.target;
    sourceSquare = { row, col };
    e.dataTransfer.setData("text/plain", ""); // Required for drag & drop to work
  }
};

// Handle drag end
const handleDragEnd = () => {
  draggedPiece = null;
  sourceSquare = null;
};

// Handle piece drop
const handleDrop = (e, targetSquare) => {
  e.preventDefault();
  
  if (draggedPiece) {
    const target = {
      row: parseInt(targetSquare.dataset.row),
      col: parseInt(targetSquare.dataset.col),
    };
    handleMove(sourceSquare, target);
  }
};

// Process move
const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };

  const validMove = chess.move(move); // Check if the move is valid

  if (validMove) {
    socket.emit("move", move);
    renderBoard(); // Update UI
  }
};

// Get image path for pieces
const getPieceImage = (piece) => {
  if (!piece) return "";

  const colorPrefix = piece.color === "w" ? "w" : "b";
  const pieceTypes = { p: "P", n: "N", b: "B", r: "R", q: "Q", k: "K" };

  return `/images/${colorPrefix}${pieceTypes[piece.type]}.svg`;
};

// Socket listeners
socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

// Initial board render
renderBoard();
