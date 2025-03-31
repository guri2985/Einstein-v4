"use client";

import { useState } from "react";
import InteractiveAvatar from "@/components/InteractiveAvatar";

export default function App() {
  const [showMask, setShowMask] = useState(false);

  const handleStartSession = () => {
    setShowMask(true);
  };

  return (
    <div
      className="main-wrapper"
      style={{
        position: "relative",
        width: "1080px",
        height: "1920px",
        overflow: "hidden",
       
      }}
    >
      {/* Background Video */}
     

      {/* Avatar + Controls */}
      <InteractiveAvatar />
    </div>
  );
}