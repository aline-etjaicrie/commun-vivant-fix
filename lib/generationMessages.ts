// Messages humanisés pour la génération du texte

export const GENERATION_MESSAGES = {
  loading: "Quelques instants pour trouver les mots justes...",
  success: "Voici le texte que nous vous proposons. Vous pourrez le modifier à tout moment.",
  error: "Nous n'avons pas pu générer le texte. Veuillez réessayer dans quelques instants."
};

// Exemple d'utilisation dans votre composant :

/*
const [isGenerating, setIsGenerating] = useState(false);
const [generatedText, setGeneratedText] = useState('');
const [error, setError] = useState('');

const generateText = async () => {
  setIsGenerating(true);
  setError('');
  
  try {
    const response = await fetch('/api/generate-memorial', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(GENERATION_MESSAGES.error);
    }
    
    const result = await response.json();
    setGeneratedText(result.text);
    
  } catch (err) {
    setError(GENERATION_MESSAGES.error);
  } finally {
    setIsGenerating(false);
  }
};

// Dans le JSX :

{isGenerating && (
  <div className="flex items-center gap-3 text-memoir-dark/70">
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <span>{GENERATION_MESSAGES.loading}</span>
  </div>
)}

{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
    {error}
  </div>
)}

{generatedText && !isGenerating && (
  <div className="space-y-4">
    <p className="text-memoir-dark/60 italic text-sm">
      {GENERATION_MESSAGES.success}
    </p>
    <div className="prose max-w-none">
      {generatedText}
    </div>
  </div>
)}
*/
