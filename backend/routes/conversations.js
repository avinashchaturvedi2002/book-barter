import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import verifyToken from '../middlewares/verifyUser.js';

const router = express.Router();


router.get("/unseen-count", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Get all conversation IDs where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    }).select("_id");

    const conversationIds = conversations.map((c) => c._id);

    // Step 2: Count unseen messages in those conversations only
    const count = await Message.countDocuments({
      conversationId: { $in: conversationIds },
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


router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { before, limit = 20 } = req.query;

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId] }
    }).populate('lastMessage');

    const receiver = await User.findById(userId).select('firstName profileImage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, userId]
      });
    }

    const filter = { conversationId: conversation._id };
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      conversation,
      receiver,
      messages: messages.reverse(), // because we sort desc
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;