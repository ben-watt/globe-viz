
import { useState } from 'react';

// Sets the state and will set an inial value. Intended to be used like context
function setLocalStorage<T>(key: string, initialValue: T): [T, (curr: T) => T] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
      try {
        // Get from local storage by key
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        // If error also return initialValue
        console.log(error);
        return initialValue;
      }
    });
  
    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T)) =>  {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    };
  
    //@ts-ignore
    return [storedValue, setValue];
}

// Will return the global state from storage if available and will thrown if the
// value has not been set previously. Ensure setLocalStorage has been called
// higher up the DOM model with an inial value, prior to calling this hook.
function useLocalStorage<T>(key: string): [T, (curr: T) => T] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      
      if(!item) {
        throw new Error(`Unable to find state with key '${key}' in local storage.`)
      }

      return JSON.parse(item);

    } catch (error) {
      throw error
    }
  });

  const setValue = (value: T | ((val: T) => T)) =>  {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  //@ts-ignore
  return [storedValue, setValue];
}

export {
    useLocalStorage,
    setLocalStorage
}