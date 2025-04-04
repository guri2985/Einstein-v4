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


  async function startSession() {
    setIsLoadingSession(true);
    const newToken = await fetchAccessToken();
  
    avatar.current = new StreamingAvatar({
      token: newToken,
      basePath: baseApiUrl(),
    });
  
    // Clear previous timeout if session is restarted
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
  
    avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);
      setTimeout(() => setMaskVisible(true), 0);
  
      // Ensure avatar video is visible again
      const avatarVideo = document.querySelector(".avatar-stream") as HTMLElement;
      if (avatarVideo) {
        avatarVideo.style.opacity = "1";
      }
    });
  
    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: "8cb79c7f37d1430d96edc1402fea67b0",
        knowledgeId: knowledgeId, // Or use a custom `knowledgeBase` if needed
        voice: {
          rate: 1,
          emotion: VoiceEmotion.EXCITED,
          elevenlabsSettings: {
            stability: 1,
            similarity_boost: 1,
            style: 1,
            use_speaker_boost: false,
          },
        },
        language: language,
        disableIdleTimeout: true, // Disable idle timeout here if needed
      });
  
      setData(res);
      await avatar.current?.startVoiceChat({
        useSilencePrompt: true,
      });
  
      // Make the avatar speak immediately by default
      const initialSpeech = "Hello, I am your interactive avatar. Let's begin!";
      await avatar.current.speak({
        text: initialSpeech,
      });
  
      setChatMode("voice_mode");

      setSessionTimeout(setTimeout(() => {
        showCloseSessionGif(); 
      }, 30000));
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  
    startSessionTransition();
  }

  let isGifLoaded = false; 
const startSessionTransition = () => {
  if (isGifLoaded) return;

  isGifLoaded = true; 

  // Create the GIF image for transition
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

    if (mainOneDiv) mainOneDiv.style.opacity = "1"; // Fade in main video
    if (videoBackground) videoBackground.style.opacity = "1"; // Fade in background video
  }, 0);

  setTimeout(() => {
    if (gifImage.parentElement) {
      gifImage.parentElement.removeChild(gifImage);
    }
    setButtonsVisible(true); // Show buttons after GIF removal
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

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    await avatar.current.interrupt().catch((e) => {
      setDebug(e.message);
    });
  }

  const handleTimeoutEndSession = () => {
    showCloseSessionGif();  // Show GIF transition before ending the session
  
    setTimeout(() => {
      endSession();  // Proceed with ending session after GIF transition
    }, 4000);  // Wait 4 seconds after GIF before ending session
  };

useEffect(() => {
  // Function to handle the session end when the page is about to unload (e.g., reload or navigate away)
  const handleBeforeUnload = () => {
    endSession(); // Call the endSession function to close the session properly
  };

  // Add the event listener for beforeunload
  window.addEventListener("beforeunload", handleBeforeUnload);

  // Cleanup the event listener and session when the component is unmounted or before reload
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    endSession(); // Ensure session is ended properly on unmount
  };
}, []); // Empty dependency array ensures this effect runs only once (on component mount)


// Automatically trigger session end when timeout occurs
useEffect(() => {
  if (sessionTimeout) {
    const timeoutHandler = setTimeout(() => {
      handleTimeoutEndSession();  // Trigger end session when timeout is reached
    }, 30000);  // Adjust timeout duration if necessary

    return () => clearTimeout(timeoutHandler);  // Cleanup timeout
  }
}, [sessionTimeout]);


// Add logic to hide the avatar and .main-one div when the session ends
const endSession = async () => {
  if (!avatar.current) return;

  await avatar.current.stopAvatar();

  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
  }

  setButtonsVisible(false);
  setStream(undefined);
  setMaskVisible(false);

  // Reset videos immediately
  const avatarVideo = document.querySelector(".avatar-stream") as HTMLVideoElement;
  const backgroundVideo = document.querySelector("#main-video1") as HTMLVideoElement;
  const screensaverVideo = document.querySelector(".screensaver-video") as HTMLVideoElement;

  // Hide avatar and background videos immediately
  if (avatarVideo) avatarVideo.style.opacity = "0";
  if (backgroundVideo) backgroundVideo.style.opacity = "0";

  // Reset screensaver video instantly
  if (screensaverVideo) {
    screensaverVideo.pause();
    screensaverVideo.currentTime = 0;
    screensaverVideo.load();
    screensaverVideo.play();
  }
};


    
const showCloseSessionGif = () => {
  // Create the GIF image
  const gifImage = document.createElement("img");
  gifImage.src = "https://ounocreatstg.wpenginepowered.com/videos/Transitions.gif";
  gifImage.style.position = "absolute";
  gifImage.style.left = "0";
  gifImage.style.width = "100%";
  gifImage.style.height = "100%";
  gifImage.style.top = "0";
  gifImage.style.opacity = "1";
  gifImage.style.zIndex = "1000";

  // Append GIF to .main-up
  const mainUpDiv = document.querySelector(".main-up");
  if (mainUpDiv) {
    mainUpDiv.appendChild(gifImage);
  }

// Select the .main-one div and cast it to HTMLElement
const mainOneDiv = document.querySelector(".main-one") as HTMLElement | null;

if (mainOneDiv) {
  // Delay hiding the .main-one div by 2 seconds
  setTimeout(() => {
    mainOneDiv.style.opacity = "0"; // Hide .main-one after 2 seconds
  }, 2000);
}

  // After the GIF finishes, hide the GIF and show .main-up
  setTimeout(() => {
    if (gifImage.parentElement) {
      gifImage.parentElement.removeChild(gifImage);  // Remove the GIF
    }

// Select the .main-up element and cast it to HTMLElement
const mainUpDiv = document.querySelector(".main-up") as HTMLElement | null;

// Delay showing .main-up by 2 seconds
setTimeout(() => {
  if (mainUpDiv) {
    mainUpDiv.style.transition = "opacity 1s ease-out"; // Smooth transition for the .main-up div
    mainUpDiv.style.opacity = "1"; // Show .main-up
  }
}, 0); // 2000 milliseconds = 2 seconds


}, 4000); // Wait for the GIF to finish (4 seconds) before starting the 2-second delay
};


    useEffect(() => {
      // Ensure screensaver video restarts on component mount
      const screensaverVideo = document.querySelector(".screensaver-video") as HTMLVideoElement;
      if (screensaverVideo) {
        screensaverVideo.pause();  
        screensaverVideo.currentTime = 0; 
        screensaverVideo.load(); // Force reload
        screensaverVideo.play();
      }
    }, []);
    
    
// Function to complete session end after GIF
const completeEndSession = async () => {
  setIsEndingSession(true);  // Set session ending state to true

  const avatarVideo = document.querySelector(".avatar-stream") as HTMLVideoElement;
  const backgroundVideo = document.querySelector("#main-video1") as HTMLVideoElement;
  const mainOneDiv = document.querySelector(".main-one") as HTMLElement;

  if (avatarVideo && backgroundVideo) {
    avatarVideo.style.transition = "opacity 1s ease-out";
    backgroundVideo.style.transition = "opacity 1s ease-out";
    avatarVideo.style.opacity = "0";  // Hide the avatar video
    backgroundVideo.style.opacity = "0";  // Hide background video
  }

  if (mainOneDiv) {
    mainOneDiv.style.transition = "opacity 1s ease-out";
    mainOneDiv.style.opacity = "0";  // Hide the main div
  }

  setTimeout(async () => {
    // Complete session logic
    // You can stop the avatar and clean up other session-related states here
    setButtonsVisible(false);  // Hide buttons after session ends
  }, 1000);  // Wait for fade-out to complete before hiding the buttons
};

 

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
      <div className="main-up" style={{ height: "100%" }}>
      <video
  className="screensaver-video"
  src="https://ounocreatstg.wpenginepowered.com/videos/screensaver.mp4"
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
    opacity: "1",
    transition: "opacity 1s ease-in-out",
  }}
/>
      </div>

      {/* Avatar video and new background */}
      <div className="main-one" style={{ opacity: "0", transition: "opacity 0s ease-in-out" }}>
      <video
  id="main-video1"
  src="https://ounocreatstg.wpenginepowered.com/videos/main-video.mp4"
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
    opacity: "0", // Initially hidden
    zIndex: "10",
    maskImage: 'radial-gradient(circle at 50% 12%, transparent 130px, rgb(255, 255, 255) 180px)', 
    WebkitMaskImage: 'radial-gradient(circle at 50% 12%, transparent 130px, rgb(255, 255, 255) 180px)', 
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
              top: "330px",
              left: "50.7%",
              transform: "translate(-50%, -50%)",  // Centers the avatar on the screen
              width:"1010px",
          }}
        />
      </div>

      {/* Start session button */}
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
><Button 
          className=" w-full text-white bg-main"
          size="lg"
          onClick={startSession}
          style={{
            backgroundImage: 'url("https://ounocreatstg.wpenginepowered.com/wp-content/uploads/2025/04/Startbutton.png")',
            backgroundSize: 'cover',  // Ensure the image covers the entire button
            backgroundPosition: 'center',  // Center the image in the button
            backgroundRepeat: 'no-repeat',  // Ensure the image doesn't repeat
            backgroundColor:'transparent',
            width:'260px',
            height:'100px',
          }}
        >  
           
            </Button> </motion.div>
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
                      backgroundImage: 'url("https://ounocreatstg.wpenginepowered.com/wp-content/uploads/2025/04/Endbutton.png")',
                      backgroundSize: 'cover',  // Ensure the image covers the entire button
                      backgroundPosition: 'center',  // Center the image in the button
                      backgroundRepeat: 'no-repeat',  // Ensure the image doesn't repeat
                      backgroundColor:'transparent',
                      width:'260px',
                      height:'100px',
                    }}
                  >
                  
                  </Button> </motion.div>
                </>
              )}
            </>
          )}
        </CardBody>
      </Card>

      
    </div>
  );
}
