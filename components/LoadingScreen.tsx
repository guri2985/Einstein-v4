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
      className="fixed inset-0 flex flex-col items-center justify-center bg-white text-white text-4xl font-bold z-50"
    >
      <div className="w-64 bg-gray-300 h-4 rounded-full">
        <div
          className="bg-green-500 h-full rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
