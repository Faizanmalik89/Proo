import React, { useEffect, useRef } from 'react';
import 'video.js/dist/video-js.css';

declare global {
  interface Window {
    videojs: any;
  }
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  height?: number | string;
  width?: number | string;
  controls?: boolean;
  autoplay?: boolean;
  options?: Record<string, any>;
}

export function VideoPlayer({
  src,
  poster,
  className = '',
  height = 360,
  width = '100%',
  controls = true,
  autoplay = false,
  options = {},
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Make sure Video.js script is loaded
    const loadVideoJs = async () => {
      if (!window.videojs) {
        const videoJsScript = document.createElement('script');
        videoJsScript.src = 'https://vjs.zencdn.net/7.20.3/video.min.js';
        videoJsScript.async = true;
        document.body.appendChild(videoJsScript);
        
        await new Promise((resolve) => {
          videoJsScript.onload = resolve;
        });
      }
      
      if (videoRef.current && !playerRef.current) {
        const videoElement = videoRef.current;
        
        // Initialize video.js
        playerRef.current = window.videojs(videoElement, {
          controls,
          autoplay,
          preload: 'auto',
          fluid: false,
          poster,
          height,
          width,
          ...options,
        });
      }
    };

    loadVideoJs();

    return () => {
      // Cleanup on unmount
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [controls, autoplay, poster, options, height, width]);

  // Update source if it changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.src({ src, type: 'video/mp4' });
    }
  }, [src]);

  return (
    <div className={className}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
        >
          <source src={src} type="video/mp4" />
          <p className="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a
            web browser that <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noreferrer">supports HTML5 video</a>
          </p>
        </video>
      </div>
    </div>
  );
}
