import { Chat } from "../models/chatModel.js";
import { User } from "../models/userModel.js";
import mongoose, { trusted } from "mongoose";
import {v2 as cloudinary} from 'cloudinary'



export const getChats = async (req, res) => {
  // console.log('SENDING OUT CHATS')
  try {
    const chats = await Chat.find({
      participants: { $in: req.user.id },
      softDeletedBy: { $ne: req.user.id }
    })
    .populate("participants")
    .populate("latestMessage");

    // console.log('SENDING OUT CHATS', chats)

    res.status(200).json({
      success: true,
      chats
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chats"
    });
  }
};

export const getGroupChats = async (req, res) => {
  try {
    const userSelectFields = 'username avatar Phone lastLogin countryCode isOnline status';

    let groupChats = await Chat.find({
      type: "group",
      participants: {$in: req.user.id},
      softDeletedBy: {$ne: req.user.id}
    })
    .populate([
      { path: 'participants', select: userSelectFields },
      { 
        path: 'latestMessage', 
        populate: { path: 'sender', select: userSelectFields }
      },
      { path: 'read.user', select: userSelectFields },
      { path: 'pinned.user', select: userSelectFields },
      { path: 'favourite.user', select: userSelectFields },
      { path: 'muted.user', select: userSelectFields },
      { path: 'archived.user', select: userSelectFields },
      { path: 'clear.user', select: userSelectFields },
      { path: 'unreadCounts.user', select: userSelectFields },
      { path: 'softDeletedBy', select: userSelectFields },
      { path: 'admin', select: userSelectFields }
    ]);

    groupChats = await Chat.populate(groupChats, { path: 'admin', select: userSelectFields });

    if (groupChats.length === 0) {
      return res.status(200).json({ 
        message: "No group chats found" }),
        groupChats
    }

    console.log('no. of group chats: ', groupChats.length)
    
    return res.status(200).json({
      message: "Group chats found",
      groupChats,
      success: true
    });

  } catch (err) {
    console.error("Error getting group chats:", err);
    return res.status(500).json({
      message: "Error getting group chats",
      error: err.message
    });
  }
};


// GET A SINGLE CHAT BY ID
export const getChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const chat = await Chat.findOne({type: "individual", _id:chatId}).populate(
      "participants",
      "username phone avatar isOnline"
    );

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    return res.json({ message: "Chat retrieved successfully", chat: chat });
  } catch (error) {
    console.error("Error retrieving chat:", error);
    return res
      .status(500)
      .json({ message: "Error retrieving chat", error: error.message });
  }
};

//CREATE A SINGLE CHAT
export const createChat = async (req, res) => {
  try {
    const { Phone } = req.body;

    const participantId = await User.findOne({Phone})
    const user = await User.findById(req.user._id)
    console.log(user)

    if (!participantId) {
      return res
       .status(404)
       .json({ message: "User not found, invite to WhatsApp" });
    }
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      type: "individual",
      participants: { $all: [req.user._id, participantId._id] },
    }).populate("participants","-contacts -verificationCode").populate('latestMessage');

    if (existingChat) {
      // console.log({ message: "Chat f already exists", chat: existingChat })
      return res.json({ message: "Chat already exists", chat: existingChat });
    }

    const softDeletedChat = await Chat.findOne({
      type: "individual",
      participants: { $in: [req.user._id, participantId._id] }
    });

    if (softDeletedChat) {
      return res.status(403).json({ message: "Chat previously deleted, cannot be re-created automatically" });
    }

    const chat = new Chat({
      type: "individual",
      participants: [req.user._id, participantId._id],
    });
    await chat.save()

    const sendChat = await Chat.findById(chat._id).
                    populate("participants","-contacts -verificationCode")
                    .populate('latestMessage');

    // console.log({ message: "Chat created", chat: JSON.stringify(sendChat) })
    res.status(201).json({ message: "Chat created", chat: sendChat, success: trusted });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res
      .status(500)
      .json({ message: "Error creating chat", error: error.message });
  }
};

//CREATE A GROUP CHAT

export const createGroupChat = async (req, res) => {
  try {
    let { group_name, duration } = req.body;
    const participants = JSON.parse(req.body.participants);
    const avatar = req.file;

    if (!group_name || !participants.length) {
      return res.status(400).json({ message: "Name and at least one participant is required" });
    }

    // Include creator and remove duplicates
    const participantIds = [...new Set([...participants, req.user.id])];

    // Validate ObjectIds
    const validParticipantIds = participantIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validParticipantIds.length !== participantIds.length) {
      return res.status(400).json({ message: "Invalid participant IDs detected" });
    }

    // Parse duration
    if (duration) {
      const lowerDuration = duration.toLowerCase().trim();
      if (lowerDuration.includes("days")) {
        duration = parseInt(lowerDuration.split(" ")[0]) * 24 * 60 * 60 * 1000;
      } else if (lowerDuration.includes("hours")) {
        duration = parseInt(lowerDuration.split(" ")[0]) * 60 * 60 * 1000;
      } else {
        duration = null;
      }
    }

    let avatarUrl = "";
    if (avatar) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(avatar.path, {
          folder: "group_avatars",
          transformation: [{ width: 100, height: 100, crop: "fill" }],
        });
        avatarUrl = uploadResponse.secure_url;
        // console.log("Avatar uploaded to Cloudinary:", avatarUrl);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Error uploading avatar to Cloudinary" });
      }
    }

    const groupObject = {
      type: "group",
      admin: req.user.id,
      name: group_name,
      durationClear: duration,
      avatar: avatarUrl,
      participants: validParticipantIds,
    };

    const chat = await Chat.create(groupObject);

    const userSelectFields = 'username avatar Phone lastLogin countryCode isOnline status';
    await chat.populate([
      { path: 'participants', select: userSelectFields },
      { path: 'admin', select: userSelectFields }
    ]);

    return res.status(201).json({
      message: "Group chat created successfully",
      chat,
      success: true
    });

  } catch (error) {
    console.error("Error creating group chat:", error.stack || error);
    return res.status(500).json({ message: "Error creating group chat", error: error.message });
  }
};


//UPDATE GROUP chat
export const updateGroupChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { name, avatar } = req.body;

    let updateObject = {};

    if (avatar !== undefined) updateObject.avatar = avatar;
    if (name !== undefined) updateObject.name = name;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      updateObject,
      { new: true } // Return updated document
    );

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.status(200).json({ message: "Group chat updated", chat });
  } catch (error) {
    console.error("Error updating group chat:", error);
    return res
      .status(500)
      .json({ message: "Error updating group chat", error: error.message });
  }
};


export const addToGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { Phones } = req.body;

    // Find users by phone numbers and extract only their _id values
    const participants = await User.find({ Phone: { $in: Phones } }).select("_id");

    // Convert to an array of ObjectId values
    const participantIds = participants.map(user => user._id);

    if (participantIds.length === 0) {
      return res.status(400).json({ message: "No valid participants found" });
    }

    // Find the chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.type !== "group") {
      return res.status(400).json({ message: "Not a group chat" });
    }

    // Convert existing participants to strings for comparison
    const existingParticipants = chat.participants.map(id => id.toString());

    // Filter out users already in the group
    const newParticipants = participantIds.filter(id => !existingParticipants.includes(id.toString()));

    if (newParticipants.length === 0) {
      return res.status(400).json({ message: "All users are already in the group" });
    }

    chat.participants = [...chat.participants, ...newParticipants];

    await chat.save();

    return res.status(200).json({ message: "Users added to group", chat });
  } catch (error) {
    console.error("Error adding user to chat:", error);
    return res.status(500).json({
      message: "Error adding user to chat",
      error: error.message,
    });
  }
}


export const removeFromGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { Phones } = req.body;

    // Find users by phone numbers and get only their ObjectId
    const participants = await User.find({ Phone: { $in: Phones } }).select("_id");

    // Convert to an array of ObjectId values
    const participantIds = participants.map(user => user._id);

    if (participantIds.length === 0) {
      return res.status(400).json({ message: "No valid participants found" });
    }

    // Find the chat first
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.type !== "group") {
      return res.status(400).json({ message: "Not a group chat" });
    }

    // Remove participants correctly
    //equals is the correc way to compare objectid in mongoose
  
    chat.participants = chat.participants.filter(participant => 
      !participantIds.some(id => id.equals(participant))
  );

    await chat.save();

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("Error removing user from chat:", error);
    return res.status(500).json({ message: "Error removing user from chat", error: error.message });
  }
};

// Mark chat as read
export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Reset unread count
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $pull: { read: { user: userId } },
      $addToSet: { read: { user: userId, status: true } },
      $set: { 'unreadCounts.$[elem].count': 0 }
    }, {
      arrayFilters: [{ 'elem.user': userId }],
      new: true
    });

    // Emit event to all participants
    req.io.to(chatId).emit('chat_read', {
      chatId,
      userId,
      unreadCount: 0
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const pinChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    
    // Verify chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id
    }).populate('participants latestMessage');
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found or user not authorized" });
    }
    
    // Set pinned status
    const pinnedEntryIndex = chat.pinned.findIndex(entry => entry?.user?.toString() === userId);

    if (pinnedEntryIndex !== -1) {
      // If user has already marked it as read, remove them (toggle back to unread)
      chat.pinned.splice(pinnedEntryIndex, 1);
    } else {
      // If user hasn't marked it as read, add them to the read array
      chat.pinned.push({ user: userId, status: true });
    }

    await chat.save();
    
    return res.status(200).json({ 
      message: pinnedEntryIndex !== -1 ? "Chat pinned" : "Chat unpinned", 
      success: true,
      chat 
    });
  } catch (error) {
    console.error("Error updating pin status:", error);
    return res.status(500).json({ 
      message: "Error updating pin status", 
      error: error.message 
    });
  }
};

//Mark chat as favorite
export const favouriteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Verify chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id
    }).populate('participants latestMessage');
    // console.log("fav chat: ", chat)
    
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found or user not authorized" });
    }
    
    if (!Array.isArray(chat.favourite) || typeof chat.favourite[0] === "boolean") {
      chat.favourite = []; 
    } 

    const favEntryIndex = chat.favourite.findIndex(entry => entry?.user?.toString() === userId);

    if (favEntryIndex !== -1) {
      // console.log("chat does exist: ")
      // If user has already marked it as fav, remove them (toggle back to norm)
      chat.favourite.splice(favEntryIndex, 1);
    } else {
      // console.log("chat doesn't exist: ")
      // If user hasn't marked it as read, add them to the read array
      chat.favourite.push({ user: userId, status: true });
    }

    await chat.save();
    
    return res.status(200).json({ 
      message: favEntryIndex !== -1 ? "Chat starred" : "Chat unstarred", 
      success: true,
      chat 
    });
  } catch (error) {
    console.error("Error updating favorite status:", error);
    return res.status(500).json({ 
      message: "Error updating favorite status", 
      error: error.message 
    });
  }
};


// Mute chat
export const muteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    
    // Verify chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id
    }).populate('participants latestMessage');
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found or user not authorized" });
    }
    
    // Set pinned status
    const muteEntryIndex = chat.muted.findIndex(entry => entry?.user?.toString() === userId);

    if (muteEntryIndex !== -1) {
      // If user has already marked it as read, remove them (toggle back to unread)
      chat.muted.splice(muteEntryIndex, 1);
    } else {
      // If user hasn't marked it as read, add them to the read array
      chat.muted.push({ user: userId, status: true });
    }

    await chat.save();
    
    return res.status(200).json({ 
      message: muteEntryIndex !== -1 ? "Chat muted" : "Chat unmuted", 
      success: true,
      chat 
    });
  } catch (error) {
    console.error("Error updating mute status:", error);
    return res.status(500).json({ 
      message: "Error updating mute status", 
      error: error.message 
    });
  }
};


// Archive chat
export const archiveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    
    // Verify chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id
    }).populate('participants latestMessage');
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found or user not authorized" });
    }
    
    // Set pinned status
    const archiveEntryIndex = chat.archived.findIndex(entry => entry?.user?.toString() === userId);

    if (archiveEntryIndex !== -1) {
      // If user has already marked it as archived, remove them (toggle back to unarchived)
      chat.archived.splice(archiveEntryIndex, 1);
    } else {
      // If user hasn't marked it as archived, add them to the archived array
      chat.archived.push({ user: userId, status: true });
    }

    await chat.save();
    
    return res.status(200).json({ 
      message: archiveEntryIndex !== -1 ? "Chat archived" : "Chat unarchived", 
      success: true,
      chat 
    });
  } catch (error) {
    console.error("Error updating archive status:", error);
    return res.status(500).json({ 
      message: "Error updating archive status", 
      error: error.message 
    });
  }
};


// Clear all messages in a chat
export const clearChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    }).populate('participants latestMessage');

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or user not authorized" });
    }

    //  update clear timestamp
    const clearEntry = chat.clear.find(entry => entry.user.toString() === userId);
    if (clearEntry) {
      clearEntry.clearedAt = new Date();
    } else {
      chat.clear.push({ user: userId, clearedAt: new Date() });
    }

    // resets unread count 
    chat.unreadCounts = chat.unreadCounts.map(uc => 
      uc.user.toString() === userId ? { ...uc, count: 0 } : uc
    );

    await chat.save();

    return res.status(200).json({ 
      message: "Chat messages cleared", 
      success: true,
      chat 
    });

  } catch (error) {
    console.error("Error clearing chat messages:", error);
    return res.status(500).json({ 
      message: "Error clearing chat messages", 
      error: error.message 
    });
  }
};



// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    }).populate('participants');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or access denied to delete chat"
      });
    }

    // Soft-delete logic
    if (!chat.softDeletedBy.includes(userId.toString())) {
      chat.softDeletedBy.push(userId.toString());
    }

    // Update or insert clear timestamp
    const clearEntry = chat.clear.find(entry => entry.user.toString() === userId.toString());
    if (clearEntry) {
      clearEntry.clearedAt = new Date();
    } else {
      chat.clear.push({ user: userId, clearedAt: new Date() });
    }

    // Reset unread count for user
    chat.unreadCounts = chat.unreadCounts.map(uc =>
      uc.user.toString() === userId.toString() ? { ...uc, count: 0 } : uc
    );

    // Delete chat if all participants have deleted
    if (chat.participants.length === chat.softDeletedBy.length) {
      await chat.deleteOne();
      return res.status(200).json({
        success: true,
        message: "Chat deleted for all participants"
      });
    }

    await chat.save();

    // Notify others in the room
    req.io.to(chatId).emit('participant_left', {
      chatId,
      userId,
      remainingParticipants: chat.participants
    });

    return res.status(200).json({
      success: true,
      message: "Chat deleted",
      chat
    });

  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting chat",
      error: error.message
    });
  }
};



