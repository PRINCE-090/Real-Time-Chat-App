import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

function Chat() {
  const navigate = useNavigate();

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <h1>Please Login</h1>;
  }

  const senderId = user._id;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/users"
        );

        const filteredUsers = res.data.filter(
          (u) => u._id !== senderId
        );

        setUsers(filteredUsers);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUsers();
  }, [senderId]);

  // LOAD OLD MESSAGES
  useEffect(() => {
    if (!receiverId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${senderId}/${receiverId}`
        );

        setMessages(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();
  }, [receiverId, senderId]);

  // SOCKET CONNECTION
  useEffect(() => {
    socket.emit("join_room", senderId);

    socket.emit("user_online", senderId);

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("online_users", (users) => {
      console.log("ONLINE USERS RECEIVED:", users);

      setOnlineUsers(
        users.map((id) => String(id))
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("online_users");
    };
  }, [senderId]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!receiverId) {
      alert("Select a user first");
      return;
    }

    if (!message.trim()) return;

    const messageData = {
      senderId,
      receiverId,
      message,
    };

    try {
      await axios.post(
        "http://localhost:5000/api/messages/send",
        messageData
      );

      socket.emit("send_message", messageData);

      setMessages((prev) => [...prev, messageData]);

      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Real-Time Chat App</h1>

      <button
        onClick={logout}
        style={{
          marginBottom: "15px",
        }}
      >
        Logout
      </button>

      {/* USERS LIST */}
      <div
        style={{
          border: "1px solid gray",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        <h3>Users</h3>

        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => setReceiverId(u._id)}
            style={{
              cursor: "pointer",
              padding: "8px",
              marginBottom: "5px",
              borderRadius: "5px",
              background:
                receiverId === u._id
                  ? "#ddd"
                  : "#f5f5f5",
            }}
          >
            {onlineUsers.includes(
              String(u._id)
            )
              ? "🟢 "
              : "⚫ "}

            {u.name}
          </div>
        ))}
      </div>

      {/* CHAT BOX */}
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
              {String(msg.senderId) ===
              String(senderId)
                ? "You"
                : "Other"}
            </strong>
            : {msg.message}
          </p>
        ))}
      </div>

      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}

export default Chat;