import Message from "../models/Message.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  res.json(newMessage);
};

// GET CHAT HISTORY
export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;

  const messages = await Message.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
};