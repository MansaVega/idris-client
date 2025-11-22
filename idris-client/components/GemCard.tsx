
import React, { useState, useEffect, useRef } from 'react';
import { ImageOff, Sparkles, PlayCircle, FileText } from 'lucide-react';

interface GemCardProps {
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isAiLoading?: boolean;
  reference?: string;
}

const GemCard: React.FC<GemCardProps> = ({ content, imageUrl, videoUrl, isAiLoading = false, reference }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset des erreurs quand l'image change
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  // Reset des erreurs quand la vidéo change
  useEffect(() => {
    setVideoError(false);
  }, [videoUrl]);

  // Auto-play silencieux
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.defaultMuted = true;
        videoRef.current.muted = true;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay bloqué par le navigateur (normal si pas d'interaction)
          });
        }
    }
  }, [videoUrl]);

  // Helper pour nettoyer le texte
  const getCleanContent = (rawContent: string) => {
    let clean = rawContent.trim();
    if (clean.includes('[[START]]')) {
      clean = clean.split('[[START]]')[1].trim();
    }
    clean = clean.replace(/\[\[END\]\]/g, '').replace(/```/g, '');
    return clean.trim();
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse opacity-60 p-5">
      <div className="h-5 bg-stone-200 rounded w-1/2 mx-auto mb-6"></div>
      <div className="space-y-2">
        <div className="h-2.5 bg-stone-200 rounded w-3/4"></div>
        <div className="h-2.5 bg-stone-200 rounded w-5/6"></div>
        <div className="h-2.5 bg-stone-200 rounded w-2/3"></div>
        <div className="h-2.5 bg-stone-200 rounded w-4/5"></div>
      </div>
      <div className="flex items-center justify-center mt-6 gap-2 text-stone-400 text-[10px] uppercase tracking-widest">
        <Sparkles size={12} className="animate-spin-slow" />
        <span>Analyse gemmologique en cours...</span>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isAiLoading) return renderLoadingSkeleton();
    if (!content) return null;

    const finalContent = getCleanContent(content);
    const lines = finalContent.split('\n').filter(line => line.trim() !== '');
    const titleLine = lines[0];
    const detailsLines = lines.slice(1);

    return (
      <div className="p-6 md:p-10">
        <div className="mb-6 pb-4 border-b border-stone-200 text-center">
           <h2 className="font-serif font-bold text-neutral-900 text-2xl md:text-3xl uppercase tracking-wide leading-tight">
             {titleLine && titleLine.replace(/\*/g, '')}
           </h2>
        </div>
        <div className="space-y-2">
          {detailsLines.map((line, i) => {
            const trimmedLine = line.trim().replace(/\*/g, '');
            if (!trimmedLine) return null;
            return (
              <div key={i} className="flex items-start text-stone-800 font-medium text-base md:text-lg pl-3 border-l-2 border-transparent hover:border-[#e6dac3] transition-colors py-1">
                <span className="leading-relaxed">{trimmedLine}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-white shadow-xl shadow-stone-300/30 overflow-hidden rounded-sm border-t-4 border-neutral-900">
        
        {/* HEADER */}
        <div className="bg-neutral-900 px-4 py-3 flex flex-col items-center justify-center gap-1 border-b border-stone-800">
            <div className="flex items-center gap-2">
                <FileText className="text-[#e6dac3]" size={18} />
                <h3 className="font-serif text-base md:text-lg font-bold tracking-[0.15em] text-[#e6dac3] uppercase text-center">
                  REPORTE GEMOLÓGICO
                </h3>
            </div>
            <div className="flex items-center gap-3 opacity-90">
                <span className="h-px w-6 bg-stone-600"></span>
                <span className="text-stone-300 text-[10px] font-bold uppercase tracking-[0.25em]">
                    REF. {reference || '---'}
                </span>
                <span className="h-px w-6 bg-stone-600"></span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 bg-stone-100 border-b border-stone-200">
          
          {/* IMAGE */}
          <div className="relative w-full h-64 md:h-80 flex items-center justify-center overflow-hidden bg-white border-b md:border-b-0 md:border-r border-stone-200 group">
            {imageUrl && !imageError ? (
              <img 
                src={imageUrl} 
                alt="Pierre précieuse"
                loading="eager"
                className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-400">
                 <ImageOff size={20} className="opacity-50 mb-2" />
                 <span className="text-[10px] uppercase tracking-widest">Image non disponible</span>
              </div>
            )}
          </div>

          {/* VIDEO PLAYER (LOCAL / NETLIFY) */}
          <div className="relative w-full h-64 md:h-80 flex items-center justify-center bg-stone-900 overflow-hidden">
             {videoUrl && !videoError ? (
                <video 
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  autoPlay
                  loop
                  muted
                  onError={() => {
                      console.warn("Video loading error", videoUrl);
                      setVideoError(true);
                  }}
                />
             ) : (
                <div className="flex flex-col items-center justify-center">
                    <PlayCircle size={20} className="text-stone-600 mb-2 opacity-50" />
                    <span className="text-[10px] text-stone-500 uppercase tracking-widest">Vidéo non disponible</span>
                </div>
             )}
          </div>
        </div>

        <div className="bg-white font-sans min-h-[150px]">
          {renderContent()}
        </div>

        <div className="h-1 w-full bg-[#e6dac3]"></div>
      </div>
    </div>
  );
};

export default GemCard;
