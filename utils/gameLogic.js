// let this = require("../resources/this")

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
    }


    /**
     * Updating game struct - new word
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

    /**
     * 
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

    /**
     * Getter
     * @returns game_struct - all fields needed for game page
     */
    get_game_struct = () => {
        var game_struct = {
            user1: this.user1,
            user1HighestScore: this.user1HighestScore,
            user2: this.user2,
            user2HighestScore: this.user2HighestScore,
            roomCreated: this.roomCreated,
            currentWord: this.currentWord,
            wordLevel: this.wordLevel,
            roomID: this.roomID,
            whosTurn: this.whosTurn,
            gameScore: this.gameScore,
            canvas: this.canvas,
            // level: this.level,
        };
        return game_struct
    }


    /**
     * Word session setter
     * @param {String} word 
     */
    set_word = (word) => {
        if (word !== '' && word !== undefined) {
            this.currentWord = word
        }
    }

    /**
     * Updating game struct - who's turn it is to draw.
     * @param {string} userName 
     */
    set_turn = (userName) => {
        if (this.user1 === userName) this.whosTurn = 1;
        else this.whosTurn = 2;
    }

    /**
     * Setter for this
     * @param {Number} level 
     */
    set_level = (level) => {
        this.wordLevel = level
    }
    /**
     * Setter
     * @param {Boolean} created 
     */
    set_room_created = (created) => {
        this.roomCreated = created;
    }

    set_canvas = (canvasObject) => {
        this.canvas = canvasObject
    }

    get_canvas = () => {
        return this.canvas;
    }



}

// /**
//  * Updating game struct - new word
//  * @param {String} word
//  * @returns 1 - Word was added
//  *          0 - Word was not added.
//  */
// exports.update_game_word = (word) => {
//     if (word !== undefined && word !== '') {
//         this.word = word;
//         return 1
//     }
//     return 0
// }

// /**
//  *
//  * @param {String} userName
//  * @param {Number} highestScore
//  * @returns The added user id in the game struct
//  *          will return Game is already full if there are 2 players in the room
//  */
// exports.add_user_to_game_struct = (userName, highestScore) => {
//     const { user1, user2 } = this;
//     if (user1 === '') {
//         this.user1 = userName;
//         this.user1HighestScore = highestScore;
//         return 1;
//     }
//     else if (user2 === '') {
//         this.user2 = userName;
//         this.user2HighestScore = highestScore;
//         return 2;
//     }
//     else return "Game is already full";
// }

// /**
//  * Updating game struct - who's turn it is to draw.
//  * @param {string} userName
//  */
// exports.set_turn = (userName) => {
//     if (this.user1 === userName) this.whosTurn = 1;
//     else this.whosTurn = 2;
// }

// /**
//  * Setter for this
//  * @param {Number} level
//  */
// exports.set_level = (level) => {
//     this.level = level
// }
// /**
//  * Setter
//  * @param {Boolean} created
//  */
// exports.set_room_created = (created) => {
//     this.created = created;
// }

// exports.set_canvas = (canvasObject) => {
//     this.canvas = canvasObject
// }

// exports.get_canvas = () => {
//     return this.canvas;
// }
