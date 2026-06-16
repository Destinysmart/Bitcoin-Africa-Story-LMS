import React from 'react';

interface VideoEmbedderProps {
  url: string;
  className?: string;
  title?: string;
}

export function VideoEmbedder({ url, className = '', title = 'Video Player' }: VideoEmbedderProps) {
  // Regex to extract YouTube video ID with advanced query parameter and raw ID support
  const getYouTubeId = (urlStr: string) => {
    if (!urlStr) return null;
    const trimmed = urlStr.trim();
    
    // Check if the input is already a raw 11-char YouTube ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    
    // Match standard watch, shorts, embed, or youtu.be links
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
    const match = trimmed.match(regExp);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(url);
  
  // Fallback to the original URL if it's not a recognized YouTube pattern (e.g. valid embed url or other source)
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;

  return (
    <div className={`aspect-video w-full rounded-xl overflow-hidden bg-black relative ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}
