/** @format */

import { useEffect, useMemo, useState, useRef } from "react";
import { io } from "socket.io-client";
export default function App() {
	const socket = useMemo(() => {
		return io("http://localhost:5000");
	}, []);

	const messageContainerRef = useRef();
	console.log("socket", socket.id);
	const [message, setMessage] = useState("");
	const [socketID, setSocketID] = useState("Connecting...");
	const [room, setRoom] = useState("");
	const [roomName, setRoomName] = useState("");
	const [allMessages, setAllMessages] = useState([]);
	const [tempMessage, setTempMessage] = useState("");

	useEffect(() => {
		// Scroll to the bottom when messages are updated
		messageContainerRef.current.scrollTop =
			messageContainerRef.current.scrollHeight;
	}, [allMessages]);

	useEffect(() => {
		socket.on("connect", () => {
			console.log("Server connected - ", socket.id);
			setSocketID(socket.id);
		});
		socket.on("hasJoined", (data) => {
			console.log(data);
		});
		socket.on("hasLeftTheChat", (data) => {
			console.log(data);
		});

		socket.on("newMessage", (data) => {
			console.log("received data ", data);
			if (data === tempMessage) {
				console.log("all messages 1 ", allMessages);
				setAllMessages((prev) => [...prev, { msg: data, by: "me" }]);
				setTempMessage("");
			} else {
				console.log("all messages 2", allMessages);
				setAllMessages((prev) => [...prev, { msg: data, by: "other" }]);
				setTempMessage("");
			}
		});

		const cleanup = () => {
			socket.disconnect();
		};

		return cleanup;
	}, []);

	const sendMessage = async (e) => {
		e.preventDefault();
		try {
			if (message.length !== 0) {
				console.log("tempMessage ", tempMessage);
				socket.emit("sendMessage", { message, room });
				setMessage("");
			} else {
				return;
			}
		} catch (error) {
			console.log("Error while sending the message");
		}
	};

	const handlChange = (e) => {
		setMessage(e.target.value);
		setTempMessage(e.target.value);
	};

	const joinRooomHandler = (e) => {
		e.preventDefault();
		console.log("Joining new room - ", roomName);
		socket.emit("join-room", roomName);
		setRoomName("");
	};

	return (
		<div className="w-full min-h-screen flex flex-col items-center gap-4 p-8 relative ">
			<h2 className="text-2xl font-bold mb-8 border-2 px-4 py-2 flex items-center gap-1">
				Welcome to new chat -{" "}
				<span className="bg-orange-500 px-3 py-1 rounded font-mono text-xl  ">
					{socketID}
				</span>
			</h2>
			<form className="flex gap-2" onSubmit={joinRooomHandler}>
				<input
					value={roomName}
					name="roomName"
					type="text"
					placeholder="Join new room"
					className="px-4 py-2 rounded "
					onChange={(e) => setRoomName(e.target.value)}
				/>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-500 rounded active:bg-blue-800">
					Join
				</button>
			</form>
			<form
				onSubmit={sendMessage}
				className="w-[300px] p-4 min-h-[400px] bg-slate-900 rounded-md overflow-hidden relative ">
				<div
					ref={messageContainerRef}
					className="flex flex-col w-full h-[280px] bg-white rounded text-white p-2 overflow-y-scroll gap-2">
					{allMessages.map((message, key) => {
						return message.by === "me" ? (
							<p key={key} className="text-black text-xl ">
								{message.msg}
							</p>
						) : (
							<p
								key={key}
								className="text-white text-xs rounded px-2 py-1 bg-black ">
								{message.msg}
							</p>
						);
					})}
				</div>
				<input
					value={room}
					type="text"
					placeholder="Room Name"
					name="room"
					onChange={(e) => setRoom(e.target.value)}
					autoComplete="off"
					className="px-4 py-2 mt-2 w-full block rounded border-none outline-none "
				/>
				<div className="flex w-full overflow-hidden gap-2 mx-auto absolute bottom-2">
					<input
						value={message}
						type="text"
						placeholder="Enter new message"
						name="message"
						onChange={handlChange}
						autoComplete="off"
						className="px-4 py-2 block rounded w-[200px] border-none outline-none "
					/>
					<button
						type="submit"
						className="px-2 py-1 bg-blue-500 rounded font-semibold active:bg-blue-800">
						Send
					</button>
				</div>

				{/* <EmojiPicker /> */}
			</form>
		</div>
	);
}
