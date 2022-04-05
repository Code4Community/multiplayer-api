// ------------------------------------------------------------------------------------------
// ---------------------------------- GAME LOGIC -------------------------------------
// ------------------------------------------------------------------------------------------

// Width of the board, in pixels
const BOARD_SIZE = 300;
// Width of one line, in pixels
const LINE_WIDTH = 1;
// Margin, in pixels, between the X or O drawn and the boundaries of the box
const LETTER_MARGIN = 10;

// A Square can have an X, an O, or be blank. Use this enum to denote the state
const SQUARE_STATES = {
    BLANK: null,
    O: 0,
    X: 1
};

// 0 for no winner, 1 for O, 2 for X, 3 for Draw
const WIN_STATES = {
    NO_WINNER: 0,
    O_WIN: 1,
    X_WIN: 2,
    DRAW: 3
};

let gameId = '';
//player 1: O, player 2: X
let player;
let hasLoaded = false;
let player1, player2;
let turnCount = 0;
let winState = WIN_STATES.NO_WINNER;


// This is the official starting state of the game. Everything is blank.
function getStartingState() {
    return [
        // Column 0          Column 1            Column 2
        [SQUARE_STATES.BLANK, SQUARE_STATES.BLANK, SQUARE_STATES.BLANK], // Horizontal row 0
        [SQUARE_STATES.BLANK, SQUARE_STATES.BLANK, SQUARE_STATES.BLANK], // Horizontal row 1
        [SQUARE_STATES.BLANK, SQUARE_STATES.BLANK, SQUARE_STATES.BLANK], // Horizontal row 2
    ];
}

let gameState = getStartingState();

class Player {
    constructor(id, letter) {
        this.id = id;
        this.letter = letter;
    }
}

// Upper left square is new SquareLocation(0, 0);
class SquareLocation {
    constructor(horizontalPosition, verticalPosition) {
        this.horizontalPosition = horizontalPosition;
        this.verticalPosition = verticalPosition;
    }
};


// NORMAL FUNCTIONS

// Simple utility function to get the width of the board
function squareWidth() {
    return BOARD_SIZE / 3;
}

// Utility function to get the contect object for the canvas
function getCanvasContext() {
    let c = document.getElementById("myCanvas");
    return c.getContext("2d");
}

// Draws the Tic-Tac-Toe board itself.
function setUpBoard() {
    let ctx = getCanvasContext();

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

function isMyTurn() {
    if ((player == 1 && turnCount % 2 != 0) || (player == 2 && turnCount % 2 == 0)) return true;
    return false;
}

//Processes a click, called from index.html
function processClick(event) {
    //player 1 moves on odd turns, player 2 moves on even turns
    if (isMyTurn()) {
        let c = document.getElementById("myCanvas");
        let ctx = getCanvasContext();

        let rect = c.getBoundingClientRect();
        let posx = event.clientX - rect.left;
        let posy = event.clientY - rect.top;

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
    let ctx = getCanvasContext();

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(
        squareLocation.horizontalPosition * squareWidth() + LETTER_MARGIN,
        squareLocation.verticalPosition * squareWidth() + LETTER_MARGIN
    );
    ctx.lineTo(
        squareLocation.horizontalPosition * squareWidth() + squareWidth() - LETTER_MARGIN,
        squareLocation.verticalPosition * squareWidth() + squareWidth() - LETTER_MARGIN
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
        squareLocation.horizontalPosition * squareWidth() + squareWidth() - LETTER_MARGIN,
        squareLocation.verticalPosition * squareWidth() + LETTER_MARGIN
    );
    ctx.lineTo(
        squareLocation.horizontalPosition * squareWidth() + LETTER_MARGIN,
        squareLocation.verticalPosition * squareWidth() + squareWidth() - LETTER_MARGIN
    );
    ctx.stroke();
}

/**
 * Given a SquareLocation, draws an O in that square
 * @param {SquareLocation} squareLocation the square in which to draw.
 *  Should be new SquareLocation(0, 2) to draw an O in the upper right square
 */
function drawO(sqLoc) {
    let ctx = getCanvasContext();

    ctx.moveTo(sqLoc.horizontalPosition + LETTER_MARGIN, sqLoc.verticalPosition + LETTER_MARGIN);
    ctx.arc(
        sqLoc.horizontalPosition * squareWidth() + squareWidth() / 2,
        sqLoc.verticalPosition * squareWidth() + squareWidth() / 2,
        (squareWidth() - 2 * LETTER_MARGIN) / 2, 0, 2 * Math.PI);
    ctx.fill();
}

// Setup function to make the players
function makePlayers() {
    player1 = new Player(1, SQUARE_STATES.X);
    player2 = new Player(2, SQUARE_STATES.O);
}

// Given a player, retrieves that player's letter and draws a square there
function markSquare(player, squareLocation) {
    if (winState === WIN_STATES.NO_WINNER
        && gameState[squareLocation.verticalPosition][squareLocation.horizontalPosition] === SQUARE_STATES.BLANK) {
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
        if (player1.letter === SQUARE_STATES.O)
            return player1;
        else if (player2.letter === SQUARE_STATES.O)
            return player2;
    }
    else if (winState === WIN_STATES.X_WIN) {
        if (player1.letter === SQUARE_STATES.X)
            return player1;
        else if (player2.letter == SQUARE_STATES.X)
            return player2;
    }
}

// If a win ocurrs, alert the players!
function checkHandleWin() {
    setWinState();
    if (winState === WIN_STATES.O_WIN || winState === WIN_STATES.X_WIN) {
        winningPlayer = getWinningPlayer();
        alert("Player " + winningPlayer.id + " has won!");
        deleteLobby();
    }
    else if (winState === WIN_STATES.DRAW) {
        alert("The match is a draw!");
        deleteLobby();
    }
}

// Call this after any state changes. This will draw the X's and O's on the board according to the state
function renderState() {
    for (let rIndex = 0; rIndex <= 2; rIndex++) {
        for (let cIndex = 0; cIndex <= 2; cIndex++) {
            if (gameState[rIndex][cIndex] === SQUARE_STATES.X) {
                // cIndex is horizontal position because it's the number of columns over
                // rIndex is vertical position because it's the number of rows down
                drawX(new SquareLocation(cIndex, rIndex));
                //console.log(rIndex + ", " + cIndex + " is X");
            }
            else if (gameState[rIndex][cIndex] === SQUARE_STATES.O) {
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
        if (gameState[0][0] == SQUARE_STATES.O) {
            winState = WIN_STATES.X_WIN;
        } else {
            winState = WIN_STATES.O_WIN;
        }
        return;
    }
    //Wins overlapping middle
    if (gameState[1][1] != null && ((gameState[1][1] == gameState[0][1] && gameState[1][1] == gameState[2][1] && gameState[0][1] == gameState[2][1]) || (gameState[1][1] == gameState[1][0] && gameState[1][1] == gameState[1][2] && gameState[1][0] == gameState[1][2]) || (gameState[1][1] == gameState[2][0] && gameState[1][1] == gameState[0][2] && gameState[2][0] == gameState[0][2]))) {
        if (gameState[1][1] == SQUARE_STATES.O) {
            winState = WIN_STATES.X_WIN;
        } else {
            winState = WIN_STATES.O_WIN;
        }
        return;
    }
    //Wins overlapping bottom right
    if (gameState[2][2] != null && ((gameState[0][2] == gameState[1][2] && gameState[0][2] == gameState[2][2] && gameState[1][2] == gameState[2][2]) || (gameState[2][0] == gameState[2][1] && gameState[2][0] == gameState[2][2] && gameState[2][0] == gameState[2][2]))) {
        if (gameState[2][2] == SQUARE_STATES.O) {
            winState = WIN_STATES.X_WIN;
        } else {
            winState = WIN_STATES.O_WIN;
        }
        return;
    }
    //Checks for draw
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (gameState[i][j] === SQUARE_STATES.BLANK) {
                return;
            }
        }
    }
    winState = WIN_STATES.DRAW;
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



// ------------------------------------------------------------------------------------------
// ---------------------------------- MULTIPLAYER LOGIC -------------------------------------
// ------------------------------------------------------------------------------------------

const hostCallback = function () {
    setUpBoard();
    makePlayers();
    renderState();
    gameState = getStartingState();
    saveGameState();
};

const joinCallback = function () {
    setUpBoard();
    makePlayers();
    renderState();
    checkUpdateGameState();
};


function saveGameState() {
    ajax(POST, JSON.stringify({ ingame: true, state: gameState }), checkUpdateGameState);
}


// Sets up the options and calls the function to check for and update the game state
function checkUpdateGameState() {
    ajax(GET, null, (responseAsJson) => {
        boardString = responseAsJson.Item.Board.S;
        boardFromServer = JSON.parse(boardString);
        if (boardFromServer.ingame == true)
            boardFromServer = boardFromServer.state;
        else {
            setTimeout(checkUpdateGameState, 200);
            return;
        }

        console.log("Fetched board");
        console.log(boardFromServer);

        // Process the response
        if (compareStates(gameState, boardFromServer)) {
            setTimeout(checkUpdateGameState, 200);
            console.log("board was the same");
        }
        else {
            console.log("board was different");

            // Update and rerender the board
            gameState = boardFromServer;
            renderState();
            checkHandleWin();
            // player switch to be your turn
            switchPlayers();

            if (!isMyTurn()) {
                setTimeout(checkUpdateGameState, 200);
            }

        }
    });
}



// ------------------------------------------------------------------------------------
// --------------------------- Lobby Hosting Package Logic ----------------------------
// ------------------------------------------------------------------------------------


const MULTIPLAYER_API_URL = "https://6f6qdmvc88.execute-api.us-east-2.amazonaws.com";
const STAGE = "dev";
const POST = 'POST';
const GET = 'GET';
const DELETE = 'DELETE';

// AJAX function -----------------------------------------------------------------------
// Method string is either POST, GET, or DELETE
// String body is the stringified JSON to be stored in a post, null should be used in get or delete
// Callback is the function called afterward given success, function called with an argument that is the response from the server in JSON
function ajax(methodString, stringBody, callback) {
    let options = {
        method: methodString, // *GET, POST, PUT, DELETE, etc.
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
        // body data type must match "Content-Type" header
    };
    if (methodString == POST) {
        options.body = stringBody;
    }
    fetch(MULTIPLAYER_API_URL + "/" + STAGE + "/" + "tictactoe" + "/" + gameId, options)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            else {
                return Promise.reject(response);
            }
        })
        // If success, print out the data to the console
        .then((responseAsJson) => {
            callback(responseAsJson);
        })
        // Else if this was a failure, log that to the console.
        .catch(function (error) {
            console.warn('Something went wrong.', error);
        });
}


// General Host lobby function
// Callback is function to run once game has started
function hostLobby (callback) {
    switchScreen('before', 'host');
    const highestID = 1000000;
    gameId = Math.floor(Math.random() * highestID);
    document.getElementById("code").value = gameId;
    beginGame(callback);
}


// Join a lobby, given a callback function to run once done
function joinLobby(callback) {
 


    // Check if there is a game
    gameId = document.getElementById("code-input").value;


    ajax(GET, null, (responseAsJson) => {

        if (responseAsJson == "" || responseAsJson == {} || responseAsJson == "{}") {
            alert("Sorry, game does not exist");
            location.reload();
            return;
        }

        boardString = responseAsJson.Item.Board.S;
        boardFromServer = JSON.parse(boardString);

        console.log("Fetched players");
        console.log(boardFromServer);


        if (boardFromServer.ingame) {
            alert("Sorry, game is already full");
        } else {
            // Process the response
            if (boardFromServer.numPlayers == 2) {
                alert("Sorry, game is already full");
            } else {
                player = 1;
                if (boardFromServer.curPlayer == 1) {
                    player = 2;
                }
                // TODO: POST THE NEW THING TELLING THE HOST TO START THE GAME -------------------------------------------------
                ajax(POST, JSON.stringify({ ingame: false, curPlayer: player, numPlayers: 2 }), () => { console.log("Told host to start gameGame"); });
                callback();
            }

        }
    });
    // -----------------------------------------------------------
    switchScreen('join', 'after');
}

// Delete game
function deleteLobby() {
    // TODO: add game deletion logic (only one player should delete the game)
    // TODO: reopen game hosting area??
    ajax(DELETE, null, () => {});
}



// ------------------------------------------------------------------------------------
// ---------- Package helper functions (not used directly by client) ------------------
// ------------------------------------------------------------------------------------

// Switch the screen
function switchScreen(oldLocation, newLocation) {
    document.getElementById(oldLocation).style = "display:none";
    document.getElementById(newLocation).style = "";
}


function beginGame(callback) {
    

    // Figure out which player
    player = Math.floor(Math.random() * 2 + 1);
    numPlayers = 1;

    // Post the game
    ajax(POST, JSON.stringify({ ingame: false, curPlayer: player, numPlayers: 1 }), () => {
        hasLoaded = true;
        setTimeout(()=>{waitForPlayer(callback)}, 200);
    });
}


// Sets up the options and calls the function to check for and update the game state
function waitForPlayer(callback) {
    ajax(GET, null, (responseAsJson) => {
        boardString = responseAsJson.Item.Board.S;
        boardFromServer = JSON.parse(boardString);

        console.log("Fetched players");
        console.log(boardFromServer);

        // Process the response
        if (boardFromServer.numPlayers == 2) {
            // Start the game
            switchScreen('host', 'after');
            console.log(callback);
            callback();
            
        } else {
            setTimeout(()=>{waitForPlayer(callback)}, 200);
        }
    });
}


