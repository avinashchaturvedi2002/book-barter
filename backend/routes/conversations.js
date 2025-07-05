import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import verifyToken from '../middlewares/verifyUser.js';

const router = express.Router();


router.get("/unseen-count", verifyToken, async (req, res) => {
  try {
    console.log("check");
    const userId = req.user._id;

    const count = await Message.countDocuments({
      seenBy: { $ne: userId },
      sender: { $ne: userId },
    });

    res.json({ count });
  } catch (err) {
    console.error("Error fetching unseen message count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user conversations
router.get("/", verifyToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate({
        path: "participants",
        select: "_id firstName lastName profileImage",
      })
      .populate({
        path: "lastMessage",
        select: "content createdAt sender",
      })
      .sort({ updatedAt: -1 });

    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const unseenCount = await Message.countDocuments({
  conversationId: conv._id,
 seenBy: { $ne: req.user._id },     
  sender: { $ne: req.user._id },
});

        return {
          _id: conv._id,
          participants: conv.participants,
          lastMessage: conv.lastMessage,
          unseenCount,
        };
      })
    );

    res.json(enrichedConversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get or create conversation
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId] }
    }).populate('lastMessage');

    // Get receiver's details
    const receiver = await User.findById(userId).select('firstName profileImage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, userId]
      });
    }

    // Get messages
    const messages = await Message.find({
      conversationId: conversation._id
    }).sort({ createdAt: 1 });

    res.json({ conversation, messages, receiver });  // ✅ Send receiver's info
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});












export default router;