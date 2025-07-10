import Notification from "../models/Notification.js";
const getNotifications = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: req.user._id }),
  ]);

  const hasMore = skip + notifications.length < total;

  res.json({ notifications, hasMore });
};


const markAsRead=async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true }
  );
  res.sendStatus(204);
}

const markAllRead=async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );
  res.sendStatus(204);
}

export {getNotifications,markAsRead,markAllRead}