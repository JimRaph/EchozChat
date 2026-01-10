import General from './General';
import Account from './Account';
import Chats from './Chats';
import Video from './Video';
import Notifications from './Notifications';
import Personalization from './Personalization';
import Storage from './Storage';
import Shortcuts from './Shortcuts';
import Help from './Help';
import Profile from './Profile';
import { useTheme } from '../context/ThemeContext';

const Settingmain = ({ activeSTab }) => {
  
  const {theme} = useTheme()
  
  // Function to return the correct component based on activeSTab
  const renderComponent = () => {
    switch (activeSTab) {
      case 'General':
        return <General />;
      case 'Account':
        return <Account />;
      case 'Chats':
        return <Chats />;
      case 'Video & voice':
        return <Video />;
      case 'Notifications':
        return <Notifications />;
      case 'Personalization':
        return <Personalization />;
      case 'Storage':
        return <Storage />;
      case 'Shortcuts':
        return <Shortcuts />;
      case 'Help':
        return <Help />;
      case "Profile":
        return <Profile />; 
      default:
        return <General />;
    }
  };

  return (
    <div className={`flex flex-col w-full mr-0 p-4 overflow-y-auto custom-scrollbar
                      ${theme.secondary}`}>
      
      {renderComponent()}
    </div>
  );
};

export default Settingmain;


