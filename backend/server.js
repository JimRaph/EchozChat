import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import ExpressMongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import morgan from "morgan";
import { connectDB } from "./db/db.js";
import routerAuth from "./routes/authRoute.js";
import routerUser from "./routes/userRoute.js";
import routerChat from "./routes/chatRoute.js";
import routerMessage from "./routes/messageRoute.js";
import routerCall from "./routes/callRoute.js";

import { Server } from "socket.io";
import http from "http";
import { socketHandlers } from "./utils/socketHandlers.js";
import { tokenVerifier } from "./utils/token.js";

dotenv.config();
console.log("CLIENT_URL env variable:", process.env.CLIENT_URL);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(helmet());
app.use(
 cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);
app.use(xss());
app.use(ExpressMongoSanitize());
app.use(morgan("dev"));

// global data shared across connections
export const onlineUsers = new Map();

app.use((req, res, next) => {
  req.io = io;
  req.onlineUsers = onlineUsers;
  next();
});

// socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Auth token missing"));
  }
  try {
    const user = tokenVerifier(token);
    socket.userId = user.id;
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

// connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}, userId: ${socket.userId}`);
  onlineUsers.set(socket.userId, socket.id);
  // user joins their own room
  // for targeted messages
  socket.join(socket.userId.toString()); 

    const originalEmit = socket.emit;
  socket.emit = function(event, ...args) {
    console.log(`[SOCKET EMIT] Event: '${event}' | Args:`, args, '| Socket ID:', socket.id);
    return originalEmit.call(this, event, ...args);
  };


  // pass everything to socket handlers
  socketHandlers(io, socket);

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    console.log(`User disconnected: ${socket.userId}`);
  });
});

app.use('/api/', routerAuth, routerUser, routerChat, routerMessage, routerCall);
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});