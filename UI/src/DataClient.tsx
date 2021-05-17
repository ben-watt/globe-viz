import type { ArcData } from './App';
import cities from './cities.json';
import axios from 'axios';

function getRandomNumber(maxValue: number) {
    return Math.floor(Math.random() * maxValue);
  }

export async function getFakeData(): Promise<ArcData[]> {
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

export async function getArchData(): Promise<[ArcData[], string]> {
    const { SNOWPACK_PUBLIC_API_SERVER, SNOWPACK_PUBLIC_API_PORT } = import.meta.env;
    let serverUri = SNOWPACK_PUBLIC_API_SERVER + ":" + SNOWPACK_PUBLIC_API_PORT;
    let response = await axios.get<ArcData[]>(serverUri + "/api/journeys", { headers: { "If-None-Match": etag } })

    console.debug(response.data)

    if (response.status == 200 && response.data.length > 0) {
      return [response.data, response.headers.etag];
    } else {
      return [[], ""];
    }
  }