import React, { useState, useEffect } from 'react';
import { Position3D, _GlobeView as GlobeView, _SunLight as SunLight } from '@deck.gl/core'
import DeckGL from '@deck.gl/react';
import {BitmapLayer, GeoJsonLayer, LineLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {SphereGeometry} from '@luma.gl/core';
import "./App.css";
import { TileLayer } from '@deck.gl/geo-layers';
import { AmbientLight, COORDINATE_SYSTEM, LightingEffect, PointLight, SimpleMeshLayer } from 'deck.gl';


const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 10
});

const sunLight = new SunLight({
  color: [255, 255, 255],
  intensity: 2.0,
  timestamp: 0
});

// create lighting effect with light sources
const lightingEffect = new LightingEffect({ambientLight});
const EARTH_RADIUS_METERS = 6.32e6;


interface AppProps {}

const App = ({}: AppProps) => {
  
  // Viewport settings
  const INITIAL_VIEW_STATE = {
    longitude: -122.41669,
    latitude: 37.7853,
    zoom: 13,
    pitch: 0,
    bearing: 0
  };
  
  // Data to be used by the LineLayer
  const data = [
    {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
  ];

  const views = [
    new GlobeView({id: 'globe', controller: true})
  ]
  
  const layers = [
    new SimpleMeshLayer({
      id: 'earth-sphere',
      data: [0],
      mesh: new SphereGeometry({radius: EARTH_RADIUS_METERS, nlat: 18, nlong: 36}),
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPosition: (d) => [0, 0, 0],
      getColor: [255, 255, 255]
    }),
    new GeoJsonLayer({
      id: 'earth-land',
      data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
      // Styles
      stroked: false,
      filled: true,
      opacity: 0.1,
      getFillColor: [0, 0, 0]
    }),
    new LineLayer({id: 'line-layer', data})
  ];
  
  return <DeckGL views={views}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      effects={[lightingEffect]}
      layers={layers} />
}

export default App;
