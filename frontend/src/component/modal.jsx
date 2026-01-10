import NewGroupModal from './NewGroupModal'
import ContactModal from './ContactModal'
import { useAppContext } from '../context/context'

const Modal = ({modalOpen,setModalOpen, ref}) => {
    
    const {groupModal} = useAppContext() 
   

  return (
    <>
        {/* New chat modal, contains new group, me, all contacts, 
        new contacts options */}
       {modalOpen && !groupModal && <ContactModal ref={ref} setModalOpen={setModalOpen}/>} 
      
        {/* Create Group Modal  */}
       {modalOpen && groupModal && <NewGroupModal setModalOpen={setModalOpen} />}
      </>
    
  )
}

export default Modal
