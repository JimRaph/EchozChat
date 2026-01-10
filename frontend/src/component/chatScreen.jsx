import { useState, useEffect, useRef, useCallback } from "react";
import {
   Search, Mic, File, Camera, Video, X, Phone,
   MicOff,
   Trash,
   Download
} from "lucide-react";
import { useAppContext } from "../context/context";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { useSocket } from "../context/Socket";
import { useWebRTC } from '../hooks/useWebRTC';
import { base_url } from "../../utils/baseUrl";
import { toast } from "sonner";


const ChatScreen = ({ recipient}) => {

  const  socket  = useSocket();
  const {
    selectedChat, user, token,setSelectedChat,
    messages, setMessages, setChats, identifier, messageRefs, 
    selectedContact, chatBg, chats, setSelectedContact
  } = useAppContext() ;
  const { theme, HoverableItem } = useTheme();

  const [showFiles, setShowFiles]  =useState(false)
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(()=>{
    return files[files.length-1]
  })
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // const pageRef = useRef(0);
  const scrollableRef = useRef(null);
  const inputFileMedia = useRef(null);
  const inputFileDoc = useRef(null);
  const messagesEndRef = useRef(null);
  const hasMoreRef = useRef(true);
  const typingTimeout = useRef();
  const observerRef = useRef();

  
  const { 
   localStream,
   remoteStream,
   callStatus,
   activeCall,
   initiateCall,
   answerCall,
   endCall,
   isMuted,
   isRemoteMuted,
   toggleMute
 } = useWebRTC(socket, user?._id); 

  const userId = user?._id;
  const chatId = selectedChat?._id;

  // --------------------------------------------
  // HANDLE LOADING MESSAGE HISTORY 
  // ----------------------------------------------
  const loadHistory = useCallback(async () => {
    if (loadingHistory || !hasMoreRef.current) return;
    setLoadingHistory(true);
    try {
      const res = await axios.get(
        `${base_url}/message/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if(res.data.success){
        const fetched = res.data.messages || [];
        // console.log('fetched: ', fetched)
        setMessages(prev => {
        const combined = [...fetched, ...prev];
        const uniqueMessages = Array.from(new Map(combined.map(m => [m._id, m])).values());
        return uniqueMessages;
      });

      if (fetched?.length < 20) {
        hasMoreRef.current = false;
        setHasMore(false);
      }

      } else{
        toast.error(res?.data?.message || 'Something went wrong')
      }
      // pageRef.current++;
    } catch (err) {
      console.error("Error loading history:", err);
      toast.error(err?.response?.data?.message || 'Something went wrong, try again');
    } finally {
      setLoadingHistory(false);
    }
  }, [chatId, token, loadingHistory]);
  
  // load history on chat change
  useEffect(() => {
    if (!chatId) return;
    // socket?.emit("join_chat", chatId);
    // pageRef.current = 0;
    setHasMore(true);
    hasMoreRef.current = true;
    setMessages([]);
    loadHistory();
    scrollToBottom();
  }, [chatId]);


  useEffect(() => {
    if (messages.length > 0 && !loadingHistory) {
      const container = scrollableRef.current;
      
      const shouldScrollToBottom = () => {
        if (!container) return false;
        return container.scrollHeight - container.clientHeight - container.scrollTop < 100;
      };

      if (shouldScrollToBottom()) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'auto'
        });
        }
      }
  }, [loadingHistory, messages.length]);
  // -------------------------------------------
// // typing Effect
// -------------------------------------------------

  const handleKeyPress = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage({ content: newMessage });
    } else sendTyping();
  };


  const sendTyping = useCallback(() => {
    if (!chatId) return;

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    socket.emit("typing", { chatId });

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { chatId });
      typingTimeout.current = null;
    }, 1500);
  }, [chatId, socket]);



  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ userId, chatId: incomingChatId, isTyping }) => {
      if (incomingChatId !== selectedChat?._id) return;

      setTypingUsers(prev => {
        const newSet = new Set(prev);
        isTyping ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      });
    };

    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("user_typing", handleUserTyping);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [socket, selectedChat]);

  // ------------------------------------------------------------
  // loads messages on scroll
  // -------------------------------------------------

  const handleScroll = () => {
    if (scrollableRef.current.scrollTop < 100 && hasMore) {
      loadHistory();
    }
  };


  // ------------------------------------------------------
  // // socket listener for new messages, new chat. set unreadcount field
  // // sets selected chat and adds to chats. sets last msg
  // -------------------------------------------------------
// console.log('MESSAGE: ', messages[messages.length-1])
  useEffect(() => {

    if(!socket) return

    // console.log('Attaching new chat socket')

  const handleChatUpdated = (updatedChat) => {
    // console.log('Chat updated:', updatedChat._id);
    setChats(prev => {
      const existingChatIndex = prev.findIndex(c => c._id === updatedChat._id);
      
      if (existingChatIndex >= 0) {
        return prev.map(c => 
          c._id === updatedChat._id ? updatedChat : c
        );
      }
      return [...prev, updatedChat]; 
    });
    
    if (selectedChat?._id === updatedChat._id) {
      setSelectedChat(updatedChat);
    }
  };

  const handleMessageDelivered = ({ messageId, deliveredTo }) => {
    
    setMessages(prev => prev.map(m => 
      m._id === messageId ? { ...m, deliveredTo } : m
    ));
    // console.log('MESSAGE DELIVERED')
  };


    scrollToBottom();
  // Set up all listeners
  socket.on("chat_updated", handleChatUpdated);
  socket.on("message_delivered", handleMessageDelivered);

  return () => {
    socket.off("chat_updated", handleChatUpdated);
    socket.off("message_delivered", handleMessageDelivered);
  };
  }, [selectedChat?._id, socket, messages]);
 

  // Add this useEffect to handle message status updates
  useEffect(() => {
    if(!socket) return 

    const handleMessageStatus = ({ messageId, status, deliveredTo, readBy }) => {
      setMessages(prev => prev.map(m => {
        if (m._id === messageId) {
          // console.log('message status')
          return { 
            ...m, 
            status: status || m.status,
            deliveredTo: deliveredTo || m.deliveredTo,
            readBy: readBy || m.readBy
          };
        }
        return m;
      }));
    };

    socket.on('message_status', handleMessageStatus);
    return () => socket.off('message_status', handleMessageStatus);
  }, [messages]);

  //user room on socket connection
// useEffect(() => {
//   if (!socket || !user?._id) return;
//   // Join personal room
//   socket.emit("join_user", user._id);
// }, [socket, user?._id]);

useEffect(() => {
  if (!socket || !selectedChat) return;
  
  // Join chat room
  socket.emit("join_chat", selectedChat._id);
  
  // Also join all participants' rooms
  selectedChat.participants.forEach(p => {
    if (p._id !== user._id) {
      socket.emit("join_user", p._id);
    }
  });
}, [socket, selectedChat]);
  // ---------------------------------------------
  // Auto-scroll to bottom
  // -------------------------------------------------
  useEffect(() => {
    // messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    scrollToBottom()
  }, [messages, socket]);


  // ----------------------------------------------------
  // Send message. sends 'join_chat' event
  // --------------------------------------------------

    const scrollToBottom = (instant = false) => {
    const container = scrollableRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: instant ? 'auto' : 'smooth'
      });
    }
  };

  const sendMessage = async ({ content = "", media = [] }) => {
    let type
    let recipientId
    if (!content.trim() && media.length === 0) return;

    if(selectedChat && selectedChat.type=='group'){

      type = 'group'
      recipientId = selectedChat._id
    }else{
      type = 'individual'
      // console.log('RECIPIENT: ', recipient)
      recipientId = recipient.firstname ? recipient.contact._id : recipient._id
    }

    // console.log(recipient)
    // console.log('GROU: ', recipientId) 
    const formData = new FormData();
    // formData.append("chatId", msgChat);
    formData.append("receiverId", recipientId);

    if (content.trim()) formData.append("content", content.trim());
    media.forEach(file => formData.append("files", file));
    formData.append("chatType", type)

    try {
      const {data} = await axios.post(`${base_url}/message/send`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      
    if (data.success) {
      const populatedMessage = {
        ...data.message,
        sender: user, 
        chat: data.chat || selectedChat 
      };

      setNewMessage(""); 
    setFiles([]);      
    setSelectedFile(null);
    setShowFiles(false);
  
      
      scrollToBottom();

      if (data.chat) {
        // console.log('there is data')
        setChats(prev => prev.some(c => c._id === data.chat._id) ? prev : [...prev, data.chat]);
        setSelectedChat(data.chat);
        setSelectedContact(null);
      }
    } else{
      toast.error(data?.message || 'Error sending message')
    }    
    } catch (err) {
      console.error("Send message error:", err);
      toast.error(err?.response?.data?.message || 'Something went wrong, try again');
    }
  };


  // join chat
  useEffect(() => {
    if (!socket || !selectedChat) return;
        socket.emit('join_chat', selectedChat._id);
    
    return () => {
      socket.emit('leave_chat', selectedChat._id);
    };
  }, [socket, selectedChat]);


useEffect(() => {
  if (messages.length > 0) {
    const scrollContainer = scrollableRef.current;
    const shouldScroll = () => {
      // Check if we're near the bottom (within 100px)
      return scrollContainer.scrollTop + scrollContainer.clientHeight > 
             scrollContainer.scrollHeight - 100;
    };

    if (shouldScroll()) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      });
    }
  }
}, [messages]); 
// ----------------------------------------
// ensures chat related messages only 
// ---------------------------------------------

useEffect(() => {
  if (selectedContact && !selectedChat) {
    // Clear messages when we have a contact but no chat
    setMessages([]);
    
    // Check if chat exists with this contact
    const contactId = selectedContact._id || selectedContact.contact?._id;
    const existingChat = chats.find(chat => 
      chat.type === 'individual' && 
      chat.participants.some(p => p._id === contactId)
    );
    
    if (existingChat) {
      setSelectedChat(existingChat);
    }
  }
}, [selectedContact]);


  //-----------------------------------------
  // adds read mark to message / starred message update
  // ----------------------------------------

  useEffect(() => {
    if(!socket) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          const isMyMessage = entry.target.dataset.isMine === 'true';
          
          if (messageId && !isMyMessage) {
            // console.log('Marking as read:', messageId);
            socket.emit("mark_as_read", {
              messageId,
              chatId: selectedChat._id
            });
          }
        }
      });
    }, {
      threshold: 0.8,
      root: scrollableRef.current
    });

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [selectedChat, socket, messages]);

  // redundant message_read handler
  // useEffect(() => {
  //   if(!socket) return 
  //   const handleMessageRead = ({ messageId, readBy }) => {
  //     // console.log('[READ RECEIPT] Updating message:', messageId);
  //     setMessages(prev => prev.map(m => {
  //       if (m._id === messageId) {
  //         // console.log('Before:', m.readBy, 'After:', readBy);
  //         return { ...m, readBy };
  //       }
  //       return m;
  //     }));
  //   };

  //   socket.on("message_read", handleMessageRead);

  //   return () => {
  //     socket.off("message_read", handleMessageRead);
  //   };
  // }, []);


  useEffect(() => {
    if(!socket) return

    const handleMessageStarred = ({ messageId, starredBy }) => {
    setMessages(prev => prev.map(m => 
      m._id === messageId ? { ...m, starredBy } : m
    ));
  };

  socket.on('message_starred', handleMessageStarred);
  // console.log('Socket connection status:', socket.connected);
  // socket.on('connect', () => console.log('Socket connected!'));
  // socket.on('disconnect', () => console.log('Socket disconnected'));
  
  return () => {
    // socket.off('connect');
    // socket.off('disconnect');
    socket.off('message_starred', handleMessageStarred);
    };
  }, [socket]);

  // -----------------------------------------------
  // File picker logic
  // -----------------------------------------------
  const triggerFile = (type) => {
    if (type === "media") inputFileMedia.current.click();
    else inputFileDoc.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    setShowFiles(true)
    if(files.length) {
      setSelectedFile(files[files.length-1])
    }
    setFiles(prev => [...prev, ...files])
    // if (files.length > 0) sendMessage({ media: files });
    e.target.value = "";
  };

  
  // Emit event to mark chat as read when opened
  useEffect(() => {
    if(!socket) return
    // Mark chat as read when opened
    if (selectedChat) {
      socket.emit('mark_chat_read', { 
        chatId: selectedChat._id 
      });
    }
  }, []);

  // chat read update
  useEffect(() => {
    if(!socket) return
      const handleChatReadUpdate = ({ chatId, userId }) => {
        setChats(prev => prev.map(chat => {
          if (chat._id === chatId) {
            return {
              ...chat,
              unreadCounts: chat.unreadCounts.map(uc => 
                uc.user === userId ? { ...uc, count: 0 } : uc
              )
            };
          }
          return chat;
        }));
      };

      socket.on('chat_read_update', handleChatReadUpdate);
      return () => socket.off('chat_read_update', handleChatReadUpdate);
    }, []);


  // -----------------------------------------------
  // Call logic
  // -------------------------------------
  const handleStartCall = (type) => {
    const participants = selectedChat.participants
        .filter(p => p._id !== user._id)
        .map(p => p._id);
        
        axios.post(`${base_url}/calls/initiate`, {
          type,
        participants,
        isGroupCall: selectedChat.type === 'group',
        chatId: selectedChat._id
    }, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
    if (res.data.success) {
      initiateCall(res.data); 
    } else {
      toast.error(res.data.message || 'Call could not be started'); 
    }
  })
  .catch(error => {
    toast.error(error?.response?.data?.message || 'Something went wrong, try again');
  });
};

// Edit and delete
const handleDelete = async (msgId) => {
  try {
    const {data} = await axios.delete(`${base_url}/message/delete/${msgId}`, 
      { headers: { Authorization: `Bearer ${token}` } });
    if(data.success){

      setMessages(prev => prev.filter(m => m._id !== msgId));
    } else{
      toast.error(data?.message || 'Something went wrong')
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Something went wrong, try again');
  }
};

const handleStarred = async(msg) => {
  // console.log('msg id: ', msg)
  try {
    const response = await axios.put(`${base_url}/message/${msg._id}/star`, 
      null,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if(response.data.success){
    // Update the message in local state
      setMessages(prev => prev.map(m => 
        m._id === msg._id ? { ...m, starredBy: response.data.starredBy } : m
      ));

      // Emit socket event for real-time updates
      socket.emit('message_starred', {
        messageId: msg._id,
        starredBy: response.data.starredBy,
        chatId: msg.chat._id
      });
    } else{
      toast.error(response?.data?.message || 'Error deleting message')
    }
    
  } catch (error) {
    // console.error("Error starring message:", error);
    toast.error(error?.response?.data?.message || 'Something went wrong, try again');
  }
}

// Handles file clean up
useEffect(() => {
  return () => {
    files.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));
  };
}, [files]);


useEffect(() => {
  if (localStream) {
    console.log('Local stream updated:', 
      localStream.getTracks().map(t => `${t.kind}:${t.enabled}`)
    );
  }
}, [localStream]);

// useEffect(() => {
//   if (remoteStream) {
//     console.log('Remote stream updated:', 
//       remoteStream.getTracks().map(t => `${t.kind}:${t.enabled}`)
//     );
//   }
// }, [remoteStream]);

useEffect(() => {
    if (isRemoteMuted !== undefined) {
      const audio = new Audio(isRemoteMuted ? '/mute-sound.mp3' : '/unmute-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [isRemoteMuted]);
 
    if(!socket || !user){
    return <div className={`text-center ${theme.textPrimary} p-5`}>Connecting to chat...</div>;
  }

const renderMessage = (msg) => {

  const mine = msg?.sender?._id === userId;
  // const isDelivered = msg?.deliveredTo?.includes(recipient._id);
  const isRead = msg?.readBy?.includes(recipient?._id);
  const isGroupChat = selectedChat?.type === "group";
  const seenCount = msg?.readBy?.length || 0;
  const deliveredCount = msg?.deliveredTo?.length || 0;
  const totalRecipients = selectedChat?.participants?.length - 1;

  const fileIcons = {
  pdf: '/pdf.png',
  doc: '/docx-file.png',
  docx: '/docx-file.png',
  xls: '/excel.png',
  xlsx: '/excel.png',
  ppt: '/ppt.png',
  pptx: '/ppt.png',
  csv: '/csv-file.png',
};

  // console.log('messsss: ', msg.media)
  // Status indicator logic
  const getStatusIndicator = () => {
    if (msg.status === 'read') return "✓✓";
    if (msg.status === 'delivered') return "✓";
    return "...";
  };

  // Status text for detailed view
  const getStatusText = () => {
    if (isGroupChat) {
      if (seenCount > 0) return `✓✓ Read by ${seenCount}/${totalRecipients}`;
      if (deliveredCount > 0) return `✓ Delivered to ${deliveredCount}/${totalRecipients}`;
      return "... Sending";
    }
    return getStatusIndicator();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
  };

  const renderMediaItem = (media) => {
    const fileExtension = media.filename?.split('.').pop()?.toLowerCase();
    const isDocument = media.type?.startsWith('application') || 
      ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(fileExtension);
  

    const downloadHref = media.url;
  
    // Helper for download button overlay on media
    const DownloadOverlay = () => (
      <a
        href={downloadHref}
        download={media.filename}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 transition"
        onClick={e => e.stopPropagation()} // prevent triggering other click events
        title="Download"
      >
        <Download size={24} className="text-gray-700" />
      </a>
    );
  
    if (media.format === 'image' || media.type?.startsWith('image/')) {
      return (
        <div className="relative inline-block max-w-[300px] max-h-[400px] rounded-lg overflow-hidden">
          <img
            src={media.displayUrl}
            alt={media.filename}
            className="w-full h-auto object-contain"
            loading="lazy"
          />
          <DownloadOverlay />
        </div>
      );
    }
  
    if (media.format === 'video' || media.type?.startsWith('video/')) {
      return (
        <div className="relative inline-block max-w-[300px] max-h-[400px] rounded-lg overflow-hidden">
          <video controls className="w-full h-auto max-h-[400px] rounded-lg">
            <source src={media.displayUrl} type={media.type} />
            Your browser does not support the video tag.
          </video>
          <DownloadOverlay />
        </div>
      );
    }
  
    if (media.format === 'audio' || media.type?.startsWith('audio/')) {
      return (
        <div className="relative bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-[300px]">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-full">
              <Mic size={16} className="text-white" />
            </div>
            <audio src={media.displayUrl} controls className="flex-1" />
          </div>
          <div className="mt-2 text-sm flex justify-between items-center">
            <div>
              <p>{media.filename}</p>
              <p className="text-gray-500 text-xs">
                {formatFileSize(media.size)} • {fileExtension?.toUpperCase()}
              </p>
            </div>
            <a
              href={downloadHref}
              download={media.filename}
              title="Download"
              className="bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 transition"
              onClick={e => e.stopPropagation()}
            >
              <Download size={20} className="text-gray-700" />
            </a>
          </div>
        </div>
      );
    }
  
    if (isDocument) {

      const DocIcon = fileIcons[fileExtension] || <File size={24} className="text-gray-600" />;
  
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-100  rounded-lg max-w-[300px] hover:bg-gray-200  transition-colors">
          {/* <div>{DocIcon}</div> */}
          <img src={DocIcon} alt='doc' className="w-10 h-10" />
          <p
            className="flex-1 min-w-0 font-medium truncate hover:underline"
            title={media.filename}
          >
            {media.filename}
            <div className="text-gray-500 text-xs">
              {formatFileSize(media.size)} • {fileExtension?.toUpperCase()}
            </div>
          </p>
          <a
            href={downloadHref}
            download={media.filename}
            title="Download"
            className="ml-auto text-gray-500 hover:text-gray-700 transition"
            onClick={e => e.stopPropagation()}
          >
            <Download size={20} />
          </a>
        </div>
      );
    }
  
    // fallback for unknown files
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-[300px] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <div>
          <File size={24} className="text-gray-600" />
        </div>
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 font-medium truncate hover:underline"
          title={media.filename}
        >
          {media.filename}
          <div className="text-gray-500 text-xs">
            {formatFileSize(media.size)} • {media.format || 'FILE'}
          </div>
        </a>
        <a
          href={downloadHref}
          download={media.filename}
          title="Download"
          className="ml-auto text-gray-500 hover:text-gray-700 transition"
          onClick={e => e.stopPropagation()}
        >
          <Download size={20} />
        </a>
      </div>
    );
  };


  return (
    <div
      key={msg?._id}
      data-message-id={msg?._id}
      data-is-mine={mine}
      ref={el => {
        if(el){
          messageRefs.current[msg._id] = el;
        if (!mine && !isRead) {
          observerRef.current?.observe(el);
        }
      }
      }}
      className={`flex mx-3 my-3 ${mine ? "justify-end" : "justify-start"}`}
    >
      
      <div className="max-w-[80%] break-words">
        <div className={`relative group mb-1 p-2 rounded-md ${mine ? theme.chatSent : theme.chatReceived}`}>
          
          {/* Media rendering */}
          {msg?.media?.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              {msg.media.map((m, i) => (
                <div key={i}>
                  {renderMediaItem(m)}
                </div>
              ))}
            </div>
          )}

          {/* Text content */}
          {msg?.content && (
            <div className="block items-center gap-1 relative text-wrap">
              {msg.content}
            </div>
          )}

          {/* Timestamp and status */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className={`text-[11px] ${theme.textSecondary}`}>
              {new Date(msg?.deliveredAt || msg?.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
            
            {/* Status indicator */}
            {mine && (
              <span className={`text-[11px] ${isRead ? 'text-blue-400' : 'text-gray-400'}`}>
                {getStatusIndicator()}
              </span>
            )}
          </div>

          {/* Hover Actions */}
          {msg && (
            <div className="absolute top-0 right-0 mt-[-1.5rem] mr-[-0.5rem]">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className={`${theme.main} ${theme.textPrimary} text-sm rounded shadow-lg flex`}>
                  { msg.starredBy?.includes(userId) ? (<button 
                    onClick={() => handleStarred(msg)} 
                    className={`hover:${theme.contactHover} px-2 py-1`}
                  >
                    Unstar
                  </button>):
                  (<button 
                    onClick={() => handleStarred(msg)} 
                    className={`hover:${theme.contactHover} px-2 py-1`}
                  >
                    star
                  </button>)}
                  <button 
                    onClick={() => handleDelete(msg?._id)} 
                    className="hover:text-red-400 px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status text for group chats */}
        {mine && isGroupChat && (
          <div className="text-right text-xs text-gray-400 mt-1">
            {getStatusText()}
          </div>
        )}
      </div>


    </div>
  );
};

  return (
    <div className={`flex-1 flex h-full ${theme.icons} flex-col ${theme.textPrimary}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-1 px-3">
        <div className="flex gap-2 items-center">
          <img src={identifier(selectedChat || selectedContact)[1] || null} width={40} height={40} 
          className={`${theme.border} border rounded-full`} />
          <h3 className={`font-bold text-sm px-2 py-2`}>
            {identifier(selectedChat || selectedContact)[0] }
          </h3>
        </div>
        <div className="flex items-center space-x-4 p-2 pr-6 ">
          <div className={`flex items-center ${theme.main} rounded-md shadow-2xl border-1
           ${theme.border}`}>
            <HoverableItem className="p-3 pr-4"
            onClick={() => handleStartCall('video')}>
              <Video size={20} />
            </HoverableItem>
            <span className={`h-6 w-[1px] ${theme.secondary}`} />
            <HoverableItem className="p-3 pl-4"
            onClick={() => handleStartCall('audio')}>
              <Phone size={20} />
            </HoverableItem>
          </div>
          <HoverableItem className="p-3"><Search size={20} /></HoverableItem>
        </div>
      </div>

        {/* Call UI Overlay */}
      {callStatus !== 'idle' && (
            <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
              <div className="relative w-full h-full max-w-4xl">
                  {/* Remote video */}
                  {remoteStream && (
                      <video 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                          ref={video => {
                              if (video) video.srcObject = remoteStream;
                          }}
                      />
                  )}
                  
                  {/* Local video preview */}
                  {localStream && callStatus === 'active' && (
                      <div className="absolute bottom-4 right-4 w-32 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                          <video
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                              ref={video => {
                                  if (video) video.srcObject = localStream;
                              }}
                          />
                          {isMuted && (
                              <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded-full p-1">
                                  <MicOff size={16} />
                              </div>
                          )}
                      </div>
                  )}

                  {/*  remote mute indicator */}
                {isRemoteMuted && (
                    <div className="absolute top-25 left-0 right-0 text-center">
                        <div className="inline-flex items-center bg-black bg-opacity-70 px-4 py-2 rounded-full text-white">
                            <MicOff size={18} className="mr-2" />
                            <span className="font-medium">Other participant is muted</span>
                        </div>
                    </div>
                )}

                  {/* Call controls */}
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6">
                      {/* Mute button - only show during active call */}
                      {callStatus === 'active' && (
                          <button 
                              onClick={toggleMute}
                              className={`rounded-full p-3 ${isMuted ? 'bg-red-500' : 'bg-gray-600'} text-white`}
                              title={isMuted ? "Unmute" : "Mute"}
                          >
                              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                          </button>
                      )}

                      {/* Answer/End call buttons */}
                      {callStatus === 'incoming' ? (
                          <>
                              <button 
                                  onClick={() => answerCall(activeCall)}
                                  className="bg-green-500 text-white rounded-full p-3"
                              >
                                  <Phone size={24} />
                              </button>
                              <button 
                                  onClick={endCall}
                                  className="bg-red-500 text-white rounded-full p-3"
                              >
                                  <X size={24} />
                              </button>
                          </>
                      ) : (
                          <button 
                              onClick={endCall}
                              className="bg-red-500 text-white rounded-full p-4"
                          >
                              <X size={28} />
                          </button>
                      )}
                  </div>
                  
                  {/* Call status info */}
                  <div className="absolute top-10 left-0 right-0 text-center text-white">
                      <h2 className="text-xl font-semibold">
                          {callStatus === 'ringing' && 'Calling...'}
                          {callStatus === 'incoming' && 'Incoming Call'}
                          {callStatus === 'active' && 'Call in progress'}
                      </h2>
                      <p className="text-gray-300">
                          {activeCall?.type === 'video' ? 'Video Call' : 'Voice Call'}
                      </p>
                  </div>
              </div>
          </div>
      )}


      {/* Messages */}
      <div className="relative grow w-full overflow-hidden">
        
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/blizzard.png')",
          }}
        />

        {/* Overlay */}
        <div className={`absolute inset-0 ${theme.type==="Light" && !chatBg ? 'bg-stone-50' : chatBg ? chatBg : ''} opacity-60 z-1 pointer-events-none`} />

        {/* Scrollable Messages Layer */}
        <div
          ref={scrollableRef}
          onScroll={handleScroll}
          className={`relative z-2 h-full overflow-y-scroll custom-scrollbar 
            ${theme.textPrimary} flex flex-col-reverse `}
        >
          {loadingHistory && (
            <div className="text-center text-gray-500 py-2">Loading...</div>
          )}

          <div className="flex flex-col-reverse px-4 pt-2 pb-2">
            {messages.length > 0 || selectedChat ? (
              <div className="flex flex-col-reverse  px-4 pt-2 pb-24">
                {messages.slice().reverse().
                sort((b, a) => new Date(a.createdAt) - new Date(b.createdAt)).
                map(renderMessage)}
              </div>
              ) : (
              <div className="flex-1 flex items-center justify-center 
              w-full absolute top-[50%] -translate-y-[50%]">
                <div className={`${theme.textSecondary}`}><p className="text-center">No messages yet.</p> 
                  Send a message to start chatting!
                </div>
              </div>
             )}
          </div>

        </div>
      </div>

      <div className="h-0.5" ref={messagesEndRef} />

      <div className={`absolute bottom-15 z-3 px-4 ${theme.textPrimary}`}>
        {typingUsers.size > 0 && !typingUsers.has(userId) && (
          <span>Someone is typing...</span>
        )}
      </div>

      {/* File selection  */}
      {showFiles &&  (
        <div className={`flex flex-col max-w-120 min-w-120 min-h-90 max-h-90
        absolute ${theme.border} border z-4 bottom-10 ml-20 right-3 sm:right-10 lg:right-auto`}>

            <div className={`m-auto max-h-10 min-h-10 flex items-center justify-center 
            ${theme.border} border w-full cursor-pointer ${theme.main} `}>
              <Trash onClick={() =>{
                const allFiles = files.filter(file => file !== selectedFile)
                setFiles(allFiles)
                if(files.length===1){
                  setShowFiles(false)
                }
                setSelectedFile(allFiles[allFiles.length - 1])
              }}/>
            </div>


            <div className={`max-w-120 min-w-120 min-h-70 max-h-70 ${theme.secondary} relative overflow-hidden`}> 
                    {selectedFile?.type.startsWith('image/') && (
                      
                      <img src={URL.createObjectURL(selectedFile)}
                      alt={selectedFile.name}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                      />
                    )}

                    {selectedFile?.type.startsWith('video/') && (
                      <video src={URL.createObjectURL(selectedFile)}
                      controls
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                      />
                    )}

                    {selectedFile?.type.startsWith('audio/') && (
                      <audio src={URL.createObjectURL(selectedFile)}
                      controls 
                  
                      />
                    )}

                   {selectedFile && (
                      (selectedFile.type.startsWith('application/') ||
                      selectedFile.name.endsWith('.xlsx') ||
                      selectedFile.name.endsWith('.xls') ||
                      selectedFile.name.endsWith('.csv')) && (
                        <div className={`flex justify-center flex-col max-h-70 min-h-70 ${theme.textPrimary} text-center p-4`}>
                          <div className="text-7xl mb-2">📄</div>
                          <div className="text-sm truncate max-w-full">{selectedFile.name}</div>
                        </div>
                      )
                    )
                   }

               
            </div>

            <div className={`flex min-w-120 max-w-120  max-h-15 min-h-15 gap-6
               ${theme.border} border-2 ${theme.main} items-center justify-between relative`}>

                 <div className="flex overflow-x-auto custom-scrollbar ml-2 flex-1">
              {files.map((file, index) => (
                <div key={index} onClick={() => setSelectedFile(file)}
                className={` ${theme.border} border rounded-sm cursor-pointer bg-black`}
                style={{
                  width: `${10 / files.length}px`,
                  minWidth: '70px',
                  height: '40px'
                }}
                >
                    
                    {file.type.startsWith('image/') && (
                        <img src={URL.createObjectURL(file)}
                        alt={file.name}
                        className={``}
                         style={{
                        objectFit: "contain",
                        display: "block",
                        width: '100%',
                        height: '100%'
                      }}
                        />

                    )}

                    {file.type.startsWith('video/') && (
                      <video src={URL.createObjectURL(file)}
                      style={{
                        objectFit: "contain",
                        display: "block",
                        width: '100%',
                        height: '100%'
                      }}
                      />
                    )}

                    {file.type.startsWith('audio/') && (
                      <audio src={URL.createObjectURL(file)}
                      />
                    )}

                   {file.type.startsWith('application/pdf') && (
                      <div className="flex items-center justify-center w-full h-full text-white text-xs">
                        📄 PDF
                      </div>
                    )}

                    {file.type.startsWith('application/') ||
                      (file.name.endsWith('.xlsx') ||
                      file.name.endsWith('.xls') ||
                      file.name.endsWith('.csv')) && (
                      <div className="flex items-center justify-center w-full h-full text-white text-xs">
                        📄 {file.name.split('.').pop().toUpperCase()}
                      </div>
                    )}

                    {/* <div>
                      {file.name} ({formatFileSize(file.size)})
                    </div> */}
                </div>
              ))}
                </div>

              <button onClick={()=>
              {
                sendMessage({media: files})
                setShowFiles(false)
                setSelectedFile(null)
                setFiles([])
              }
              }
              className="bg-green-700 p-2 rounded border-2 border-green-700 text-gray-200 
              font-semibold relative right-1">
                Send
              </button>
            </div>


        </div>
      )} 


      {/* Input & Actions */}
      <div className="flex items-center p-2">
        <HoverableItem className="p-2" onClick={() => triggerFile("media")}><Camera size={20} /></HoverableItem>
        <HoverableItem className="p-2" onClick={() => triggerFile("doc")}><File size={20} /></HoverableItem>
        <HoverableItem className="grow p-2">
          <input
            type="text"
            value={newMessage}
            autoFocus
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message"
            className={`w-full outline-none ${theme.textPrimary} 
             focus:${theme.main}`}
          />
        </HoverableItem>
        <HoverableItem className="p-2" onClick={() => sendMessage({ content: newMessage })}><Mic size={20} /></HoverableItem>
      </div>

      {/* Hidden Inputs */}
      <input type="file" accept="image/*,video/*,audio/*" multiple hidden ref={inputFileMedia} onChange={handleFileChange} />
      <input type="file" multiple hidden ref={inputFileDoc} onChange={handleFileChange} />

    </div>
  );
}

export default ChatScreen;

