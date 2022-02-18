// Server tools
const { json } = require('express');
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // allow communication in http at chrome based browser engine 
require('dotenv').config() // all access to process.env
const mongo_async_handler = require('./DAL/mongo_handler');
const port = process.env.PORT || "3001";
// const GameUtils = require('./utils/gameLogic')
var gameLogic = require('./utils/gameLogic')


// let gameStruct = { // default game struct
//     user1: '',
//     user1HighestScore: 0,
//     user2: '',
//     user2HighestScore: 0,
//     roomCreated: false,
//     currentWord: 'test',
//     wordLevel: 0,
//     roomID: '',
//     whosTurn: '',
//     gameScore: 0,
//     canvas: null,
// }

// const add_user_to_game_struct = (userName, highestScore) => {
//     const { user1, user2 } = gameStruct;
//     if (user1 === '') {
//         gameStruct.user1 = userName;
//         gameStruct.user1HighestScore = highestScore;
//         // return true;
//     }
//     else if (user2 === '') {
//         gameStruct.user2 = userName;
//         gameStruct.user2HighestScore = highestScore;
//         // return true; 
//     }
//     // else return false;
// }

// const set_word = (word) => {
//     gameStruct.currentWord = word;
// }
// const set_turn = (userName) => {
//     if (gameStruct.user1 === userName) gameStruct.whosTurn = 1;
//     else gameStruct.whosTurn = 2;
// }



async function main() {
    // express app
    const app = express(); // create server
    app.use(express.json()); // parsing
    app.use(cors()) // Cross-Origin Resource Sharing
    // DB connection
    await mongo_async_handler.init_mongo_connection();
    // Game Struct class
    var game = new gameLogic.GameStruct();



    // WebSocket Server using socket.io
    // const server = http.createServer(app)
    // socket.init(server);
    // server.listen(port, () => { // function that will start as enter to server
    //     console.log(`App running on port ${port}`);
    // })

    app.get("/ping", (req, res) => {
        res.send("pong");

    })


    app.listen(port, () => { // function that will start as enter to server
        console.log(`App running on port ${port}`);
    })

    /**
     * Registration End-point
     * type: Post
     * required: Request body
     * Body schema example:
     *      {
     *          "userName" : "DorUser",
     *          "password" : "password",
     *          "email" : "dorEmail@email.com"
     *      }
     * Responses:
     *      200: User has been added, user object will be returned
     *      409: User already exist - same email
     * 
    */

    app.post('/register', async (req, res, next) => {
        try {
            console.log("Register been called")
            const { userName, password, email } = req.body;
            let newUser = {
                "userName": userName,
                "password": password,
                "email": email,
                "highestScore": 0
            };
            let result = await mongo_async_handler.add_object_async(newUser);
            if (result) {
                game.add_user_to_game_struct(userName, 0)
                // add_user_to_game_struct(userName, 0) // update game struct
                res.status(200).send(newUser);
            }
            else {
                res.status(409).send('Error: email already exist')
            }
        }
        catch (err) {
            next(err);
        }
    })

    /**
     * Login End-point
     * type: Post
     * required: Request body
     * Body schema example:
     *      {
     *          "password" : "password",
     *          "email" : "dorEmail@email.com"
     *      }
     * Responses:
     *      200: Login successfully, user object will be attached
     *      403: Wrong input - email or password are wrong.
     * 
    */
    app.post('/signin', async (req, res, next) => {
        try {
            console.log("/signin triggered");
            const { email, password } = req.body
            let result = await mongo_async_handler.find_user_async(email);
            if (result == 0 || result.password !== password) {
                res.status(403).send('Error: Email or password are incorrect')
            }
            const userToRerun = { 'email': email, 'password': password, 'userName': result.userName, 'highestScore': result.highestScore }
            const answer = game.add_user_to_game_struct(userToRerun.userName, userToRerun.highestScore); // update game struct
            console.log("Checking")
            res.status(200).send(userToRerun);
        }
        catch (err) {
            next(err);
        }
    })

    /**
     * Did-game-created End-point
     * type: get
     * required: none
     * Responses:
     *      200: Game was created, attaching gameStruct
     *      204: Game room was not created
    */
    app.get('/did-game-created', (req, res) => {
        // console.log(gameStruct.gameStruct.roomCreated);
        // const { roomCreated: roomCreated } = game.roomCreated;
        const roomCreated = game.roomCreated;

        if (!roomCreated) {
            res.status(204).send('No game was created yet');
        }
        else {
            const game_struct = game.get_game_struct()
            res.status(200).send(game_struct)
        }
    })


    /**
     * Create room End-point
     * type: Post
     * required: Request body
     * Body schema example:
     *      {
     *          "chosenWord" : "moveo",
     *          "level": 3,
     *          "userName" : "boost"
     *      }
     * Responses:
     *      200: Room created, (TODO - will add the game socket!)
     *      400: Wrong input - chosenWord or userName were not givin.
     * 
    */
    app.post('/create-room', async (req, res, next) => {
        try {
            const { chosenWord, level, userName } = req.body;
            if (chosenWord === undefined || userName === undefined) {
                res.status(400).send('Error: missing parameters word / username')
            }
            game.set_level(level);
            game.set_word(chosenWord)
            game.set_turn(userName)
            game.set_room_created(true)
            // gameStruct.level = level;
            // set_word(chosenWord);
            // set_turn(userName);
            // gameStruct.roomCreated = true;
            const gameStruct = game.get_game_struct()
            console.log("Returning game: ", gameStruct)
            res.status(200).send(gameStruct);
            //todo: need to create here the socket and add this user to the sockeet
        }
        catch (err) {
            console.log("Error at /create-room endpoint ", err);
            next(err);
        }
    })

    /**
     * Guess the word End-point
     * type: get
     * required: url param
     * /guess-word/someWord
     * Responses:
     *      200: Current guess
     *      409: Wrong guess
     */
    app.get("/guess-word/:word", (req, res) => {
        let word = req.params.word;
        console.log("In guess-word endpoint, word got is: ", word)
        if (word === game.currentWord) { // current guess
            //TODO: update gameStruct!!! - here?
            res.status(200).send("Good guess, change turns.")
        }
        else res.status(409).send("Wrong guess, try again."); // wrong guess
    })


    /**
     * Post canvas End-point
     * type: post
     * required: Request body
     * Body schema example:
     *      {
     *          "type" : "canvas object",
     *          "canvas": canvasObject,
     *      }
     * Responses:
     *      200: Got canvas - update gameStruct
     *      404: No canvas object was found
     */
    app.post("/post-canvas", (req, res) => {
        console.log(req.body);
        const { canvas } = req.body;
        try {
            if (canvas !== undefined) {
                console.log("Got canvas element from user")
                res.status(200).send("Got canvas")
                game.set_canvas(canvas)
                // gameStruct.canvas = canvas;
            }
            else res.status(404).send("No canvas was found")
        } catch (error) {
            console.log("Error at /post-canvas endpoint ", error);
            next(error);
        }
    })



    /**
     * Get canvas End-point
     * type: get
     * required: none
     * Responses:
     *      200: Canvas found + canvas object
     *      404: No canvas found
     */
    app.get("/get-canvas", (req, res) => {
        console.log("In get-canvas endpoint")
        const canvas = game.canvas;
        if (canvas === null) {
            console.log("No canvas was found")
            res.status(404).send("No canvas was sen't yes")
        }
        else {
            console.log("Sending canvas...")
            res.status(200).send(game.canvas);
        }
    })

    app.get('/room-status', (req, res) => {
        console.log("Room status request")
        const game_struct = game.get_game_struct()
        if (game_struct !== undefined) {
            res.status(200).send(game_struct)
        }
        res.status(404)
    })
}




main();


