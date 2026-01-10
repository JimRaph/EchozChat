import { MessageCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";


const Chatarea = () => {

  const {theme} = useTheme()

  return (
    
      <div className={`flex flex-col sm:px-5 flex-grow border-l-1 ${theme.border}`}>
        

        
        <div className="text-center flex flex-grow flex-col items-center justify-center ">
          <MessageCircle size={64} className="text-[#00a884] mx-auto mb-4" />
          <div className="text-gray-400">
            <h2 className="pb-4 text-white">WhatsApp for Windows</h2>
            <p>Send and receive messages without keeping your phone online.</p>
            <p>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
          </div>
        </div>
      </div>
  
  );
};

export default Chatarea;
