import { useEffect, useRef } from 'react';

export default () => {
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};
