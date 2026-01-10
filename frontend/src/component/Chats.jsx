import { LucideMonitorSpeaker, Square } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const Chats = () => {

const {theme} = useTheme()

const [archieveModal, setArchieveModal] = useState(false)
const [clearChatModal, setClearChatModal] = useState(false)
const [deleteChatModal, setDeleteChatModal] = useState(false)
const [keepStarred, setKeepStarred] = useState(false)

// ----------------------------------------------
// HANDLES ARCHIVE MODEL 
// ---------------------------------------------
  const archieveModalHandler = ()=>{
    return (
      <>
      <div className='fixed inset-0 bg-black/40 '>
       </div> 
        <div className={`z-50 text-sm fixed inset-0 m-auto h-fit w-96 ${theme.secondary} ${theme.border} 
        border-2 shadow-gray-500 shadow  rounded-md`}>
          <p className='p-5'>Are you sure you want to archieve all of your chats?</p>
          <div className={`flex p-5 ${theme.main} items-center justify-between`}>
            <button className={`w-[50%] p-2 m-1 bg-[#4caf50] ${theme.type==='Light'&&'text-white'} rounded-md hover:bg-[#45a049]`}>Yes</button>
            <button className={`w-[50%] p-2 m-1 bg-[#20313b] ${theme.type==='Light'&&'text-white'} rounded-md hover:bg-[#2a3b46]`} onClick={()=>setArchieveModal(false)}>No</button>
          </div>
        </div>
        </>
    )
  }

// ---------------------------------------------------
// HANDLES CLEAR CHAT MODAL 
// --------------------------------------------------
  const clearChatModalHandler = ()=>{
    return (
      <>
      <div className='fixed inset-0 bg-black/40 '>
       </div> 
        <div className={`z-50 text-sm pt-5 fixed inset-0 m-auto h-fit w-96 
        ${theme.secondary} ${theme.border} border-2 shadow-gray-500 shadow  rounded-md`}>
          <h2 className='pl-5 text-lg font-semibold'>Clear messages in chats?</h2>
          <p className='pl-5 mt-3'>Messages will be removed from all your devices</p>
          <p className='pl-5 flex items-center mt-4 mb-8 space-x-2'>
            {
              keepStarred ?
              <svg onClick={()=>setKeepStarred(false)}
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="green" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-check"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
              :
              <Square onClick={()=>setKeepStarred(true)} />
            }
            <label className='text-sm'>Keep starred messages</label>
          </p>

          <div className={`flex p-5 ${theme.main} items-center justify-between`}>
            <button className={`w-[50%] p-2 m-1 bg-[#4caf50] ${theme.type==='Light'&&'text-white'} rounded-md hover:bg-[#45a049]`}>Clear chats</button>
            <button className={`w-[50%] p-2 m-1 bg-[#20313b] ${theme.type==='Light'&&'text-white'} rounded-md hover:bg-[#2a3b46]`} onClick={()=>setClearChatModal(false)}>Cancel</button>
          </div>
        </div>
        </>
    )
  }

// ------------------------------------------------
// HANDLES DELETE CHAT MODAL 
// --------------------------------------------------
  const deleteChatModalHandler = ()=>{
    return (
      <>
      <div className='fixed inset-0 bg-black/40 '>
       </div> 
        <div className={`z-50 text-sm pt-5 fixed inset-0 m-auto 
          h-fit w-96 ${theme.secondary} ${theme.border} border-2 
          shadow-gray-500 shadow rounded-md`}>
          <h2 className='pl-5 text-lg font-semibold'>Delete messages and chats?</h2>
          <p className='pl-5 mt-3'>Messages will be removed from all your devices</p>
          <p className='pl-5 flex items-center mt-4 mb-8 space-x-2'>
            {
              keepStarred ?
              <svg onClick={()=>setKeepStarred(false)}
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="green" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-check"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
              :
              <Square onClick={()=>setKeepStarred(true)} />
            }
            <label className='text-sm'>Keep starred messages</label>
          </p>

          <div className={`flex p-5 ${theme.main} items-center justify-between`}>
            <button className={`w-[50%] p-2 m-1 bg-[#4caf50] ${theme.type==='Light'&&'text-white'} rounded-md hover:bg-[#45a049]`}>Delete all</button>
            <button className={`w-[50%] p-2 m-1 bg-[#20313b] ${theme.type==='Light'&&'text-white'} rounded-md hover:bg-[#2a3b46]`} onClick={()=>setDeleteChatModal(false)}>Cancel</button>
          </div>
        </div>
        </>
    )
  }

  return (

    <div>

      <h2 className="text-xl font-semibold">Chats</h2>
      
        {/* History  */}
        <div className="mb-4 mt-4 space-y-2">
          <p>Chat history</p>
          <p className='text-xs flex space-x-2'>
            <LucideMonitorSpeaker />
            <span>Synced with your phone</span>
          </p>
        </div>
        {archieveModal && archieveModalHandler()}
        {clearChatModal && clearChatModalHandler()}
        {deleteChatModal && deleteChatModalHandler()}

          {/* Archive  */}
        <div className='mt-4'>
          <p onClick={()=>setArchieveModal(true)}
          className={`${theme.type==='Dark' ? theme.main :''} p-2 text-sm w-fit mb-2 rounded-lg shadow-sm border 
          ${theme.type === 'Dark' ? 'border-[#111B21]' :'border-[#dad8d8]'}`}>
            Archive all chats</p>
          <p className='text-xs'>You will still receive new messages from<br></br> archieved chats</p>
        </div>

          {/* Clear  */}
        <div className='mt-4'>
          <p onClick={()=>setClearChatModal(true)}
          className={`${theme.type==='Dark' ? theme.main:''} p-2 text-sm w-fit ${theme.type === 'Dark' ? 'text-red-300' :'text-red-500'} mb-2 rounded-lg shadow-sm border
           ${theme.type === 'Dark' ? 'border-[#111B21]' :'border-[#dad8d8]'}`}>Clear all messages</p>
          <p className='text-xs'>Delete all messages from chats and groups</p>
        </div>

          {/* Delete  */}
        <div className='mt-4'>
          <p onClick={()=>setDeleteChatModal(true)}
          className={`${theme.type==='Dark' ? theme.main:''} p-2 text-sm ${theme.type === 'Dark' ? 'text-red-300' :'text-red-500'} w-fit mb-2 
          rounded-lg shadow-sm border ${theme.type === 'Dark' ? 'border-[#111B21]' :'border-[#dad8d8]'}`}>Delete all chats</p>
          <p className='text-xs'>Delete all messages and clear the chats from <br /> your history</p>
        </div>


    </div>
  )
}

export default Chats
