const mongoose = require('mongoose'); // communication with mongoDB 
// const mongo = require("mongodb");
// const MongoClient = mongo.MongoClient;

const COLLECTION = { USERS: "draw-guess-users" }
const dbURI = process.env.MONGO_URL;
const Schema = mongoose.Schema;
const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    highestScore: {
        type: Number,
        required: false
    }
}, { timestamps: true }); // record schema
const USER = mongoose.model('draw-guess-users', userSchema) // draw-guess-users is the name of the table in DB


const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://shiretod:dorDrawAndGuess@drawandguessdb.q0gcs.mongodb.net/drawandguessDB?retryWrites=true&w=majority";


async function init_mongo_connection() {
    try {
        console.log("Connection to DB using mongoose");
        client = await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connection succeeded");
    }
    catch (error) {
        console.log("failed at init_mongo_connection");
        console.log(error)
    }
}

async function add_object_async(body) {
    try {
        //find if email is already in use
        const oldUser = await USER.where("email").equals(body.email);
        console.log(oldUser.length);

        if (oldUser.length == 0) {
            let newUser = new USER({
                userName: body.userName,
                email: body.email,
                password: body.password
            })
            // add user to db
            let result = await newUser.save()
            console.log(`User with email: ${newUser.email} and user name ${newUser.userName} was added.`)
            return 1;
        }
        else {
            return 0;
        }

    }
    catch (err) {
        console.log("Error at add_object_async\n", err)
        return 0;
    }
}

async function find_user_async(email) {
    try {
        const user = await USER.where("email").equals(email);
        console.log(user.length);
        if (user.length == 0) {
            console.log(`User with email: ${email} was not found`)
            return 0;
        }
        else {
            console.log("User found.")
            return user[0];
        }
    }
    catch (err) {
        console.log("Error at find_user_async\n", err)
        return 0;
    }

}

/**
 * Setter method:
 * @param {String} user - userName
 * @param {Number} score
 * Method will get user(userName) and score
 * Fetch user from DB with the same userName
 * Check if user's highest score if lower and 
 * @returns  "Updated" - if score was updated
 *           "No need" - if user's old score is higher
 *           "User not found" - if user giving was not found
 *           "Error" - if error in communication with mongoDB
 */
async function update_user_highest_score_async(user, score) {
    try {
        const userFromServer = await USER.where("userName").equals(user);
        if (userFromServer.length <= 0) {
            return "User not found"
        }
        var userDetails = userFromServer[0]
        var oldHightestScore = userDetails.highestScore;
        if (score > oldHightestScore) {
            console.log(`Updating ${user} hightest score...`)
            userFromServer[0].highestScore = score
            userFromServer[0].save()
            console.log(`Old hightest score was ${oldHightestScore} and now is ${score}...`)
            return "Updated"
        }
        return "No need" // old score is higher

    } catch (error) {
        console.log("Error at update_user_highest_score_async\n", error)
        return "Error";
    }
}




module.exports = {
    COLLECTION,
    init_mongo_connection,
    add_object_async,
    find_user_async,
    update_user_highest_score_async,
    USER
};