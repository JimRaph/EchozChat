import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/context'
import { Pencil, Smile } from 'lucide-react'
import EmojiPicker from "emoji-picker-react"
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { base_url } from '../../utils/baseUrl'

const Profile = () => {

    const { user, token, setUser } = useAppContext() 
    const {theme} = useTheme()
    const { logout } = useAppContext()


    const [isEditableName, setIsEditableName] = useState(false);
    const [isEditableAbout, setIsEditableAbout] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showEmojiPicker1, setShowEmojiPicker1] = useState(false);
    const [name, setName] = useState("");
    const [about, setAbout] = useState("")
    const [pfp, setPfp] = useState(user?.avatar);
    const [error, setError] = useState(null);

    const nameInputRef = useRef(null);
    const pencilRef = useRef(null);
    const containerRef = useRef(null);
    const emojiTriggerRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const emojiTriggerDiv = useRef(null)

    const aboutInputRef = useRef(null);
    const pencilRef1 = useRef(null);
    const containerRef1 = useRef(null);
    const emojiTriggerRef1 = useRef(null);
    const emojiPickerRef1 = useRef(null);
    const avatarImg = useRef()

// -------------------------------
// NAME EMOJI 
// -------------------------
    const emojiHandler = (emojidata) => {
      setName(prev => prev + emojidata.emoji)
    }

// -------------------------------
// ABOUT EMOJI 
// -------------------------
    const emojiHandler1 = (emojidata) => {
      setAbout(prev => prev + emojidata.emoji)
    }

    //   -------------------------------------------
//   HANDLES NAME SECTION
//   --------------------------------------------
const handleClickOutside = (event) => {
  const isOutsideContainer = isEditableName && 
    containerRef.current && 
    !containerRef.current.contains(event.target);
  
  const isOutsideEmojiElements = 
    (!emojiTriggerRef.current || !emojiTriggerRef.current.contains(event.target)) &&
    (!emojiPickerRef.current || !emojiPickerRef.current.contains(event.target)) &&
    (!emojiTriggerDiv.current || !emojiTriggerDiv.current.contains(event.target));

  if (isOutsideContainer && isOutsideEmojiElements) {
    setIsEditableName(false);
    setShowEmojiPicker(false);
    if (name !== user.username) {
      updateProfile({ name });
    }
  }
};

//   -------------------------------------------
//   HANDLES ABOUT SECTION
//   --------------------------------------------
const handleClickOutside1 = (event) => {
  const isOutsideContainer = isEditableAbout && 
    containerRef1.current && 
    !containerRef1.current.contains(event.target);
  
  const isOutsideEmojiElements = 
    (!emojiTriggerRef1.current || !emojiTriggerRef1.current.contains(event.target)) &&
    (!emojiPickerRef1.current || !emojiPickerRef1.current.contains(event.target)) &&
    (!emojiTriggerDiv.current || !emojiTriggerDiv.current.contains(event.target));

  if (isOutsideContainer && isOutsideEmojiElements) {
    setIsEditableAbout(false);
    setShowEmojiPicker1(false);
    if (about !== user.status) {
      updateProfile({ status: about });
    }
  }
};

const trigger =() =>{
    avatarImg.current.click()
}

const handleFileChange = async(e) => {
    try {
        const avatar = e.target.files[0]
        if(avatar){

            const {data} = await updateProfile({avatar})
            if(data.success){
                setPfp(data.user.avatar)
            }else{
              toast.error(data?.message || 'Something went wrong')
            }
        }
    } catch (error) {
        // console.log(error)
        toast.error(error?.response?.data?.message || 'Something went wrong, try again');
    }
}

    //update use profile
  const updateProfile = async ({ name = null, status = null, avatar = null }) => {
  try {

    setError(null);

    const formData = new FormData();

    if (name) formData.append('name', name);
    if (status) formData.append('status', status);
    if (avatar) formData.append('avatar', avatar);

    if (!formData.has('name') && !formData.has('status') && !formData.has('avatar')) {
      console.log("Nothing to update");
      return;
    }

    const { data } = await axios.put(
      `${base_url}/users/profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (data.success && data.user) {
      setUser(data.user);
      setError(null) 
    } else {
    //   console.warn("Profile update failed:", data.message || data);
      setError(data.message || 'Failed to update profile')
    }
  } catch (error) {
    console.error("ERROR in updateProfile:", error?.response?.data || error.message);
    setError(error?.response?.data?.message || error.message || 'Unexpected error occurred')
  }
};


const handleNameBlur = async (e) => {
  const relatedTarget = e.relatedTarget;
  const isClickingEmoji = 
    relatedTarget === emojiTriggerRef.current || 
    emojiPickerRef.current?.contains(relatedTarget) ||
    emojiTriggerDiv.current?.contains(relatedTarget);

  if (!isClickingEmoji) {
    setIsEditableName(false);
    setShowEmojiPicker(false);
    if (name !== user.username) {
      try {
        await updateProfile({ name });
      } catch (error) {
        console.error('Failed to update name:', error);
      }
    }
  }
};

const handleAboutBlur = async (e) => {
  const relatedTarget = e.relatedTarget;
  const isClickingEmoji = 
    relatedTarget === emojiTriggerRef1.current || 
    emojiPickerRef1.current?.contains(relatedTarget) ||
    emojiTriggerDiv.current?.contains(relatedTarget);

  if (!isClickingEmoji) {
    setIsEditableAbout(false);
    setShowEmojiPicker1(false);
    if (about !== user.status) {
      try {
        await updateProfile({ status: about });
      } catch (error) {
        console.error('Failed to update about:', error);
      }
    }
  }
};


// --------------------------------------------
// HANDLES CLOSING MODALS
// ---------------------------------------
   useEffect(() => {
        if (isEditableName) {
            nameInputRef.current?.focus();
            document.addEventListener('mousedown', handleClickOutside, true);
        }
        if (isEditableAbout) {
            aboutInputRef.current?.focus();
            document.addEventListener('mousedown', handleClickOutside1, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('mousedown', handleClickOutside1, true);
        };
}, [isEditableName, isEditableAbout]);

// maintain states
    useEffect(() => {
    if (user) {
        setName(user.username || "");
        setAbout(user.status || "");
        setPfp(user.avatar || "");
    }
    }, [user]);

// clears error messages
    useEffect(() => {
    if (error) {
        const timer = setTimeout(() => {
        setError('');
        }, 3000); 

        return () => clearTimeout(timer); 
    }
    }, [error]);


    return (
        <div>

                {/* Avatar Section  */}
            <div onClick={trigger}>
                <img 
                    src={pfp || user?.avatar} 
                    alt="User Avatar" 
                    className="rounded-full h-30 w-30 bg-[#13344e]" 
                />
            </div>

            {/* Name Section */}
            <div className='relative p-1 mb-4'>
                <div 
                    ref={containerRef}
                    className="flex mt-8 space-x-4 items-center justify-between"
                >
                    <input 
                        ref={nameInputRef}
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleNameBlur}
                        value={name}
                        maxLength={25}
                        placeholder='your name'
                        className={`
                            flex-1 
                            bg-transparent 
                              ${theme.type==="Dark" ? theme.textPrimary: theme.textPrimary} 
                            ${theme.type==="Dark"? 'placeholder-gray-200':'placeholder-black'}
                            ${isEditableName 
                                ? 'outline-1 outline-green-600' 
                                : 'outline-none'
                            }
                        `}
                        disabled={!isEditableName}
                    />
                    {!isEditableName && (
                        <div ref={pencilRef}>
                            <Pencil 
                                size={15} 
                                className="cursor-pointer text-gray-400 hover:text-white"
                                onClick={() =>{
                                  setIsEditableName(true)
                                //   setShowSmiles(true)
                                } }
                            />
                        </div>
                    )}
                </div>
                
                {isEditableName && (
                  <div ref = {emojiTriggerDiv}
                  className='flex mt-1 items-center justify-end space-x-1'>
                  <div 
                      ref={emojiTriggerRef}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                      className=""
                  >
                      <Smile size={18} className="text-gray-400 hover:text-white" />
                  </div>
                  <button className='bg-green-600 rounded-lg pl-2 pr-2'>
                      {name.length}/25
                  </button>
                </div>
                )}

                {showEmojiPicker && (
                    <div 
                    ref={emojiPickerRef}
                    className=" fixed left-10 top-130 z-50">
                        <EmojiPicker
                        
                            onEmojiClick={emojiHandler}
                            disableAutoFocus
                            height={400}
                            width={400}
                            className="absolute mt-2"
                        />
                    </div>
                )}
            </div>

            {/* About Section */}
            <div className='relative p-1'>
              <p className={`${theme.textSecondary}`}>About</p>
                <div 
                    ref={containerRef1}
                    className="flex space-x-4  items-center justify-between"
                >
                    <input 
                        ref={aboutInputRef}
                        type="text"
                        onChange={(e) => setAbout(e.target.value)}
                        onBlur={handleAboutBlur}
                        value={about}
                        maxLength={139}
                        placeholder='Tell us about you'
                        className={`
                            flex-1 
                            bg-transparent 
                            ${theme.type==="Dark"?theme.textPrimary:theme.textPrimary} 
                            ${theme.type==="Dark"?'placeholder-gray-200':'placeholder-black'}
                            ${isEditableAbout 
                                ? ' outline-1 outline-green-600' 
                                : 'outline-none'
                            }
                        `}
                        disabled={!isEditableAbout}
                    />
                    {!isEditableAbout && (
                        <div ref={pencilRef1}>
                            <Pencil 
                                size={15} 
                                className="cursor-pointer text-gray-400 hover:text-white"
                                onClick={() =>{
                                  setIsEditableAbout(true)
                                //   setShowSmiles1(true)
                                } }
                            />
                        </div>
                    )}
                </div>
                
                {isEditableAbout && (
                  <div ref = {emojiTriggerDiv} 
                  className='flex mt-1 items-center justify-end space-x-1'>
                  <div 
                      ref={emojiTriggerRef1}
                      onClick={() => setShowEmojiPicker1(!showEmojiPicker1)} 
                      className=""
                  >
                      <Smile size={18} className="text-gray-400 hover:text-white" />
                  </div>
                  <button className='bg-green-600 rounded-lg pl-2 pr-2'>
                      {about.length}/139
                  </button>
                </div>
                )}

                {showEmojiPicker1 && (
                    <div 
                    ref={emojiPickerRef1}
                    className=" fixed left-10 top-130 z-50">
                        <EmojiPicker
                        
                            onEmojiClick={emojiHandler1}
                            disableAutoFocus
                            height={400}
                            width={400}
                            className="absolute mt-2"
                        />
                    </div>
                )}
            </div>

                {/* Phone Section */}
            <div className='mt-4 flex flex-col pb-8 border-b-1 border-gray-600'>
              <p className={`${theme.textSecondary} text-[#8d8d8d]`}>Phone number</p>
              <p>+234 falfoa f eoa </p>
            </div>

                {/* Logout Section  */}
            <div className='flex flex-col mt-6 space-y-2'>
              <button onClick={logout}
              className={`${theme.type==='Dark'?'text-red-400': theme.textPrimary} rounded-md ${theme.secondary} w-fit
               p-1 pl-6 pr-6 border ${theme.border}`}>Log out</button>
              <p className={`${theme.textPrimary} text-xs`}>Chat history on this computer will be cleared when you<br /> log out.</p>
            </div>

            {error && (
                <p className="text-red-600 mt-2">
                {error}
                </p>
            )}
            <input type="file" multiple hidden ref={avatarImg} onChange={handleFileChange} />

        </div>
    )
}

export default Profile