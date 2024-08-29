const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    genres: [{ type: String }],
    picture: {
        type: String,
        default: '',
      },
});

module.exports = mongoose.model('Artist', ArtistSchema);
