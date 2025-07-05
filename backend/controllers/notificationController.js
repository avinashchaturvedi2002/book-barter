import Notification from "../models/Notification.js";
const getNotifications=async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ notifications });
}

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