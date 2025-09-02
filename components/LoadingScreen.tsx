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
      className="fixed inset-0 flex items-center justify-center bg-white text-white text-4xl font-bold z-50 loader-div"
      style={{
        width: '1080px',
        height: '1920px',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)', 
      }}
    >
   
      <div className="flex flex-col items-center justify-center space-y-4">
        <img 
          src="https://ouno.co.uk/Avatar/Initialising.png"
          alt="Initializing..."
          className="w-[500px] h-auto"
        />

    <div className="w-[450px] h-5 bg-gray-300 rounded-full overflow-hidden meter relative">
          <div
            className="h-full bg-[a1915e] 500 transition-all duration-200 ease-in-out relative"
            style={{
              width: `${progress}%`,
              backgroundImage: `repeating-linear-gradient(
                -45deg,
#1c1c1c29,
               #1c1c1c29, 10px,
#1c1c1c 10px,
            #1c1c1c  20px
              )`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}