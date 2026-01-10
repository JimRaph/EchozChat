import Contactbar from './chat/contactbar'
import Call from './Call';
import Status from './Status';
import Starred from './Starred';
import Archived from './Archived';
import Unread from './chat/Unread';
import Favourite from './chat/Favourite';
import Contacts from './chat/Contacts';
import NonContacts from './chat/NonContacts';
import Groups from './chat/Groups';
import Drafts from './chat/Drafts';

const Mainbar = ({activeIcon,setActiveIcon,className}) => {
    return (
   <div className={`${className} w-full h-full`}> 
        {(()=>{
            switch(activeIcon) {
            case 'message':
                return <Contactbar setActiveIcon={setActiveIcon}/>;
            case 'call':
                return <Call />;
            case 'status':
                return <Status />;
            case 'starred':
                return <Starred />
            case 'archived':
                return <Archived />;
            case 'unread':
                return <Unread  setActiveIcon={setActiveIcon}/>
            case 'favourite':
                return <Favourite setActiveIcon={setActiveIcon} />
            case 'contacts':
                return <Contacts setActiveIcon={setActiveIcon} />
            case 'noncontacts':
                return <NonContacts setActiveIcon={setActiveIcon} />
            case 'groups':
                return <Groups setActiveIcon={setActiveIcon} />
            case 'drafts':
                return <Drafts setActiveIcon={setActiveIcon} />
            default:
                return <Contactbar />;
            }
        })()
        }
  </div>
  )
}

export default Mainbar
