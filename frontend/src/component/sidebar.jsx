import {useState,useRef, useEffect} from 'react'
import { Menu,
    Phone,
    ChartPie, Star,Archive, Settings,
    MessageCircleMore
 } from 'lucide-react'
import Setting from './Setting'
import { useTheme } from '../context/ThemeContext'
import { useAppContext } from '../context/context'


const Sidebar = ({setActiveIcon, setOpen, open}) => {

  const {theme} = useTheme()
  const {user, setSelectedContact, setSelectedChat} = useAppContext() 

  const [setting, setSetting] = useState(false)
  const settingRef = useRef()
  const [settingClicked, setSettingClicked] = useState('General')
  const [transitionComplete, setTransitionComplete] = useState(false);


  const handleSettingToggle = (e) => {
    if(settingRef.current && !settingRef.current.contains(e.target)){
      setSetting(false)
    }
  }

  const handleIconClick = (icon) => {
  setActiveIcon(icon);
  setSelectedChat(null);  
  setSelectedContact(null);
  localStorage.removeItem('selectedChat')
  localStorage.removeItem('selectedContact')
  setOpen(false);
};

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setTransitionComplete(true), 50); 
      return () => clearTimeout(timer);
    } else {
      setTransitionComplete(false);
    }
  }, [open]);

  useEffect(()=>{
    document.addEventListener('mousedown', handleSettingToggle)
    return ()=>{
      document.removeEventListener('mousedown', handleSettingToggle)
    }
  },[setting])





  const classname = `hover:${theme.contactHover} p-2 flex items-center ${open ? 'gap-3 rounded-l-lg justify-start'
    :'justify-center'} transition-all duration-300 ease-in overflow-hidden`
 
  return (
    
    <div className={`h-full w-full pt-5 flex flex-col relative ${open ? ' pl-3' :
    'items-center'}`} >
    
      <div className='border-b-[#60696e] space-y-2 '>

          {/* Menu Button  */}
        <p className={classname}
        onClick={(e) => {
          e.stopPropagation(); // Prevent document click from firing
          setOpen(prev => !prev);
        }}>
            <Menu size={20} className={`  ${theme.icons}`}/>      
        </p>

          {/* Message BUtton  */}
        <p className={classname}
        onClick={(e)=>{
           e.stopPropagation();
          handleIconClick('message');
          }}>
          <MessageCircleMore size={20} className={` ${theme.icons}`}/>
           <span className={`${transitionComplete && open ? 'opacity-100' : 'opacity-0 w-0'} 
          whitespace-nowrap transition-opacity duration-200`}>
          Chats
        </span>
        </p>

          {/* Phone Button  */}
        <p className={classname}
        onClick={(e)=>{
          e.stopPropagation()
          handleIconClick('call');
          }}>
          <Phone size={20} className={` ${theme.icons}`}/>
          <span className={`${transitionComplete && open ? 'opacity-100' : 'opacity-0 w-0'} 
          whitespace-nowrap transition-opacity duration-200`}>
          Calls
        </span>
        </p>

          {/* Status Button  */}
        <p className={classname}
        onClick={(e)=>{
          e.stopPropagation();
          handleIconClick('status');
          }}>
          <ChartPie size={20} className={` ${theme.icons}`}/>
          <span className={`${transitionComplete && open ? 'opacity-100' : 'opacity-0 w-0'} 
          whitespace-nowrap transition-opacity duration-200`}>
          Status
        </span>
        </p>        
      </div>


          {/* MIDDLE SECTION  */}
      <div className=' border-t-1 border-b-1 border-[#2d3133]  mb-3 mt-3  pt-3 pb-3 flex flex-col flex-grow justify-between'>
        
          {/* AI Button  */}
        <div onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
          className={classname}>
        <div 
          className={` bg-gradient-to-r from-purple-600 via-red-300 to-pink-500 w-5 h-5 rounded-full p-[4px]`}
        >
        <p className="w-full h-full rounded-full bg-white"></p>
        </div>
        <span className={`${transitionComplete && open ? 'opacity-100' : 'opacity-0 w-0'} 
          whitespace-nowrap transition-opacity duration-200`}>
          Meta AI
        </span>
        
        </div>


        <div className=' space-y-3'>
 
          {/* Starred Button  */}
          <p className={classname}
            onClick={(e)=>{
              e.stopPropagation();
              handleIconClick('starred');
              }}>
            <Star size={20} className={` ${theme.icons}`}/>
            <span className={`${transitionComplete && open ? 'opacity-100' : 'opacity-0 w-0'} 
          whitespace-nowrap transition-opacity duration-200`}>
          Starred messages
        </span>
          </p>

              {/* Archived Button  */}
          <p className={classname}
          onClick={(e)=>{
            e.stopPropagation();
            handleIconClick('archived');
            }}>
            <Archive size={20} className={` ${theme.icons}`}/>
            <span className={`${transitionComplete && open ? 'opacity-100' : 'opacity-0 w-0'} 
          whitespace-nowrap transition-opacity duration-200`}>
          Archived chats
        </span>
          </p>

        </div>

      </div>
      
            {/* BOTTOM SECTION  */}
    <div className='space-y-0 mb-4'>
       
       {/* Setting Button  */}
        <p 
        onClick={(e)=>{
           e.stopPropagation();
          setSetting(true)
          setOpen(false);
        }}
        className={classname}>
          <Settings size={20} className={` ${theme.icons}`}/>
          <span className={`${transitionComplete && open ? 'opacity-100' : 'opacity-0 w-0'} 
          whitespace-nowrap transition-opacity duration-200`}>
          Settings
        </span>
        </p>

        {/* Profile BUtton  */}
        <p 
        onClick={(e)=>{
          e.stopPropagation(); 
          setOpen(false);
          setSettingClicked('Profile')
          setSetting(true)
          
        }}
        className={classname}>
          <img src={user?.avatar} alt='pfp' className='rounded-full w-6 h-6'/>
          <span className={`${transitionComplete && open ? 'opacity-100' : 'opacity-0 w-0'} 
          whitespace-nowrap transition-opacity duration-200`}>
          Profile
        </span>
        </p>
      
    </div>

    <div ref={settingRef}>
      {setting && <Setting settingClicked={settingClicked} className={` ${theme.icons}`}/>}
    </div>
    
    </div>
  )
}

export default Sidebar
