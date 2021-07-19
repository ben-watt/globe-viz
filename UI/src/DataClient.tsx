import cities from './cities.json';
import axios from 'axios';
import type { AnimatedArcLayerData } from './AnimatedArcLayer';

function getRandomNumber(maxValue: number) {
    return Math.floor(Math.random() * maxValue);
  }

export async function getFakeData(): Promise<AnimatedArcLayerData[]> {
let startingCity = cities[getRandomNumber(cities.length)];
let endingCity = cities[getRandomNumber(cities.length)];

return Promise.resolve([{
    id: Date.now().toString(),
    date: Date.now().toString(),
    from: {
        name: startingCity.name,
        latitude: Number.parseFloat(startingCity.lat),
        longitude: Number.parseFloat(startingCity.lng),
    },
    to: {
        name: endingCity.name,
        latitude: Number.parseFloat(endingCity.lat),
        longitude: Number.parseFloat(endingCity.lng),
    }
}])
}

export async function getArchData(etag: string): Promise<[AnimatedArcLayerData[], string]> {
    const { SNOWPACK_PUBLIC_API_SERVER, SNOWPACK_PUBLIC_API_PORT } = import.meta.env;
    let serverUri = SNOWPACK_PUBLIC_API_SERVER + ":" + SNOWPACK_PUBLIC_API_PORT;

    let response = null;
    if(etag != "") {
      response = await axios.get<AnimatedArcLayerData[]>(serverUri + "/api/journeys", { headers: { "If-None-Match": etag } })
    } else {
      response = await axios.get<AnimatedArcLayerData[]>(serverUri + "/api/journeys")
    }

    console.debug(response.data)

    if (response.status == 200 && response.data.length > 0) {
      return [response.data, response.headers.etag];
    } else {
      return [[], ""];
    }
  }