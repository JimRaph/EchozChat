import express from 'express';
import { 
  getMessages, 
  sendMessage, 
  // markMessagesDelivered, 
  // markMessagesRead, 
  // getUnreadCounts,
  toggleStar,
  getStarredMessages,
  deleteMessage,
  // deletemessages
} from '../controllers/messageController.js';
import { userProtect } from '../middlewares/auth.js';
import {upload} from '../utils/media.js'


const routerMessage = express.Router();

// Send message (with file support)
routerMessage.post('/message/send', userProtect, upload.array('files'), sendMessage);

// Get messages in a chat
routerMessage.get('/message/:chatId', userProtect, getMessages);

routerMessage.put('/message/:messageId/star', userProtect, toggleStar)

routerMessage.get('/message/starred/star', userProtect, getStarredMessages)
// // Mark message as delivered
// routerMessage.post('/message/:messageId/delivered', userProtect, markMessagesDelivered);

// // Mark message as read
// routerMessage.post('/message/:messageId/read', userProtect, markMessagesRead);

// // Get message read status
// routerMessage.get('/message/:chatId/readstatus', userProtect, getUnreadCounts);

routerMessage.delete('/message/delete/:messageId', userProtect, deleteMessage);

// routerMessage.delete('/message', deletemessages)

export default routerMessage;
