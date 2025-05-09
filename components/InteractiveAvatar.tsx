import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import { motion } from "framer-motion";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Spinner,
  Chip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";
import LoadingScreen from "./LoadingScreen"; // Import the LoadingScreen component
import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";
import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";
export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId, setKnowledgeId] = useState<string>(""); 
  const [avatarId, setAvatarId] = useState<string>(""); 
  const [language, setLanguage] = useState<string>("en");
  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>(""); 
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [maskVisible, setMaskVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);  // State to manage button visibility
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const hasEndedRef = useRef(false);
  const [countdownVisible, setCountdownVisible] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);

  function baseApiUrl() {
    return process.env.NEXT_PUBLIC_BASE_API_URL;
  }
  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      console.log("Access Token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
    return "";
  }

  const showStartSessionGif = (showLoaderCallback: () => void): Promise<void> => {
    return new Promise((resolve) => {
      const screensaverVideo = document.querySelector(".screensaver-video") as HTMLElement;
      const gifImage = document.createElement("img");
      gifImage.src = "https://ounocreatstg.wpenginepowered.com/videos/Transitions.gif";
      Object.assign(gifImage.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        opacity: "1",
        zIndex: "9999",
        backgroundColor: "transparent",
      });
  
      const mainUpDiv = document.querySelector(".main-up") as HTMLElement;
      const mainOneDiv = document.querySelector(".main-one") as HTMLElement;
  
      if (mainUpDiv) {
        mainUpDiv.appendChild(gifImage);
      }
  
      setTimeout(() => {
        if (screensaverVideo) {
          screensaverVideo.style.display = "none";
        }
        showLoaderCallback();
      }, 2000);
  
      gifImage.onload = () => {
        setTimeout(() => {
          gifImage.remove();
          if (mainOneDiv) {
            mainOneDiv.style.opacity = "1";
          }
          resolve();
        }, 4000);
      };
      gifImage.onerror = () => {
        gifImage.remove();
        if (screensaverVideo) {
          screensaverVideo.style.display = "none";
        }
        if (mainOneDiv) {
          mainOneDiv.style.opacity = "1";
        }
        resolve();
      };
    });
  };

  const startSession = async () => {
    setSessionEnded(false);
    hasEndedRef.current = false;
    await showStartSessionGif(() => setIsLoadingSession(true));
    const newToken = await fetchAccessToken();
    setIsLoadingSession(true); 
    avatar.current = new StreamingAvatar({
      token: newToken,
      basePath: baseApiUrl(),
    });
  
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);
      setTimeout(() => {
      setMaskVisible(true);
        const avatarVideo = document.querySelector(".avatar-stream") as HTMLElement;
        if (avatarVideo) avatarVideo.style.opacity = "1";
        avatar.current?.on(StreamingEvents.AVATAR_START_TALKING, () => {
          setIsAvatarSpeaking(true);
        });
        avatar.current?.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
          setIsAvatarSpeaking(false);
        });
      }, 1500);
    });
    

    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.High,
          avatarName: "5da1806dea054b19a7a47647ccdf102b",
        knowledgeId,
        voice: {
          rate: 1,
          emotion: VoiceEmotion.EXCITED,
          elevenlabsSettings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.75,
            use_speaker_boost: true,
          },
        },
        language,
        disableIdleTimeout: false,
      });
      setData(res);
  
      await avatar.current.startVoiceChat({ useSilencePrompt: true });
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await avatar.current.speak({
        text: "Hello, I am your interactive avatar. Let's begin!",
      });
    
      setChatMode("voice_mode");
   
  } catch (error) {
    console.error("Error starting avatar session:", error);
  } finally {
    setIsLoadingSession(false);
  }
  startSessionTransition();
};

  let isGifLoaded = false; 
 
const startSessionTransition = () => {
  if (isGifLoaded) return;
  isGifLoaded = true; 
  const gifImage = document.createElement("img");
  gifImage.src = "https://ounocreatstg.wpenginepowered.com/wp-content/uploads/2025/04/pixels_once.gif"; 
  gifImage.style.position = "absolute";
  gifImage.style.left = "0";
  gifImage.style.width = "100%";
  gifImage.style.height = "100%";
  gifImage.style.top = "0";
  gifImage.style.opacity = "1";
  gifImage.style.zIndex = "1000"; 

  const mainUpDiv = document.querySelector(".main-one");
  if (mainUpDiv) {
    mainUpDiv.appendChild(gifImage);
  }
  setTimeout(() => {
    const mainOneDiv = document.querySelector(".main-one") as HTMLElement;
    const videoBackground = document.querySelector("#main-video1") as HTMLVideoElement;
    if (mainOneDiv) mainOneDiv.style.opacity = "1"; 
    if (videoBackground) videoBackground.style.opacity = "1"; 
  }, 500);

  setTimeout(() => {
    if (gifImage.parentElement) {
      gifImage.parentElement.removeChild(gifImage);
    }
    setButtonsVisible(true); 
  }, 2000);
};

async function handleSpeak() {
  setIsLoadingRepeat(true);
  if (!avatar.current) {
    setDebug("Avatar API not initialized");
    return;
  }

  await avatar.current
    .speak({ text: text, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC })
    .catch((e) => {
      setDebug(e.message);
    });

  setIsLoadingRepeat(false);
}
const handleUserSpeechStart = () => {
  setIsUserTalking(true);  

  handleInterrupt(); 
};
const handleUserSpeechEnd = () => {
  setIsUserTalking(false);  
};
async function handleInterrupt() {
  if (!avatar.current) {
    setDebug("Avatar API not initialized");
    return;
  }
}

const handleTimeoutEndSession = async () => {
  showCloseSessionGif(); 
  setButtonsVisible(false);
  await new Promise(resolve => setTimeout(resolve, 1200));
  try {
    await avatar.current?.stopAvatar();
  } catch (e) {
    console.warn("Failed to stop avatar:", e);
  }
  endSession();
  await new Promise(resolve => setTimeout(resolve, 300));
  window.location.reload();
};
(avatar.current as any)?.on(StreamingEvents.STREAM_DISCONNECTED, () => {
  handleTimeoutEndSession(); 
});
const cleanUpSessionSync = () => {
  try {
    avatar.current?.stopAvatar();
    avatar.current?.interrupt(); 
    avatar.current?.closeVoiceChat?.();
  
  } catch (e) {
    console.warn("Failed to clean session in beforeunload:", e);
  }
};

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    cleanUpSessionSync(); 
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);
const endSession = async () => {
  if (hasEndedRef.current || !avatar.current) return;
  hasEndedRef.current = true;
  console.log("Ending session...");

  try {
    await avatar.current.interrupt();
    await avatar.current.closeVoiceChat?.();
    await avatar.current.stopAvatar();
    avatar.current = null;
  } catch (error) {
    console.warn("Error while stopping avatar:", error);
  }
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
    setSessionTimeout(null);
  }
  setSessionEnded(true);
  setButtonsVisible(false);
  setStream(undefined);
  setMaskVisible(false);
  setCountdownVisible(false);
  const avatarVideo = document.querySelector(".avatar-stream") as HTMLVideoElement;
  const backgroundVideo = document.querySelector("#main-video1") as HTMLVideoElement;
  const screensaverVideo = document.querySelector(".screensaver-video") as HTMLVideoElement;
  if (avatarVideo) avatarVideo.style.opacity = "0";
  if (backgroundVideo) backgroundVideo.style.opacity = "0";
  if (screensaverVideo) {
    screensaverVideo.style.display = "block";
    screensaverVideo.pause();
    screensaverVideo.currentTime = 0;
    screensaverVideo.load();
    screensaverVideo.play();
  }
};
const showCloseSessionGif = () => {
  const gifImage = document.createElement("img");
  gifImage.src = "https://ounocreatstg.wpenginepowered.com/videos/Transitions.gif";
  gifImage.style.position = "absolute";
  gifImage.style.left = "0";
  gifImage.style.width = "100%";
  gifImage.style.height = "100%";
  gifImage.style.top = "0";
  gifImage.style.opacity = "1";
  gifImage.style.zIndex = "1000";
  const mainUpDiv = document.querySelector(".main-up");
  if (mainUpDiv) {
    mainUpDiv.appendChild(gifImage);
  }
const mainOneDiv = document.querySelector(".main-one") as HTMLElement | null;
if (mainOneDiv) {
  setTimeout(() => {
    mainOneDiv.style.opacity = "0"; 
  }, 4000);
}
  setTimeout(() => {
    if (gifImage.parentElement) {
      gifImage.parentElement.removeChild(gifImage); 
    }
const mainUpDiv = document.querySelector(".main-up") as HTMLElement | null;
setTimeout(() => {
  if (mainUpDiv) {
    mainUpDiv.style.transition = "opacity 1s ease-out"; 
    mainUpDiv.style.opacity = "1"; 
  }
}, 0); 
}, 4000); 
};

    useEffect(() => {
      const screensaverVideo = document.querySelector(".screensaver-video") as HTMLVideoElement;
      if (screensaverVideo) {
        screensaverVideo.pause();  
        screensaverVideo.currentTime = 0; 
        screensaverVideo.load(); // Force reload
        screensaverVideo.play();
      }
    }, []);
  
  const handleChangeChatMode = useMemoizedFn(async (v) => {
    if (v === chatMode) {
      return;
    }
    if (v === "text_mode") {
      avatar.current?.closeVoiceChat();
    } else {
      await avatar.current?.startVoiceChat();
    }
    setChatMode(v);
  });
  const previousText = usePrevious(text);
  useEffect(() => {
    if (!previousText && text) {
      avatar.current?.startListening();
    } else if (previousText && !text) {
      avatar?.current?.stopListening();
    }
  }, [text, previousText]);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="main-wrapper" style={{ position: "relative" }}>
      
      {/* Default screensaver video */}
      <div className="main-up" style={{ height: "100%",  position: "absolute",
            top: "0",
            left: "0",
            width: "100%", }}>
        <video
          className="screensaver-video"
          src="https://ounocreatstg.wpenginepowered.com/videos/Samuel Screensaver3.mp4"
          autoPlay
          loop
          muted
          style={{
           
            height: "100%",
            objectFit: "cover",
            opacity: "1",
            transition: "opacity 1s ease-in-out",
          }}
        />
        
        {/* Append loader inside .main-up */}
        {isLoadingSession && (
          <LoadingScreen
            onComplete={() => setIsLoadingSession(false)}
            isLoadingSession={isLoadingSession}
          />
        )}
      </div>
  
      {/* Avatar video and new background */}
      <div className="main-one" style={{ opacity: "0", transition: "opacity 0s ease-in-out" }}>

          <video
          id="main-video1"
          src="https://ounocreatstg.wpenginepowered.com/videos/Samuel Static Loop v2.mp4"
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            top: "-40px",
            left: "0",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: "0", // Initially hidden
            zIndex: "10",
            maskImage: 'radial-gradient(circle at 51% 13%, transparent 173px, rgb(255, 255, 255) 217px)', 
            WebkitMaskImage: 'radial-gradient(circle at 51% 13%, transparent 173px, rgb(255, 255, 255) 217px)', 
          }}
        />
        <video
          ref={mediaStream}
          autoPlay
          playsInline
          className="avatar-stream"
          style={{
            objectFit: "contain",
            position: "absolute",
            top: "300px",
            left: "50%",
            transform: "translate(-50%, -50%)",  // Centers the avatar on the screen
            width: "1100px",
          }}
        />
      </div>
     
  
      {/* Session Start Button */}

      <Card>
        <CardBody>
          {!stream && !isLoadingSession ? (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}  // Start at normal size
              animate={{ scale: [1, 1.03, 1], opacity: 1 }} 
              transition={{
                duration: 1,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
        <Button 
  className="w-full start-btn focus:outline-none active:outline-none hover:opacity-100 hover:filter-none active:opacity-100"
  size="lg"
  onClick={startSession}
  style={{
    backgroundImage: 'url("https://ounocreatstg.wpenginepowered.com/wp-content/uploads/2025/04/START-CHAT.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'transparent',
    width: '260px',
    height: '100px',
    boxShadow: 'none',
  }}
/>


            </motion.div>
          ) : isLoadingSession ? (
            <LoadingScreen onComplete={() => setIsLoadingSession(false)} isLoadingSession={isLoadingSession} />
          ) : (
            <>
              {buttonsVisible && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Button
                      className="bg-main"
                      size="lg"
                      onClick={handleTimeoutEndSession}
                      style={{
                   backgroundImage: 'url("https://ounocreatstg.wpenginepowered.com/wp-content/uploads/2025/04/END-CHAT.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: 'transparent',
                        width: '260px',
                        height: '100px',
                      }}
                    />
                   {countdownVisible && (
  <img className="counter"
    src="https://ounocreatstg.wpenginepowered.com/videos/counter.gif"
    alt="Countdown Timer"
    style={{
      position: "absolute",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: "9999",
      maxWidth: "65%", // Adjust the size
    }}
  />
)}

                  </motion.div>
                </>
              )}
            </>
          )}
        </CardBody>
      </Card>


    </div>
  );
  
}