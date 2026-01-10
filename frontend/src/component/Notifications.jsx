
import { ChevronDown, Music4, Play } from 'lucide-react'
import  { useEffect, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const Notifications = () => {
  const [message, setMessage] = useState('Off')
  const [calls, setCalls] = useState('Off')
  const [reactions, setReactions] = useState('Off')
  const [status, setStatus] = useState('Off')

  const [text, setText] = useState('Off')
  const [media, setMedia] = useState('Off')

  const [banner, setBanner] = useState('Always')
  const [badge, setBadge] = useState('Always')
  const [modalBanner, setModalBanner] = useState(false)
  const [modalBadge, setModalBadge] = useState(false)
  const modalRef = useRef()
  const {theme} = useTheme()

  const modalOptions = ['Always', 'Never', 'Only when app is open']

  const bannerModalHandler = () => {
    return(
      <div ref ={modalRef} className={`z-50 w-[80%] absolute top-6 rounded-md flex flex-col 
      p-1 border-1 border-[#2c3c44] ${theme.main} shawdow-lg`}>
        <div className=''>
          {modalOptions.map((option, index) => (
            <div key={index} onClick={(e)=>{
              e.stopPropagation()
              setBanner(option)              
              setModalBanner(false)
            }} className={` relative pl-3 w-full  h-10 flex items-center rounded-md text-sm 
             text-left ${banner === option ? 'bg-[#2c3c44] text-gray-50 hover:bg-[#2c3c44]' : 'hover:bg-gray-200'}`}>
              {banner === option && (
                <p className='absolute left-0 h-5 w-1 bg-green-600 rounded-md'></p>
              )}
              <p >{option}</p>
            </div>
          ))}
         </div>
      </div>
    )
  }

  const badgeModalHandler = () => {
    return(
      <div ref ={modalRef} className={`z-50 w-[80%] absolute top-6 rounded-md flex flex-col 
      p-1 border-1 border-[#2c3c44] ${theme.main} shawdow-lg`}>
        <div className=''>
          {modalOptions.map((option, index) => (
            <div key={index} onClick={(e)=>{
              e.stopPropagation()
              setBadge(option)              
              setModalBadge(false)
            }} className={` relative pl-3 w-full  h-10 flex items-center rounded-md text-sm  
              text-left ${badge === option ? 'bg-[#2c3c44] text-gray-50' : 'hover:bg-gray-200'}`}>
              {badge === option && (
                <p className='absolute left-0 h-5 w-1 bg-green-600 rounded-md'></p>
              )}
              <p >{option}</p>
            </div>
          ))}
         </div>
      </div>
    )
  }

  const closeModalHandler = (event) => {
    if(modalRef.current && !modalRef.current.contains(event.target)){
      setModalBanner(false)
      setModalBadge(false)
    }
  }

  useEffect(()=>{
    document.addEventListener('mousedown', closeModalHandler)
    return ()=>{
      document.removeEventListener('mousedown', closeModalHandler)
    }
  }, [modalBanner])

  return (
    <div className='mr-4'>
      <h2 className="text-xl font-semibold">Notifications</h2>

      {/* BANNERS */}
      <div className='flex justify-between space-x-2 mt-4'>
        <div className='border-green-600 border-1 h-20 w-full rounded-md '></div>
        <div className='border-green-600 border-1 h-20 w-full rounded-md '></div>
      </div>

    {/* SHOW BANNER NOTIFICATION */}
      <div className=' relative mt-4 text-sm w-[70%]'>
        <p>Show banner notifications</p>
        <div onClick={()=>setModalBanner(true)}
        className= { `flex items-center ${banner==="Only when app is open" ? "space-x-4": 
        "space-x-22"} ${theme.main} border-1 ${theme.border} w-fit p-1 pl-3 mt-3 rounded-md`}>
          <p>{banner}</p>
          <ChevronDown size={15} />
          
        </div>
        {modalBanner && bannerModalHandler()}
      </div>

      {/* SHOW BADGE NOTIFICATION */}
      <div className=' relative mt-4 text-sm w-[70%]'>
        <p>Show taskbar notification badge</p>
        <div onClick={()=>setModalBadge(true)}
        className={ `flex items-center ${badge==="Only when app is open" ? "space-x-4":
         "space-x-22"}  ${theme.main} border-1 ${theme.border} w-fit p-1 pl-3 mt-3 rounded-md`}>
          <p>{badge}</p>
          <ChevronDown size={15} />
          
        </div>
        {modalBadge && badgeModalHandler()}
      </div>

      {/* SHOW  NOTIFICATION */}
      <div className="flex flex-col mt-6 border-[#424141da] border-t-1">
      
          <div className="mt-4">
            
            <div className="text-xs flex items-center justify-between">
            <p className={`${theme.textSecondary}`}>Messages</p>
              {message === "Off" ? (
            <span className="flex space-x-2 items-center" onClick={() => setMessage("On")}>
              <span>{message}</span>
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
            <span className="flex space-x-2 items-center" onClick={() => setMessage("Off")}>
              <span>{message}</span>
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
          </div>

          <div className="mt-4">
            <div className="text-xs flex items-center justify-between">
            <p className={`${theme.textSecondary}`}>Calls</p>            
            {calls === "Off" ? (
            <span className="flex space-x-2 items-center" onClick={() => setCalls("On")}>
              <span>{calls}</span>
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
            <span className="flex space-x-2 items-center" onClick={() => setCalls("Off")}>
              <span>{calls}</span>
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
          </div>

          <div className="mt-4">
          <p className={`${theme.textSecondary}`}>Reactions</p>
            <p className="text-xs flex items-center justify-between">
              <span className="w-[70%]">Show notifications for reactions to <br /> messages you send</span>
              {reactions === "Off" ? (
            <span className="flex space-x-2 items-center" onClick={() => setReactions("On")}>
              <span>{reactions}</span>
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
            <span className="flex space-x-2 items-center" onClick={() => setReactions("Off")}>
              <span>{reactions}</span>
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
          </div>

          <div className="mt-4">
            <p className={`${theme.textSecondary}`}>Status reactions</p>
            <p className={`text-xs flex items-center justify-between `}>
              <span className="w-[75%]">Show notifications when you get likes<br /> on a status</span>
              {status === "Off" ? (
                <span
                  className={`flex space-x-2 items-center ${
                    text === 'Off' ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  onClick={() => text === 'On' && setStatus('On')}
                >
                  <span>{status}</span>
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
                    className={`lucide lucide-toggle-left`}
                  >
                  <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
                  <circle cx="8" cy="12" r="3" />
              </svg>
                </span>
              ) : (
                <span className={`flex space-x-2 items-center ${
                    text === 'Off' ? 'opacity-50 pointer-events-none' : ''
                  }`}
                onClick={() => text === "On" && setStatus("Off")}>
                  <span>{status}</span>
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
          </div>


      </div>


          {/* PREVIEW NOTIFS */}
      <div className="flex flex-col mt-6 border-[#424141da] border-t-1">
      

        <div className="mt-4">
        <p className={`${theme.textSecondary}`}>Text preview</p>
          <p className="text-xs flex items-center justify-between">
            <span className="w-[75%]">Show message preview text inside new <br /> message notifications</span>
            {text === "Off" ? (
          <span className="flex space-x-2 items-center" onClick={() => setText("On")}>
            <span>{text}</span>
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
          <span className="flex space-x-2 items-center" onClick={() => setText("Off")}>
            <span>{text}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="37"
              height="37"
              viewBox="0 0 24 24"
              fill= "green"
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
        </div>

       <div className="mt-4">
        <p className={`${theme.textSecondary}`}>Media preview</p>
        <p className={`text-xs flex items-center justify-between`}>
          <span className="w-[80%]">Show media preview images inside new<br />message notifications</span>
          {media === "Off" ? (
            <span className={`flex space-x-2 items-center ${
                    text === 'Off' ? 'opacity-50 pointer-events-none' : ''
                  }`}
            onClick={() => text === "On" && setMedia("On")}>
              <span>{media}</span>
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
              <circle cx="8" cy="12" r="2" />
            </svg>
            </span>
          ) : (
            <span className={`flex space-x-2 items-center ${
                    text === 'Off' ? 'opacity-50 pointer-events-none' : ''
                  }`}
            onClick={() => text === "On" && setMedia("Off")}>
              <span>{media}</span>
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
      </div>


      </div>


      <div className=" space-y-2 border-[#424141da] border-t-1  mt-6 pt-4 pb-2">
          <p>Notification tones</p>
          <>
            <p className='text-sm'>Messsges</p>
            <div className='flex items-center space-x-2'>
              <p className={`${theme.main}  shadow-sm border-1 ${theme.border} p-2`}><Play size={17} /></p>
              <p className={`flex items-center space-x-3 ${theme.main} border-1
               ${theme.border} p-2`}> 
               <Music4 size={17}/>
               <span className='text-sm'>Default</span> <ChevronDown size={15}/>
               </p>
            </div>
          </>
          <>
            <p className='text-sm'>Groups</p>
            <div className='flex items-center space-x-2'>
              <p className={`${theme.main}  shadow-sm border-1 ${theme.border} p-2`}><Play size={17} /></p>
              <p className={`flex items-center space-x-3 ${theme.main} border-1 
               ${theme.border} p-2`}> 
               <Music4 size={17}/><span className='text-sm'>Default</span> 
               <ChevronDown size={15}/>
              </p>
            </div>
          </>
      </div>

    </div>
  )
}

export default Notifications
