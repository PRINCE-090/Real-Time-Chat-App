import express from "express";

import {
  sendMessage,
  getMessages,
  markAsDelivered,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/send", sendMessage);

router.get(
  "/:senderId/:receiverId",
  getMessages
);

router.put(
  "/delivered/:messageId",
  markAsDelivered
);

export default router;