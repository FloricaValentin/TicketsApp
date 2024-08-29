const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const userRoute = require("./routes/user.route.js");
const artistRoute = require("./routes/artist.route.js");
const eventRoute = require("./routes/event.route.js");
const notificationRoutes = require('./routes/notification.route.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

connectDB();


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.set('io', io);

app.use("/api/users", userRoute);
app.use("/api/artists", artistRoute);
app.use("/api/events", eventRoute);
app.use('/api/notifications', notificationRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
