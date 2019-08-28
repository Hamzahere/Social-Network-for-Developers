const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true
    });
    console.log('mongodb connected');
  } catch (err) {
    console.log('error in db.js file');
    console.log(err);
  }
};

module.exports = connectDB;
