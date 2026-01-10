import {  MessageCircle } from 'lucide-react'
const Header = () => {


  return (
      <header className=" flex p-2 ml-3 items-center">
           <MessageCircle size={30} className={`text-[#00a884] `} />
          <h1 className="text-md font-semibold pl-2">WhatsApp</h1>
      </header>
  )
}

export default Header
