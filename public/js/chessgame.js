// const { Chess } = require("chess.js");

const socket = io(); // this connects the frontend with the server

// socket.emit("chessboard");
// socket.on("chess connection", () => {
//     console.log("chess connection established");
// })

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

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = ""; // board should be empty

  board.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
      // Create a square element for each piece
      const square = document.createElement("div");
      square.classList.add(
        "square",
        (rowIndex + columnIndex) % 2 === 0 ? "light" : "dark"
      ); // it creates chess board pattern like dark and light pattern on the chess board!

      square.dataset.row = rowIndex;
      square.dataset.col = columnIndex;

      if (column) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          column.color === "w" ? "white" : "black"
        );

        const pieceImg = document.createElement("img");
        pieceImg.src = getPieceUnicode(column);
        pieceImg.classList.add("piece");
        pieceElement.appendChild(pieceImg);

        // pieceElement.innerHTML = getPieceUnicode(column);
        pieceElement.draggable = playerRole === column.color; // only the player's pieces are draggable

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: columnIndex };
            e.dataTransfer.setData("text/plain", ""); // Required for drag and drop to work
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null; // reset the dragged piece and source square when the drag ends
        });

        square.appendChild(pieceElement); // append the piece to the square
      }

      square.addEventListener("dragover", (e) => {
        e.preventDefault(); // prevent the default drag and drop behavior
      });

      square.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(square.dataset.row),
            col: parseInt(square.dataset.col),
          };
          handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(square); // append the square to the board
    });
  });
};

const handleMove = () => {};


const getPieceUnicode = (piece) => {
    if (!piece) return "";

    const colorPrefix = piece.color === "w" ? "w" : "b"; // Determine color prefix

    const unicodePieces = {
        p: "P.svg", n: "N.svg", b: "B.svg", r: "R.svg", q: "Q.svg", k: "K.svg"
    };

    return `/images/${colorPrefix}${unicodePieces[piece.type] || ""}`; 
};


renderBoard();