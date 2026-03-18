'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music as MusicIcon } from 'lucide-react';

interface MusicPlayerProps {
  audioUrl: string;
  title?: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  autoPlay?: boolean;
}

export default function MusicPlayer({ 
  audioUrl, 
  title, 
  accentColor, 
  textColor, 
  bgColor,
  autoPlay = false 
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showNotification, setShowNotification] = useState(autoPlay);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayNotification = () => {
    setShowNotification(false);
    setIsPlaying(true);
    audioRef.current?.play();
  };

  const handleDismissNotification = () => {
    setShowNotification(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const isLightBg = bgColor === '#F5EFE7' || bgColor === '#FDFBF8';

  return (
    <>
      {/* Notification auto-play */}
      {showNotification && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in"
          style={{ maxWidth: '90%', width: '400px' }}
        >
          <div 
            className="rounded-xl shadow-2xl p-4 border relative"
            style={{ 
              backgroundColor: bgColor,
              borderColor: accentColor,
              backdropFilter: 'blur(10px)'
            }}
          >
            <button
              onClick={handleDismissNotification}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
              style={{ color: textColor, opacity: 0.5 }}
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-3">
              <MusicIcon className="w-5 h-5" style={{ color: accentColor }} />
              <p className="font-medium" style={{ color: textColor }}>
                Une musique accompagne ce mémorial
              </p>
            </div>
            {title && (
              <p className="text-sm mb-3" style={{ color: textColor, opacity: 0.7 }}>
                {title}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handlePlayNotification}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: accentColor, color: isLightBg ? '#1a365d' : '#fff' }}
              >
                Écouter
              </button>
              <button
                onClick={handleDismissNotification}
                className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-70"
                style={{ 
                  border: `1px solid ${accentColor}`,
                  color: textColor
                }}
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lecteur audio */}
      <div 
        className="rounded-lg p-4"
        style={{ 
          backgroundColor: isLightBg ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
          border: `1px solid ${accentColor}30`
        }}
      >
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ backgroundColor: accentColor }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>

          <div className="flex-1">
            {title && (
              <p className="font-medium text-sm mb-1" style={{ color: textColor }}>
                {title}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1 hover:opacity-70 transition-opacity"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" style={{ color: textColor, opacity: 0.5 }} />
                ) : (
                  <Volume2 className="w-4 h-4" style={{ color: textColor, opacity: 0.5 }} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${volume * 100}%, rgba(128,128,128,0.2) ${volume * 100}%, rgba(128,128,128,0.2) 100%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${accentColor};
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${accentColor};
          cursor: pointer;
          border: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}