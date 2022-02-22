// Server tools
const { json } = require('express');
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors'); // allow communication in http at chrome based browser engine 
require('dotenv').config() // all access to process.env
const mongo_async_handler = require('./DAL/mongo_handler');
const port = process.env.PORT || "3001";
// const GameUtils = require('./utils/gameLogic')
var gameLogic = require('./utils/gameLogic')

async function main() {
    // express app
    const app = express(); // create server
    app.use(express.json()); // parsing
    app.use(cors()) // Cross-Origin Resource Sharing
    app.use(express.static(path.join(__dirname, '../draw-guess-frontend/build'))); //To serve static files such as images, CSS files, and JavaScript files
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

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../draw-guess-frontend/build', 'index.html'));
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
     *      201: User has been added, user object will be returned
     *      202: User was added but room is full!
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
                const answer = game.add_user_to_game_struct(userName, 0)
                if (answer === 1 || answer === 2) { res.status(201).send(newUser); }
                else {
                    res.status(202).send(newUser);
                }
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
     *      304: No place in room
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
            else {
                const userToRerun = { 'email': email, 'password': password, 'userName': result.userName, 'highestScore': result.highestScore, 'updatedAt': result.updatedAt }
                const answer = game.add_user_to_game_struct(userToRerun.userName, userToRerun.highestScore); // update game struct
                if (answer === 1 || answer === 2) {
                    res.status(200).send(userToRerun);
                }
                else {
                    res.status(304).send("Room is full")
                }
            }
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
        if (word === game.currentWord.toLowerCase()) { // current guess
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
    app.post("/post-canvas", (req, res, next) => {
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
     *      304: - Not Modified -  No canvas found /  User already see the most up to date canvas
     */
    app.get("/get-canvas", (req, res) => {
        console.log("In get-canvas endpoint");
        const canvas = game.get_canvas();
        console.log("Canvas: ", canvas);
        if (canvas !== false) {
            console.log("Sending canvas...");
            res.status(200).send(canvas);
        }
        // console.log("No canvas was found or current canvas have already sent")
        else res.status(304).send("No canvas was sen't yet or you already have the most up to date canvas")

        // if (canvas === false) {// Canvas have not changed
        //     console.log("No canvas was found or current canvas have already sent")
        //     res.status(304).send("No canvas was sen't yet or you already have the most up to date canvas")
        // }
        // else {
        //     console.log("Sending canvas...");
        //     res.status(200).send(canvas);
        // }
    })


    /**
     * Get room struct End-point
     * type: get
     * required: none
     * Responses:
     *      200: Room struct (the struct can be seen at ./utils/gameLogic.js for more information)
     *      404: No room struct was found
     */
    app.get('/room-struct', (req, res) => {
        console.log("Room status request")
        const game_struct = game.get_game_struct()
        if (game_struct !== undefined) {
            res.status(200).send(game_struct)
        }
        res.status(404)
    })


    /**
     * Method to update game struct due to correct guessing by client 
     * Get win round End-point
     * type: get
     * required: none
     * Responses:
     *      200: Update successfully
     *      404: Error in updating
     */
    app.get('/win-round', async (req, res, next) => {
        try {
            console.log("Updating about round winning...");
            game.update_scores();
            game.update_turns();
            game.change_round()
            console.log("Win-round... updated scores..")
            res.status(200).send("Turns and scores were updated...")
        } catch (error) {
            console.log("Error at /win-round endpoint ", error);
            res.status(404).send(error);
            next(error); // needed???
        }
    })

    /**
     * Method to check if round ended 
     * Get check round change End-point
     * type: get
     * required: none
     * Responses:
     *      200: Round changed + game struct
     *      304: - Not Modified -  round is not over 
     */
    app.get('/check-round-change', (req, res) => {
        const roundChanged = game.check_for_change_round()
        if (roundChanged) { // true
            console.log("Round changed")
            const game_struct = game.get_game_struct()
            res.status(200).send(game_struct)
        }
        else res.status(304).send()
    })
}




main();


