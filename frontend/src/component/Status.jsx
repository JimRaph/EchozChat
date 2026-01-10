import { useTheme } from '../context/ThemeContext';
import { User } from 'lucide-react';

const Status = () => {

  const {theme, HoverableItem} = useTheme()

    const getFormattedDate = (date) => {
        const now = new Date();
        const givenDate = new Date(date);
    
        // gets the date parts
        const today = now.toDateString();
        const yesterday = new Date(now.setDate(now.getDate() - 1)).toDateString(); // Yesterday's date
    
        if (givenDate.toDateString() === today) {
            return `Today, ${givenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (givenDate.toDateString() === yesterday) {
            return `Yesterday, ${givenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return givenDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
                   ', ' + givenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };
    

  return (
    <div className={`flex flex-col ${theme.secondary} p-4 overflow-y-scroll 
    custom-scrollbar rounded-tl w-full h-full`}>
        
        <p className="font-semibold text-xl">Status</p>

        <HoverableItem className="flex items-center space-x-2 mt-3 mb-3 p-2 rounded-lg">
          <span className='border-1 rounded-full p-3 '>
          <User size={27} />
          </span>
        <div>
          <p className={`font-semibold  text-sm`}>User name</p>
          <p className={`text-xs ${theme.textSecondary} `}>Last seen: 5 minutes ago</p>
        </div>
      </HoverableItem>

      <p className={`font-semibold ${theme.textSecondary} text-sm`}>Recent updates</p>

    {
        [...Array(20)].map((_, i) =>(
            <HoverableItem key={i}
            className="flex items-center space-x-2 mt-0 pl-1 p-2 rounded-lg">

              <span className='border-1 rounded-full p-3 '>

              <User size={27} />
              </span>
            <div>
              <p className="font-semibold text-sm">User 1</p>
              <p className={`text-xs ${theme.textSecondary} `}>{getFormattedDate(new Date())}</p>
            </div>
          </HoverableItem>
        ))
    }

    </div>
  )
}

export default Status
