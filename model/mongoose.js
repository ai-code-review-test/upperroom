const mongoose = require('mongoose');
const env = require('../env.json');

const url = `mongodb://${env.USERNAME}:${env.PASSWORD}@${env.URL}/${env.DBNAME}?retryWrites=true&w=majority`;

console.log(process.env.USERNAME);

const dbconnect = async () => {
    try {
        await mongoose.connect(url);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};


mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = dbconnect;
