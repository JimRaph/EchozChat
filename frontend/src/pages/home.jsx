import { useEffect, useRef, useState } from "react";

import Header from "../component/header";
import Sidebar from "../component/sidebar";
import Chatarea from "../component/chatarea";
import { useAppContext } from "../context/context";
import NewContactModal from "../component/NewContactModal";
import Mainbar from "../component/Mainbar";
import ChatScreen from "../component/chatScreen";
import { useTheme } from "../context/ThemeContext";


const Home = () => {

  const {user,newContactModal, setNewContactModal, selectedContact, selectedChat} = useAppContext() ;
  const [activeIcon, setActiveIcon] = useState('message')
  const {theme } = useTheme()
  const [open, setOpen] = useState(false)
  const expanded = useRef(null)
  
  const closeOpen = (e) => {
    if (expanded.current && !expanded.current.contains(e.target) && open) {
      setOpen(false);
    }
  };


  useEffect(()=>{
    document.addEventListener('mousedown', closeOpen)
    return ()=>{
      document.removeEventListener('mousedown', closeOpen)
    }
  },[open])

  // -----------------------------------------------------------
  // Handle recipient name, phone and avatar for display in chat
  // -----------------------------------------------------------
  
  let recipient

  if(selectedChat && selectedChat?.participants?.[0]?._id == user?._id){
      recipient = selectedChat?.participants[1]
  }else{
    recipient = selectedChat?.participants[0]
  }

  if(selectedContact && !selectedChat){
    recipient = selectedContact
  }


  return (
      <div className={`h-svh relative cursor-default w-screen ${theme.main}  overflow-hidden ${theme.textPrimary} flex flex-col`}>
        <Header />

        <div className="flex flex-1 relative h-full w-full overflow-hidden" >
          
          <div ref={expanded}
          className={`${open ? `min-w-[250px] max-w-[250px] z-4`: 'min-w-[50px] max-w-[50px]'} h-full ${theme.main} 
          transition-all duration-300 ease-in-out absolute
          `}>
            <Sidebar setActiveIcon={setActiveIcon} setOpen={setOpen} open={open}/>
          </div>
          
          {newContactModal && 
          <NewContactModal onClose={() => setNewContactModal(prev=>!prev)}/>
          }
            
            {/* Main Content */}
        <div className={`flex-1 h-full min-w-0 ml-[50px] flex ${theme.secondary} `}>
          <Mainbar className={`${selectedContact || selectedChat ? 'hidden sm:flex' : 'flex '}
           lg:w-[30%] sm:w-[350px] ${theme.border} border`} activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

          {/* Messaging section */}
          <div className={`${selectedContact || selectedChat ? '' : 'hidden sm:flex'}
          flex-1 min-w-0  h-full flex flex-col ${theme.secondary} `}>
            {selectedContact || selectedChat? <ChatScreen  recipient={recipient}/> : <Chatarea />}
          </div>
        </div>
        </div>

    </div>
    
  );
};

export default Home;
