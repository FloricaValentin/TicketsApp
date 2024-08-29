const express = require('express');
const router = express.Router();
const {
    getAllArtists,
    getArtistById,
    followArtist,
    unfollowArtist,
    postArtist,
    updateArtist,
    deleteArtist,
} = require('../controllers/artist.controller');
const { verifyToken } = require('../controllers/user.controller');


router.get('/', getAllArtists);
router.get('/:id', getArtistById);
router.post('/follow', verifyToken, followArtist);
router.post('/unfollow', verifyToken, unfollowArtist);
router.post('/', postArtist);
router.put('/:id', updateArtist);
router.delete('/:id', deleteArtist);

module.exports = router;
