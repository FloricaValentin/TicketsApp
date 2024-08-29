const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    artist: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    organizer: { type: String },
});

module.exports = mongoose.model('Event', EventSchema);
