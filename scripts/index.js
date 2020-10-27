
let boardSize = 300;
let lineWidth = 1;
let letterMargin = 10;

function squareWidth() {
    return boardSize/3;
}

let squareStates = {
    BLANK: null, 
    O: 0,
    X: 1
};

let gameState = [
    // Column 0          Column 1            Column 2
    [squareStates.BLANK, squareStates.BLANK, squareStates.BLANK], // Horizontal row 0
    [squareStates.BLANK, squareStates.BLANK, squareStates.BLANK], // Horizontal row 1
    [squareStates.BLANK, squareStates.BLANK, squareStates.BLANK], // Horizontal row 2
];

let testGameState = [
    // Column 0          Column 1            Column 2
    [squareStates.X, squareStates.BLANK, squareStates.O], // Horizontal row 0
    [squareStates.O, squareStates.X, squareStates.BLANK], // Horizontal row 1
    [squareStates.X, squareStates.BLANK, squareStates.BLANK], // Horizontal row 2
];

//gameState = testGameState;

let player1, player2;

function Player(id, letter) {
    this.id = id;
    this.letter = letter;
}

function SquareLocation(horizontalPosition, verticalPosition) {
    this.horizontalPosition = horizontalPosition;
    this.verticalPosition = verticalPosition;
};

function getCanvCtxt() {
    var c = document.getElementById("myCanvas");
    return c.getContext("2d");
}

function setUpGame() {
    setUpBoard();
    makePlayers();
    // TODO: Decide if the state really needs to be rendered here
    renderState();
}

function setUpBoard() {
    let ctx = getCanvCtxt();

    ctx.lineWidth = 1;

    ctx.moveTo(100, 0);
    ctx.lineTo(100, 300);
    ctx.moveTo(10,10);
    ctx.lineTo(10,10);
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 300);
    ctx.moveTo(0, 100);
    ctx.lineTo(300, 100);
    ctx.moveTo(0, 200);
    ctx.lineTo(300, 200);
    ctx.stroke();
}

function drawX(squareLocation) {
    let ctx = getCanvCtxt();

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(
        squareLocation.horizontalPosition * squareWidth() + letterMargin,
        squareLocation.verticalPosition * squareWidth() + letterMargin
        );
    ctx.lineTo(
        squareLocation.horizontalPosition * squareWidth() + squareWidth() - letterMargin,
        squareLocation.verticalPosition * squareWidth() + squareWidth() - letterMargin
        );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
        squareLocation.horizontalPosition * squareWidth() + squareWidth() - letterMargin,
        squareLocation.verticalPosition * squareWidth() + letterMargin
        );
    ctx.lineTo(
        squareLocation.horizontalPosition * squareWidth() + letterMargin,
        squareLocation.verticalPosition * squareWidth() + squareWidth() - letterMargin
        );
    ctx.stroke();
}

function drawO(sqLoc) {
    let ctx = getCanvCtxt();

    ctx.moveTo(sqLoc.horizontalPosition + letterMargin, sqLoc.verticalPosition + letterMargin);
    ctx.arc(
        sqLoc.horizontalPosition * squareWidth() + squareWidth()/2,
        sqLoc.verticalPosition * squareWidth() + squareWidth()/2, 
        (squareWidth() - 2 * letterMargin)/2, 0, 2 * Math.PI);
    ctx.fill();
}

function makePlayers() {
    player1 = new Player(1, squareStates.X);
    player2 = new Player(2, squareStates.O);
}

function markSquare(player, squareLocation) {
    gameState[squareLocation.horizontalPosition][squareLocation.verticalPosition] = player.letter;
    renderState();
}

function renderState() {
    for (let rIndex = 0; rIndex <= 2; rIndex++) {
        for (let cIndex = 0; cIndex <= 2; cIndex++) {
            if (gameState[rIndex][cIndex] === squareStates.X) {
                // cIndex is horizontal position because it's the number of columns over
                // rIndex is vertical position because it's the number of rows down
                drawX(new SquareLocation(cIndex, rIndex));
                console.log(rIndex + ", " + cIndex + " is X");
            }
            else if (gameState[rIndex][cIndex] === squareStates.O) {
                drawO(new SquareLocation(cIndex, rIndex));
                console.log(rIndex + ", " + cIndex + " is O");
            }
            else {
                console.log(rIndex + ", " + cIndex + " is empty");
            }
        }
    }
}

window.onload = setUpGame();
