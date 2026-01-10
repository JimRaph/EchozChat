import {useState,useRef} from "react";
import { SquarePen, ListFilter, Search, MessageSquare, 
  User, Heart, Users, UserX, Pencil,
  PinIcon,
  Bell
} from "lucide-react";
import Modal from "../modal";
import { useAppContext } from '../../context/context'
import Contextmenu from "./Contextmenu";
import { useTheme } from "../../context/ThemeContext";
import { useEffect } from "react";



const Contactbar = ({setActiveIcon}) => {

      const {theme, HoverableItem} = useTheme()
      const [modalOpen, setModalOpen] = useState(false)
      const { setGroupModal, chats, user, identifier,
        setSelectedChat,  formatMessageTime, getUnreadCount} = useAppContext() 
      const [showFilterDropdown, setShowFilterDropdown] = useState(false);
      const [showModal, setShowModal] = useState(false);
      const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
      const [contextChat, setContextChat] = useState(null)
      const [chatList, setChatList] = useState([]);

    const modalOpenRef = useRef();
    const filterDropDownRef = useRef();
    const filterButtonRef = useRef();
  

  const openModal = () =>{
      setModalOpen(prev => !prev)
      setGroupModal(false)
      if(filterDropDownRef.current){
        setShowFilterDropdown(false)
      }
  }

  // ----------------------------------------
  // HANDLES POSITIONING THE CONTEXT MENU 
  // --------------------------------------------
  
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

  // ----------------------------------------------
  // HANDLES CLOSING MODAL
  // -------------------------------------------------
  const handleClickOutside = (event) => {

    if (modalOpenRef.current && !modalOpenRef.current.contains(event.target)) {
      setModalOpen(false);
    }
    
    if(filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
       setShowFilterDropdown(false)
    }
  };

  
  // console.log('no arch: ', chatList)

useEffect(()=>{
    if (chats) {
    const filtered = chats.filter(chat => {
      const notArchived = chat.archived.find(ca => ca.user === user._id);
      return !notArchived;
    });
    setChatList(filtered);
  }
},[chats, user._id])

  useEffect(() => {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, []);

// -----------------------------------------
// FILTER OPTIONS 
// ---------------------------------------------
  const filterByUnread = () =>{
    setActiveIcon("unread")
  }
  const filterByFavourite = () => {
    setActiveIcon('favourite')
  }
  const filterByContact = () => {
    setActiveIcon('contacts')
  }
  const filterByNonContact = () => {
    setActiveIcon('noncontacts')
  }
  const filterByGroups = () => {
    setActiveIcon('groups')
  }
  const filterByDrafts = () => {
    setActiveIcon('drafts')
  }


  // console.log('chats: ', chats)

  return (
    <div className={`flex flex-col p-4 w-full h-full `}>
      
      {/* Top section  */}
      <div className="flex justify-between items-center">

        <p className="font-semibold text-xl">Chats</p>
        <div className="flex space-x-1">
          <div className={` hover:${theme.contactHover} p-2`} 
          onClick={(e) => {
            e.stopPropagation()
            openModal()}}>
            <SquarePen size={20} 
            />      
          </div>
        
            {/* Chat and Group Chats Modal  */}
          {modalOpen && <Modal ref={modalOpenRef} modalOpen={modalOpen} setModalOpen={setModalOpen}/>}
         
            {/* Filter section  */}
          <p
          ref={filterButtonRef}
          onClick={() => setShowFilterDropdown(prev=>!prev)} 
          className={` hover:${theme.contactHover} p-2`} >
            <ListFilter size={20} />
          </p>

            {/* Filter Modal  */}
          {showFilterDropdown && (
              <div ref={filterDropDownRef}
              // onClick={(e) => e.stopPropagation()}
               className={`absolute p-1 mt-8 w-50 ${theme.main} border ${theme.border} rounded-md shadow-lg z-10`}>
                <div className=" flex flex-col space-y-1 cursor-default ">
                  <p 
                  className="p-2 pl-4 text-[#b1b3b4] font-semibold"
                  >Filter chats by</p>
                  <p 
                  onClick={filterByUnread}
                  className={`text-sm hover:${theme.contactHover} p-2 pl-4 rounded-md w-full flex items-center space-x-2`}>
                    <MessageSquare size={18} /> <span>Unread</span>
                  </p> 
                  <p 
                  onClick={filterByFavourite}
                  className={`text-sm hover:${theme.contactHover} p-2 pl-4 rounded-md w-full flex items-center space-x-2`}>
                    <Heart size={18} /><span>Favourite</span> 
                  </p> 
                  <p 
                  onClick={filterByContact}
                  className={`text-sm hover:${theme.contactHover} p-2 pl-4 rounded-md w-full flex items-center space-x-2`}>
                    <User size={18} /> <span>Contacts</span> 
                  </p> 
                  <p 
                  onClick={filterByNonContact}
                  className={`text-sm hover:${theme.contactHover} p-2 pl-4 rounded-md w-full flex items-center space-x-2`}>
                    <UserX size={18} /><span>Non-contacts</span> 
                  </p> 
                  <p 
                  onClick={filterByGroups}
                  className={`text-sm hover:${theme.contactHover} p-2 pl-4 rounded-md w-full flex items-center space-x-2`}>
                    <Users size={18} /><span> Groups</span>
                  </p>
                  <p 
                  onClick={filterByDrafts}
                  className={`text-sm hover:${theme.contactHover} p-2 pl-4 rounded-md w-full flex items-center space-x-2`}>
                    <Pencil size={18} /><span>Drafts</span>
                  </p>
                </div>
              </div>
            )
          }
        </div> 

      </div>
      
      {/* Search Bar  */}
      <div className={`mt-5 mb-5 flex items-center ${theme.main} border-b ${theme.border} space-x-2 pl-2`}>
        <Search size={13} />
        <input
          type="text"
          placeholder="Search for chats"
          className="w-full px-2 py-1 rounded-md outline-none"
        />
      </div>

            {/* Chats Section  */}
          {chatList?.sort((a,b) =>{
            if (a.pinned?.status && !b.pinned?.status) return -1;
            return 0;
                }).map((chat) => (
                    <HoverableItem
              key={chat._id}
              onContextMenu={(e) => handleRightClick(e, chat)}
              onClick={() => {
                // console.log('chat selected: ', chat);
                localStorage.setItem('whatapp-selectedchat', JSON.stringify(chat));
                setSelectedChat(chat);
              }}
              className={`flex w-full max-w-full items-center space-x-2 p-2 rounded-md`}
            >
              <img
                src={identifier(chat)[1] || null}
                alt="user1"
                className={`rounded-full h-12 ${theme.border} border w-12`}
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
          ))}

      

          {/* Context Menu  */}
      {showModal && <Contextmenu 
      modalPosition={modalPosition} 
      setShowModal={setShowModal}
      selectedContextChat={contextChat}/>}
    </div>
  );
};

export default Contactbar;
0