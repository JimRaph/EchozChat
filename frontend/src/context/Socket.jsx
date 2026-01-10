// socket.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useAppContext } from "./context";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user, chats, setChats, setSelectedChat, 
    selectedContact, setMessages, selectedChat } = useAppContext() ;

  const socketRef = useRef(null); // persistent socket instance
  const [connected, setConnected] = useState(false);

  const selectedChatRef = useRef();

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!token || !user?._id) return;

    const socket = io(import.meta.env.VITE_BASE_URL, {
      auth: { token }
    });

    socketRef.current = socket;

    const userId = user._id;

    socket.removeAllListeners();

    // socket.onAny((event, ...args) => {
    //   console.log(`[SOCKET RECEIVED] ${event}:`, args);
    // });

    socket.on("connect", () => {
      console.log("Connected to socket server");
      setConnected(true);
      socket.emit("join", userId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    socket.on("new_chat", (chat) => {
      console.log("New chat received:", chat);

      setChats(prev => {
        const exists = prev.some(c => c._id === chat._id);
        return exists ? prev : [...prev, chat];
      });

      if (selectedContact &&
          chat.participants.some(p =>
            p._id === (selectedContact._id || selectedContact.contact?._id))) {
        setSelectedChat(chat);
      }
    });

    socket.on("new_message", ({ message: msg, chat }) => {
      // console.log("New message received:", msg);

      if (selectedChatRef.current?._id === msg.chat._id) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;

          const tempIndex = prev.findIndex(m => m.clientMessageId === msg.clientMessageId);
          if (tempIndex !== -1) {
            const newMessages = [...prev];
            newMessages[tempIndex] = msg;
            newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            return newMessages;
          }

          const updated = [...prev, msg];
          updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return updated;
        });
      }

      setChats(prev =>
        prev.map(c =>
          c._id === chat._id ? { ...c, latestMessage: msg } : c
        )
      );

      setChats(prev => {
        const existingChatIndex = prev.findIndex(c => c._id === msg.chat._id);
        if (existingChatIndex >= 0) {
          return prev.map(chat => {
            if (chat._id === msg.chat._id) {
              const updatedCounts = chat.unreadCounts?.map(uc => {
                if (
                  uc.user.toString() === user._id.toString() &&
                  msg.sender?._id !== user._id
                ) {
                  return { ...uc, count: uc.count + 1 };
                }
                return uc;
              }) || [];
              return { ...chat, latestMessage: msg, unreadCounts: updatedCounts };
            }
            return chat;
          });
        }
        return prev;
      });

      if (msg.sender?._id !== user._id) {
        socket.emit("mark_delivered", {
          messageId: msg._id,
          chatId: msg.chat._id,
          senderId: msg.sender._id
        });
      }
    });


    socket.on("join_chat_room", ({ chatId }) => {
      // console.log("Received join_chat_room for", chatId);
      if (socket.connected) {
        socket.emit("join_chat", chatId);
        // console.log(`Joined chat room ${chatId} by server request`);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        // console.log("Socket disconnected and listeners removed.");
      }
    };
  }, [token, user?._id]); 

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
