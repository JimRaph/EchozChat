import { 
  // storage, upload,
  cloudinary } from "../utils/media.js";
import { Message } from "../models/messageModel.js";
import { Chat } from "../models/chatModel.js";
import { v4 as uuidv4 } from 'uuid';
// import path from 'path'
import { onlineUsers } from "../server.js";


function sanitizeFilename(name) {
  return name
    .replace(/\s+/g, '_')           
    .replace(/[()]/g, '')           
    .replace(/[^a-zA-Z0-9._-]/g, '')
}

const getFormatFromMimetype = (mimetype) => {
if (mimetype.startsWith('image/')) return 'image';
if (mimetype.startsWith('video/')) return 'video';
if (mimetype.startsWith('audio/')) return 'audio';
return 'document';
};

// Send Message 

export const sendMessage = async (req, res) => {

  try {
    const { content, receiverId, clientMessageId, chatType } = req.body;
    const senderId = req.user._id;
    let undeletedUsers = [];
    
    console.log('receiver: ', receiverId)
    console.log('receiver: ', senderId)
    let chat;
    let isNewChat = false;

    // Handle Group Chat
    if (chatType === 'group') {
      chat = await Chat.findOne({ _id: receiverId, type: 'group' });

      if (!chat) {
        // console.log(receiverId)
        console.log('GROUP CHAT NOT FOUND')
        return res.status(404).json({
          success: false,
          message: 'Group chat not found'
        });
      }
    } 
     else {
      chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] },
        type: 'individual'
      });
      // console.log('chat exis: ', chat)
      
      // Check if user soft-deleted the chat
      if(chat){

        chat.participants.forEach(participantId => {
          if (chat.softDeletedBy.includes(participantId.toString())) {
            chat.softDeletedBy = chat.softDeletedBy.filter(id => id.toString() !== participantId.toString());
            undeletedUsers.push(participantId.toString());
          }
        });

        if (undeletedUsers.length > 0) {
          chat.markModified('softDeletedBy');
          await chat.save();
          console.log('Chat undeleted for:', undeletedUsers);
        }
        console.log('after save: ', chat.softDeletedBy)
      }
       else {
          // create one if it doesn't exist
          chat = await Chat.create({
            type: 'individual',
            participants: [senderId, receiverId],
          });
          // console.log('new chat: ', chat)
          isNewChat = true;
        }
      }


    // Media Uploads 
    let media = [];
    if (req.files) {
      media = await Promise.all(req.files.map(async (file) => {
          const extension = '.' + (file.originalname.split('.').pop() || '').toLowerCase();
          const sanitizedName = sanitizeFilename(file.originalname.replace(extension, ''));
          const fileType = file.mimetype.split('/')[0];


      const downloadUrl = cloudinary.url(file.filename, {
      secure: true,
      resource_type: file.resource_type,
      flags: 'attachment',
      attachment: `${sanitizedName}${extension}`,
    });

    const displayUrl = cloudinary.url(file.filename, {
      secure: true,
      resource_type: file.resource_type,
    });

    // console.log('resource_type: ', getFormatFromMimetype(file.mimetype))
    const mediaItem = {
      url: downloadUrl,
      displayUrl,
      format: getFormatFromMimetype(file.mimetype),
      filename: file.originalname,
      type: file.mimetype,
      size: file.size,
      originalExtension: extension.replace('.', ''),
    };

    if (['image', 'video'].includes(file.resource_type)) {
      if (file.width) mediaItem.width = file.width;
      if (file.height) mediaItem.height = file.height;
    }

    if (['video', 'audio'].includes(file.resource_type)) {
      if (file.duration) mediaItem.duration = file.duration;
    }

    // console.log('mediaItem: ', mediaItem)
    return mediaItem;
  }));
}

let resolvedType = 'text'

if (media.length) {
  const formats = [...new Set(media.map(m => m.format))];
  
  if (formats.length === 1) {
    resolvedType = formats[0] === 'raw' ? 'document' : formats[0];
  } else {
    resolvedType = 'media';
  }
}


  // console.log('media obj: ', media)
    // Create Message
    const message = await Message.create({
      chat: chat._id,
      sender: senderId,
      receiver: chat.participants.filter(id => id.toString() !== senderId.toString()),
      type: resolvedType,
      content: media.length ? null : content,
      media,
      status: 'sent',
      clientMessageId: clientMessageId || uuidv4(),
      isOptimistic: !!clientMessageId,
      deliveredAt: new Date()
    });

    // Ensures unreadCounts array includes recipient(s)
    const receivers = chat.participants.filter(id => id.toString() !== senderId.toString());
    // console.log('more: ', receivers)

    // Updates chat with unread count and latest message
  await Chat.findByIdAndUpdate(
  chat._id,
  {
    $inc: {
      'unreadCounts.$[elem].count': 1
    },
    $set: {
      latestMessage: message._id
    }
  },
  {
    arrayFilters: [{ 'elem.user': { $in: receivers } }]
  }
  );

  const updatedChat = await Chat.findById(chat._id).populate([
    { path: 'participants', select: 'username avatar Phone isOnline status' },
    { path: 'unreadCounts.user', select: 'username avatar Phone isOnline status' },
    {
      path: 'latestMessage',
      populate: { path: 'sender receiver readBy deliveredTo' }
    }
  ]);

    // Populate the new message for UI response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender')
      .populate('receiver')
      .populate('chat')
      .populate('readBy')
      .populate('deliveredTo');


    // emit socket events
    console.log('MEDIAAAA: ')
    req.io.to(updatedChat._id.toString()).emit('new_message', {
      message: populatedMessage,
      chat: updatedChat
    });

  updatedChat.participants.forEach(participant => {
    const userIdStr = participant._id.toString();
    console.log('pa: ', participant)
    if (userIdStr !== senderId.toString()) {
      req.io.to(userIdStr).emit('new_message', {
        message: populatedMessage,
        chat: updatedChat
        });
      }
  });

    console.log('1')
  
    if (isNewChat) {
      // For new chats, make backend tell participants to join
      chat.participants.forEach(participant => {
        console.log('participants: ', participant._id)
        console.log('online: ', onlineUsers)
        req.io.to(participant._id.toString()).emit('join_chat_room', {
          chatId: chat._id,
          initialMessage: populatedMessage
        });
      });
    }


    if (isNewChat ) {
      receivers.forEach(receiver =>
        req.io.to(receiver.toString()).emit('new_chat', updatedChat)
      );
    }
    console.log('3')

    if(undeletedUsers.length>0){
      undeletedUsers.forEach(userId => {
        console.log('part: ', userId)
        req.io.to(userId).emit('new_chat', updatedChat);
      });
    }


    return res.status(201).json({
      success: true,
      message: populatedMessage,
      chat: isNewChat ? updatedChat : undefined
    });
  } catch (error) {
    console.error('SendMessage error:', error);
    return res.status(500).json({
      success: false,
      message: 'Message sending failed',
      isRetryable: true
    });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    // console.log(chatId)
    // Checks if chatId is provided
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user.id)) {
      console.log("can't get messages getMessages")
      return res.status(403).json({ message: 'Error getting messages' });
    }

    const clearEntry = chat.clear.find(entry => entry.user.toString() === req.user.id);
    const filter = { chat: chatId };

    if (clearEntry) {
      filter.createdAt = { $gt: clearEntry.clearedAt }; 
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate("sender receiver chat");
      
    // console.log('Messages: ', messages)
    res.status(200).json({ success: true, messages });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// toggles starred message
export const toggleStar = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      console.log('MESSAGE NOT FOUND: ', message)
      return res.status(404).json({ message: "Message not found" })};

    const isStarred = message.starredBy.includes(userId);
    
    if (isStarred) {
      message.starredBy.pull(userId);
    } else {
      message.starredBy.push(userId);
    }

    await message.save();
    
  req.io.to(message.chat.toString()).emit('message_starred', {
        messageId: message._id,
        starredBy: message.starredBy
      });

    res.json({ 
      success: true,
      isStarred: !isStarred,
      starredBy: message.starredBy,
      message: "Message star status updated"
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// get starred messages
export const getStarredMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      starredBy: req.user._id
    })
    .populate('sender', 'username avatar Phone')
    .populate('chat', 'name type')
    .sort({ createdAt: -1 });

    res.json({success: true, messages});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id; 

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user is the sender
    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own messages" });
    }

    // Delete media from Cloudinary if any
    if (message.media.length > 0) {
      // console.log('MEDIA: ',message.media)
      for (const mediaUrl of message.media) {
        const publicId = mediaUrl.url.split("/").pop().split(".")[0]; 
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Delete the message from the database
    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Message deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res
      .status(500)
      .json({ message: "Error deleting message", error: error.message });
  }
};

// // for testing purpose
// export const deletemessages = async(req,res) => {
//   try {
//     await Message.deleteMany({})
//   } catch (error) {
//     console.log('ERROR DELETING ALL MESSAGES')
//   }
// };