
// URL del Google Sheet publicado como CSV
const SHEET_ID = '2PACX-1vRnk3qbEvZU18stRZNNzv0puQxduRca6RSDsW-om8LNgWgPPte5LKqcTYhmPx0QiJq9k7h24o5VHFiE';

// 🚀 CACHE BUSTER ULTRA AGRESSIF
// On combine Date.now() et un nombre aléatoire pour être certain que Google ne sert pas une version cache
const getCsvUrl = () => `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv&t=${Date.now()}&r=${Math.floor(Math.random() * 10000)}`;

export interface GemData {
  [key: string]: string;
}

// Cache mémoire local pour éviter de re-télécharger pendant la même session utilisateur
let cachedGemData: GemData[] | null = null;

export const findGemstoneByReference = async (reference: string): Promise<GemData | null> => {
  try {
    let data = cachedGemData;

    // Si pas de cache local, on télécharge
    if (!data) {
      const uniqueUrl = getCsvUrl();
      console.log(`📡 Téléchargement des données fraîches (Bypass Cache)...`);
      console.log(`🔗 URL: ${uniqueUrl}`);
      
      const response = await fetch(uniqueUrl, {
        cache: "no-store", // Instruction explicite au navigateur
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur de connexion à la base de données (Status: ${response.status})`);
      }
      
      const text = await response.text();
      data = parseCSV(text);
      
      // Mise en cache pour cette session
      cachedGemData = data;
      console.log(`✅ Base de données chargée : ${data.length} articles.`);
    } else {
       console.log(`⚡ Utilisation du cache local (Session).`);
    }
    
    if (data.length === 0) return null;

    const searchRef = reference.trim().toLowerCase();

    // Identifier la colonne de référence
    const headers = Object.keys(data[0]);
    const refKey = headers.find(h => {
      const lower = h.toLowerCase();
      return lower.includes('ref') || lower.includes('lote') || lower.includes('subasta') || lower.includes('id');
    });

    const targetKey = refKey || headers[0];
    
    console.log(`Recherche de "${searchRef}" dans la colonne "${targetKey}"`);

    const gem = data.find(row => {
      const cellValue = row[targetKey]?.toString().toLowerCase().trim();
      return cellValue === searchRef;
    });

    return gem || null;
  } catch (error) {
    console.error("Erreur dans findGemstoneByReference:", error);
    throw error;
  }
};

/**
 * Parsea el texto CSV a un array de objetos JSON
 */
function parseCSV(csvText: string): GemData[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const result: GemData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length > 0 && values.some(v => v.trim() !== '')) {
      const entry: GemData = {};
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      result.push(entry);
    }
  }

  return result;
}

/**
 * Parsea una línea CSV manejando comillas y comas
 */
function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
