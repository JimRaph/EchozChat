import { createContext, useState,  useContext } from "react";

// Define theme objects
const darkTheme = {
  main: "bg-[#111B21]",
  secondary: "bg-[#202C33]",
  chatSent: "bg-[#005C4B]",
  chatReceived: "bg-[#202C33]",
  textPrimary: "text-[#E9EDEF]",
  textSecondary: "text-[#8696A0]",
  icons: "text-[#8696A0]",
  border: "border-[#111B21]",
  btnLnk: "text-[#00A884] bg-[#00A884]",
  input: "bg-[#ccc1]",
  contactHover: "bg-[#2e3e47]",
  textOnBg: 'text-gray-950',
  type: 'Dark'
};
// [#3d49] bg-[#445053]
const lightTheme = {
  main: "bg-[#F3F3F3]",
  secondary: "bg-[#FFFFFF]",
  chatSent: "bg-[#D9FDD3]",
  chatReceived: "bg-[#FFFFFF]",
  textPrimary: "text-[#111B21]",
  textSecondary: "text-[#8d8d8d]",
  icons: "text-[#54656F]",
  border: "border-[#dad8d8]",
  btnLnk: "text-[#008069] bg-[#008069]",
  input: "bg-[#ccc1]",
  contactHover: "bg-[#e2e2e2]",
  type: "Light"
};

// Create context
const ThemeContext = createContext();

// Theme provider
export const ThemeProvider = ({ children }) => {


  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") === "Light" ? lightTheme : darkTheme
  });

  // Function to toggle themes
  const toggleTheme = (theme) => {
    let newTheme;
    // console.log('CURRENT tete: ', theme)
    if(theme === 'Light'){
      newTheme = lightTheme
    }
    if(theme === 'Dark'){
      newTheme = darkTheme
    }
    // console.log('CURRENT THREME: ', newTheme)
    setTheme(newTheme);
    localStorage.setItem("theme", theme);
  };

  //for dynamic hover
const HoverableItem = ({ children, className = "", ...rest }) => {
  const { theme } = useTheme();
  const [hover, setHover] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`${hover ? theme.contactHover : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, HoverableItem }}>
      {children}
    </ThemeContext.Provider>
  )
};

// Custom hook for easy theme access
export const useTheme = () => useContext(ThemeContext);
