
import React, { useState } from 'react';
import { Search, Loader2, HelpCircle } from 'lucide-react';
import { findGemstoneByReference } from './services/sheetService';
import { generateGemstoneDescription } from './services/geminiService';
import GemCard from './components/GemCard';
import RestorationGuide from './components/RestorationGuide';

// ----------------------------------------------------------------------
// 🟢 CONFIGURATION DES MÉDIAS (NETLIFY)
// ----------------------------------------------------------------------
// Les fichiers doivent être dans le dossier 'public/media' sur GitHub.
const MEDIA_BASE_URL = "/media/"; 
const HARDCODED_LOGO_URL = "/media/logoidris.png"; 

interface IdrisLogoProps {
  customUrl?: string;
}

const IdrisLogo: React.FC<IdrisLogoProps> = ({ customUrl }) => {
  const [imgError, setImgError] = useState(false);
  const urlToUse = customUrl || HARDCODED_LOGO_URL;

  if (urlToUse && !imgError) {
    return (
      <div className="mb-6 w-40 h-40 relative flex items-center justify-center">
        <img 
          src={urlToUse}
          alt="Logo IDRIS" 
          className="w-full h-full object-contain drop-shadow-2xl"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-col items-center justify-center p-6 border-4 border-double border-[#e6dac3] rounded-full w-40 h-40 bg-neutral-900 shadow-xl animate-fade-in-up">
        <h2 className="font-serif text-3xl font-bold text-[#e6dac3] tracking-widest">IDRIS</h2>
    </div>
  );
};

const App: React.FC = () => {
  const [reference, setReference] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [gemImage, setGemImage] = useState<string | null>(null);
  const [gemVideo, setGemVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;

    // Reset
    setIsSearching(true);
    setError(null);
    setResult(null);
    setGemImage(null);
    setGemVideo(null);
    setIsAiLoading(false);

    try {
      // 1. RECHERCHE CSV
      const gemData = await findGemstoneByReference(reference);
      
      if (!gemData) {
        throw new Error(`Aucune gemme trouvée avec la référence "${reference}".`);
      }

      console.log("🔍 Données :", gemData);
      const keys = Object.keys(gemData);

      // 2. EXTRACTION MÉDIAS (IMAGE & VIDÉO)
      
      // -- Image --
      let foundImageUrl: string | null = null;
      
      // On cherche d'abord si une colonne contient le nom du fichier
      const imgKeys = keys.filter(k => {
        const n = k.toLowerCase();
        return n.includes('img') || n.includes('photo') || n.includes('image');
      });

      for (const key of imgKeys) {
        if (gemData[key] && gemData[key].trim() !== '') {
          let rawLink = gemData[key].split(',')[0].trim();
          // Si c'est juste un nom de fichier (ex: "rubis1"), on ajoute l'extension et le chemin
          if (!rawLink.startsWith('http')) {
             if (!rawLink.includes('.')) rawLink += '.jpg';
             rawLink = `${MEDIA_BASE_URL}${rawLink}`;
          }
          foundImageUrl = rawLink;
          break;
        }
      }

      // Fallback : Si pas de colonne image, on utilise la référence (ex: 2976.jpg)
      if (!foundImageUrl) {
        const cleanRef = reference.trim();
        foundImageUrl = `${MEDIA_BASE_URL}${cleanRef}.jpg`;
      }
      
      // Cache buster pour éviter les problèmes de cache navigateur
      const timestamp = new Date().getTime();
      setGemImage(`${foundImageUrl}?t=${timestamp}`);

      // -- Vidéo --
      // On suppose que la vidéo a le même nom que l'image mais en .mp4
      // Ex: /media/2976.jpg -> /media/2976.mp4
      let baseVideoUrl = foundImageUrl.replace(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i, '.mp4');
      
      // Sécurité si l'extension n'a pas été remplacée
      if (!baseVideoUrl.toLowerCase().includes('.mp4')) {
         baseVideoUrl = foundImageUrl.split('?')[0] + '.mp4';
      }
      
      setGemVideo(baseVideoUrl);

      setIsSearching(false);
      setIsAiLoading(true);

      // 3. GÉNÉRATION IA
      try {
        const description = await generateGemstoneDescription(gemData);
        setResult(description);
      } catch (aiErr: any) {
        console.error("AI Error", aiErr);
        setResult("Fiche technique indisponible momentanément.");
        
        // Si l'erreur concerne la clé API, on ouvre le guide d'aide
        if (aiErr.message && (aiErr.message.includes("Clé API") || aiErr.message.includes("API key"))) {
            setError("Configuration API requise. Ouverture du guide...");
            setIsGuideOpen(true);
        }
      } finally {
        setIsAiLoading(false);
      }
      
    } catch (err: any) {
      console.error("Search Error:", err);
      setError(err.message);
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 flex flex-col items-center py-12 px-4 font-sans relative">
      
      <RestorationGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <header className="mb-8 text-center flex flex-col items-center w-full max-w-2xl mx-auto">
        <IdrisLogo />
        <h1 className="text-3xl md:text-4xl font-bold tracking-[0.15em] text-neutral-900 uppercase mb-2 font-serif">
          IDRIS GEMAS
        </h1>
        <div className="w-16 h-0.5 bg-[#e6dac3] mt-2"></div>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        {/* BARRE DE RECHERCHE */}
        <div className="bg-white p-6 rounded-sm shadow-lg border border-stone-200 max-w-xl mx-auto relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-neutral-900"></div>
          
          <form onSubmit={handleSearch} className="relative">
            <label htmlFor="reference" className="block text-xs font-bold text-neutral-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
              <Search size={12} className="text-[#e6dac3]" />
              Referencia Certificado / Lote
            </label>
            <div className="relative flex items-center">
              <input
                id="reference"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="EX: 2976"
                className="block w-full pl-4 pr-14 py-3 bg-stone-50 text-neutral-900 font-bold text-lg border border-stone-300 rounded-none focus:ring-0 focus:border-neutral-900 focus:bg-white transition-all placeholder-stone-300"
              />
              <button
                type="submit"
                disabled={isSearching || !reference.trim()}
                className="absolute right-1 top-1 bottom-1 aspect-square bg-neutral-900 text-[#e6dac3] rounded-none hover:bg-black disabled:bg-stone-300 disabled:text-stone-400 transition-all flex items-center justify-center"
              >
                {isSearching ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Search size={20} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </form>
          
          {error && (
             <div className="mt-4 p-3 bg-red-50 text-red-900 text-xs border-l-2 border-red-900 flex items-center font-medium">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
             </div>
          )}
        </div>

        {/* RÉSULTAT */}
        {(gemImage || result || isAiLoading) && !isSearching && !error && (
          <div>
            <GemCard 
              content={result || ''} 
              imageUrl={gemImage} 
              videoUrl={gemVideo}
              isAiLoading={isAiLoading}
              reference={reference}
            />
          </div>
        )}
      </main>
      
      <footer className="mt-auto pt-16 flex flex-col items-center pb-8 opacity-60 relative w-full">
        <div className="text-stone-500 text-[10px] font-bold tracking-[0.2em] uppercase">
          &copy; {new Date().getFullYear()} IDRIS GEMAS
        </div>
        
        {/* Bouton d'aide discret pour l'admin/développeur */}
        <button 
          onClick={() => setIsGuideOpen(true)}
          className="absolute right-0 bottom-0 p-4 text-stone-300 hover:text-[#e6dac3] transition-colors"
          title="Ouvrir le guide de configuration"
        >
          <HelpCircle size={18} />
        </button>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
