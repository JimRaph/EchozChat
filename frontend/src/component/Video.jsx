import { Camera, ChevronDown, Disc, Mic } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const Video = () => {

  const {theme} = useTheme()

  const [cameraToggle, setCameraToggle] = useState(false)
  const [micToggle, setMicToggle] = useState(false)
  const [speakerToggle, setSpeakerToggle] = useState(false)
  const [micRef, setMicRef] = useState('Default Device')
  const [speaker, setSpeaker] = useState('Default Device')



  return (

    <div className=''>
       <h2 className="text-xl font-semibold">Video & voice</h2>

          {/* Video Section  */}
       <div className='mt-5 pr-6'>
        <p>Video</p>
         
         {/* Video Toggler  */}
         {cameraToggle ? (
          <div className={`flex mt-3 items-center justify-between w-[70%] 
             p-2 rounded-lg ${theme.main} border ${theme.border}`}>
          <div onClick={()=>setCameraToggle(false)}
          className='relative flex items-center space-x-3'>
            <p className=' bg-green-600 w-1 h-5'></p>
            <p>HP HD Camera</p>
          </div>
          <ChevronDown size={16}/>
         </div>
         ) : (
          <div className={`flex mt-3 items-center justify-between w-[70%] 
          ${theme.main} p-2 rounded-lg border ${theme.border}`}>
          <div onClick={()=>setCameraToggle(true)}
          className=' flex space-x-3'>
            <Camera />
            <p>HP HD Camera</p>
          </div>
          <ChevronDown size={16}/>
         </div>
         )
         }

         {/* Video mock  */}
         <div className='mt-2 h-50 w-[90%] bg-amber-600'></div>

       </div>

          {/* Microphone Section  */}
       <div className='mt-5'>

        <p>Microphone</p>
        {micToggle ? (
           <div onClick={()=>setMicToggle(false)}
           className={`flex mt-3 items-center justify-between w-[70%] 
             p-2 rounded-lg ${theme.main} border-1 ${theme.border}`}>
           <div className='flex space-y-1 flex-col w-full'>
             <p onClick={(e) =>setMicRef(e.target.innerHTML)} 
             className= {`hover:${theme.contactHover} p-1 px-2`}>Default Device</p>
             <p onClick={(e) =>setMicRef(e.target.innerHTML)} 
             className= {`hover:${theme.contactHover} p-1 px-2 truncate overflow-x-hidden`}>Microphone Array (Intel@ Smart Sound Techn</p>
           </div>
          </div>
        ): (
          <div onClick={()=>setMicToggle(true)}
          className={`flex mt-3 items-center justify-between w-[70%] 
             p-2 rounded-lg ${theme.main} border ${theme.border}`}>
          <div className='flex space-x-3 flex-nowrap items-center overflow-x-hidden'>
          <Mic size={16} className='mr-3'/>
            <p className='w-[70%]  truncate overflow-hidden'>{micRef}</p>
          </div>
          <ChevronDown size={16} className='flex-shrink-0'/>
         </div>
        )}

        {/* Test Mic  */}
         <div className='mt-2 text-[#d9dcdd]'>
          <p className={`text-sm ${theme.textSecondary}`}>Test</p>
          <div className='flex items-center space-x-3 mt-1'>
            <p className={` ${theme.main} p-2 rounded-sm`}>
              <Disc size={16} className={` ${theme.textPrimary}`}/>
            </p>
            <p className={` ${theme.textPrimary}`}> Record from your mic</p>
          </div>
         </div>
       </div>

          {/* Speaker Section  */}
       <div className='mt-5'>

        <p>Speakers</p>
        {/* Speaker Toggler  */}
        {speakerToggle ? (
           <div onClick={()=>setSpeakerToggle(false)}
           className={`flex mt-3 items-center justify-between w-[70%] 
             p-2 rounded-lg ${theme.main} border ${theme.border}`}>
           <div className='flex flex-col w-full space-y-0'>
             <p onClick={(e) => setSpeaker(e.target.innerHTML)} 
             className={`hover:${theme.contactHover} p-2 rounded-md`}>Default Device</p>
             <p onClick={(e) => setSpeaker(e.target.innerHTML)} 
             className={`hover:${theme.contactHover} p-2 whitespace-nowrap overflow-x-hidden`}>Speakers (Realtek(R) Audio)</p>
           </div>
          </div>
        ): (
          <div onClick={()=>setSpeakerToggle(true)}
          className={`flex mt-3 items-center justify-between w-[70%] 
             p-2 rounded-lg ${theme.main} border ${theme.type==="Dark"?'border-[#111B21]':'border-[#dad8d8]'}`}>
          <div className='flex space-x-3 overflow-hidden items-center'>
            <Mic size={16}/>
            <p className='overflow-hidden truncate'>{speaker}</p>
          </div>
          <ChevronDown size={16} className='flex-shrink-0'/>
         </div>
        )}

        {/* Test Speaker  */}
         <div className='mt-2 text-[#d9dcdd]'>
          <p className={`text-sm ${theme.textSecondary}`}>Test</p>
          <div className={`flex mt-3 items-center justify-between w-[70%] 
             p-2 rounded-lg ${theme.main} border ${theme.type==="Dark"?'border-[#111B21]':'border-[#dad8d8]'}`}>
            <p className={`text-sm ${theme.textPrimary}`}> Play test sound</p>
          </div>
         </div>
       </div>

    </div>
  )
}

export default Video
