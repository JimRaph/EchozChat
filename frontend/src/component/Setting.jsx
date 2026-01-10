import  { useState } from 'react'
import Settingsidebar from './Settingsidebar'
import Settingmain from './Settingmain'
import { useTheme } from '../context/ThemeContext'


const Setting = ({settingClicked}) => {

  const {theme} = useTheme()
  // console.log(theme)
  const [activeSTab, setActiveSTab] = useState(settingClicked)

  return (
    <div className= {`absolute flex bottom-2 left-3  min-w-140 max-w-140 
    z-10 rounded-md h-[58%] cursor-default border-2 ${theme.border} shadow-2xl`}>
        <Settingsidebar setActiveSTab={setActiveSTab} activeSTab={activeSTab}/>
        <Settingmain activeSTab={activeSTab} />
    </div>
  )
  
}

export default Setting
