import React, { useEffect, useState } from 'react';
import { setLocalStorage } from './hooks';
import axios from 'axios';
import Menu from './Menu';
import { DefaultDevSettingsContext, DefaultGlobeColourContext, DevSettingsContext, DevSettingsState, GlobeColourContext, GlobeColourState } from './SettingContext';
import cities from './cities.json';  
import { Globe } from './Globe';

const NODE_ENV = import.meta.env.NODE_ENV;

interface Loc {
    name: string,
    latitude: number,
    longitude: number,
}

export interface ArcData {
    id: string,
    date: string,
    from: Loc,
    to: Loc
}
 

  interface AppProps { }

  const App = ({ }: AppProps) => {

    const [devSettings, setDevSettings] = setLocalStorage('devSettings', DefaultDevSettingsContext[0]);
    const [globeColourSettings, setGlobeColour] = setLocalStorage('colour', DefaultGlobeColourContext[0]);

    let [archData, setArchData] = useState<ArcData[][]>([]);
    let [etag, setEtag] = useState<string>("");

    useEffect(() => {
      const runEffect = async () => {
        let newData = await requestData();
        console.debug("request data, new data", newData);
        if(newData.length != 0) {
          setArchData(curr => [...curr, newData])
        }
      };
      
      let interval = setInterval(() => runEffect(), 5000);
      return () => clearInterval(interval);
    }, [devSettings.useDemoData, setArchData]);

    async function getArchData() : Promise<ArcData[]> {
      const  { SNOWPACK_PUBLIC_API_SERVER, SNOWPACK_PUBLIC_API_PORT } = import.meta.env;
      let serverUri = SNOWPACK_PUBLIC_API_SERVER + ":" + SNOWPACK_PUBLIC_API_PORT;
      let response = await axios.get<ArcData[]>(serverUri + "/api/journeys", { headers: { "If-None-Match": etag }})
      setEtag(response.headers.etag);

      console.debug(response.data)

      if(response.status == 200 && response.data.length > 0) {
          let fetchedArchData = response.data
          let currentIds = archData.flatMap(x => x.map(y => y.id));
          console.debug(currentIds);
          let newData = fetchedArchData.filter(x => !currentIds.includes(x.id));
          console.debug(newData);
          return newData;
      }
      return [];
    }

    function getRandomNumber(maxValue :number) {
      return Math.floor(Math.random() * maxValue);
    }

    async function getFakeData(cities :Array<any>) : Promise<ArcData[]> {
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

    async function requestData() : Promise<ArcData[]> {
      console.debug("requestData:", NODE_ENV, devSettings.useDemoData)
      try {
        if(NODE_ENV == "production") {
          return await getArchData();
        } 
        else if(devSettings.useDemoData === true) {
          return await getFakeData(cities);
        }
      }
      catch(ex) {
        console.error(ex);
      }

      return Array<ArcData>();
    }    

    return (
      <DevSettingsContext.Provider value={[ devSettings, setDevSettings ]}>
        <GlobeColourContext.Provider value={[ globeColourSettings, setGlobeColour ]}>
            <Globe data={archData} />
            <Menu />
        </GlobeColourContext.Provider>
      </DevSettingsContext.Provider>
      
    )
  }

  export default App;
