const mongoose = require("mongoose");
const DB = process.env.DATABASE;

const connectDB = () => {
  return mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectDB;
