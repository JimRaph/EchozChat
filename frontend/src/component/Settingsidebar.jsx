import { Bell, Disc2Icon, InfoIcon, Key, Keyboard, 
  Laptop, MessageCircleIcon, Paintbrush, User, VideoIcon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settingsidebar = ({setActiveSTab, activeSTab}) => {

  const {theme} = useTheme()

  const tabs = [
    'General',
    'Account',
    'Chats',
    'Video & voice',
    'Notifications',
    'Personalization',
    'Storage',
    'Shortcuts',
    'Help',
  ];

  return (

    <div className={`min-w-[35%] flex ${theme.main} flex-col justify-between`}>

      {/* Sidebar Tabs */}
      <div className='pl-1 mt-1 mr-2'>
        {tabs.map((tab,idx) => (
          <div
            key={idx}
            className={`relative flex p-2 pl-3 mb-1 space-x-4 items-center rounded-md
              text-sm ${theme.type === 'Dark' ? 'hover:bg-[#2e3e47]':'hover:bg-[#e2e2e2]'} cursor-pointer ${
                (activeSTab === tab  && theme.type==="Dark") ? 'bg-[#2e3e47]': (activeSTab === tab  && theme.type==="Light") && 'bg-[#e2e2e2]'
            }`}
            onClick={() => setActiveSTab(tab)}
          >
            {/* Green bar indicator */}
            {activeSTab === tab && (
              <div className="absolute left-0 h-4 w-1 bg-green-600 rounded-md"></div>
            )}
            {tab === 'General' ? <Laptop size={18}/> : ''}
            {tab === 'Account' ? <Key size={18}/> : ''}
            {tab === 'Chats' ? <MessageCircleIcon size={18}/> : ''}
            {tab === 'Video & voice' ? <VideoIcon size={18}/> : ''}
            {tab === 'Notifications' ? <Bell size={18}/> : ''}
            {tab === 'Personalization' ? <Paintbrush size={18}/> : ''}
            {tab === 'Storage' ? <Disc2Icon size={18}/> : ''}
            {tab === 'Shortcuts' ? <Keyboard size={18}/> : ''}
            {tab === 'Help' ? <InfoIcon size={18}/> : ''}
           
            <p>{tab}</p>
          </div>
        ))}
      </div>


      <div className='mb-2'>
      {/* Profile Section */}
      <div
      onClick={()=>setActiveSTab('Profile')}
      className={`relative flex p-2 pl-3 mb-1 m-1 space-x-4 items-center rounded-md text-sm
         ${theme.type === 'Dark' ? 'hover:bg-[#2e3e47]':''} cursor-pointer ${
        (activeSTab === 'Profile'  && theme.type==="Dark") ? 'bg-[#2e3e47]': 
        (activeSTab === 'Profile'  && theme.type==="Light") && 'bg-[#e2e2e2]'
    }`}>
       {/* Green bar indicator */}
       {activeSTab === "Profile" && (
              <div className="absolute left-0 h-4 w-1 bg-green-600 rounded-md"></div>
            )}
        <User />
        <p className='text-sm'>Profile</p>
      </div>

       {/* Log out Section */}
       {/* <div
      onClick={logout}
      className={`relative flex p-2 pl-3 mb-1 m-1 space-x-4 items-center rounded-md text-sm
         ${theme.type === 'Dark' ? 'text-red-400 hover:bg-[#2e3e47]':'text-red-500 hover:bg-[#ffe5e5]'} cursor-pointer`}>
        <LogOut size={18} />
        <p className='text-sm'>Log out</p>
      </div> */}
      </div>

    </div>
  );
};

export default Settingsidebar;
