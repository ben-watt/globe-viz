import React, { useState } from 'react'

type ToggleProps = {
    initialState?: boolean,
    stateChanged?: (state: boolean) => void
}

const Toggle = ({ initialState = false, stateChanged = (x) => { } }: ToggleProps) => {
    const [enabled, setEnabled] = useState(initialState);

    function onChange() {
        if (stateChanged) {
            stateChanged(!enabled);
        }

        setEnabled(!enabled);
    }

    return (
        <div className="flex flex-col">
            <label htmlFor="toggle" className="mt-3 inline-flex items-center cursor-pointer justify-between">
                <span>Fake Data</span>
                <span className="relative">
                    <div className={`w-10 h-5 rounded-full shadow-inner ${enabled ? "bg-white" : "bg-gray-400"}`}>
                        <div className={`relative w-5 h-5 rounded-full shadow transition-transform duration-300 ease-in-out ${enabled ? "bg-purple-600 transform translate-x-full" : "bg-white"}`}>
                            <input onChange={onChange} checked id="toggle" type="checkbox" className="absolute opacity-0 w-0 h-0" />
                        </div>
                    </div>
                </span>
            </label>
        </div>
    )
}

export { Toggle }