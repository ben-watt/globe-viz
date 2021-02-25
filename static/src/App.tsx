import React, { useState } from 'react';
import { _GlobeView as GlobeView } from '@deck.gl/core'
import DeckGL from '@deck.gl/react';
import {ArcLayer, GeoJsonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import { AmbientLight, LightingEffect } from 'deck.gl';

import "./App.css";

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 2
});

const lightingEffect = new LightingEffect({ ambientLight })


interface AppProps {}

const App = ({}: AppProps) => {

  const [state, setState] = useState({
    background: "",
    globeLand: "",
    globeSea: "",
    ArchFrom: "",
    ArchTo: ""
  });
  
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
      getFillColor: [20, 20, 40],
    }),
    new GeoJsonLayer({
      id: 'earth-land',
      data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
      stroked: false,
      filled: true,
      opacity: 1,
      getFillColor: [20, 20, 20],
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
      onClick: (ev) => console.log(ev),
      onHover: (ev) => console.log(ev.object),
      getSourcePosition: d => (d as any).from.coordinates,
      getTargetPosition: d => (d as any).to.coordinates,
      getSourceColor: () => [200, 0, 200],
      getTargetColor: () => [0, 0, 255],
    })
  ];
  
  // style={{ backgroundImage: "linear-gradient(to right bottom, #180025, #150423, #130920, #120c1d, #110f19, #110f1a, #100f1b, #100f1c, #0e0d22, #0c0a28, #09062e, #050334)" }}
  return (
    <div>
      <DeckGL style={{ backgroundColor: "rgb(5, 5, 5)" }}
        views={views}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        effects={[lightingEffect]}
        layers={layers} />
      <div className="absolute bg-white flex-col w-52 p-2">
        <fieldset className="flex justify-between">
          <label htmlFor="background">Background</label>
          <input id="background" name="background" type="color" onSelect={(ev) => console.log(ev)}/>
        </fieldset>
        <fieldset className="flex justify-between">
          <label htmlFor="globe-sea">Globe Sea</label>
          <input id="globe-sea" name="globe-sea" type="color" />
        </fieldset>
        <fieldset className="flex justify-between">
          <label htmlFor="globe-land">Globe Land</label>
          <input id="globe-land" name="globe-land" type="color" />
        </fieldset>
        <fieldset className="flex justify-between">
          <label htmlFor="arch-from">Arch From</label>
          <input id="arch-from" name="arch-from" type="color" />
        </fieldset>
        <fieldset className="flex justify-between">
          <label htmlFor="arch-to">Arch To</label>
          <input id="arch-to" name="arch-to" type="color" />
        </fieldset>
      </div>
    </div>
    )
}

export default App;
