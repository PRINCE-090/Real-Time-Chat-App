import Message from "../models/Message.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
    status: "sent",
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
export const markAsDelivered = async (req, res) => {

  const { messageId } = req.params;

  try {

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status: "delivered" },
      { new: true }
    );

    res.json(message);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};