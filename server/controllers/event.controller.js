const Event = require("../models/events.collection");
const User = require("../models/users.collection");
const Notification = require("../models/notification.collection");

// Get All Events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get single Event
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//Create Event
const postEvent = async (req, res) => {
  try {
    const { title, date, artist, location, description, organizer } = req.body;

    if (!title || !date || !location) {
      return res
        .status(400)
        .json({ message: "Title, date, and location are required." });
    }

    const event = new Event({
      title,
      date,
      artist,
      location,
      description,
      organizer,
    });

    await event.save();

    const usersInLocation = await User.find({ town: location });

    if (usersInLocation.length > 0) {
      // Create notifications for each user
      for (const user of usersInLocation) {
        const notification = new Notification({
          userId: user._id,
          artist,
          event: event._id.toString(),
          message: `New event "${title}" happening in your town (${location})!`,
        });

        await notification.save();

        // Emit notification to all connected clients
        const io = req.app.get("io");
        if (io) {
          io.emit("newNotification", notification);
        } else {
          console.error("Socket.IO instance not found.");
        }
      }
    }

    res
      .status(201)
      .json({
        event,
        message:
          "Event created and notifications sent to users in the location.",
      });
  } catch (error) {
    console.error("Error creating event:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error. Please try again later." });
  }
};

//Update Event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    const event = await Event.findByIdAndUpdate(id, eventData, { new: true });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: error.message });
  }
};

//Delete Event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  postEvent,
  updateEvent,
  deleteEvent,
};
