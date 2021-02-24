import React, { useState, useEffect } from 'react';
import { Position3D, _GlobeView as GlobeView, _SunLight as SunLight } from '@deck.gl/core'
import DeckGL from '@deck.gl/react';
import {ArcLayer, BitmapLayer, GeoJsonLayer, LineLayer, PointCloudLayer, PolygonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { AmbientLight, COORDINATE_SYSTEM, LightingEffect, PointLight, SimpleMeshLayer } from 'deck.gl';
import {SphereGeometry} from '@luma.gl/core';

import "./App.css";
import { DirectionalLight } from '@deck.gl/core';
import deckGl from 'deck.gl';
import Transition from '@deck.gl/core/transitions/transition';


const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 2
});

const lightingEffect = new LightingEffect({ ambientLight })

const EARTH_RADIUS_METERS = 6.32e6;

interface AppProps {}

const App = ({}: AppProps) => {
  
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
  

  const archData = [{
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
      getPolygon: d => d,
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
      getSourcePosition: d => d.from.coordinates,
      getTargetPosition: d => d.to.coordinates,
      getSourceColor: d => [200, 0, 200],
      getTargetColor: d => [0, 0, 255],
    })
  ];
  
  // style={{ backgroundImage: "linear-gradient(to right bottom, #180025, #150423, #130920, #120c1d, #110f19, #110f1a, #100f1b, #100f1c, #0e0d22, #0c0a28, #09062e, #050334)" }}
  return <DeckGL style={{ backgroundColor: "rgb(5, 5, 5)" }}
      views={views}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      effects={[lightingEffect]}
      layers={layers} />
}

export default App;
