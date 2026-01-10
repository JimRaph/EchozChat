import { useAppContext  } from '../context/context'
import { useTheme } from "../context/ThemeContext";


const Allcontacts = ({setModalOpen}) => {

    const { contacts, setSelectedContact, setSelectedChat} = useAppContext ()
    const {HoverableItem, theme} = useTheme()
    

    return (
        <div className='h-full'>

            {
                contacts?.map((c,_) => (
                    <HoverableItem key={c.contact._id} 
                    onClick={()=>{
                        // console.log('selected contact: ', c)
                        setModalOpen(false)
                        //makes sure there is no active conversation
                        localStorage.removeItem('whatapp-selectedchat')
                        setSelectedChat(null)

                        setSelectedContact(c)
                    }}
                    className={`flex space-x-4 items-center cursor-default hover:${theme.contactHover} p-2 rounded-sm`}>
                        <p className={`rounded-full border-1 ${theme.main} ${theme.border} p-2`}>
                            <img src={c.contact.avatar}
                            className='w-7 h-7' />
                        </p>
                        <div>
                        <p className='font-semibold'>
                            {c.firstname + ' ' + c.lastname}
                        </p>
                        <p className={`${theme.textSecondary}`}>
                            {c.contact.status}
                        </p>
                        </div>
                    </HoverableItem>
                ))
            }
        
        </div>
    )
}

export default Allcontacts
