const { json } = require('express');
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // allow communication in http at chrome based browser engine
const bcrypt = require("bcryptjs"); // passwords and other encryption 
const mongoose = require('mongoose'); // communication with mongoDB 
require('dotenv').config() // all access to process.env
const mongo_async_handler = require('./DAL/mongo_handler');
const port = process.env.PORT || "3001";


// connect to mongoDB
// const dbURI = "mongodb+srv://shiretod:dorDrawAndGuess@drawandguessdb.q0gcs.mongodb.net/drawandguessDB?retryWrites=true&w=majority";
// const dbConnection = await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });




// app.get('/', (req, res) => {
//     res.send('Working');
// })



// app.get('/profile/:id', (req, res) => {
//     let found = false;
//     const uid = req.params.id;
//     let user = db.users.forEach(user => {
//         if (user.id === uid) {
//             found = true;
//             return res.status(200).json(user);
//         }
//     });
//     if (!found)
//         res.status(404).send('No user found');
// })

async function main() {

    // express app
    const app = express();
    app.use(express.json());
    app.use(cors())

    await mongo_async_handler.init_mongo_connection();
    app.listen(port, () => { // function that will start as enter to server
        console.log(`App running on port ${port}`);
    })
    app.post('/register', async (req, res, next) => {
        try {
            console.log("Register been called")
            const { userName, password, email } = req.body;
            let newUser = {
                "userName": userName,
                "password": password,
                "email": email,
            };
            let result = await mongo_async_handler.add_object_async(newUser);
            if (result) {
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


    app.post('/signin', async (req, res, next) => {
        try {
            const { email, password } = req.body
            let result = await mongo_async_handler.find_user_async(email);
            if (result == 0 || result.password !== password) {
                res.status(403).send('Error: Email or password are incorrect')
            }

            res.status(200).send({ 'email': email, 'password': password, userName: result.userName });
        }
        catch (err) {
            next(err);
        }

    })

}




main();

/**
 * /signin --> POST - 200 / 404
 * /register --> POST - 200 + new user object/404
 * /profile/:userId --> GET = user
 * /
 */




// Add routes
// routes.get('/', SessionController.store);
// routes.post('/', SessionController.store);
// routes.put('/', SessionController.store);
// routes.delete('/', SessionController.store);

