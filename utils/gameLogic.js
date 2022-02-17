let gameStruct = require("../resources/GameStruct")

/**
 * Updating game struct - new word
 * @param {String} word 
 * @returns 1 - Word was added
 *          0 - Word was not added.
 */
exports.update_game_word = (word) => {
    if (word !== undefined && word !== '') {
        gameStruct.word = word;
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
exports.add_user_to_game_struct = (userName, highestScore) => {
    const { user1, user2 } = gameStruct;
    if (user1 === '') {
        gameStruct.user1 = userName;
        gameStruct.user1HighestScore = highestScore;
        return 1;
    }
    else if (user2 === '') {
        gameStruct.user2 = userName;
        gameStruct.user2HighestScore = highestScore;
        return 2;
    }
    else return "Game is already full";
}

/**
 * Updating game struct - who's turn it is to draw.
 * @param {string} userName 
 */
exports.set_turn = (userName) => {
    if (gameStruct.user1 === userName) gameStruct.whosTurn = 1;
    else gameStruct.whosTurn = 2;
}

/**
 * Setter for gameStruct
 * @param {Number} level 
 */
exports.set_level = (level) => {
    gameStruct.level = level
}
/**
 * Setter
 * @param {Boolean} created 
 */
exports.set_room_created = (created) => {
    gameStruct.created = created;
}

exports.set_canvas = (canvasObject) => {
    gameStruct.canvas = canvasObject
}

exports.get_canvas = () => {
    return gameStruct.canvas;
}
