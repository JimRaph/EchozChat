import {createContext, useContext, useState, useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import axios from 'axios'
import { base_url } from '../../utils/baseUrl'
import { useRef } from 'react'
import { toast } from 'sonner'

export const ContextBuild = createContext()

// eslint-disable-next-line react/prop-types
const ContextProvider = ({children}) => {

    //current conversation
    const [selectedChat, setSelectedChat] = useState(()=>{
        return JSON.parse(localStorage.getItem('whatapp-selectedchat')) || null
    })

    //retrieves token
    const [token, setToken] = useState(()=>{
      const storedToken = localStorage.getItem('whatsapp-token');
      if (storedToken) {
        try {
            const decoded = jwtDecode(storedToken);
            // Check if token is expired (exp is in seconds, Date.now() in ms)
            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('whatsapp-token');
                localStorage.removeItem('whatsapp-user');
                localStorage.removeItem('whatapp-selectedchat');
                return null;
            }
            return storedToken;
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem('whatsapp-token');
             localStorage.removeItem('whatsapp-user');
            return null;
        }
      }
      return null;
    })

    //current user
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem('whatsapp-user'))
    })

    //tracks if the group chat modal is open
    const [groupModal, setGroupModal] = useState(false)
    // tracks the modal where contacts can be created is open
    const [newContactModal, setNewContactModal] = useState(false)
    // keeps hold of saved contacts
    const [contacts, setContact] = useState(null)

    // keeps selected contacts to create a group chat
    const [selectedContacts, setSelectedContacts] = useState([]);

    // tracks the selected contact to start a chat with
    const [selectedContact, setSelectedContact] = useState(null)

    //list of all conversations
    const [ chats, setChats] = useState([])

    //all messages 
    const [messages, setMessages] = useState([])

    const [calls, setCalls] = useState([])

    const [chatBg, setChatBg] = useState(() => {
      return localStorage.getItem('chatBg')
    })

    //tracks messages for starred ones
    const messageRefs = useRef({});

    // keeps starred message state
    const isStarred = useRef()

    const deleteContact = async (phone) => {
        // console.log('FROM CONTEXT deleting contact deleteContact....')

        try {
        const {data} = await axios.delete(base_url + '/users/contacts'
            , {
            Phone: phone
            }, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if(data.success){
            setContact(data.contact)
        }else{
            // console.log("Failed to delete contact ", data)
            toast.error(data?.message || 'Something went wrong')
        }
        } catch (error) {
          // console.log("ERROR deleteContact: ", error.response.data)
          toast.error(error?.response?.data?.message || 'Something went wrong, try again');
        }
    }

    // USERS 
    const getContacts = async () => {
        // console.log('FROM CONTEXT getting all contacts getContacts....')
        try {
        const {data} = await axios.get(base_url + '/users/contacts', {
            headers: { Authorization: `Bearer ${token}` }
        })
        if(data.success){ 
            setContact(data.contact)
        }else{
            // console.log("Failed to get contacts ", data)
            toast.error(data?.message || 'Something went wrong')
        }
        } catch (error) {
          // console.log("ERROR getcontact: ", error.response.data)
          toast.error(error?.response?.data?.message || 'Something went wrong, try again');

        }
    }

    //retrieves current user profile
    //keeps user state up-to-date
    const getProfile = async() => {
        // console.log('FROM CONTEXT retrieving user profile getProfile')
        try {
        const {data} = await axios.get(base_url + '/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
        // console.log('data: ', data)
        if(data.success){
            setUser(data.user)
        }else{
            console.log("Failed to get profile: ", data)
            toast.error(data?.message || 'something went wrong')
        }
        } catch (error) {
        // console.log("ERROR getProfile: ", error.response.data)
          toast.error(error?.response?.data?.message || 'Something went wrong, try again');
        }
    }

    const createChat = async () => {

        // console.log('FROM CONTEXT creating chat createChat......')
        try {
        const { data } = await axios.post(
            `${base_url}/chats`,
            { userId: activeUser._id },
            {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('whatsapp-token')}`,
            }
            }
        );
        // Set the newly created chat as selected
        // setNewChat(data.chat)
        if(data.success){

          setSelectedChat(prev => [...prev,  data.chat]);
          localStorage.setItem('whatsapp-chat', JSON.stringify(data.chat));
        } else{
          toast.error(data?.message || 'Something went wrong')
        } 
        } catch (error) {
        // console.error('Error creating/loading chat:', error);
        toast.error(error?.response?.data?.message || 'Something went wrong, try again');
        }
        };

      const deleteChat = async (chatId) => {
        try {
          const { data } = await axios.delete(`${base_url}/chats/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (data.success) {
            //  removes selectedChat from localStorage 
            setChats(prev => prev.filter(chat => chat._id !== chatId));
            const storedSelectedChat = JSON.parse(localStorage.getItem('whatapp-selectedchat') || '{}');
            // If the currently selected chat is the deleted one, reset state
            if (selectedChat?._id === chatId || storedSelectedChat?._id === chatId) {
              setSelectedChat(null);
              localStorage.removeItem('whatapp-selectedchat');
            }
            setSelectedContact(null);
          } else{
            toast.error(data?.message || 'Something went wrong')
          }
        } catch (error) {
          console.error("Delete failed:", error);
          toast.error(error?.response?.data?.message || 'Something went wrong, try again');
          // return { 
          //   success: false, 
          //   error: error.response?.data?.message || "Failed to delete chat" 
          // };
        }
      };


    const identifier = (chat) => {

        //checks if chat is an actual chat or selected contact
        if(chat.firstname){
          const identity = chat.firstname + ' ' + chat.lastname
          const avatar = chat.contact.avatar
          return [identity, avatar]
        }

        if(chat.type === 'group'){
            const identity = chat.name;
            const avatar = chat.avatar;
            return [identity, avatar]
        }

        let identifier;
        if(user._id === chat?.participants[0]?._id){
          identifier =  chat?.participants[1]
        }else{
          identifier = chat?.participants[0]
        }

        const saved_identifier = contacts?.filter(c=>c.contact?._id == identifier?._id)
        let identifier_name;

        if(saved_identifier){
            identifier_name = (saved_identifier[0]?.firstname && saved_identifier[0]?.lastname)
            ? `${saved_identifier[0].firstname} ${saved_identifier[0].lastname}`
            : saved_identifier[0]?.contact?.phone;
        }
        const identity = identifier_name ? 
                        identifier_name :
                        identifier?.Phone

        const avatar = identifier_name ? 
                        saved_identifier[0]?.contact?.avatar :
                        identifier?.avatar
        return [identity, avatar] 
    }

    const getUnreadCount = (chat) => {
      const myCount = chat.unreadCounts?.find(uc => 
        uc.user.toString() === user._id.toString()
      );
      return myCount?.count || 0;
    };

    const formatMessageTime =(date) =>{
        const now = new Date();
        const msgDate = new Date(date);
        const diffMs = now - msgDate;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
            return msgDate.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            });
        } else if (diffHours < 48) {
            return 'Yesterday';
        } else if (diffHours > 48){
            return msgDate.toLocaleDateString(undefined, {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            });
        }
        else {
            return ''
        }
    }

    // scroll to starred message
    const scrollToMessage = (message, messageId) => {
      console.log(message.chat)
      console.log(chats)
      const msgChat = chats.filter(chat => chat._id === message.chat._id)
      console.log(msgChat)
      setSelectedChat(msgChat[0])

      setTimeout(()=>{
        const el = messageRefs.current[messageId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add( 'rounded-md', 'bg-blue-50/10'); 
          setTimeout(() => el.classList.remove( 'rounded-md', 'bg-blue-50/10'), 800);
        }
      }, 1000)
    };

    useEffect(()=>{
         if(token){
            getProfile(),
            getContacts()
        }
    },[token])


    useEffect( ()=>{

      const getCallHistory = async() => {

        try {
       const calls = await axios.get(base_url + '/calls/history', {
          headers: { Authorization: `Bearer ${token}`
                      }
        })
        // console.log('calls: ', calls)
      if(calls){
        setCalls(calls.data.calls)
      }

      } catch (error) {
      console.log('Error getting call history: ', error)
      }

      }

      getCallHistory()
  
    },[token])

  // loads chat and call history
  useEffect(() => {
  if (!token) return;

  const loadChats = async () => {
    setChats([]); 


    try {
      const [individual, group] = await Promise.all([
        axios.get(base_url + '/chats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(base_url + '/chats/group', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if(!individual.data.success){
        toast.error(individual?.data?.message || 'Error getting chats')
      }
        
      if(!group.data.success)[
        toast.error(group?.data?.message || 'Error getting group chats')
      ]
      if(!Array.isArray(individual.data.chats)){
        individual.data.chats = []
      }
      if(!Array.isArray(group.data.groupChats)){
        group.data.groupChats = []
      }

      const allChats = [...individual.data.chats, ...group.data.groupChats];
      // console.log('all chats: ', allChats)
      // Deduplicate by _id
      const uniqueChats = [];
      const seen = new Set();

      for (const chat of allChats) {
        if (!seen.has(chat._id)) {
          uniqueChats.push(chat);
          seen.add(chat._id);
        }
      }

      setChats(uniqueChats);
    } catch (err) {
      console.log("Error loading chats:", err.response?.data || err.message);
      toast.error(err?.response?.data?.message || 'Something went wrong, try again');
    }
  };

  loadChats();
  }, [token]);

    const logout = () => {
        localStorage.removeItem('whatsapp-token');
        localStorage.removeItem('whatsapp-user');
        localStorage.removeItem('whatapp-selectedchat');
        setToken(null);
        setUser(null);
        setSelectedChat(null);
        // Force reload to update App.jsx state
        window.location.href = '/'; 
    }


  return (
    <ContextBuild.Provider value={{contacts, setContact, chats, setChats, messages, 
    setMessages, user, setUser, deleteContact,
    setGroupModal, groupModal, setNewContactModal, newContactModal,
    setSelectedChat, selectedChat, chatBg, setChatBg, messageRefs, isStarred,
    token,createChat, getUnreadCount, identifier, deleteChat,calls, scrollToMessage,
    selectedContact, setSelectedContact, formatMessageTime, selectedContacts, setSelectedContacts, logout }}>
      {children}
    </ContextBuild.Provider>
  )

}

export const useAppContext  = () => useContext(ContextBuild);

export default ContextProvider
