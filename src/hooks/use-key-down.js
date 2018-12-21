import { useState, useEffect } from 'react';

const useKeyDown = (keyToMatch, defaultValue) => {
  const [match, setMatch] = useState(defaultValue);
  useEffect(() => {
    const handleKey = event => {
      const { key } = event;
      if (event.srcElement.localName !== 'input') {
        if (key === keyToMatch) {
          setMatch(true);
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, []);
  return [match, setMatch];
};

export default useKeyDown;
