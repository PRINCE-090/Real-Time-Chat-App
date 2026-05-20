import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const senderId = "69d1fbc0b9c069968c011144";
  const receiverId = "69d2974acbd35595f35822ba";

  useEffect(() => {

    socket.emit("join_room", senderId);

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };

  }, []);

  const sendMessage = () => {

    if (!message.trim()) return;

    const messageData = {
      senderId,
      receiverId,
      message,
    };

    socket.emit("send_message", messageData);

    setMessages((prev) => [...prev, messageData]);

    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>Real-Time Chat App</h1>

      <div
        style={{
          border: "1px solid gray",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>
              {msg.senderId === senderId ? "You" : "Other"}:
            </strong>{" "}
            {msg.message}
          </p>
        ))}
      </div>

      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

    </div>
  );
}

export default Chat;