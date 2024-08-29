const Artist = require("../models/artists.collection");
const User = require("../models/users.collection");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Get all artists
const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find();
    res.json(artists);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get artist by ID
const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.json(artist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Create Artist
const postArtist = async (req, res) => {
  try {
    const { name, description, events, genres } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const artist = new Artist({
      name,
      description,
      events,
      genres,
    });

    await artist.save();

    res.status(201).json(artist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { picture, ...artistData } = req.body;

    if (picture) {
      artistData.picture = picture;
    }

    const artist = await Artist.findByIdAndUpdate(id, artistData, {
      new: true,
    });

    if (!artist) {
      console.log("Artist not found");
      return res.status(404).json({ message: "Artist not found" });
    }

    res.status(200).json(artist);
  } catch (error) {
    console.error("Error updating artist:", error);
    res.status(500).json({ message: error.message });
  }
};

//Delete Artist
const deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findByIdAndDelete(id);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }
    res.status(200).json({ message: "Artist deleted successfully" });
  } catch (error) {
    console.error("Error deleting artist:", error);
    res.status(500).json({ message: error.message });
  }
};

const followArtist = async (req, res) => {
  try {
    const { artistId } = req.body;
    const userId = req.userId;

    if (!artistId)
      return res.status(400).json({ message: "Artist ID is required" });
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.followedArtists.includes(artistId)) {
      return res.status(400).json({ message: "Already following this artist" });
    }

    user.followedArtists.push(artistId);
    await user.save();

    console.log("User ID following the artist:", userId);
    console.log("Artist ID followed:", artistId);

    res.status(200).json({ message: "Artist followed successfully" });
  } catch (error) {
    console.error("Error following artist:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const unfollowArtist = async (req, res) => {
  try {
    const { artistId } = req.body;
    const userId = req.userId;

    if (!artistId)
      return res.status(400).json({ message: "Artist ID is required" });
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.followedArtists.includes(artistId)) {
      return res.status(400).json({ message: "Not following this artist" });
    }

    user.followedArtists = user.followedArtists.filter(
      (id) => id.toString() !== artistId.toString()
    );
    await user.save();
    res.status(200).json({ message: "Artist unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing artist:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  postArtist,
  updateArtist,
  getAllArtists,
  getArtistById,
  deleteArtist,
  followArtist,
  unfollowArtist,
};
