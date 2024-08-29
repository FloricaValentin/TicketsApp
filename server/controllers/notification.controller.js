const Notification = require('../models/notification.collection');
const User = require('../models/users.collection');


// Get all notifications for a specific user
const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    if (!notifications) {
      return res.status(404).json({ message: 'No notifications found' });
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark a specific notification as read
const markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification deleted successfully" });
} catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: error.message });
}
};


module.exports = {
  getNotifications,
  markNotificationsAsRead,
  deleteNotifications,
};
