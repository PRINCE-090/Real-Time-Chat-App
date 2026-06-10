import { useEffect, useState, useRef } from "react";
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
  const [typingUser, setTypingUser] = useState("");
  const messagesEndRef = useRef(null);

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
        const res = await axios.get("http://localhost:5000/api/auth/users");

        const filteredUsers = res.data.filter((u) => u._id !== senderId);

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
          `http://localhost:5000/api/messages/${senderId}/${receiverId}`,
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

      setOnlineUsers(users.map((id) => String(id)));
    });

    socket.on("user_typing", (data) => {
      setTypingUser(data.senderName);

      setTimeout(() => {
        setTypingUser("");
      }, 2000);
    });
    

    return () => {
      socket.off("receive_message");
      socket.off("online_users");
      socket.off("user_typing");
    };
  }, [senderId]);

  useEffect(() => {

  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });

}, [messages]);

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
      await axios.post("http://localhost:5000/api/messages/send", messageData);

      socket.emit("send_message", messageData);

      setMessages((prev) => [...prev, messageData]);

      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
      <div className="h-screen bg-gray-100 flex">
      {/* USERS LIST */}
      <div className="w-1/4 bg-white border-r flex flex-col">

  <div className="p-4 bg-green-600 text-white flex justify-between items-center">

    <h2 className="font-bold text-lg">
      Chats
    </h2>

    <button
      onClick={logout}
      className="bg-red-500 px-3 py-1 rounded"
    >
      Logout
    </button>

  </div>

  <div className="flex-1 overflow-y-auto">

    {users.map((u) => (

      <div
        key={u._id}
        onClick={() => setReceiverId(u._id)}
        className={`p-4 cursor-pointer border-b hover:bg-gray-100 ${
          receiverId === u._id
            ? "bg-green-100"
            : ""
        }`}
      >

        <div className="font-semibold">

          {onlineUsers.includes(String(u._id))
            ? "🟢 "
            : "⚫ "}

          {u.name}

        </div>

      </div>

    ))}

  </div>

</div>

      {/* CHAT BOX */}
    {/* CHAT AREA */}
<div className="flex-1 flex flex-col">

  {/* Header */}
  <div className="bg-green-600 text-white p-4 font-bold">
    {receiverId ? "Chat" : "Select a User"}
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4">

    {messages.map((msg, index) => (

      <div
        key={index}
        className={`mb-3 flex ${
          String(msg.senderId) === String(senderId)
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`px-4 py-2 rounded-lg max-w-xs ${
            String(msg.senderId) === String(senderId)
              ? "bg-green-500 text-white"
              : "bg-white border"
          }`}
        >
          {msg.message}
        </div>
      </div>

    ))}

    <div ref={messagesEndRef}></div>

  </div>

  {/* Typing */}
  {typingUser && (
    <div className="px-4 py-2 text-green-600 italic">
      {typingUser} is typing...
    </div>
  )}

  {/* Input */}
  <div className="p-4 bg-white border-t flex gap-2">

    <input
      type="text"
      placeholder="Type a message..."
      value={message}
      onChange={(e) => {

        setMessage(e.target.value);

        if (receiverId) {

          socket.emit("typing", {
            receiverId,
            senderName: user.name,
          });

        }

      }}
      className="flex-1 border rounded-lg px-4 py-2"
    />

    <button
      onClick={sendMessage}
      className="bg-green-600 text-white px-6 py-2 rounded-lg"
    >
      Send
    </button>
    </div>

  </div>

</div>
);
}

export default Chat;
