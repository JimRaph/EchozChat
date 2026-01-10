import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/context';

const Personalization = () => {
  const [open, setOpen] = useState(false);
  const [openChatBg, setOpenChatBg] = useState(false);
  const options = ['Light', 'Dark'];
  const dropdownRef = useRef();
  const dropdownRefChatBg = useRef();
  const {toggleTheme, theme} = useTheme()
  const {chatBg, setChatBg} = useAppContext() 

  const colours = [
    "bg-[#8FDAC1]",
    "bg-[#DFB3B3]",
    "bg-[#692723]",
    "bg-[#876CBD]",
    "bg-[#C2B474]",
    "bg-[#2F4433]"
  ]

  const toggleDropdown = () => setOpen(!open);
  const toggleDropdownChatBg = () => setOpenChatBg(!openChatBg)

  const handleSelect = (option) => {
    toggleTheme(option);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (dropdownRefChatBg.current && !dropdownRefChatBg.current.contains(e.target)) {
        setOpenChatBg(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <>

        {/* Theme Section */}
      <div ref={dropdownRef} className="relative w-full  mx-auto">
        
        <p className={`${theme.textSecondary} font-bold mb-2`}>Select theme</p>
        
        <div
          onClick={toggleDropdown}
          className={`bg-[#2c3c44] text-white px-4 py-2 rounded-md cursor-pointer 
                        border-1 ${theme.border} flex justify-between items-center`}>
          <span>{theme.type}</span>
          <ChevronDown size={18} />
        </div>

        {/* Theme select Dropdown Options */}
        {open && (
          <div className="absolute mt-1 w-full bg-[#1f2b34] border border-[#344452] rounded-md shadow-md z-10">
            {options.map((opt, index) => (
              <div
                key={index}
                onClick={() => handleSelect(opt)}
                className={`px-4 py-2 hover:${theme.contactHover} ${theme.main} cursor-pointer ${
                  theme.type === opt ? theme.main : ''
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>


        {/* Background section  */}
      <div ref={dropdownRefChatBg} className="relative w-full mt-5 mx-auto">
                
        <p className={`${theme.textSecondary} font-bold mb-2`}>Select chat background colour</p>

          {/* Selected background  */}
        <div
          onClick={toggleDropdownChatBg}
          className={`relative ${chatBg ? chatBg : 'bg-[#2c3c44]'} ${theme.textSecondary} px-4 py-2 rounded-md cursor-pointer 
            flex justify-between items-center ${chatBg ? 'h-10' : ''} text-white border-1 ${theme.border}`}
        >
         {!chatBg && 
          <>
          <span>Select Background</span>
          <ChevronDown size={18} />
          </>
          } 
        </div>

        {/* Background dropdown options */}
        {openChatBg && (
          <div className={`absolute mt-3 w-full border-2 border-[#344452] 
            rounded-md shadow-md z-10 `}>
            {colours.map((col, index) => (
              <div
                key={index}
                onClick={() => {
                  setChatBg(col)
                  localStorage.setItem('chatBg', col)
                  setOpenChatBg(false)
                }}
                className={`px-4 py-2 h-13 cursor-pointer ${col} hover:border-1 border-gray-50`}
              >
                {''}
              </div>
            ))}
          </div>
        )}
      </div>


      <div onClick={()=>{
        setChatBg(null)
        localStorage.removeItem('chatBg')
      }
      }
      className={`${theme.main} p-1 rounded-md w-fit mt-5 ${theme.textPrimary} 
                  hover:opacity-80 border-2 ${theme.border} ${theme.type==='Dark' ? 'shadow-gray-600': ''} shadow`}>
        <button>Reset background colour</button>
      </div>
    
    </>
  );
}

export default Personalization;
