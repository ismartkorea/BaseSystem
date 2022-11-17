const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SessionSchema = new Schema({
    _id : String,
    session : String,
    expires : Date
});

module.exports = SessionSchema;