const mongoose = require('mongoose');
require('dotenv').config();


module.exports = {
    init: async () => {

        mongoose.connect(`mongodb+srv://discordbot:${process.env.MONGOPAS}@discordbot.hrcdy.mongodb.net/StarGazersBot?retryWrites=true&w=majority`);

        mongoose.Promise = global.Promise;

        mongoose.connection.on('connected', () => {
            console.log('The bot has connected to the database.');
        });

        mongoose.connection.on('disconnected', () => {
            console.log('The bot has disconnected from the database.');
        });

        mongoose.connection.on('err', (err) => {
            console.log('There was an error with the connection to the database: ' + err);
        });



    }
}