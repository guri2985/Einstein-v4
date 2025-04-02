import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
  isLoadingSession: boolean;
}

export default function LoadingScreen({ onComplete, isLoadingSession }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (isLoadingSession) {
      const updateProgress = () => {
        const elapsedTime = Date.now() - startTime;
        const estimatedProgress = Math.min((elapsedTime / 10000) * 100, 99); // Assume max load time 10s
        setProgress(estimatedProgress);
      };

      const interval = setInterval(updateProgress, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setTimeout(onComplete, 500);
    }
  }, [isLoadingSession, onComplete, startTime]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: !isLoadingSession ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex items-center justify-center bg-white text-white text-4xl font-bold z-50"
      style={{
        width: '1080px',
        height: '1920px',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)', // Center the loading screen
      }}
    >
      {/* Flex container to stack image and progress bar vertically */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Image above the progress bar */}
        <img 
          src="https://ounocreatstg.wpenginepowered.com/wp-content/uploads/2025/04/thumbnail_Initialising-text.png"
          alt="Initializing..."
          className="w-[500px] h-auto"
        />

        {/* Progress Bar */}
        <div className="w-[450px] h-5 bg-gray-300 rounded-full overflow-hidden meter relative">
          <div
            className="h-full bg-red-500 transition-all duration-200 ease-in-out relative"
            style={{
              width: `${progress}%`,
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                rgb(243, 116, 116),
                rgb(243, 116, 116),10px,
                #f42323 10px,
                #f42323 20px
              )`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
