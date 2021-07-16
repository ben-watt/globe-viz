import { AmbientLight } from '@deck.gl/core';
import { DirectionalLight } from '@deck.gl/core';
import { LinearInterpolator } from '@deck.gl/core';
import { LightingEffect } from '@deck.gl/core';
import { _GlobeView as GlobeView } from '@deck.gl/core'
import { GeoJsonLayer, SolidPolygonLayer } from '@deck.gl/layers';
import hexRgb from 'hex-rgb';
import React, { memo, useCallback, useContext, useState } from 'react'
import { AnimatedArcLayer } from './AnimatedArcLayer';
import { GlobeColourContext } from './SettingContext';
import GL from '@luma.gl/constants';
import type { AnimatedArcLayerData } from './AnimatedArcLayer';
import { DeckGL } from '@deck.gl/react';
import type { RGBAColor } from '@deck.gl/core';

const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 0.5
});

const pointLight = new DirectionalLight({
    color: [255, 255, 255],
    intensity: 1.0,
    direction: [-10, -60, -20]
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight })


function hexToArray(hex: string) : [number, number, number] {
    let rgb = hexRgb(hex)
    return [rgb.red, rgb.green, rgb.blue]
}

type GlobeProps = {
    data: AnimatedArcLayerData[][]
}

export const Globe = ({ data }: GlobeProps) => {

    const [colour, _] = useContext(GlobeColourContext);

    const transitionInterpolator = new LinearInterpolator(['longitude']);
    const [initialViewState, setInitialViewState] = useState({
        longitude: -2.244644,
        latitude: 35.483959,
        zoom: 1.0,
        pitch: 0,
        bearing: 0,
    });

    const rotateCamera = useCallback(() => {
        setInitialViewState(viewState => ({
            ...viewState,
            longitude: viewState.longitude + 1.0,
            transitionDuration: 1000,
            transitionInterpolator,
            onTransitionEnd: rotateCamera
        }))
    }, []);

    const views = [
        new GlobeView({
            id: 'globe',
            controller: true
        })
    ]

    const defaultLayers: Array<any> = [
        new SolidPolygonLayer({
            id: 'background',
            data: [
                [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
            ],
            getPolygon: d => d as any,
            stroked: false,
            filled: true,
            opacity: 1,
            getFillColor: hexToArray(colour.globeSea) as RGBAColor,
            extruded: true,
            material: {
                ambient: 0.2,
                diffuse: 0.6,
                shininess: 229,
                specularColor: [255, 255, 255]
            }
        }),
        new GeoJsonLayer({
            id: 'earth-land',
            data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
            stroked: false,
            filled: true,
            opacity: 1,
            getFillColor: hexToArray(colour.globeLand) as RGBAColor,
            updateTriggers: {
                getFillColor: [colour.globeLand]
            },
            extruded: true,
            elevationScale: 10,
            material: {
                ambient: 0.3,
                diffuse: 0.9,
                shininess: 50,
                specularColor: [255, 255, 255]
            }
        }),
    ];

    const archLayers = data.map<AnimatedArcLayer>((chunk, index) => {
        //@ts-ignore
        return new AnimatedArcLayer({
            id: `arch-layer-${index}`,
            data: chunk,
            pickable: true,
            getWidth: 2,
            widthScale: 1,
            autoHighlight: true,
            getHeight: 0.5,
            greatCircle: true,
            color: colour.archFrom,
            animationSpeed: 1.0,
            renderDate: new Date(),
            animationDuration: 10000,
            getSourcePosition: (d: AnimatedArcLayerData) => [d.from.longitude, d.from.latitude],
            getTargetPosition: (d: AnimatedArcLayerData) => [d.to.longitude, d.to.latitude],
            getSourceColor: hexToArray(colour.archFrom),
            getTargetColor: hexToArray(colour.archTo),
            updateTriggers: {
                getSourceColor: [colour.archFrom],
                getTargetColor: [colour.archTo],
            },
            //@ts-ignore
            parameters: {
                // prevent flicker from z-fighting
                [GL.DEPTH_TEST]: true,

                // turn on additive blending to make them look more glowy
                [GL.BLEND]: true,
                [GL.BLEND_SRC_RGB]: GL.ONE,
                [GL.BLEND_DST_RGB]: GL.ONE,
                [GL.BLEND_EQUATION]: GL.FUNC_ADD,
            }
        });
    });


    let layers = defaultLayers.concat(archLayers);
    console.debug("re-render arch data", data);
    console.debug("Render layers", layers);
    return (
        <DeckGL
            //@ts-ignore
            getTooltip={({ object }) => object && { html: `<div>${object.from.name} to ${object.to.name}</div>` }}
            style={{ backgroundColor: colour.background }}
            views={views}
            initialViewState={initialViewState}
            controller={false}
            effects={[lightingEffect]}
            onLoad={rotateCamera}
            layers={layers} />
    )
}