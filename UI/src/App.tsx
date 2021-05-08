  import React, { useEffect, useState } from 'react';
  import { _GlobeView as GlobeView } from '@deck.gl/core'
  import DeckGL from '@deck.gl/react';
  import { GeoJsonLayer, SolidPolygonLayer } from '@deck.gl/layers';
  import { AnimatedArcLayer } from './AnimatedArcLayer';
  import { AmbientLight, LightingEffect } from 'deck.gl';
  import hexRgb from 'hex-rgb';
  import { setLocalStorage } from './hooks';
  import GL from '@luma.gl/constants';
  import type { RGBAColor } from 'deck.gl';
  import axios from 'axios';
  import Menu from './Menu';
  import type { ColourState, DevSettings } from './Settings';
  
  const NODE_ENV = import.meta.env.NODE_ENV;

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

  const App = ({ }: AppProps) => {

    const [colour, setColour] = setLocalStorage<ColourState>('colour', {
      "background": "#000000",
      "globeLand": "#0d0d0d",
      "globeSea": "#333333",
      "archFrom": "#ff00ea",
      "archTo": "#ffffff"
    });

    const [devSettings, setDevSettings] = setLocalStorage<DevSettings>('devSettings', {
      createFakeData: false,
    });


    let [requestCount, setRequestCount] = useState(0);
    let [archData, setArchData] = useState<ArchData[]>([]);
    let [etag, setEtag] = useState<string>("");

    useEffect(() => {
      const runEffect = async () => {
          let newData = await requestData();
          if(newData.length != 0) {
            setArchData(curr => curr.concat(newData))
          }

          let timeOut = setTimeout(() => setRequestCount(curr => curr + 1), 1000);
          return () => clearTimeout(timeOut);
      };

      runEffect();
    }, [requestCount]);

    async function getArchData() : Promise<ArchData[]> {
      const  { SNOWPACK_PUBLIC_API_SERVER, SNOWPACK_PUBLIC_API_PORT } = import.meta.env;
      let serverUri = SNOWPACK_PUBLIC_API_SERVER + ":" + SNOWPACK_PUBLIC_API_PORT;
      let response = await axios.get<Array<ArchData>>(serverUri + "/api/journeys", { headers: { "If-None-Match": etag }})
      setEtag(response.headers.etag);

      console.log(response.data)

      if(response.status == 200 && response.data.length > 0) {
          let fetchedArchData = response.data
          fetchedArchData.forEach(x => x.fetchedDate = Date.now());
          let currentIds = archData.map(x => x.id);
          console.debug(currentIds);
          let newData = fetchedArchData.filter(x => !currentIds.includes(x.id));
          console.log(newData);
          return newData;
      }
      return [];
    }

    async function getFakeData() : Promise<ArchData[]> {
      return Promise.resolve([{
        id: Date.now().toString(),
        fetchedDate: Date.now(),
        date: Date.now().toString(),
        from: {
          name: "Manchester",
          latitude: 53.4723271,
          longitude: -2.2936734,
        },
        to: {
          name: "Hong Kong",
          latitude: 22.352991,
          longitude: 113.9872748,
        }
      }])
    }

    async function requestData() : Promise<ArchData[]> {
      try {
        if(NODE_ENV == "production") {
          return await getArchData();
        } 
        else if(devSettings.createFakeData === true) {
          return await getFakeData();
        }
        else {
          return []
        }
      }
      catch(ex) {
        console.log(ex);
      }

      return Array<ArchData>();
    }

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
      name: string,
      latitude: number,
      longitude: number,
    }

    interface ArchData {
      id: string,
      fetchedDate: number,
      date: string,
      from: Loc,
      to: Loc
    }

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
        getFillColor: () => hexToArray(colour.globeSea) as RGBAColor,
      }),
      new GeoJsonLayer({
        id: 'earth-land',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
        stroked: false,
        filled: true,
        opacity: 1,
        getFillColor: () => hexToArray(colour.globeLand) as RGBAColor,
        updateTriggers: {
          getFillColor: [colour.globeLand]
        },
        material: {}
      }),
      //@ts-ignore
      new AnimatedArcLayer({
        id: 'arc-layer',
        data: archData,
        pickable: true,
        getWidth: 2,
        widthScale: 1,
        autoHighlight: true,
        getHeight: 0.5,
        greatCircle: true,
        color: colour.archFrom,
        getSourcePosition: (d : ArchData) => [d.from.longitude, d.from.latitude],
        getTargetPosition: (d : ArchData) => [d.to.longitude, d.to.latitude],
        getSourceColor: () => hexToArray(colour.archFrom),
        getTargetColor: () => hexToArray(colour.archTo),
        getDate: (d : ArchData) =>  {
          return Math.floor((d.fetchedDate - 1615746276338) / 100);
        },
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
          //@ts-ignore
          getTooltip={({ object }) => object && { html: `<div>${object.from.name} to ${object.to.name}</div>`}}
          style={{ backgroundColor: colour.background }}
          views={views}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          effects={[lightingEffect]}
          layers={layers} />
        <Menu settings={{ colour, devSettings}} setColour={setColour} setDevSettings={setDevSettings} />
      </div>
    )
  }

  export default App;
