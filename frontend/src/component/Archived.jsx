import { Bell, PinIcon, Search } from 'lucide-react'
import { useAppContext } from '../context/context';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import Contextmenu from './chat/Contextmenu';

const Archived = () => {

  const { user, chats, identifier, setSelectedChat,
          formatMessageTime, getUnreadCount} = useAppContext() 
  const {theme,HoverableItem} = useTheme()

  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [contextChat, setContextChat] = useState(null)


    const handleRightClick = (e, chat) => {
    e.preventDefault(); 

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const modalWidth = 180;
    const modalHeight = 230;

    let x = e.pageX;
    let y = e.pageY;

    // Prevent modal from overflowing the right edge
    if (x + modalWidth > screenWidth) x -= modalWidth;

    // Prevent modal from overflowing the bottom
    if (y + modalHeight > screenHeight) y -= modalHeight;

    setModalPosition({ x, y });
    setContextChat(chat)
    setShowModal(true);
    
  };

  const archived = chats.filter(chat => {
  return chat.archived.some(
    c => c.user === user._id && c.status == true
  );
});


  return (
    <div className="w-full h-full flex flex-col  p-4 rounded-tl">
       
        <p className="font-semibold text-xl">Archived</p>

          {/* Search bar  */}
        <div className={`mt-5 mb-2 flex items-center ${theme.input} border-b-1 border-b-[#969494] space-x-2 pl-2`}>
          <Search size={13} />
          <input
            type="text"
            placeholder="Search for Archived chats"
            className="w-full px-2 py-1 outline-none rounded-md"
          />
        </div>


        {/* Archived Section  */}
      {!archived ? 'Loading' : 
        (<>
        
      <div className='overflow-y-scroll custom-scrollbar'>

      {
        archived.map((chat,i)=>(
            <HoverableItem
              key={i}
              onContextMenu={(e) => handleRightClick(e, chat)}
              onClick={() => {
                console.log('chat selected: ', chat);
                localStorage.setItem('whatapp-selectedchat', JSON.stringify(chat));
                setSelectedChat(chat);
              }}
              className={`flex w-full max-w-full items-center space-x-2 p-2 hover:${theme.contactHover} rounded-md`}
            >
              <img
                src={identifier(chat)[1]}
                alt="user1"
                className="rounded-full h-12 w-12"
              />
            <div className="flex flex-col flex-1 min-w-0">
            <p className="font-semibold text-sm flex justify-between items-center">
              {identifier(chat)[0]}
              <span className=" ml-2 text-green-500 text-xs">
                {formatMessageTime(chat.latestMessage?.updatedAt)}
              </span>
            </p>
            <div className="text-xs text-gray-500 flex justify-between items-center">
              <span className="flex-1 min-w-0 whitespace-nowrap truncate overflow-hidden">
                {chat.latestMessage?.content}
              </span>
              <div className="flex gap-1 ml-2 flex-shrink-0">
                {Array.isArray(chat?.muted) && chat.muted.find(c => c.user === user._id)?.status && (
            <span><Bell size={17} /></span>
          )}
          {Array.isArray(chat?.pinned) && chat.pinned.find(c => c.user === user._id)?.status && (
            <span><PinIcon size={17} /></span>
          )}
          { getUnreadCount(chat) > 0 && ( 
          <span className={`bg-green-500 rounded-full px-1 font-semibold text-gray-950`}> 
            { getUnreadCount(chat) }
          </span>
           )}

        </div>
      </div>
    </div>
  </HoverableItem>
        ))
      }

      </div>
        </>)
      }


      {showModal && <Contextmenu 
            modalPosition={modalPosition} 
            setShowModal={setShowModal}
            selectedContextChat={contextChat}/>}
    </div>
  )
}

export default Archived
