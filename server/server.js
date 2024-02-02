/** @format */

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());
const httpServer = createServer(app);
const port = 5000;
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true,
	},
});
app.get("/", (req, res) => {
	res.send("Hello from server!");
});

app.post("/", (req, res) => {
	res.send("hello world again");
});

//MIDDLEWARES-------------------
const newUser = false;
io.use((socket, next) => {
	if (newUser) {
		next();
	}
});

//io -> means referring to whole circuit

// on -> means listening to an event

// jab new user join karege to connection name se ek event trigger hoga -> ye event message ke rup me socket bhejega

io.on("connection", (socket) => {
	console.log("New user connected: ", socket.id);
	socket.emit("welcome", `Welcome user - ${socket.id}`);
	socket.broadcast.emit("hasJoined", `${socket.id} has joined the chat`);
	socket.on("reply", (data) => {
		console.log("reply data is ", data);
	});

	socket.on("sendMessage", (data) => {
		console.log("New message: ", data);
		io.to(data.room).emit("newMessage", data.message);
	});

	socket.on("join-room", (room) => {
		socket.join(room);
	});

	socket.on("disconnect", () => {
		console.log("user disconnected ", socket.id);
		socket.broadcast.emit("hasLeftTheChat", `${socket.id} has left the chat`);
	});
});

httpServer.listen(port, () => {
	console.log("Server is listening at port 5000");
});
