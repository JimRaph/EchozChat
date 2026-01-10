import  { useState,useRef, useEffect } from 'react';
import { useAppContext } from '../context/context';
import {Camera, Smile} from 'lucide-react'
import EmojiPicker from "emoji-picker-react"
import axios from 'axios';
import { base_url } from '../../utils/baseUrl';
import { useTheme } from '../context/ThemeContext';

const NewGroupModal = ({setModalOpen}) => {
  const {  setGroupModal, contacts, 
    setSelectedChat,setChats, 
  setSelectedContacts, selectedContacts } = useAppContext() ;

  const {theme} = useTheme()
  
  const [groupInfo, setGroupInfo] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(""); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [avatar, setAvatar] = useState(null)
  const [error, setError] = useState(null)


  const contactModal = useRef()

  const handleDispDuration = (event) => {
    setSelectedDuration(event.target.value);
  };
  // console.log('select: ',selectedContacts)

  const createGroup = async() => {
    const formdata = new FormData()
    formdata.append('group_name',groupName);
    formdata.append('duration', selectedDuration);
    formdata.append('avatar', selectedImage);
    formdata.append('participants', JSON.stringify(selectedContacts.map(contact => contact.contact._id)));
   
    try {
      setError(null)

      const response = await axios.post(`${base_url}/chats/group`, formdata, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('whatsapp-token')}`,
          'Content-Type':'multipart/form-data'
        }
      })
      // console.log('Group created successfully', response)


      // setChats((prev) => {
      //   const exists = prev.some(chat => chat._id === response.data.chat._id);
      //   if (exists) {
      //     return prev.map(chat =>
      //       chat._id === response.data.chat._id
      //         ? { ...chat, latestMessage: response.data.chat.latestMessage }
      //         : chat
      //     );
      //   }
      //   return [...prev, response.data.chat];
      // })
      
      if(response.data.success){
        setSelectedChat(response.data.chat)
        setChats(prev => [...prev, response.data.chat]);
        setError(null)
        setGroupModal(false)
        setModalOpen(false)
      }else{
        console.log("Failed to add contact: ", response.data.response.message)
        setError(response.data.response.message)
      }

    } catch (error) {
      console.log('Error creating group from newgropmodal', error)
      setError(error.response.data.message)

    }
    // finally{
    //   setGroupModal(false)
    //   setModalOpen(false)
    // }
  }
  // Toggle contact selection
    const fileInputRef = useRef(null);
  
    const handleCameraClick = () => {
      fileInputRef.current.click(); 
    };

  const emojiHandler = (emojidata) => {
    setGroupName(prev => prev + emojidata.emoji)
  }


  const handleCheckboxChange = (contact) => {
    setSelectedContacts((prev) =>
      prev.some((c) => c.contact.Phone === contact.contact.Phone)
        ? prev.filter((c) => c.contact.Phone !== contact.contact.Phone)
        : [...prev, contact] 
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0]; 
    if (file) {
      if(file instanceof File) {
        setSelectedImage(file)
        setAvatar(URL.createObjectURL(file)) 
      }else{
        
        console.log("Invalid file type. Please select an image.")
        
      }
    }
  };

  const closeModal = (e) => {
    if(contactModal.current && !contactModal.current.contains(e.target)){
      setModalOpen(false)
    }
  }

  useEffect(()=>{
    document.addEventListener('mousedown', closeModal)

    return () => {
    document.removeEventListener('mousedown', closeModal)
  }
  },[])

  useEffect(() => {
    if (error) {
        const timer = setTimeout(() => {
        setError('');
        }, 3000); 
        return () => clearTimeout(timer); 
    }
  }, [error]);

  console.log('ALL CONTACTS FROM NEW GROUP MODAL: ', contacts)
  console.log('ALL CONTACTS : ', selectedContacts)

  return (
    <div ref={contactModal}
     className={`absolute flex right-5 top-10 ${theme.main} ${theme.textPrimary} z-5`}>

    <div className=" p-3 flex flex-col h-140  overflow-y-scroll custom-scrollbar w-84 shadow-lg rounded-md left-0">

      <h1 className="text-lg mt-3 mb-3 font-semibold">New Group</h1>

      {/* Selected Contacts Input Box */}
      <div className={`flex items-center border-b-1 p-2 min-h-[40px] overflow-y-auto
         custom-scrollbar rounded-md flex-wrap gap-1 ${theme.secondary}`}>
        {selectedContacts.length === 0 ? (
          <p className={`${theme.textSecondary}`}>Search name or number</p>
        ) : (
          selectedContacts.map((contact) => (
            <div key={contact.contact.Phone} className="flex flex-nowrap items-center space-x-2 bg-green-600 px-2 py-1 rounded-lg mr-2">
              <img src={contact?.contact.avatar} alt='pic' className="w-3 h-3 rounded-full" />
              <span className="text-sm text-nowrap">{contact?.firstname + ' ' + contact?.lastname}</span>
            </div>
          ))
        )}
      </div>

      {!groupInfo ?

      (
        <>
        {selectedContacts.length > 0 && (
          <div className="flex space-x-2 justify-between">
            <button
              onClick={() => {
                setGroupInfo(true)    
              }}
              className={`bg-green-600 w-[45%] ${theme.textPrimary} font-semibold py-2 px-4 rounded-md mt-4`}
            >
              Next
            </button>
  
            <button
              onClick={() => setSelectedContacts([])}
              className={`bg-[#666869] w-[45%] ${theme.textPrimary} font-semibold py-2 px-4 rounded-md mt-4`}
            >
              Cancel
            </button>
          </div>
        )}
  
        <p className={`mt-4 ${theme.textPrimary}`}>All contacts</p>
  
        {/* Contact List with Checkboxes */}
        <div className="mt-2 overflow-y-scroll custom-scrollbar">
          {contacts.map((contact) => (
            <label
              key={contact.contact?.Phone}
              className={`flex space-x-4 items-center cursor-default hover:${theme.contactHover} p-2 rounded-sm`}
            >
              <p className={` ${theme.border} rounded-full border-1`}>
                <img
                  src={contact.contact?.avatar}
                  alt={contact.contact?.Phone}
                  className="w-12 h-12 rounded-full"
                />
              </p>
              <p className="flex-grow">
                {contact.firstname + ' ' + contact.lastname}
              </p>
              <p>
                <input
                  type="checkbox"
                  checked={selectedContacts.some((c) => c.contact.Phone === contact.contact.Phone)}
                  onChange={() => handleCheckboxChange(contact)}
                  className="w-4 h-4 cursor-pointer"
                />
              </p>
            </label>
          ))}
        </div>
      </>
      ) :
      (
        <div className="flex flex-col h-full space-x-2 justify-between text-sm">

          <div className='mt-4 flex space-x-4 items-center'>
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange} 
            />

            {/* Camera Icon Button */}
            <button onClick={handleCameraClick} className="cursor-pointer bg-gray-500 p-3 rounded-full">
              <Camera size={24} />
            </button>

            <p>Add group icon <span className='text-gray'>(optional)</span></p>

            {/* Show Image Preview */}
            {avatar && (
              <div className="mt-2">
                <img
                  src={avatar}
                  alt="Selected"
                  className="w-20 h-20 object-cover rounded-full"
                />
              </div>
            )}

          </div>

          {/* Group Name Input with Emoji Picker */}
          <div className="mt-4 space-y-2 relative">
            <p>Provide a group name</p>
            <label className="flex justify-between bg-gray-700 border-b-1 pr-3 rounded-md items-center relative">
              <input
                type="text"
                placeholder="Group name (optional)"
                className="w-full outline-0 p-2 text-white rounded-md"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />

              {/* Emoji Button */}
              <span onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="cursor-pointer">
                <Smile size={18} />
              </span>
            </label>

          
          </div>

         <div className='mt-4'>
            <p>Disappearing messages</p>
            
            <select name="" id="" className='bg-gray-600 outline-0 p-2 rounded-sm text-sm pr-2'
            value={selectedDuration}
            onChange={handleDispDuration}>
              <option value="">Off</option>
              <option value="1">90 days</option>
              <option value="2">7 days</option>
              <option value="3">24 hours</option>
              
            </select>
         </div>
         <p className='flex-1 mt-4'>All new messages in this chat will disappear<br />
         after the selected duration</p>
         {error && (
            <p className='text-red-500'>{error}</p>
          )}

         {selectedContacts.length > 0 && (
          <div className="flex space-x-2 justify-between">
            <button
              onClick={createGroup}
              className="bg-green-600 w-[45%] text-[#c5cdd4] font-semibold py-2 px-4 rounded-md mt-4"
            >
              Create
            </button>
  
            <button
              onClick={() => setSelectedContacts([])}
              className="bg-[#666869] w-[45%] text-[#c5cdd4] font-semibold py-2 px-4 rounded-md mt-4"
            >
              Cancel
            </button>
          </div>
        )}
        </div> 
      )
      }
      
    </div>
      
       {/* Emoji Picker (conditionally rendered) */}
     {showEmojiPicker && (
      <div className=" absolute top-10 left-83 translate-x-2 z-50 bg-gray-800 rounded-lg shadow-lg">
        <EmojiPicker onEmojiClick={emojiHandler} />
      </div>
    )}
    </div>
  ) 
};

export default NewGroupModal;
