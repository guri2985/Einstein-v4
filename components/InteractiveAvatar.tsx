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
        knowledgeId: knowledgeId,
        voice: {
          rate: 1.5,
          emotion: VoiceEmotion.EXCITED,
        },
        language: language,
        disableIdleTimeout: true,
      });
  
      setData(res);
      await avatar.current?.startVoiceChat({
        useSilencePrompt: false,
      });
      setChatMode("voice_mode");
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  
    startSessionTransition();
  }

  // Start the session transition with GIF and fade-in effects
  const startSessionTransition = () => {
    // Create the GIF image for transition
    const gifImage = document.createElement("img");
    gifImage.src = "https://ounocreatstg.wpenginepowered.com/videos/Transitions.gif"; // Your GIF source
    gifImage.style.position = "absolute";
    gifImage.style.left = "0";
    gifImage.style.width = "100%";
    gifImage.style.height = "100%";
    gifImage.style.top = "0";
    gifImage.style.opacity = "1"; // Ensure it is visible immediately
    gifImage.style.zIndex = "1000"; // On top of everything else
  
    // Get the main container where everything will be added
    const mainUpDiv = document.querySelector(".main-up");
  
    // Append the GIF to the main-up container
    if (mainUpDiv) {
      mainUpDiv.appendChild(gifImage);
    }
  
    // Fade in effects after 2 seconds
    setTimeout(() => {
      const mainOneDiv = document.querySelector(".main-one") as HTMLElement;
      const videoBackground = document.querySelector("#main-video1") as HTMLVideoElement;
      if (mainOneDiv) mainOneDiv.style.opacity = "1"; // Fade in main video
      if (videoBackground) videoBackground.style.opacity = "1"; // Fade in background video
    }, 3000);
  
    // Remove GIF after 4 seconds and show buttons after the GIF
    setTimeout(() => {
      if (gifImage.parentElement) {
        gifImage.parentElement.removeChild(gifImage); // Remove GIF after it plays once
      }
      // Delay showing the buttons
      setButtonsVisible(true); // Show buttons after GIF removal
    }, 4000);
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


  
    // Function to show GIF on close session
    const showCloseSessionGif = () => {
      // Create the GIF image for transition
      const gifImage = document.createElement("img");
      gifImage.src = "https://ounocreatstg.wpenginepowered.com/videos/Transitions.gif"; // Your GIF source
      gifImage.style.position = "absolute";
      gifImage.style.left = "0";
      gifImage.style.width = "100%";
      gifImage.style.height = "100%";
      gifImage.style.top = "0";
      gifImage.style.opacity = "1"; // Ensure it is visible immediately
      gifImage.style.zIndex = "1000"; // On top of everything else
    
      // Get the main container where everything will be added
      const mainUpDiv = document.querySelector(".main-up");
    
      // Append the GIF to the main-up container
      if (mainUpDiv) {
        mainUpDiv.appendChild(gifImage);
      }
    
      // Remove GIF after 4 seconds and trigger session end
      setTimeout(() => {
        if (gifImage.parentElement) {
          gifImage.parentElement.removeChild(gifImage); // Remove GIF after it plays once
        }
        // Proceed with ending the session
        completeEndSession();
      }, 4000);
    };


    async function endSession() {
      if (!avatar.current) return;
    
      if (stream) {
        setButtonsVisible(false); // Instantly hide the End Session button
        showCloseSessionGif(); // Show the GIF transition
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 4 seconds
        completeEndSession(); // End the session after the GIF transition
      }
    }
    

   


    // Function to complete session end after GIF
    async function completeEndSession() {
      if (!avatar.current) return;
    
      // Start the fade-out effect on avatar and background videos
      const avatarVideo = document.querySelector(".avatar-stream") as HTMLVideoElement;
      const backgroundVideo = document.querySelector("#main-video1") as HTMLVideoElement;
      const mainOneDiv = document.querySelector(".main-one") as HTMLElement;
    
      if (avatarVideo && backgroundVideo) {
        avatarVideo.style.transition = "opacity 0s ease-out";
        backgroundVideo.style.transition = "opacity 0s ease-out";
        avatarVideo.style.opacity = "0";
        backgroundVideo.style.opacity = "0";
      }
    
      if (mainOneDiv) {
        mainOneDiv.style.transition = "opacity 0s ease-out";
        mainOneDiv.style.opacity = "0";
      }
    
      setTimeout(async () => {
        await avatar.current?.stopAvatar();
        setStream(undefined);
        setMaskVisible(false);
    
        // Show Start Session button after 2 seconds
        setTimeout(() => {
          setButtonsVisible(true);
        }, 1000);
    
      }, 1000);
    }
    
    
 

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
    maskImage: 'radial-gradient(circle at 50% 12%, transparent 160px, rgb(255, 255, 255) 180px)', 
    WebkitMaskImage: 'radial-gradient(circle at 50% 12%, transparent 160px, rgb(255, 255, 255) 180px)', 
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
              top: "332px",
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
            initial={{ scale: .1, opacity: 1 }}
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
            <Spinner color="default" size="lg" />
          ) : (
            <>
              {buttonsVisible && (
                <>
                 
                  <Button
                    className="bg-main"
                    size="lg"
                    onClick={endSession}
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
                  
                  </Button>
                </>
              )}
            </>
          )}
        </CardBody>
      </Card>

      
    </div>
  );
}
