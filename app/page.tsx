"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import { useEffect, useRef, useState } from "react";
export default function App() {
  const [showMask, setShowMask] = useState(false);

  const handleStartSession = () => {
    setShowMask(true);
  };



return (

    
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
 
);

}