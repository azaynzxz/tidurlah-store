import { useState, useRef, useEffect } from "react";
import { Music } from "lucide-react";

// Use the file from the public directory which will be available in production
const audioPath = "/audio/Tidurlah Grafika.mp3";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(audioPath);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5; // Set volume to 50%
    
    // Clean up
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Modern browsers require user interaction for auto-play
        audioRef.current.play().catch(err => {
          console.error("Failed to play audio:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <button
      onClick={togglePlay}
      className="relative p-2 mx-2"
      aria-label={isPlaying ? "Mute music" : "Play music"}
      title="Toggle background music"
    >
      {isPlaying ? (
        <Music className="h-6 w-6 text-[#FF5E01]" />
      ) : (
        <div className="relative flex items-center justify-center">
          <Music className="h-6 w-6 text-[#FF5E01] opacity-70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-0.5 bg-[#FF5E01] -rotate-45 transform" />
          </div>
        </div>
      )}
    </button>
  );
};

export default MusicPlayer; 