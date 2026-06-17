import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";


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
  const [search, setSearch] = useState("");
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
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
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
      status: "sent",
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/messages/send",
        messageData,
      );

      socket.emit("send_message", res.data);
      setMessages((prev) => [...prev, res.data]);

      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

   return (

<div className="h-screen bg-gray-100 flex">

  <Sidebar

    users={users}

    receiverId={receiverId}

    setReceiverId={setReceiverId}

    onlineUsers={onlineUsers}

    logout={logout}

    search={search}

    setSearch={setSearch}

  />

  <div className="flex-1 flex flex-col">

    <ChatHeader

      receiverId={receiverId}

    />

    <MessageList

      messages={messages}

      senderId={senderId}

      formatTime={formatTime}

      messagesEndRef={messagesEndRef}

    />

    {typingUser && (

      <div className="px-4 py-2 text-green-600 italic">

        {typingUser} is typing...

      </div>

    )}

    <MessageInput

      message={message}

      setMessage={setMessage}

      receiverId={receiverId}

      user={user}

      socket={socket}

      sendMessage={sendMessage}

    />

  </div>

</div>

);

}

export default Chat;