import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// 1. Get or create conversation
export const getOrCreateConversation = async (req, res) => {
  const userA = req.user._id;
  const userB = req.params.userId;

  if (userA === userB) return res.status(400).json({ message: "Cannot chat with yourself" });

  let conversation = await Conversation.findOne({
    members: { $all: [userA, userB], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({ members: [userA, userB] });
  }

  const messages = await Message.find({ conversationId: conversation._id }).sort('createdAt');

  res.json({ _id: conversation._id, messages });
};

// 2. Get messages by conversationId
export const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({ conversationId }).sort('createdAt');

  res.json(messages);
};
