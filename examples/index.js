let gameId = '98563';
//player 1: O, player 2: X
let player = 2;
let boardApiBaseUrl = "https://6f6qdmvc88.execute-api.us-east-2.amazonaws.com";
let stage = "dev";

// ENUMERATIONS
// A Square can have an X, an O, or be blank. Use this enum to denote the state
let squareStates = {
    BLANK: null,
    O: 0,
    X: 1
};

// 0 for no winner, 1 for O, 2 for X, 3 for Draw
let WIN_STATES = {
    NO_WINNER: 0,
    O_WIN: 1,
    X_WIN: 2,
    DRAW: 3
};

// PREDEFINED CONSTANTS
// Width of the board, in pixels
let boardSize = 300;
// Width of one line, in pixels
let lineWidth = 1;
// Margin, in pixels, between the X or O drawn and the boundaries of the box
let letterMargin = 10;

//GLOBAL VARIABLES
let player1, player2;
let turnCount = 0;
let winState = WIN_STATES.NO_WINNER;

// This is the official starting state of the game. Everything is blank.
let gameState = [
    // Column 0          Column 1            Column 2
    [squareStates.BLANK, squareStates.BLANK, squareStates.BLANK], // Horizontal row 0
    [squareStates.BLANK, squareStates.BLANK, squareStates.BLANK], // Horizontal row 1
    [squareStates.BLANK, squareStates.BLANK, squareStates.BLANK], // Horizontal row 2
];

// Here's a testing game state with some X's and O's filled in.
let testGameState = [
    // Column 0          Column 1            Column 2
    [squareStates.X, squareStates.BLANK, squareStates.O], // Horizontal row 0
    [squareStates.O, squareStates.X, squareStates.BLANK], // Horizontal row 1
    [squareStates.X, squareStates.BLANK, squareStates.BLANK], // Horizontal row 2
];

function saveGameState() {

    let options = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        // So apparently chrome makes the response body opaque if you specify no-cors. Anyways this works without specifying a cors mode. 
        // https://stackoverflow.com/questions/36840396/fetch-gives-an-empty-response-body
        //mode: 'no-cors', // no-cors, *cors, same-origin
        dataType: 'json',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(gameState) // body data type must match "Content-Type" header
    };

    fetch(boardApiBaseUrl + "/" + stage + "/" + "tictactoe" + "/" + gameId, options)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            else {
                return Promise.reject(response);
            }
        })
        // If success, print out the data to the console
        .then(function (data) {
            console.log("Saved Game State, server response: ");
            console.log(data);

            // Now that we have saved off our player's move, hit the server to look for the other player's move
            checkUpdateGameState();
        })
        // Else if this was a failure, log that to the console.
        .catch(function (error) {
            console.warn('Something went wrong.', error);
        });
}

// Uncomment this line to start with the testing game state
//gameState = testGameState;

// OBJECT CONSTRUCTORS 

// Constructor for Player Object
function Player(id, letter) {
    this.id = id;
    this.letter = letter;
}

// Constructor for Square Location object, which is the horizontal and vertical square location
// Upper left square is new SquareLocation(0, 0);
function SquareLocation(horizontalPosition, verticalPosition) {
    this.horizontalPosition = horizontalPosition;
    this.verticalPosition = verticalPosition;
};


// NORMAL FUNCTIONS

// Simple utility function to get the width of the board
function squareWidth() {
    return boardSize / 3;
}

// Utility function to get the contect object for the canvas
function getCanvCtxt() {
    var c = document.getElementById("myCanvas");
    return c.getContext("2d");
}

// Runs on window.onload. Sets up the board, players, and renders the state on the canvas
function setUpGame() {
    setUpBoard();
    makePlayers();
    // TODO: Decide if the state really needs to be rendered here
    renderState();
    checkUpdateGameState();
}

// Draws the Tic-Tac-Toe board itself.
function setUpBoard() {
    let ctx = getCanvCtxt();

    // Draw the lines that make up the board itself
    ctx.moveTo(squareWidth(), 0);
    ctx.lineTo(squareWidth(), 3 * squareWidth());
    ctx.moveTo(10, 10);
    ctx.lineTo(10, 10);
    ctx.moveTo(2 * squareWidth(), 0);
    ctx.lineTo(2 * squareWidth(), 3 * squareWidth());
    ctx.moveTo(0, squareWidth());
    ctx.lineTo(3 * squareWidth(), squareWidth());
    ctx.moveTo(0, 2 * squareWidth());
    ctx.lineTo(3 * squareWidth(), 2 * squareWidth());

    ctx.stroke();
}

function isMyTurn(){
    if ((player == 1 && turnCount % 2 != 0) || (player == 2 && turnCount % 2 == 0)) return true;
    return false;
}

//Processes a click, called from index.html
function processClick(event) {
    //player 1 moves on odd turns, player 2 moves on even turns
    if (isMyTurn()) {
        var c = document.getElementById("myCanvas");
        let ctx = getCanvCtxt();
    
        var rect = c.getBoundingClientRect();
        var posx = event.clientX - rect.left;
        var posy = event.clientY - rect.top;
    
        if (posx < squareWidth()) {
            posx = 0;
        } else if (posx < 2 * squareWidth()) {
            posx = 1;
        } else {
            posx = 2;
        }
    
        if (posy < squareWidth()) {
            posy = 0;
        } else if (posy < 2 * squareWidth()) {
            posy = 1;
        } else {
            posy = 2;
        }
        markSquare(getCurrentPlayer(), new SquareLocation(posx, posy));
    }
    else {
        console.log("It is not your turn, you are player " + player + " and it is turn " + turnCount)
    }
}

function getCurrentPlayer() {
    if (turnCount % 2 === 0)
        return player1;
    else
        return player2;
}

function switchPlayers() {
    turnCount++;
}

/**
 * Given a SquareLocation, draws an X in that square
 * @param {SquareLocation} squareLocation the square in which to draw.
 *  Should be new SquareLocation(1, 1) to draw an X in the middle square
 */
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

/**
 * Given a SquareLocation, draws an O in that square
 * @param {SquareLocation} squareLocation the square in which to draw.
 *  Should be new SquareLocation(0, 2) to draw an O in the upper right square
 */
function drawO(sqLoc) {
    let ctx = getCanvCtxt();

    ctx.moveTo(sqLoc.horizontalPosition + letterMargin, sqLoc.verticalPosition + letterMargin);
    ctx.arc(
        sqLoc.horizontalPosition * squareWidth() + squareWidth() / 2,
        sqLoc.verticalPosition * squareWidth() + squareWidth() / 2,
        (squareWidth() - 2 * letterMargin) / 2, 0, 2 * Math.PI);
    ctx.fill();
}

// Setup function to make the players
function makePlayers() {
    player1 = new Player(1, squareStates.X);
    player2 = new Player(2, squareStates.O);
}

// Given a player, retrieves that player's letter and draws a square there
function markSquare(player, squareLocation) {
    if (winState === WIN_STATES.NO_WINNER
        && gameState[squareLocation.verticalPosition][squareLocation.horizontalPosition] === squareStates.BLANK) {
        gameState[squareLocation.verticalPosition][squareLocation.horizontalPosition] = player.letter;
        saveGameState();
        renderState();
        checkHandleWin();
        switchPlayers();
    }
}

// If a player has won the game, returns that player
function getWinningPlayer() {
    if (winState === WIN_STATES.O_WIN) {
        if (player1.letter === squareStates.O)
            return player1;
        else if (player2.letter === squareStates.O)
            return player2;
    }
    else if (winState === WIN_STATES.X_WIN) {
        if (player1.letter === squareStates.X)
            return player1;
        else if (player2.letter == squareStates.X)
            return player2;
    }
}

// If a win ocurrs, alert the players!
function checkHandleWin() {
    setWinState();
    if (winState === WIN_STATES.O_WIN || winState === WIN_STATES.X_WIN) {
        winningPlayer = getWinningPlayer();
        alert("Player " + winningPlayer.id + " has won!");
    }
    else if (winState === WIN_STATES.DRAW) {
        alert("The match is a draw!");
    }
}

// Call this after any state changes. This will draw the X's and O's on the board according to the state
function renderState() {
    for (let rIndex = 0; rIndex <= 2; rIndex++) {
        for (let cIndex = 0; cIndex <= 2; cIndex++) {
            if (gameState[rIndex][cIndex] === squareStates.X) {
                // cIndex is horizontal position because it's the number of columns over
                // rIndex is vertical position because it's the number of rows down
                drawX(new SquareLocation(cIndex, rIndex));
                //console.log(rIndex + ", " + cIndex + " is X");
            }
            else if (gameState[rIndex][cIndex] === squareStates.O) {
                drawO(new SquareLocation(cIndex, rIndex));
                //console.log(rIndex + ", " + cIndex + " is O");
            }
            else {
                //console.log(rIndex + ", " + cIndex + " is empty");
            }
        }
    }
}

// Call this after any change in the game state to detect a win!
function setWinState() {
    //Wins with top left
    if (gameState[0][0] != null && ((gameState[0][0] == gameState[0][1] && gameState[0][0] == gameState[0][2] && gameState[0][1] == gameState[0][2]) || (gameState[0][0] == gameState[1][1] && gameState[0][0] == gameState[2][2] && gameState[1][1] == gameState[2][2]) || (gameState[0][0] == gameState[1][0] && gameState[0][0] == gameState[2][0] && gameState[1][0] == gameState[2][0]))) {
        if (gameState[0][0] == squareStates.O) {
            winState = WIN_STATES.O_WIN;
        } else {
            winState = WIN_STATES.X_WIN;
        }
        return;
    }
    //Wins overlapping middle
    if (gameState[1][1] != null && ((gameState[1][1] == gameState[0][1] && gameState[1][1] == gameState[2][1] && gameState[0][1] == gameState[2][1]) || (gameState[1][1] == gameState[1][0] && gameState[1][1] == gameState[1][2] && gameState[1][0] == gameState[1][2]) || (gameState[1][1] == gameState[2][0] && gameState[1][1] == gameState[0][2] && gameState[2][0] == gameState[0][2]))) {
        if (gameState[1][1] == squareStates.O) {
            winState = WIN_STATES.O_WIN;
        } else {
            winState = WIN_STATES.X_WIN;
        }
        return;
    }
    //Wins overlapping bottom right
    if (gameState[2][2] != null && ((gameState[0][2] == gameState[1][2] && gameState[0][2] == gameState[2][2] && gameState[1][2] == gameState[2][2]) || (gameState[2][0] == gameState[2][1] && gameState[2][0] == gameState[2][2] && gameState[2][0] == gameState[2][2]))) {
        if (gameState[2][2] == squareStates.O) {
            winState = WIN_STATES.O_WIN;
        } else {
            winState = WIN_STATES.X_WIN;
        }
        return;
    }
    //Checks for draw
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (gameState[i][j] === squareStates.BLANK) {
                return;
            }
        }
    }
    winState = WIN_STATES.DRAW;
}


// Sets up the options and calls the function to check for and update the game state
function checkUpdateGameState() {
    let options = {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        // So apparently chrome makes the response body opaque if you specify no-cors. Anyways this works without specifying a cors mode. 
        // https://stackoverflow.com/questions/36840396/fetch-gives-an-empty-response-body
        //mode: 'no-cors', // no-cors, *cors, same-origin
        dataType: 'text',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        //body: JSON.stringify(data) // body data type must match "Content-Type" header
    };

    // Call the initial function
    fetch(boardApiBaseUrl + "/" + stage + "/tictactoe" + "/" + gameId + "/", options)
        // When we get a response back from the server, convert it to json
        .then(
            function(response) {
                return response.json()
            }
        )
        // When we are done converting to json, do something with it
        .then((responseAsJson) => {
            boardString = responseAsJson.Item.Board.S;
            boardFromServer = JSON.parse(boardString);

            console.log("Fetched board");
            console.log(boardFromServer);

            // Process the response
            if (compareStates(gameState, boardFromServer)) {
                setTimeout(checkUpdateGameState, 1000)
                console.log("board was the same");
            }
            else {
                console.log("board was different");
                
                // Update and rerender the board
                gameState = boardFromServer;
                renderState();
                
                // player switch to be your turn
                switchPlayers();
                
                if (!isMyTurn()) {
                    setTimeout(checkUpdateGameState, 1000);
                }
                
            }
        });
}

function compareStates(gameState, boardFromServer) {
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        for (let colIndex = 0; colIndex < 3; colIndex++) {
            if (gameState[rowIndex][colIndex] !== boardFromServer[rowIndex][colIndex]) {
                return false;
            }
        }
    }
    return true;
}

// When the page is loaded, sets up the game
window.onload = setUpGame();
