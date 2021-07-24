import React, { useEffect, useRef, useState } from 'react';
import { setLocalStorage } from './hooks';
import Menu from './Menu';
import { DefaultDevSettingsContext, DefaultGlobeColourContext, DevSettingsContext, GlobeColourContext, } from './SettingContext';
import { Globe } from './Globe';
import { getFakeData, getArchData } from './DataClient';
import type { AnimatedArcLayerData } from './AnimatedArcLayer';

interface Loc {
  name: string,
  latitude: number,
  longitude: number,
}

type AppProps = {}

const App = ({ }: AppProps) => {

  const [devSettings, setDevSettings] = setLocalStorage('devSettings', DefaultDevSettingsContext[0]);
  const [globeColourSettings, setGlobeColour] = setLocalStorage('colour', DefaultGlobeColourContext[0]);

  let [archData, setArchData] = useState<AnimatedArcLayerData[][]>([]);
  let [etag, setEtag] = useState<string>("");

  useEffect(() => {
    const runEffect = async () => {
      console.log("runEffect")
      let [newData, newETag] = await requestData();

      console.log(newData);
      
      if(etag !== newETag) {
        setEtag(newETag);
      }

      if (newData.length !== 0) {
        setArchData(curr => [...curr, newData])
      }
    };

    console.log("setInterval")
    let intervalId : NodeJS.Timeout;
    intervalId = setInterval(() => runEffect(), 5000);

    return () => {
      if(intervalId != null) {
        clearInterval(intervalId);
      }
    }
  }, [devSettings.useDemoData, etag]);

  async function requestData(): Promise<[AnimatedArcLayerData[], string]> {
    try {
      if (devSettings.useDemoData) {
        console.debug("Fetch fake data")
        return [await getFakeData(), ""];
      }

      if (import.meta.env.NODE_ENV == "production") {
        let currentIds = archData.flatMap(x => x.map(y => y.id));
        let [response, newETag] = await getArchData(etag);
        return [response.filter(x => !currentIds.includes(x.id)), newETag];
      }
    }
    catch (ex) {
      console.error(ex);
    }

    return [Array<AnimatedArcLayerData>(), ""];
  }

  return (
    <DevSettingsContext.Provider value={[devSettings, setDevSettings]}>
      <GlobeColourContext.Provider value={[globeColourSettings, setGlobeColour]}>
        <Globe data={archData} />
        <Menu />
      </GlobeColourContext.Provider>
    </DevSettingsContext.Provider>

  )
}

export default App;
