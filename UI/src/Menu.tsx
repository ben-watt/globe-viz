
import React, { useState } from 'react';
import type { ColourState, DevSettings, Settings } from './Settings';
  
  type MenuProps = {
    settings: Settings
    setColour: (curr: ColourState) => ColourState
  }

  const Menu = ({ settings, setColour } : MenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="absolute">
        { !isOpen 
          ? <MenuIcon isOpen={isOpen} setIsOpen={setIsOpen} /> 
          : <SettingsMenu settings={settings} setColour={setColour} setIsOpen={setIsOpen} />}
      </div>
    )
  }

  type MenuIconProps = {
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  }

  const MenuIcon = ({ isOpen, setIsOpen } : MenuIconProps) => {
    return (      
      <div onClick={ev => setIsOpen(!isOpen)} className="w-8 m-5 cursor-pointer transform hover:rotate-45 duration-200 text-white">
        <SettingsIcon />
      </div>
    )
  }

  type SettingsMenuProps = {
    settings:  Settings,
    setColour: (curr: ColourState) => ColourState,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  }

  const SettingsMenu = ({ settings, setColour, setIsOpen }: SettingsMenuProps) => {

    const colourJson = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings.colour, null, 2));
    const colour = settings.colour;
    function createEventHandler(propName: string) {
      // @ts-ignore
      return (ev: React.ChangeEvent<HTMLInputElement>) => setColour(curr => ({ ...curr, [propName]: ev.target.value }))
    }

    return (
      <div className="bg-white flex-col w-52 px-5 py-5 rounded">
        <CrossIcon className="cursor-pointer w-8" onClick={() => setIsOpen(false)}/>
        <div className="py-5">
          <fieldset className="flex justify-between cursor-pointer">
            <label htmlFor="background">Background</label>
            <input id="background"
              name="background"
              type="color"
              value={colour.background}
              onChange={createEventHandler("background")} />
          </fieldset>
          <fieldset className="flex justify-between">
            <label htmlFor="globe-sea">Globe Sea</label>
            <input id="globe-sea"
              name="globe-sea"
              type="color"
              value={colour.globeSea}
              onChange={createEventHandler("globeSea")} />
          </fieldset>
          <fieldset className="flex justify-between">
            <label htmlFor="globe-land">Globe Land</label>
            <input id="globe-land" 
              name="globe-land" 
              type="color" 
              value={colour.globeSea}
              onChange={createEventHandler("globeLand")} />
          </fieldset>
          <fieldset className="flex justify-between">
            <label htmlFor="arch-from">Arch From</label>
            <input id="arch-from" 
              name="arch-from" 
              type="color" 
              value={colour.archFrom}
              onChange={createEventHandler("archFrom")} />
          </fieldset>
          <fieldset className="flex justify-between">
            <label htmlFor="arch-to">Arch To</label>
            <input id="arch-to" 
              name="arch-to" 
              type="color" 
              value={colour.archTo}
              onChange={createEventHandler("archTo")} />
          </fieldset>
        </div>
        <div className="pt-5 flex justify-between">
          <a href={"data:" + colourJson} download="shipment_viz_colour.json">
            <button onClick={() => console.log(JSON.stringify(colour, null, 2))} className="bg-black text-white px-2 py-1 hover:bg-gray-700">Download</button>
          </a>
          <button className="bg-black text-white px-2 py-1 hover:bg-gray-700">Upload</button>
        </div>
      </div>
    )
  }

  const SettingsIcon = () => 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>


  type CrossIconProps = {
    className: string,
    onClick: React.MouseEventHandler
  }

  const CrossIcon = ({ className, onClick } : CrossIconProps) => {
    return (
      <svg className={className} onClick={onClick} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  export default Menu;