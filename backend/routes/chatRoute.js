import { Router } from "express";
import {userProtect} from '../middlewares/auth.js'
import {
    getChats,
    createChat,
    // getChat,
    createGroupChat,
    // updateGroupChat,
    // addToGroup,
    // removeFromGroup,
    getGroupChats, markChatAsRead, pinChat, favouriteChat,
    archiveChat, clearChatMessages, deleteChat, muteChat
} from '../controllers/chatController.js'
import { upload } from "../utils/media.js";

const routerChat = Router();

routerChat.get('/chats', userProtect, getChats);
routerChat.get('/chats/group', userProtect, getGroupChats);
routerChat.post('/chats', userProtect, createChat);
// routerChat.get('/chats/:chatId', userProtect, getChat);
routerChat.post('/chats/group', userProtect, upload.single("avatar"), createGroupChat);
// routerChat.put('/chats/group/:chatId', userProtect, updateGroupChat);
// routerChat.put('/chats/group/:chatId/add', userProtect, addToGroup);
// routerChat.put('/chats/group/:chatId/remove', userProtect, removeFromGroup);

routerChat.put('/chats/:chatId/read', userProtect, markChatAsRead);
routerChat.put('/chats/:chatId/pin', userProtect, pinChat);
routerChat.put('/chats/:chatId/favourite', userProtect, favouriteChat);
routerChat.put('/chats/:chatId/mute', userProtect, muteChat);
routerChat.put('/chats/:chatId/archive', userProtect, archiveChat);
routerChat.delete('/chats/:chatId/messages', userProtect, clearChatMessages);
routerChat.delete('/chats/:chatId', userProtect, deleteChat);

export default routerChat;