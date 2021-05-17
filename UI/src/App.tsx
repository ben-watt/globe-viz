import React, { useEffect, useState } from 'react';
import { setLocalStorage } from './hooks';
import Menu from './Menu';
import { DefaultDevSettingsContext, DefaultGlobeColourContext, DevSettingsContext, GlobeColourContext, } from './SettingContext';
import { Globe } from './Globe';
import { getFakeData, getArchData } from './DataClient';

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


type AppProps = {}

const App = ({ }: AppProps) => {

  const [devSettings, setDevSettings] = setLocalStorage('devSettings', DefaultDevSettingsContext[0]);
  const [globeColourSettings, setGlobeColour] = setLocalStorage('colour', DefaultGlobeColourContext[0]);

  let [archData, setArchData] = useState<ArcData[][]>([]);
  let [etag, setEtag] = useState<string>("");

  useEffect(() => {
    const runEffect = async () => {
      let newData = await requestData();
      console.debug("request data, new data", newData);
      if (newData.length != 0) {
        setArchData(curr => [...curr, newData])
      }
    };

    let interval = setInterval(() => runEffect(), 5000);
    return () => clearInterval(interval);
  }, [devSettings.useDemoData, setArchData]);

  async function requestData(): Promise<ArcData[]> {
    try {
      if (import.meta.env.NODE_ENV == "production") {
        let currentIds = archData.flatMap(x => x.map(y => y.id));
        let [response, etag] = await getArchData();
        setEtag(etag);
        return response.filter(x => !currentIds.includes(x.id));
      }
      else if (devSettings.useDemoData === true) {
        return await getFakeData();
      }
    }
    catch (ex) {
      console.error(ex);
    }

    return Array<ArcData>();
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
