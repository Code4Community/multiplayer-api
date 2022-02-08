# Multiplayer Game API
Stateful web API for n-player multiplayer games. Built using AWS Lambda and Amazon DynamoDB.

## Documentation
/{gameid} GET: send a gameid to getGameState, which returns the current state of the game at that gameid after the other player moves.

/{gameid} POST: send a gameid to getItemUpdated, which updates the game state, and returns whether it worked or not.

## Examples
We have one example project, a 2-player tic-tac-toe game. Players alternate turns until the game is over. This project is based on [this forum post](https://www.codecademy.com/forum_questions/535061fc52f86345af0000fe). If you are unfamiliar with making HTTP requests in JavaScript, you can read up on [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

## Notes:
We have:
* 2 players
  * Different computers
  * One’s player 1 with X’s
  * The other is player 2 with O’s
* Problem:
  * We need player 2 to know when and where player 1 puts an X
  * And vice versa
* Actions:
  * Player 1 can place an X
  * Player 2 can place a O
* Solution:
  * Server
  * What’s a server:
    * Just another computer
    * But it listens for requests from other computers
  * What can it do:
    * Receive and store information
    * Give information out
  * Uses here:
    * Send the server placement of an X or an O
    * Server needs to store the locations of the X’s and O’s
      * “game state”
    * Server needs to give out that information when asked
* Functions of a server (backend):
  * Database
    * Stores data
  * Web API (Application Programming Interface)
    * Fancy piece of code
    * Listens for requests for information and pushes of info
  * Functions to link the two
* Needed Actions:
  * Start a game
  * Join a game
  * Write to a square
  * Read from a square

## Contribution Policy
This project is open to outside contributions.
