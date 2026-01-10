import  { useRef, useEffect, useState } from 'react'
import {  Eye, Pin, Star, 
  Archive, MessageSquare, Trash2, ExternalLink, 
  EyeOff,
  PinOffIcon,
  StarOffIcon,
  Bell,
  BellOffIcon,
  ArchiveRestoreIcon
} from "lucide-react";
import { useAppContext } from '../../context/context';
import axios from 'axios';
import { base_url } from '../../../utils/baseUrl';
import {toast} from 'sonner'

const Contextmenu = ({ modalPosition, setShowModal, selectedContextChat }) => {
  
  const modalRef = useRef();
  const { chats, setChats,user, setMessages, deleteChat } = useAppContext() ;
  const [isLoading, setIsLoading] = useState(false);

  const getStatus = (field) => 
    Array.isArray(selectedContextChat?.[field])
      ? selectedContextChat[field].find(c => c.user === user._id)?.status == true
      : false;

  const isRead = getStatus("read");
  const isPinned = getStatus("pinned");
  const isFavourite = getStatus("favourite");
  const isMuted = getStatus("muted");
  const isArchived = getStatus("archived");
  // console.log('isread: ', isRead, ' ispinned: ', isPinned, ' ismuted: ', isMuted)

  // console.log('SC: ',selectedContextChat)

  const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
  };
  
  useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);


  // update local state 
  const updateLocalChat = (chatId, updates) => {
      const updatedChats = chats.map(chat => 
          chat._id === chatId 
              ? { ...chat, ...updates }
              : chat
      );
      // console.log('local: ', updatedChats)
      setChats(updatedChats);
  };

    // function to handle menu actions 
  const markAsRead = async () => {
      if (!selectedContextChat) return;

      try {
            setShowModal(false);

            const {data} = await axios.put(`${base_url}/chats/${selectedContextChat._id}/read`,
              { },
              {headers:{
                Authorization: `Bearer ${localStorage.getItem("whatsapp-token")}`
              }}
            )
            if(data.success){
              const updatedChat = data.chat;
              updateLocalChat(updatedChat._id, updatedChat);
              // console.log("Chat marked as read")
              // console.log(data.message)
              // console.log('read: ', data.chat)
            }else{
              // console.log(data.error)
              toast.error(data?.message || 'Something went wrong')
            }
      } catch (error) {
        // console.log('error marking chat as read: ', error)
        toast.error(error?.response?.data?.message || 'Something went wrong, try again');
      }
    }

  const pinToTop = async () => {
      if (!selectedContextChat) return;
      const newStatus = !getStatus('pinned')
      updateLocalChat(selectedContextChat._id, {pinned: [{user:user._id, status:newStatus}]})

      try {
        setShowModal(false);

        const {data} = await axios.put(`${base_url}/chats/${selectedContextChat._id}/pin`,
          {  },
          {headers:{
            Authorization: `Bearer ${localStorage.getItem("whatsapp-token")}`
          }}
        )
        if(data.success){
          // console.log("Chat pinned to top")
          const updatedChat = data.chat;
          updateLocalChat(updatedChat._id, updatedChat);
        }else{
          toast.error(data?.message || 'Something went wrong')
        }
      } catch (error) {
          // console.log("chat not pinned to top: ", error)
          toast.error(error?.response?.data?.message || 'Something went wrong, try again');
      }
  };

  const addToFavorite = async () => {
      if (!selectedContextChat) return;
      // const newStatus = getStatus('favourite')
      try {
        setShowModal(false);
        

        const {data} = await axios.put(`${base_url}/chats/${selectedContextChat._id}/favourite`,
          {  },
          {headers:{
            Authorization: `Bearer ${localStorage.getItem("whatsapp-token")}`
          }}
        )
        if(data.success){
          // console.log("Chat added to favourite", data)
          const updatedChat = data.chat;
          updateLocalChat(updatedChat._id, updatedChat);  
        }else{
          toast.error(data?.message || 'Something went wrong')
        }
      } catch (error) {
          // console.log("chat not added to favourite: ", error)
          toast.error(error?.response?.data?.message || 'Something went wrong, try again');
      }
  };

  const muteChat = async () => {
    if (!selectedContextChat) return;

    try {
      setShowModal(false);

      const { data } = await axios.put(
        `${base_url}/chats/${selectedContextChat._id}/mute`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("whatsapp-token")}`,
          },
        }
      );

      if (data.success) {
        const updatedChat = data.chat;
        updateLocalChat(updatedChat._id, updatedChat);
        // setSelectedChat(updatedChat);
      }else{
        toast.error(data?.message || 'Something went wrong')
      }
    } catch (error) {
      // console.error("Error toggling mute status:", error);
      toast.error(error?.response?.data?.message || 'Something went wrong, try again');
    }
  };


  const archiveChat = async () => {
      if (!selectedContextChat) return;

      try {
        setShowModal(false);
        

        const {data} = await axios.put(`${base_url}/chats/${selectedContextChat._id}/archive`,
          {  },
          {headers:{
            Authorization: `Bearer ${localStorage.getItem("whatsapp-token")}`
          }}
        )
        if(data.success){
          const updatedChat = data.chat;
          updateLocalChat(updatedChat._id, updatedChat);            
          // console.log("Chat added to archive")
          // console.log('chat: ', data.chat)
        }else{
          toast.error(data?.message || 'Something went wrong')
        }
      } catch (error) {
          // console.log("chat not added to archive: ", error)
          toast.error(error?.response?.data?.message || 'Something went wrong, try again');
      }

  };

  const clearMessages = async () => {
      if (!selectedContextChat) return;
      try {
      setShowModal(false);
      setIsLoading(true);
        

        const {data} = await axios.delete(`${base_url}/chats/${selectedContextChat._id}/messages`,
          
          {headers:{
            Authorization: `Bearer ${localStorage.getItem("whatsapp-token")}`
          }}
        )
        if(data.success){
            updateLocalChat(selectedContextChat._id, { messages: [], latestMessage: null });
            setMessages([])
          // console.log("Messages deleted")
          // console.log('Cleared: ', data.chat)
        }else{
          toast.error(data?.message)
        }
      } catch (error) {
          // console.log("messages not deleted: ", error)
          toast.error(error?.response?.data?.message || 'Something went wrong, try again');
      }

  };

  const handleDelete = async () => {
    setShowModal(false);
    const result = await deleteChat(selectedContextChat._id);
    if (!result.success) {
      alert(`Deletion failed: ${result.error}`);
    }
  };

    return (
        <div ref={modalRef}
            className="fixed bg-[#202c33] p-2 rounded-md shadow-lg w-[180px] border border-gray-600 z-50"
            style={{ top: `${modalPosition.y}px`, left: `${modalPosition.x}px` }}
        >
            <ul className="text-white text-sm">
                <li 
                    onClick={() => {
                      // setRead(!read)
                      markAsRead()
                    }}
                    className={`flex items-center space-x-2 p-2 hover:bg-[#30393f] cursor-pointer border-b border-gray-600 ${isLoading ? 'opacity-50' : ''}`}
                >
                  {!isRead ?
                    (<><Eye size={16} /> <span>Mark as read</span></>)
                      :
                   (<> <EyeOff size={16} /> <span>Mark as read</span></>)

                  }
                </li>

                <li 
                    onClick={() => {
                      // setPinned(!pinned)
                      pinToTop()
                    }}
                    className={`flex items-center space-x-2 p-2 hover:bg-[#30393f] cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
                >
                   {!isPinned ?
                   (<> <Pin size={16} /> <span>Pin to top</span></>)
                   :
                   (<> <PinOffIcon size={16} /> <span>Unpin from top</span></>)
                  }
                </li>

                <li 
                    onClick={() => {
                      // setFavourite(!favourite)
                      addToFavorite()
                    }}
                    className={`flex items-center space-x-2 p-2 hover:bg-[#30393f] cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
                >
                   {!isFavourite ?
                   (<> <Star size={16} /> <span>Add to favorite</span></>)
                   :
                   (<> <StarOffIcon size={16} /> <span>Remove from favorite</span></>)
                  }
                    
                </li>

                <li 
                    onClick={() => {
                      // setMuted(!muted)
                      muteChat()
                    }}
                    className={`flex items-center space-x-2 p-2 hover:bg-[#30393f] cursor-pointer border-b border-gray-600 ${isLoading ? 'opacity-50' : ''}`}
                >
                  {!isMuted ?
                   (<> <BellOffIcon size={16} /> <span>Mute</span></>)
                   :
                   (<> <Bell size={16} /> <span>Unmute</span></>)
                  }
                </li>

                <li 
                    onClick={() => {
                      // setArchived(!archived)
                      archiveChat()
                    }}
                    className={`flex items-center space-x-2 p-2 hover:bg-[#30393f] cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
                >
                   {!isArchived ?
                   (<> <Archive size={16} /> <span>Archive</span></>)
                   :
                   (<> <ArchiveRestoreIcon size={16} /> <span>Unarchive</span></>)
                  }
                </li>

                <li 
                    onClick={clearMessages}
                    
                    className={`flex items-center space-x-2 p-2 hover:bg-[#30393f] cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
                >
                    <MessageSquare size={16} /> <span>Clear messages</span>
                </li>

                <li 
                    onClick={(handleDelete)}
                    className={`flex items-center space-x-2 p-2 hover:bg-[#30393f] cursor-pointer border-b border-gray-600 ${isLoading ? 'opacity-50' : ''}`}
                >
                    <Trash2 size={16} className="text-red-500" /> <span>Delete</span>
                </li>

                <li className="flex items-center space-x-2 p-2 hover:bg-[#30393f] cursor-pointer">
                    <ExternalLink size={16} /> <span>Pop out chat</span>
                </li>

            </ul>
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    {/* Optional loading indicator */}
                </div>
            )}
        </div>
    );
}

export default Contextmenu;