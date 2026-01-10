import { Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const Account = () => {

  const [toggle, setToggle] = useState("off")
  const {theme} = useTheme()

  return (
    <div className={`${theme.textPrimary}`}>
      <h2 className="text-xl font-semibold">Account</h2>
      <>
        <div className="mb-4 mt-4">
          <p>Privacy</p>
          <p className='text-xs italic'>Managed on your phone</p>
        </div>

        <div className="mb-4 text-xs space-y-1">
          <p className=''>Last seen and online</p>
          <p>Nobody</p>
          <p className=''>If you don&apos;t share your Last Seen, you won&apos;t be able to 
            see other people&apos;s Last Seen.
          </p>
        </div>

        <div className="mb-3 text-xs space-y-1">
          <p className={`${theme.textSecondary}`}>Profile photo</p>
          <p>Everyone</p>
        </div>

        <div className="mb-3 text-xs space-y-1">
          <p className={`${theme.textSecondary}`}>About</p>
          <p>My contacts</p>
        </div>

        <div className="mb-3 text-xs space-y-1">
          <p className={`${theme.textSecondary}`}>Add to groups</p>
          <p>My contacts</p>
        </div>

        <div className="mb-3 text-xs space-y-1">
          <p className={`${theme.textSecondary}`}>Read receipts</p>
          <p>On</p>
          <p className={`${theme.textSecondary}`}>Read receipts are always sent for group chats</p> 
        </div>
      </>

      <div className=" space-y-2 border-[#424141da] border-t-1  mt-6 pt-3 pb-2">
          <p>Blocked contacts</p>
          <p className='text-xs italic'>Managed on your phone</p>
          <p className='flex items-center space-x-2'>
            <Smartphone size={17} />
            <span>11 blocked contacts</span>
          </p>
      </div>

      <div className="space-y-2 border-[#424141da] border-t-1 mt-3 pt-3 pb-2">
          <p>Security</p>
          <p className= {`text-sm ${theme.textSecondary} pr-2`}>Messages and calls in end-to-end encrypted
            chats stay betwen you and the people you choose. Not even WhatsApp can read or listen 
            to them. <span className='text-green-600 underline'>Learn more</span>
          </p>

          <p className={`text-sm ${theme.textSecondary} pr-2`}>
            Show security notifications on this computer
          </p>

          <p className={`text-sm ${theme.textSecondary} pr-2`}>
            {toggle === "off" ? (
          <span className="flex space-x-2 items-center" onClick={() => setToggle("on")}>
            
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="44"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-toggle-left"
            >
              <rect width="25" height="12" x="2" y="6" rx="6" ry="6" />
              <circle cx="8" cy="12" r="2" />
            </svg>

            <span>{toggle}</span>
          </span>
        ) : (
          <span className="flex space-x-2 items-center" onClick={() => setToggle("off")}>
            
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="44"
              height="34"
              viewBox="0 0 24 24"
              fill="green"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-toggle-right"
            >
              <rect width="25" height="12" x="2" y="6" rx="6" ry="6" />
              <circle cx="16" cy="12" r="2" />
            </svg>
            <span>{toggle}</span>
          </span>
        )}
          </p>

          <p className={`text-sm ${theme.textSecondary} pr-2`}>
            Get notified when your security code changes for a
            contact&apos;s phone. If you have multiple devices, this
            setting must be enabled on each device where you
            want to get notifications. <span className='text-green-600 underling'>Learn more</span>
          </p>
      </div>

      <div className=" space-y-2 border-[#424141da] border-t-1  mt-6 pt-3 pb-3">
          <p className='text-sm pt-1 pb-1 text-green-600'>How to delete my account</p>
      </div>

    </div>
  )
}

export default Account
