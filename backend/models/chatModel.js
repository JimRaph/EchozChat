import mongoose from "mongoose";

const userStatusSchema = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: Boolean, default: false }
};

const userCountSchema = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  count: { type: Number, default: 0 }
};

const userClearSchema = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clearedAt: { type: Date, default: Date.now }
};

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["individual", "group"],
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    name: {
      type: String,
      trim: true
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },

    // Unified status fields using reusable schema
    read: [userStatusSchema],
    pinned: [userStatusSchema],
    favourite: [userStatusSchema],
    muted: [userStatusSchema],
    archived: [userStatusSchema],

    clear: [userClearSchema],
    unreadCounts: [userCountSchema],

    softDeletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    avatar: {
      type: String,
      trim: true
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// 🔍 Indexes for faster queries
chatSchema.index({ type: 1, participants: 1 });
chatSchema.index({ softDeletedBy: 1 });
// chatSchema.index({ participants: 1, softDeletedBy: 1 });

// Initialize unreadCounts for new chats
chatSchema.pre("save", function (next) {
  if (this.isNew && this.participants?.length > 0) {
    this.unreadCounts = this.participants.map((userId) => ({
      user: userId,
      count: 0
    }));
  }
  next();
});

export const Chat =  mongoose.model("Chat", chatSchema);
