import { useEffect, useState } from 'react';

export function useTypewriter(text: string, speed: number = 50) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let i = 0;
    setIndex(0);
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setIndex(prev => prev + Math.random() * 4);
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return text.slice(0, index);
}
