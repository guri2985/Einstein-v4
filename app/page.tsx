"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import { useEffect, useRef, useState } from "react";
export default function App() {
  const [showMask, setShowMask] = useState(false);

  const handleStartSession = () => {
    setShowMask(true);
  };
useEffect(() => {
  const resizeApp = () => {
    const wrapper = document.querySelector<HTMLElement>(".app-inner");
    if (!wrapper) return;

    const scaleX = window.innerWidth / 1080;   // portrait width
    const scaleY = window.innerHeight / 1920;  // portrait height
    const scale = Math.min(scaleX, scaleY);    // fit whole app

    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.position = "absolute";
    wrapper.style.left = "50%";
    wrapper.style.top = "50%";
    wrapper.style.transformOrigin = "center center";
    wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
  };

  window.addEventListener("resize", resizeApp);
  resizeApp(); // initial scale

  return () => window.removeEventListener("resize", resizeApp);
}, []);



return (
  <div
    className="app-scale-wrapper"
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
    }}
  >
    <div
      className="app-inner"
      style={{
        width: "1080",   // your design width
        height: "1920px",  // your design height
        transformOrigin: "top left",
        transform: "scale(1)", // will be updated dynamically
      }}
      ref={(el) => {
        if (!el) return;
        const resizeApp = () => {
          const scaleX = window.innerWidth / 1080;
          const scaleY = window.innerHeight / 1920;
          const scale = Math.min(scaleX, scaleY);
          el.style.transform = `scale(${scale})`;
        };
        window.addEventListener("resize", resizeApp);
        resizeApp(); // initial scale
      }}
    >
      <div
        className="main-div"
        style={{
          position: "relative",
          width: "1080px",
          height: "1920px",
          overflow: "hidden",
          margin: "auto",
        }}
      >
        <InteractiveAvatar />
      </div>
    </div>
  </div>
);

}
