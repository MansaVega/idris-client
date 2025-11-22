
import React from 'react';
import { X, Github, Key, ArrowRight, FolderInput, AlertTriangle, FileJson } from 'lucide-react';

interface RestorationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const RestorationGuide: React.FC<RestorationGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/95 backdrop-blur-md flex items-center justify-center z-50 p-4 text-stone-200">
      <div className="bg-neutral-900 border border-neutral-700 rounded-sm shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in-up scrollbar-thin scrollbar-thumb-[#e6dac3] scrollbar-track-neutral-800">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-stone-500 hover:text-[#e6dac3] transition-colors z-10"
        >
          <X size={28} />
        </button>

        <div className="p-8 md:p-12">
          <div className="border-b border-neutral-700 pb-6 mb-8">
            <h2 className="text-3xl font-serif font-bold text-[#e6dac3] mb-2 flex items-center gap-3">
              <Github className="text-[#e6dac3]" />
              Guide de Réparation (Erreur 404)
            </h2>
            <p className="text-stone-400 font-light">
              Si vous voyez "Page Not Found", c'est un problème de structure de dossier ou de fichier manquant.
            </p>
          </div>

          <div className="space-y-10">
            
            {/* ÉTAPE 1 : PRÉPARATION */}
            <div className="relative pl-8 border-l-2 border-[#e6dac3]/30">
              <div className="absolute -left-[9px] top-0 bg-neutral-900 p-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e6dac3]"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">1. Structure des dossiers (CRUCIAL)</h3>
              <div className="bg-amber-900/20 border border-amber-700/50 p-5 rounded-sm">
                <p className="text-amber-200 font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    C'est ici que se trouve l'erreur fréquente !
                </p>
                <p className="text-stone-300 mb-4">
                  Sur votre ordinateur, assurez-vous d'avoir cette structure exacte avant d'aller sur GitHub :
                </p>
                <div className="bg-black/50 p-4 rounded font-mono text-sm text-stone-300 border border-stone-700">
                    📁 idris-client <span className="text-stone-500">(Dossier principal)</span><br/>
                    │<br/>
                    ├── 📄 index.html<br/>
                    ├── 📄 package.json<br/>
                    ├── 📄 netlify.toml <span className="text-[#e6dac3] font-bold">(OBLIGATOIRE)</span><br/>
                    ├── 📁 src<br/>
                    │<br/>
                    └── 📁 public <span className="text-[#e6dac3] font-bold">(IMPORTANT : DOIT ÊTRE ICI)</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;└── 📁 media <span className="text-stone-500">(Vos photos/vidéos)</span>
                </div>
                <p className="text-sm text-stone-400 mt-3 italic">
                    Le dossier "public" ne doit pas être à côté de "idris-client", il doit être <strong>DEDANS</strong>.
                </p>
              </div>
            </div>

            {/* ÉTAPE 2 : GITHUB */}
            <div className="relative pl-8 border-l-2 border-[#e6dac3]/30">
              <div className="absolute -left-[9px] top-0 bg-neutral-900 p-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e6dac3]"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                2. Mise à jour sur GitHub
              </h3>
              
              <div className="space-y-4 text-stone-300">
                <p>Si le dossier public est mal placé sur GitHub :</p>

                <div className="flex gap-4 items-start">
                   <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-xs font-bold">1</span>
                   <p>Supprimez l'ancien dossier mal placé sur GitHub.</p>
                </div>
                <div className="flex gap-4 items-start">
                   <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-xs font-bold">2</span>
                   <p>Entrez DANS le dossier <strong>idris-client</strong> sur GitHub.</p>
                </div>
                <div className="flex gap-4 items-start">
                   <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-xs font-bold">3</span>
                   <p>Faites <strong>Add file > Upload files</strong> et glissez votre dossier <strong>public</strong> (qui contient media) ici.</p>
                </div>
              </div>
            </div>

            {/* ÉTAPE 3 : CLÉ API */}
            <div className="relative pl-8 border-l-2 border-transparent">
               <div className="absolute -left-[9px] top-0 bg-neutral-900 p-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e6dac3]"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Key size={20} className="text-[#e6dac3]" />
                3. Clé API (Rappel)
              </h3>
              <div className="bg-neutral-800/60 p-4 border border-neutral-700 rounded-sm text-sm text-stone-400">
                <p>
                  Si le site s'affiche mais que l'IA ne répond pas, vérifiez que votre clé API est bien dans <br/>
                  <strong>Site configuration > Environment variables</strong> sur Netlify sous le nom <code>API_KEY</code>.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-12 flex justify-center">
            <button 
              onClick={onClose}
              className="px-10 py-4 bg-[#e6dac3] hover:bg-white text-neutral-900 font-bold uppercase tracking-widest text-sm transition-all rounded-sm shadow-lg hover:shadow-xl hover:scale-105"
            >
              J'ai compris la structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestorationGuide;