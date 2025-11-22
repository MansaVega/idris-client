
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration pour React avec support des variables d'environnement Netlify
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  const rawApiKey = env.API_KEY || process.env.API_KEY || process.env.VITE_API_KEY || '';
  const apiKey = rawApiKey.trim();

  if (!apiKey) {
    console.warn("⚠️ ATTENTION BUILD: Aucune API_KEY trouvée !");
  } else {
    console.log(`✅ SUCCÈS BUILD: API_KEY injectée.`);
  }
  
  return {
    plugins: [react()],
    base: '/',
    publicDir: 'public', // Vital : assure que le dossier public est bien copié
    build: {
      outDir: 'dist', // Doit correspondre au 'publish' de netlify.toml
      emptyOutDir: true,
      assetsDir: 'assets'
    },
    define: {
      '__APP_API_KEY__': JSON.stringify(apiKey)
    }
  }
})