import { Star, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/context';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { base_url } from '../../utils/baseUrl';
import {toast} from 'sonner'

const Starred = () => {
  const { theme, HoverableItem } = useTheme();
  const { scrollToMessage, token,contacts } = useAppContext() ;
  const [starredMessages, setStarredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // console.log('contas: ', contacts)

  const name =(msg)=> {
    const exists = contacts.filter(contact => contact.contact.Phone === msg.sender.Phone)
    // console.log(exists)
    if(exists.length){
      return `${exists.firstname} ${exists.lastname}`
    } else {
      return msg.sender.Phone
    }
  }

  useEffect(() => {
    const fetchStarredMessages = async () => {
      try {
        const response = await axios.get(`${base_url}/message/starred/star`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if(response.data.success){
          setStarredMessages(response.data.messages);
          // console.log(response.data.messages)
        }else{
          toast.error(response.data.message || 'Error fetching starred messages')
        }
      } catch (error) {
        // console.error("Error fetching starred messages:", error);
        toast.error(error?.response?.data?.message || 'Something went wrong, try again');
      }
    };
    
    fetchStarredMessages();
  }, [token]);

  const filteredMessages = starredMessages.filter(msg => 
    msg.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col p-4 w-full h-full rounded-tl">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-xl">Starred Messages</p>
        <div className="text-sm text-gray-500">
          {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
        </div>
      </div>

      <div className={`mt-5 mb-2 flex items-center ${theme.input} rounded-md px-3 py-1 space-x-2`}>
        <Search size={16} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search starred messages"
          className="w-full bg-transparent outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar ${theme.secondary}`}>
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <HoverableItem
              key={msg._id}
              onClick={() => scrollToMessage(msg, msg._id)}
              className={`flex items-center p-3 mb-2 rounded-md ${theme.main} transition-colors`}
            >

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold truncate">{msg.chat?.type==='group' ? msg.chat.name : name(msg)}</span>
                  <span className={`text-xs ${theme.textPrimary} font-semibold`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm truncate ${theme.textSecondary} font-bold`}>
                  {msg.chat?.type==='group' && (msg.sender.username || name(msg))+ ': '} {msg.content || (msg.media ? "📷 Media" : "")}
                </p>
              </div>
            </HoverableItem>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Star size={48} className={`${theme.textSecondary} mb-3`} />
            <p className={`font-medium`}>No starred messages</p>
            <p className={`text-sm mt-1`}>
              {searchTerm ? 'No matches found' : 'Star messages to see them here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Starred;