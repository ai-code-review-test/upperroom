const mongoose = require('mongoose');
const url = `mongodb://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.URL}/${process.env.DBNAME}?retryWrites=true&w=majority`;

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
