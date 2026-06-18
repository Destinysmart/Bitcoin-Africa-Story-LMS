import React from 'react';
import { ExternalLink, Play } from 'lucide-react';

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
  
  // Format clean watch-link to open on native mobile YouTube app
  const nativeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;

  // Build high-compatibility privacy-friendly embed URL with optimal parameters 
  const getEmbedUrl = () => {
    if (!videoId) return url;
    
    const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      enablejsapi: '1',
      playsinline: '1', // Solves iOS auto-fullscreen block
    });

    // Pass parent host dynamically to authorize domain-restricted streams on Vercel
    if (typeof window !== 'undefined') {
      params.set('origin', window.location.origin);
    }

    return `${base}?${params.toString()}`;
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* Video aspect-ratio container */}
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black relative border border-white/5 shadow-inner">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin" // Forces browser to pass Vercel domain to YouTube for authorization
          className="w-full h-full border-0 absolute inset-0 z-10"
        />
      </div>

      {/* Mobile-friendly fallback & escape hatch */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-gray-400">
        <span className="flex items-center gap-1 text-[11px] opacity-75">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          Trouble playing? Try optimized options below
        </span>
        
        <a 
          href={nativeUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-brand-gold/10 hover:bg-brand-gold/[0.18] border border-brand-gold/20 hover:border-brand-gold/40 text-brand-gold font-semibold py-1 px-3 rounded-lg transition-all active:scale-97 text-[11px]"
        >
          <Play size={10} className="fill-brand-gold" />
          <span>Open in YouTube App</span>
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
