const mongo_async_handler = require('../DAL/mongo_handler');

exports.GameStruct = class {
    constructor(props) {  // default game struct
        this.user1 = '';
        this.user1HighestScore = 0;
        this.user2 = '';
        this.user2HighestScore = 0;
        this.roomCreated = false;
        this.currentWord = '';
        this.wordLevel = 0;
        this.roomID = '';
        this.whosTurn = '';
        this.gameScore = 0;
        this.canvas = null;
        this.didCanvasChanged = false;
        this.didTurnChanged = false;
    }

    ////////// SETTERS //////////
    /** Updating game struct - new word
     * @param {String} word 
     * @returns 1 - Word was added
     *          0 - Word was not added.
     */
    update_game_word = (word) => {
        if (word !== undefined && word !== '') {
            this.word = word;
            return 1
        }
        return 0
    }

    /** Setting game struct with giving user
     * @param {String} userName 
     * @param {Number} highestScore 
     * @returns The added user id in the game struct
     *          will return Game is already full if there are 2 players in the room
     */
    add_user_to_game_struct = (userName, highestScore) => {
        const { user1, user2 } = this;
        if (user1 === userName || user2 === userName) return "User already logged in"
        if (user1 === '') {
            this.user1 = userName;
            this.user1HighestScore = highestScore;
            return 1;
        }
        else if (user2 === '') {
            this.user2 = userName;
            this.user2HighestScore = highestScore;
            return 2;
        }
        else return "Game is already full";
    }

    /** Word session setter
     * @param {String} word 
     */
    set_word = (word) => {
        if (word !== '' && word !== undefined) {
            this.currentWord = word
        }
    }

    /** Updating game struct - who's turn it is to draw.
     * @param {string} userName 
     */
    set_turn = (userName) => {
        if (this.user1 === userName) this.whosTurn = 1;
        else this.whosTurn = 2;
    }

    /** Setter for word level
     * @param {Number} level 
     */
    set_level = (level) => {
        this.wordLevel = level
    }

    /** Setter room - created
     * @param {Boolean} created 
     */
    set_room_created = (created) => {
        this.roomCreated = created;
    }

    /** Setter canvas object
     * @param {urlDATA} canvasObject 
     */
    set_canvas = (canvasObject) => {
        this.canvas = canvasObject
        this.didCanvasChanged = true;
    }

    /** Updating session score + users highest score
     */
    update_scores = async () => {
        const { user1, user2, wordLevel, gameScore } = this;
        var newScore = gameScore + wordLevel // new score due to win
        // UPDATE USERS HIGHTEST SCORE
        // USER 1
        const user1UpdateScoreResponse = await mongo_async_handler.update_user_highest_score_async(user1, newScore);
        console.log(user1UpdateScoreResponse) // console log the result of updating score
        // USER 2
        const user2UpdateScoreResponse = await mongo_async_handler.update_user_highest_score_async(user2, newScore);
        console.log(user2UpdateScoreResponse) // console log the result of updating score
        // UPDATE GAME-STRUCT 
        // UPDATING GAME SCORE
        this.gameScore = newScore;
    }

    /** Setter - change game_struct whosTurn
     * 
     */
    update_turns = () => {
        if (this.whosTurn == 1) {
            this.whosTurn = 2;
        }
        else this.whosTurn = 1;
    }

    /** Setter + check if round changed
     * @returns true if round was changed
     *          false if round have not been changed
     */
    check_for_change_round = () => {
        if (this.didTurnChanged) { // round changed
            this.didTurnChanged = !this.didTurnChanged
            return true
        }
        else return false
    }

    /** Setter - set didTurnChanged to true
     */
    change_round = () => {
        this.didTurnChanged = true;
    }


    ////////// GETTERS //////////

    /** Getter of game_struct
    * @returns game_struct - all fields needed for game page
    */
    get_game_struct = () => {
        var game_struct = {
            user1: this.user1,
            user1HighestScore: this.user1HighestScore, // maybe not needed
            user2: this.user2,
            user2HighestScore: this.user2HighestScore, // maybe not needed
            roomCreated: this.roomCreated,
            currentWord: this.currentWord,
            wordLevel: this.wordLevel,
            roomID: this.roomID, // maybe not needed
            whosTurn: this.whosTurn,
            gameScore: this.gameScore,
            canvas: this.canvas,
            // level: this.level,
        };
        return game_struct
    }

    /** Canvas getter
     * @returns {urlDTA} canvas object if canvas have changed
     *                   if canvas have not changed will return false
     */
    get_canvas = () => {
        if (this.didCanvasChanged) { // canvas have changed..
            this.didCanvasChanged = false; // set back to no - uses as a flag
            return this.canvas;
        }
        return false
    }



}
