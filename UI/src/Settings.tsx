

interface ColourState {
    background: string,
    globeLand: string,
    globeSea: string,
    archFrom: string,
    archTo: string,
}

interface DevSettings {
    createFakeData: boolean
}

type Settings = {
    colour: ColourState,
    devSettings: DevSettings
}

export {
    ColourState,
    DevSettings,
    Settings
}