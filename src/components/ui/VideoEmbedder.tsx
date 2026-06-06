import React from 'react';

interface VideoEmbedderProps {
  url: string;
  className?: string;
  title?: string;
}

export function VideoEmbedder({ url, className = '', title = 'Video Player' }: VideoEmbedderProps) {
  // Regex to extract YouTube video ID
  const getYouTubeId = (urlStr: string) => {
    if (!urlStr) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = urlStr.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
