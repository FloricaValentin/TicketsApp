const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationsAsRead, deleteNotifications } = require('../controllers/notification.controller');
const {verifyToken} = require('../controllers/user.controller');


router.get('/:userId', getNotifications);
router.post('/mark-read', verifyToken, markNotificationsAsRead);
router.delete('/:id', deleteNotifications);

module.exports = router;
