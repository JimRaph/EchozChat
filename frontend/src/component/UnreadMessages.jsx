
const UnreadMessages = (chatId) => {

  const mChat = messages.filter(m => m.chat._id == chatId)
  const unreadM = mChat.map(mc=>!mc.readBy.includes(user._id))
  const unreadCount = len(unreadM)
  const currentChat = chats.filter(c=>c._id == chatId)
  currentChat.map(cc => cc.unreadCounts.append({count: unreadCount, user: user._id}))


  return (
    <div>
      <p>Building in progress....</p>
    </div>
  )
}

export default UnreadMessages
