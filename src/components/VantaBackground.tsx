import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from "./ThemeProvider";
// @ts-ignore
import RINGS from 'vanta/dist/vanta.rings.min';

export default function VantaBackground() {
  const { theme } = useTheme();
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const myRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        RINGS({
          el: myRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          backgroundColor: theme === "dark" ? 0x020617 : 0xf8fafc,
          color: 0x00f2ff,
          backgroundAlpha: 1
        })
      );
    } else {
      vantaEffect.setOptions({
        backgroundColor: theme === "dark" ? 0x020617 : 0xf8fafc,
      });
    }
    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
        setVantaEffect(null);
      }
    };
  }, [vantaEffect, theme]);

  return (
    <div 
      ref={myRef} 
      className="fixed inset-0 -z-50 w-full h-full backdrop-blur-[100px]"
      style={{ position: 'fixed', top: 0, left: 0 }}
    />
  );
}
