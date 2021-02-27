import React, { ChangeEvent, SyntheticEvent, useState } from 'react';
import { _GlobeView as GlobeView } from '@deck.gl/core'
import DeckGL from '@deck.gl/react';
import {ArcLayer, GeoJsonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import { AmbientLight, LightingEffect } from 'deck.gl';
import hexRgb from 'hex-rgb';

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

interface AppProps {}

const App = ({}: AppProps) => {

  const [colour, setColour] = useState({
    background: "#000000",
    globeLand: "#000000",
    globeSea: "#000000",
    archFrom: "#000000",
    archTo: "#000000"
  });

  function createEventHandler(propName: string) {
    return (ev: React.ChangeEvent<HTMLInputElement>) => setColour(curr => ({ ...curr, [propName] : ev.target.value }))
  }
  
  // Viewport settings
  const INITIAL_VIEW_STATE = {
    longitude: -2.244644,
    latitude: 53.483959,
    zoom: 3,
    pitch: 0,
    bearing: 0
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
    from: Loc
    to: Loc
  }

  const archData : Array<ArchData> = [{
        from: {
          name: '19th St. Oakland (19TH)',
          coordinates: [-2.244644, 53.483959]
        },
        to: {
          name: '12th St. Oakland City Center (12TH)',
          coordinates: [-122.271604, 37.803664]
        }
      }]

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
    new ArcLayer({
      id: 'arc-layer',
      data: archData,
      pickable: true,
      getWidth: 1,
      widthScale: 1,
      autoHighlight: true,
      getHeight: 0.5,
      greatCircle: true,
      onClick: (ev) => console.log(ev),
      onHover: (ev) => console.log(ev.object),
      getSourcePosition: d => (d as any).from.coordinates,
      getTargetPosition: d => (d as any).to.coordinates,
      getSourceColor: () => hexToArray(colour.archFrom),
      getTargetColor: () => hexToArray(colour.archTo),
      updateTriggers: {
        getSourceColor: [colour.archFrom],
        getTargetColor: [colour.archTo]
      }
    })
  ];
  
  // style={{ backgroundImage: "linear-gradient(to right bottom, #180025, #150423, #130920, #120c1d, #110f19, #110f1a, #100f1b, #100f1c, #0e0d22, #0c0a28, #09062e, #050334)" }}
  return (
    <div>
      <DeckGL
        style={{ backgroundColor: colour.background }}
        views={views}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        effects={[lightingEffect]}
        layers={layers} />
      <div className="absolute bg-white flex-col w-52 p-2">
        <fieldset className="flex justify-between">
          <label htmlFor="background">Background</label>
          <input id="background" name="background" type="color" onChange={createEventHandler("background")} />
        </fieldset>
        <fieldset className="flex justify-between">
          <label htmlFor="globe-sea">Globe Sea</label>
          <input id="globe-sea" name="globe-sea" type="color" onChange={createEventHandler("globeSea")}  />
        </fieldset>
        <fieldset className="flex justify-between">
          <label htmlFor="globe-land">Globe Land</label>
          <input id="globe-land" name="globe-land" type="color" onChange={createEventHandler("globeLand")} />
        </fieldset>
        <fieldset className="flex justify-between">
          <label htmlFor="arch-from">Arch From</label>
          <input id="arch-from" name="arch-from" type="color" onChange={createEventHandler("archFrom")}  />
        </fieldset>
        <fieldset className="flex justify-between">
          <label htmlFor="arch-to">Arch To</label>
          <input id="arch-to" name="arch-to" type="color" onChange={createEventHandler("archTo")} />
        </fieldset>
      </div>
    </div>
    )
}

export default App;
