import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import { motion } from "framer-motion";
import Image from "next/image";
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
     const screensaverVideo = document.querySelector(".screensaver-video") as HTMLVideoElement | null;
      const gifImage = document.createElement("img");
      gifImage.src = "/images/Transitions.gif";
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
    screensaverVideo.pause();       
    screensaverVideo.currentTime = 0;
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

  // 1️⃣ Show first GIF
  await showStartSessionGif(() => setIsLoadingSession(true));

  // 2️⃣ Fetch token and init avatar
  const newToken = await fetchAccessToken();
  setIsLoadingSession(true);
  avatar.current = new StreamingAvatar({
    token: newToken,
    basePath: baseApiUrl(),
  });

  avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
    console.log(">>>>> Stream ready:", event.detail);
    setStream(event.detail);

    avatar.current?.on(StreamingEvents.AVATAR_START_TALKING, () => setIsAvatarSpeaking(true));
    avatar.current?.on(StreamingEvents.AVATAR_STOP_TALKING, () => setIsAvatarSpeaking(false));
  });

  try {
    const res = await avatar.current.createStartAvatar({
      quality: AvatarQuality.High,
      avatarName: "dd252a4748f84dbfa46157e9ed2ced86",
      knowledgeId,
      voice: {
        rate: 1,
        emotion: VoiceEmotion.EXCITED,
        elevenlabsSettings: {
          stability: 1,
          similarity_boost: 1,
          style: 1,
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

  // 3️⃣ Wait for second GIF to finish before showing avatar
  await startSessionTransition();

  // 4️⃣ Show avatar only AFTER second GIF
  setMaskVisible(true);
  const avatarVideo = document.querySelector(".avatar-stream") as HTMLElement | null;
  if (avatarVideo) {
    avatarVideo.style.opacity = "1";
    avatarVideo.style.visibility = "visible";
  }
};

  let isGifLoaded = false; 
 

const startSessionTransition = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isGifLoaded) return resolve();
    isGifLoaded = true;

    const gifImage = document.createElement("img");
    gifImage.src = "https://ouno.co.uk/Avatar/pixels_once.gif";
    Object.assign(gifImage.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      opacity: "1",
      zIndex: "1000",
    });

    const mainOneDiv = document.querySelector(".main-one");
    mainOneDiv?.appendChild(gifImage);

    // Optional minor delay to sync with video background
    setTimeout(() => {
      const mainOneDiv = document.querySelector(".main-one") as HTMLElement | null;
      if (mainOneDiv) mainOneDiv.style.opacity = "1";

      const videoBackground = document.querySelector("#main-video1") as HTMLVideoElement | null;
      if (videoBackground) videoBackground.style.opacity = "1";
    }, 500);

    // Remove GIF after 2 seconds and resolve
    setTimeout(() => {
      if (gifImage.parentElement) gifImage.parentElement.removeChild(gifImage);
      setButtonsVisible(true);
      resolve(); // <- avatar only becomes visible after this
    }, 1000);
  });
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
  gifImage.src = "https://ouno.co.uk/Avatar/Transitions.gif";
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
  const screensaverVideo = document.querySelector(
    ".screensaver-video"
  ) as HTMLVideoElement | null;

  if (!screensaverVideo) return;

  // ✅ Start muted so autoplay works
  screensaverVideo.muted = true;

  screensaverVideo.play().catch((err) => {
    console.warn("Muted autoplay blocked:", err);
  });

  // Try unmuting after a short delay
  setTimeout(() => {
    screensaverVideo.muted = false;

    screensaverVideo
      .play()
      .then(() => {
        console.log("Video playing with audio");
      })
      .catch((err) => {
        console.warn("Autoplay with audio blocked, fallback to muted:", err);
        // 🔄 Fallback: keep it muted & playing
        screensaverVideo.muted = true;
        screensaverVideo.play().catch((err2) =>
          console.error("Even muted playback failed:", err2)
        );
      });
  }, 3000);
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
     <div className="main-up" style={{ height: "100%",  position: "absolute",
            top: "0",
            left: "0",
            width: "100%", }}>
        <video
          className="screensaver-video"
          src="https://ouno.co.uk/Avatar/Einstein.mp4"
          autoPlay
          loop 
          style={{
           height: "100%",
            objectFit: "cover",
            opacity: "1",
            transition: "opacity 1s ease-in-out",
          }}
        />
  
        {isLoadingSession && (
          <LoadingScreen
            onComplete={() => setIsLoadingSession(false)}
            isLoadingSession={isLoadingSession}
          />
        )}
      </div>
  
      <div className="main-one" style={{ opacity: "0", transition: "opacity 0s ease-in-out" }}>
        <video
          id="main-video1"
          src="https://ouno.co.uk/Avatar/e-video.mp4"
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: "0",
            zIndex: "9",
            maskImage: 'radial-gradient(circle at 49% 12%, transparent 221px, rgb(255, 255, 255) 243px)', 
            WebkitMaskImage: 'radial-gradient(circle at 49% 12%, transparent 221px, rgb(255, 255, 255) 243px)', 
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
            top: "294px",
            left: "50%",
            transform: "translate(-50%, -50%)",  
            width: "1100px",
             height: "607px",
            opacity: 1,
			zIndex: "1",
          }}
        />
      </div>
 <Card>
        <CardBody>
          {!stream && !isLoadingSession ? (
            <motion.div
              initial={{ scale: 1, opacity: 1 }} 
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
    backgroundImage: 'url("https://ouno.co.uk/Avatar/start.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'transparent',
    width: '180px',
    height: '180px',
    boxShadow: 'none',
    marginRight:'30px',
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
                   backgroundImage: 'url("https://ouno.co.uk/Avatar/END.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: 'transparent',
                        width: '180px',
                        height: '180px',
                         marginRight:'30px',
                      }}
                    />
                   {countdownVisible && (
  <img className="counter"
    src="/images/counter.gif"
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
