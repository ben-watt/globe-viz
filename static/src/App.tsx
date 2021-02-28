  import React, { ChangeEvent, SyntheticEvent, useState } from 'react';
  import { _GlobeView as GlobeView } from '@deck.gl/core'
  import DeckGL from '@deck.gl/react';
  import { ArcLayer, GeoJsonLayer, SolidPolygonLayer } from '@deck.gl/layers';
  import { AmbientLight, LightingEffect } from 'deck.gl';
  import hexRgb from 'hex-rgb';
  import { useLocalStorage } from './hooks';

  import "./App.css";


  const vsDeclaration = `
  attribute float instanceFrequency;
  varying float vArcLength;
  varying float vFrequency;`

  const vsMain = `
  vArcLength = distance(source, target);
  vFrequency = instanceFrequency;
  `

  const fsDeclaration = `
  uniform float tailLength;
  uniform float timestamp;
  uniform float animationSpeed;

  varying float vArcLength;
  varying float vFrequency;`

  const fsColorFilter = `
  float tripDuration = vArcLength / animationSpeed;
  float flightInterval = 1.0 / vFrequency;
  float r = mod(geometry.uv.x, flightInterval);

  // Head of the trip (alpha = 1.0)
  float rMax = mod(fract(timestamp / tripDuration), flightInterval);
  // Tail of the trip (alpha = 0.0)
  float rMin = rMax - tailLength / vArcLength;
  // Two consecutive trips can overlap
  float alpha = (r > rMax ? 0.0 : smoothstep(rMin, rMax, r)) + smoothstep(rMin + flightInterval, rMax + flightInterval, r);
  if (alpha == 0.0) {
    discard;
  }
  color.a *= alpha;
  `

  class AnimatedArcLayer extends ArcLayer {
    getShaders() {
      const shaders = super.getShaders();
      shaders.inject = {
        'vs:#decl': vsDeclaration,
        'vs:#main-end': vsMain,
        'fs:#decl': fsDeclaration,
        'fs:DECKGL_FILTER_COLOR': fsColorFilter
      };
      return shaders;
    }

    initializeState(params) {
      super.initializeState(params);
      
      this.getAttributeManager().addInstanced({
        instanceFrequency: {
          size: 1,
          accessor: 'getFrequency',
          defaultValue: 1
        },
      });
    }
    
    draw(opts) {
      this.state.model.setUniforms({
        tailLength: this.props.tailLength,
        animationSpeed: this.props.animationSpeed,
        timestamp: (Date.now() / 1000) % 86400
      });

      super.draw(opts);

      this.setNeedsRedraw();
    }
  }

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

  const calculateFrequency = (d) => {
    let lat = Math.abs(d.from.coordinates[0] - d.to.coordinates[0])
    let long = Math.abs(d.from.coordinates[1] - d.to.coordinates[1])

    let normalLat = lat / 90;
    let normalLong = long / 180;

    let distance = normalLat + normalLong;
    
    console.log({ distance });
    return distance * 6;
  }

  const App = ({ }: AppProps) => {

    const [colour, setColour] = useLocalStorage<ColourState>('colour', {
      background: "#000000",
      globeLand: "#000000",
      globeSea: "#000000",
      archFrom: "#000000",
      archTo: "#000000"
    });

    function createEventHandler(propName: string) {
      localStorage.setItem('colour', JSON.stringify(colour))
      return (ev: React.ChangeEvent<HTMLInputElement>) => setColour(curr => ({ ...curr, [propName]: ev.target.value }))
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

    const archData: Array<ArchData> = [{
      from: {
        name: '19th St. Oakland (19TH)',
        coordinates: [-2.244644, 53.483959]
      },
      to: {
        name: '12th St. Oakland City Center (12TH)',
        coordinates: [-122.271604, 37.803664]
      }
    },
    {
      from: {
        name: '19th St. Oakland (19TH)',
        coordinates: [-2.244644, 53.483959]
      },
      to: {
        name: '12th St. Oakland City Center (12TH)',
        coordinates: [15.271604, 56.803664]
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
      new AnimatedArcLayer({
        id: 'arc-layer',
        animationSpeed: 25,
        tailLength: 50,
        getFrequency: calculateFrequency,
        data: archData,
        pickable: true,
        getWidth: 1,
        widthScale: 1,
        autoHighlight: true,
        getHeight: 0.5,
        greatCircle: true,
        color: colour.archFrom,
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
        <div className="absolute">
          <div className="w-8 m-5 cursor-pointer transform hover:rotate-12 duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="bg-white flex-col w-52 px-5 py-2 rounded">
            <fieldset className="flex justify-between">
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
        </div>
      </div>
    )
  }

  export default App;
