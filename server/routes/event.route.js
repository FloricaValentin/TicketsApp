const express = require('express');
const router = express.Router();
const {
    getAllEvents,
    getEventById,
    postEvent,
    updateEvent,
    deleteEvent,
} = require('../controllers/event.controller');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', postEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;

