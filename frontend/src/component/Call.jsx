import { PhoneCallIcon, User, Search } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAppContext } from '../context/context'



const Call = () => {
  const {theme, HoverableItem} = useTheme()
  const {calls, user, contacts, formatMessageTime} = useAppContext() 


  const getInfo = (participants) => {
    const otherUser = participants.find(participant => participant._id !== user.id)
    const isContact = contacts.find(contact => contact.contact._id === otherUser._id)
    const name = isContact ?  `${isContact.firstname} ${isContact.lastname}` 
            : otherUser.Phone;
    const avatar = isContact ? isContact.contact.avatar : otherUser.avatar
    return [name, avatar]
  }


  return (
    <div className={`flex h-full w-full ${theme.main} flex-col`}>
  {/* Header Section */}
  <div className={`h-fit p-4 pb-2 mb-1 ${theme.secondary} `}>
    <div className="flex justify-between items-center">
      <p className="font-semibold text-xl">Calls</p>
      <div className="flex space-x-1">
        <div className="${theme.contactHover  p-2">
          <PhoneCallIcon size={20} />
        </div>
      </div>
    </div>
    
        {/* Search bar  */}
    <div className={`mt-5 mb-2 flex items-center ${theme.input} border-b-1 border-b-[#969494] space-x-2 pl-2`}>
      <Search size={13} />
      <input
        type="text"
        placeholder="Search for chats"
        className="w-full px-2 py-1 outline-none rounded-md"
      />
    </div>
  </div>

  {/* Favorites Section  */}
  <div className={`h-fit p-4 mb-1 ${theme.secondary}`}>
    <div className="flex flex-col">
      <p className={`${theme.textSecondary} font-semibold text-md`}>Favourite</p>
      <HoverableItem 
      className={`flex space-x-4 mt-1 mb-1 p-1 items-center rounded-md`}>
        <div className={`p-4 rounded-full ${theme.main} border ${theme.border}`}>
          <User size={20} />
        </div>
        <p>Add favourite</p>
      </HoverableItem>
    </div>
  </div>

      {/* Recent Calls Section */}
      <div className={`h-0 flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full p-4 pt-2 ${theme.secondary} `}>
        <div className="flex flex-col w-full">
          <p className={`${theme.textSecondary} font-semibold text-md mb-3`}>Recent</p>

          {calls.map((call, idx) => (
            <HoverableItem key={idx} 
            className={`flex space-x-4 mb-2 p-3 rounded-md w-full`}>
              <div className="rounded-full bg-[#353b3d]">
                <img src={call.isGroupCall ? call.avatar : getInfo(call.participants)[1]} 
                alt='pfp'
                className={`${theme.border} border rounded-full h-12 w-12`} />
              </div>
              <div className="flex flex-col flex-1 space-y-1 w-full">
                <div className="flex justify-between mr-2 w-full">
                  <p>
                    {call?.isGroupCall ? call?.chatId?.name : getInfo(call?.participants)[0]}
                  </p>
                  <p className="flex items-end text-sm">
                    {formatMessageTime(call.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneCallIcon size={15} />
                  <p className="text-sm text-[#bec5c9]">
                    {(call.caller._id !== user._id && !call.picked) ? 'missed call' :
                     (call.caller._id !== user._id && call.picked) ? 'Incoming' : 
                     (call.caller._id === user._id) ? 'Outgoing' : ''}
                  </p>
                </div>
              </div>
            </HoverableItem>
          ))}
    </div>
      </div>
</div>

  )
}

export default Call
