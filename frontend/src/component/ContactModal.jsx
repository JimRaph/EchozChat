import Allcontacts from './Allcontacts'
import { Keyboard,Users } from 'lucide-react'
import { useAppContext } from '../context/context'
import { useTheme } from '../context/ThemeContext'
import { useEffect } from 'react'

const ContactModal = ({setModalOpen, ref}) => {
    
    const {user, setGroupModal, setNewContactModal } = useAppContext() 
    const {theme} = useTheme()
    
    const toggleGroupModal = () => {
        setGroupModal(true);
    }

    const toggleNewContactModal = () => {
        setNewContactModal(prev => !prev);
        setModalOpen(false);
    }

    const closeModal = (e) => {
        if(ref.current && !ref.current.contains(e.target)){
            setModalOpen(false)
        }
    }

    useEffect(()=>{
        document.addEventListener('mousedown', closeModal)

        return ()=>{
            document.removeEventListener('mousedown', closeModal)
        }
    },[])

  

  return (
    <div ref={ref}
    className={`absolute mt-10 p-3 flex flex-col ${theme.main} h-140 
    overflow-y-scroll custom-scrollbar ${theme.textPrimary} w-84 
    shadow-lg rounded-md z-4 border ${theme.border} right-5 sm:right-auto`}>
      
      <h1 className="text-lg mt-3 mb-3 font-semibold">New Chat</h1>
        
        {/* Search bar  */}
        <div className={`flex items-center ${theme.secondary} border-b ${theme.border} pr-2`}>
            <input type="text" placeholder="Search name or number" 
            className= {`w-full p-1 ${theme.textPrimary} rounded-md outline-none`} />
            <Keyboard size={20} />
        </div>

        {/* Create group or contact  */}

            {/* New Group  */}
        <div 
        onClick={toggleGroupModal}
        className={`flex space-x-4 mt-2 items-center cursor-default hover:${theme.contactHover} p-2 rounded-sm`}>
            <p className={`rounded-full border ${theme.secondary} ${theme.border} p-2`}>
                <Users className={` ${theme.icons}`}/>
            </p>
            <p className='font-semibold'>New group</p>
        </div>
        
            {/* New Contact  */}
        <div 
        onClick={toggleNewContactModal}
        className={`flex space-x-4 items-center cursor-default hover:${theme.contactHover} p-2 rounded-sm`}>
            <p className={`rounded-full border ${theme.secondary} ${theme.border} p-2`}>
                <Users className={` ${theme.icons}`}/>
            </p>
            <p className='font-semibold'>New Contact</p>
        </div>

            {/* Me  */}
        <div className={`flex space-x-4 items-center hover:${theme.contactHover} p-2 rounded-sm`}>
            <p className={`rounded-full border-1 ${theme.secondary} ${theme.border} p-2`}>
                <img src={user?.avatar} alt='user'
                className='w-7 h-7' />
            </p>
            <div>
                <p className='font-semibold'>Me (You)</p>
                <p className={`${theme.textSecondary}`}>Message yourself</p>
            </div>  
        </div>

        <p className={`${theme.textSecondary} my-4`}>Frequently contacted</p>

        {/*  Frequent contacts  */}
        <div className={`flex space-x-4 items-center hover:${theme.contactHover} p-2 rounded-sm`}>
           
            <p className={`rounded-full border-1 ${theme.secondary} ${theme.border} p-2`}>
                <img src={user?.avatar} alt='user'
                className='w-7 h-7' />
            </p>
            <div>
                <p className='font-semibold'>Me (You)</p>
                <p className={`${theme.textSecondary}`}>Message yourself</p>
            </div> 

        </div>

        <p className={`${theme.textSecondary} mt-4`}>All contacts</p>

        {/* DISPLAYS ALL CONTACTS HERE */}
        <Allcontacts setModalOpen={setModalOpen} />
    </div>
  )
}

export default ContactModal
