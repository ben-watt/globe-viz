import React from 'react'

export type StateContext<T> = [ T , (value: T | ((val: T) => T)) => void]

function stateFuncGenerator<T>() {
    return (value: T | ((val: T) => T)) => {}
}

//-------------------------------------------

export type GlobeColourState = {
    background: string,
    globeLand: string,
    globeSea: string,
    archFrom: string,
    archTo: string,
}

export const DefaultGlobeColourContext : StateContext<GlobeColourState> = [{
    "background": "#000000",
    "globeLand": "#0d0d0d",
    "globeSea": "#333333",
    "archFrom": "#ff00ea",
    "archTo": "#ffffff",
}, stateFuncGenerator<GlobeColourState>() ]

export const GlobeColourContext = React.createContext<StateContext<GlobeColourState>>(DefaultGlobeColourContext)

//--------------------------------------------

export type DevSettingsState = {
    useDemoData: boolean,
}

export const DefaultDevSettingsContext : StateContext<DevSettingsState> = [{
    useDemoData: true,
}, stateFuncGenerator<DevSettingsState>() ]

export const DevSettingsContext = React.createContext<StateContext<DevSettingsState>>(DefaultDevSettingsContext)

//------------------------------------------