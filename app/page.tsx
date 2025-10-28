'use client';

import InteractiveAvatar from "@/components/InteractiveAvatar";
import { useEffect, useState } from "react";

export default function App() {
  const [showMask, setShowMask] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const handleStartSession = () => {
    setShowMask(true);
  };

  // Mobile detection function
  const checkMobileView = () => {
    const userAgent = typeof window !== "undefined" ? navigator.userAgent : "";
    const mobileRegex =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i;
    const isMobileDevice = mobileRegex.test(userAgent);
    const isSmallScreen = window.innerWidth < 767;

    setIsMobileView(isMobileDevice && isSmallScreen);
  };

  useEffect(() => {
    // Scale app logic
    const resizeApp = () => {
      const wrapper = document.querySelector<HTMLElement>(".app-inner");
      if (!wrapper) return;

      const scaleX = window.innerWidth / 1080; // portrait width
      const scaleY = window.innerHeight / 1920; // portrait height
      const scale = Math.min(scaleX, scaleY); // fit whole app

      wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
      wrapper.style.position = "absolute";
      wrapper.style.left = "50%";
      wrapper.style.top = "50%";
      wrapper.style.transformOrigin = "center center";
    };

    // Initial checks
    resizeApp();
    checkMobileView();

    // Event listeners
    window.addEventListener("resize", () => {
      resizeApp();
      checkMobileView();
    });

    return () => window.removeEventListener("resize", () => {
      resizeApp();
      checkMobileView();
    });
  }, []);

  if (isMobileView) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-center p-4">
        <h2 className="text-lg md:text-xl font-semibold">
          To enjoy this experience, please use Chrome browser on a compatible Holobox device.
        </h2>
      </div>
    );
  }

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
          width: "1080px",
          height: "1920px",
          transformOrigin: "top left",
          transform: "scale(1)",
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
