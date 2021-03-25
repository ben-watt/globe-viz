  import React, { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';
  import { _GlobeView as GlobeView } from '@deck.gl/core'
  import DeckGL from '@deck.gl/react';
  import { GeoJsonLayer, SolidPolygonLayer } from '@deck.gl/layers';
  import { AnimatedArcLayer } from './AnimatedArcLayer';
  import { AmbientLight, LightingEffect } from 'deck.gl';
  import hexRgb from 'hex-rgb';
  import { useLocalStorage } from './hooks';
  import GL from '@luma.gl/constants';

  import "./App.css";

  const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 2
  });

  const lightingEffect = new LightingEffect({ ambientLight })


  function hexToArray(hex: string) {
    let rgb = hexRgb(hex)
    return [rgb.red, rgb.green, rgb.blue]
  }

  interface AppProps { }
  interface ColourState {
    background: string,
    globeLand: string,
    globeSea: string,
    archFrom: string,
    archTo: string,
  }

  const App = ({ }: AppProps) => {

    const [colour, setColour] = useLocalStorage<ColourState>('colour', {
      background: "#000000",
      globeLand: "#000000",
      globeSea: "#000000",
      archFrom: "#000000",
      archTo: "#000000"
    });

    // Viewport settings
    const INITIAL_VIEW_STATE = {
      longitude: -2.244644,
      latitude: 53.483959,
      zoom: 1,
      pitch: 0,
      bearing: 10,
    };

    const views = [
      new GlobeView({
        id: 'globe',
        controller: true
      })
    ]

    interface Loc {
      name: string
      coordinates: Array<number>
    }

    interface ArchData {
      date: number,
      from: Loc,
      to: Loc
    }

    const archData: Array<ArchData> = [
      {
        date: Date.now(),
        from: {
          name: 'Manchester',
          coordinates: [-2.244644, 53.483959]
        },
        to: {
          name: 'California',
          coordinates: [-122.271604, 37.803664]
        }
      },
      {
        date: Date.now() + 1000,
        from: {
          name: 'Manchester',
          coordinates: [-2.244644, 53.483959]
        },
        to: {
          name: 'California',
          coordinates: [-2.144644, 55.803664]
        }
      },
      {
        date: Date.now() + 2000,
        from: {
          name: 'Manchester',
          coordinates: [-2.244644, 53.483959]
        },
        to: {
          name: 'California',
          coordinates: [-100.271604, 107.803664]
        }
      },
      {
        date: Date.now() + 3000,
        from: {
          name: 'Manchester',
          coordinates: [-2.244644, 53.483959]
        },
        to: {
          name: 'California',
          coordinates: [-5.244644, 20.03664]
        }
      },
      {
        date: Date.now() + 2500,
        from: {
          name: 'Manchester',
          coordinates: [-2.244644, 53.483959]
        },
        to: {
          name: 'Copenhagen',
          coordinates: [15.271604, 56.803664]
        }
      }
    ]

    const layers = [
      new SolidPolygonLayer({
        id: 'background',
        data: [
          [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
        ],
        getPolygon: d => d as any,
        stroked: false,
        filled: true,
        opacity: 1,
        getFillColor: () => hexToArray(colour.globeSea),
      }),
      new GeoJsonLayer({
        id: 'earth-land',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
        stroked: false,
        filled: true,
        opacity: 1,
        getFillColor: () => hexToArray(colour.globeLand),
        updateTriggers: {
          getFillColor: [colour.globeLand]
        },
        material: {}
      }),
      new AnimatedArcLayer({
        id: 'arc-layer',
        animationSpeed: 10.0,
        tailLength: 1,
        data: archData,
        pickable: true,
        getWidth: 2,
        widthScale: 1,
        autoHighlight: true,
        getHeight: 0.5,
        greatCircle: true,
        color: colour.archFrom,
        // onClick: (ev) => console.log(ev),
        // onHover: (ev) => console.log(ev),
        getSourcePosition: d => (d as any).from.coordinates,
        getTargetPosition: d => (d as any).to.coordinates,
        getSourceColor: () => hexToArray(colour.archFrom),
        getTargetColor: () => hexToArray(colour.archTo),
        getDate: d =>  { 
          return Math.floor((d.date - 1615746276338) / 1000);
        },
        pickable: true,
        updateTriggers: {
          getSourceColor: [colour.archFrom],
          getTargetColor: [colour.archTo]
        },
        parameters: {
          // prevent flicker from z-fighting
          [GL.DEPTH_TEST]: true,

          // turn on additive blending to make them look more glowy
          [GL.BLEND]: true,
          [GL.BLEND_SRC_RGB]: GL.ONE,
          [GL.BLEND_DST_RGB]: GL.ONE,
          [GL.BLEND_EQUATION]: GL.FUNC_ADD,
        }
      }),
    ];

    return (
      <div>
        <DeckGL
          getTooltip={({object}) => object && { html: `<div>${object.from.name} to ${object.to.name}</div>`}}
          style={{ backgroundColor: colour.background }}
          views={views}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          effects={[lightingEffect]}
          layers={layers} />
        <Menu colour={colour} setColour={setColour}/>
      </div>
    )
  }

  const Menu = ({ colour, setColour}) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="absolute">
        { !isOpen 
          ? <MenuIcon isOpen={isOpen} setIsOpen={setIsOpen} /> 
          : <SettingsMenu colour={colour} setColour={setColour} setIsOpen={setIsOpen} />}
      </div>
    )
  }

  const MenuIcon = ({ isOpen, setIsOpen }) => {
    return (      
      <div onClick={ev => setIsOpen(!isOpen)} className="w-8 m-5 cursor-pointer transform hover:rotate-45 duration-200 text-white">
        <SettingsIcon />
      </div>
    )
  }

  const SettingsMenu = ({ colour, setColour, setIsOpen }) => {

    const colourJson = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(colour, null, 2));
    function createEventHandler(propName: string) {
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

  const CrossIcon = ({ className, onClick }) => {
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


  export default App;
