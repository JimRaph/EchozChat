import { useEffect, useRef, useState } from "react";
import { GlobeIcon, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';

const General = () => {
  const [toggleLogin, setToggleLogin] = useState("off");
  const [langModal, setLangModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState({ english: "System default", local: "" })
  const [replaceText, setReplaceText] = useState(':-D')
  const langRef = useRef(null);
  const {theme} = useTheme()

  

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangModal(false);
      }
    };

    if (langModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langModal]);

  const languages = [
    { english: "English", local: "English" },
    { english: "Spanish", local: "Español" },
    { english: "French", local: "Français" },
    { english: "German", local: "Deutsch" },
    { english: "Chinese (Simplified)", local: "中文 (简体)" },
    { english: "Chinese (Traditional)", local: "中文 (繁體)" },
    { english: "Hindi", local: "हिन्दी" },
    { english: "Arabic", local: "العربية" },
    { english: "Portuguese", local: "Português" },
    { english: "Russian", local: "Русский" },
    { english: "Japanese", local: "日本語" },
    { english: "Korean", local: "한국어" },
    { english: "Italian", local: "Italiano" },
    { english: "Dutch", local: "Nederlands" },
    { english: "Turkish", local: "Türkçe" },
    { english: "Swedish", local: "Svenska" },
    { english: "Greek", local: "Ελληνικά" },
    { english: "Polish", local: "Polski" },
    { english: "Hebrew", local: "עברית" },
    { english: "Vietnamese", local: "Tiếng Việt" },
    { english: "Thai", local: "ไทย" },
    { english: "Bengali", local: "বাংলা" },
    { english: "Tamil", local: "தமிழ்" },
    { english: "Urdu", local: "اردو" },
    { english: "Malay", local: "Bahasa Melayu" },
    { english: "Indonesian", local: "Bahasa Indonesia" },
    { english: "Filipino", local: "Filipino" },
    { english: "Hungarian", local: "Magyar" },
    { english: "Czech", local: "Čeština" },
    { english: "Romanian", local: "Română" },
  ];

  const sortedLanguages = [
    { english: "System default", local: "" },
    ...languages.sort((a, b) => a.english.localeCompare(b.english)),
  ];

  return (
    <div className="">
      <h2 className="text-xl font-semibold">General</h2>
      <p className="mt-4 mb-4">Login</p>

      <div className="flex justify-between items-center">
        <p>Start WhatsApp at login</p>
        {toggleLogin === "off" ? (
          <span className="flex space-x-2 items-center" onClick={() => setToggleLogin("on")}>
            <span>{toggleLogin}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="37"
              height="37"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-toggle-left"
            >
              <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
              <circle cx="8" cy="12" r="3" />
            </svg>
          </span>
        ) : (
          <span className="flex space-x-2" onClick={() => setToggleLogin("off")}>
            <span>{toggleLogin}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="37"
              height="37"
              viewBox="0 0 24 24"
              fill="green"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-toggle-right"
            >
              <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
              <circle cx="16" cy="12" r="3" />
            </svg>
          </span>
        )}
      </div>

      <p className="mt-9">Language</p>

      <div className="mt-2">
        <span
          onClick={() => setLangModal(true)}
          className={`flex relative items-center w-[80%] space-x-3 p-1 shadow-sm shadow-gray-400
          rounded-md cursor-pointer ${theme ? 'border border-[#FFFFFF]' : 'bg-gray-700'}`}
        >
          <GlobeIcon size={18} />
          <p className="whitespace-nowrap overflow-x-hidden">{selectedLang.english} {selectedLang.local}</p>
          <p className="absolute right-3">
            <ChevronDown size={14} />
          </p>
          {/* Backdrop to block interactions outside modal */}
        {langModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50  z-30"
              onClick={() => setLangModal(false)}
            ></div>

            {/* Modal Content */}
            <div
              ref={langRef}
              className={`z-40 absolute left-0 -top-60 h-120 overflow-y-scroll overflow-x-hidden 
              custom-scrollbar w-full ${theme.main} p-1 rounded-md shadow-lg`}
            >
              <div className="flex flex-col">
                {sortedLanguages.map((lang, index) => (
                  <div
                    key={index}
                    className= {`pt-2 pb-2 space-x-3 pl-3 relative flex items-center text-sm
                         hover:bg-gray-400 cursor-pointer  whitespace-nowrap rounded
                        `}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedLang(lang)
                      setLangModal(false)}}
                  >
                    {/* Green bar indicator */}
                    {selectedLang.english === lang.english && (
                      <div className="absolute left-0 h-4 w-1 bg-green-600 rounded-md"></div>
                    )}
                    {lang.english} {lang.local}
                  </div>
                ))}
              </div>

            </div>
          </>
        )}
        </span>


      </div>

      <div className="flex flex-col mt-6 ">
        <p className="">Typing</p>
        <p className="text-xs">Changed typing settings for autocorrect and misspelled highlight from <Link to="/" className="text-green-600 underline">Windows Settings.</Link></p>

        <div className="mt-4">
          <p className="text-sm">Replace text with emoji</p>
          <p className="text-xs flex items-center justify-between">
            <span className="w-[65%]">Emoji will replace specific text as you type</span>
            {replaceText === ":-D" ? (
          <span className="flex space-x-2 items-center" onClick={() => setReplaceText("😁")}>
            <span>{replaceText}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="37"
              height="37"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-toggle-left"
            >
              <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
              <circle cx="8" cy="12" r="3" />
            </svg>
          </span>
        ) : (
          <span className="flex space-x-2 items-center" onClick={() => setReplaceText(":-D")}>
            <span>{replaceText}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="37"
              height="37"
              viewBox="0 0 24 24"
              fill="green"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-toggle-right"
            >
              <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
              <circle cx="16" cy="12" r="3" />
            </svg>
          </span>
        )}
          </p>
          <p className="text-xs text-green-600 underline mt-1">See list of text</p>
        </div>
      </div>
      
      <div className="border-b-1 mt-6 border-[#f8ecec25]"></div>
      
      <div className="text-xs w-[90%] mt-6 pb-10">
        To <span className="font-semibold">log out</span> of WhatsApp on this computer go
        your <span className="text-green-600 underline">Profile.</span>
      </div>

    </div>
  );
};

export default General;
