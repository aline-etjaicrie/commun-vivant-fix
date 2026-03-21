'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Lightbulb, X, RotateCcw } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { buildFinalizationPayloadFromAlma, persistFinalizationPayload } from '@/lib/memorialFinalizationAdapter';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'recap'; // For recap messages
}

interface AlmaChatProps {
  userName?: string;
  context?: 'funeral' | 'living_story' | 'object_memory' | 'feter' | 'transmettre' | 'honorer';
  onSuggestion?: (suggestion: string) => void;
  genre?: 'Elle' | 'Il' | 'Sans genre spécifié';
  subjectName?: string;
  age?: number;
  storageNamespace?: 'dev';
  previewPath?: string;
  questionnairePath?: string;
  communType?: string;
}

const ADJECTIVE_MAPPING: Record<string, { m: string, f: string, n: string }> = {
  // ... existing mapping (it's outside the component so it stays) ...
  'discret·e': { m: 'Il était discret', f: 'Elle était discrète', n: 'C\'était quelqu\'un de discret' },
  'généreux·se': { m: 'Il était généreux', f: 'Elle était généreuse', n: 'C\'était quelqu\'un de généreux' },
  'drôle': { m: 'Il était très drôle', f: 'Elle était très drôle', n: 'C\'était quelqu\'un de très drôle' },
  'engagé·e': { m: 'Il était engagé', f: 'Elle était engagée', n: 'C\'était quelqu\'un d\'engagé' },
  'réservé·e': { m: 'Il était réservé', f: 'Elle était réservée', n: 'C\'était quelqu\'un de réservé' },
  'passionné·e': { m: 'Il était passionné', f: 'Elle était passionnée', n: 'C\'était quelqu\'un de passionné' },
  'libre': { m: 'Il était libre', f: 'Elle était libre', n: 'C\'était un esprit libre' },
  'protecteur·rice': { m: 'Il était protecteur', f: 'Elle était protectrice', n: 'C\'était quelqu\'un de protecteur' },
  'créatif·ve': { m: 'Il était créatif', f: 'Elle était créative', n: 'C\'était quelqu\'un de créatif' },
  'pragmatique': { m: 'Il était pragmatique', f: 'Elle était pragmatique', n: 'C\'était quelqu\'un de pragmatique' },
  'curieux·se': { m: 'Il était curieux', f: 'Elle était curieuse', n: 'C\'était quelqu\'un de curieux' },
  'patient·e': { m: 'Il était patient', f: 'Elle était patiente', n: 'C\'était quelqu\'un de patient' },
  'exigeant·e': { m: 'Il était exigeant', f: 'Elle était exigeante', n: 'C\'était quelqu\'un d\'exigeant' },
  'tendre': { m: 'Il était tendre', f: 'Elle était tendre', n: 'C\'était quelqu\'un de tendre' },
  'entier·e': { m: 'Il était entier', f: 'Elle était entière', n: 'C\'était quelqu\'un d\'entier' },
  'solaire': { m: 'Il était solaire', f: 'Elle était solaire', n: 'C\'était une personnalité solaire' },
  'pudique': { m: 'Il était pudique', f: 'Elle était pudique', n: 'C\'était quelqu\'un de pudique' },
  'audacieux·se': { m: 'Il était audacieux', f: 'Elle était audacieuse', n: 'C\'était quelqu\'un d\'audacieux' },
  'calme': { m: 'Il était calme', f: 'Elle était calme', n: 'C\'était quelqu\'un de calme' },
  'énergique': { m: 'Il était énergique', f: 'Elle était énergique', n: 'C\'était quelqu\'un d\'énergique' },
  'rassurant·e': { m: 'Il était rassurant', f: 'Elle était rassurante', n: 'C\'était quelqu\'un de rassurant' },
  'indépendant·e': { m: 'Il était indépendant', f: 'Elle était indépendante', n: 'C\'était quelqu\'un d\'indépendant' },
  'sportif·ve': { m: 'Il était sportif', f: 'Elle était sportive', n: 'C\'était quelqu\'un de sportif' },
};

const QUICK_TAG_CLASS = "text-xs px-3 py-1.5 bg-white text-memoir-blue/80 rounded-lg border border-memoir-gold/10 hover:border-memoir-gold hover:text-memoir-gold transition-all text-left shadow-sm";

export default function AlmaChat({
  userName,
  context = 'honorer',
  genre,
  onSuggestion,
  subjectName,
  age,
  storageNamespace,
  previewPath = '/alma/apercu',
  questionnairePath = '/create/questionnaire',
  communType,
}: AlmaChatProps) {
  const getValidatedThemes = () => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('image_themes') || localStorage.getItem('memory_image_energies');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((v) => String(v).trim()).filter(Boolean).slice(0, 12);
    } catch {
      return [];
    }
  };

  const isIsolated = storageNamespace === 'dev';
  const conversationKey = `almaConversation_${isIsolated ? `dev_${context}` : context}`;
  const collectedInfoByContextKey = `almaCollectedInfo_${isIsolated ? `dev_${context}` : context}`;
  const teaserTextKey = isIsolated ? 'alma_teaser_text_dev' : 'alma_teaser_text';
  const almaContextKey = isIsolated ? 'alma_context_dev' : 'alma_context';
  const almaSubjectKey = isIsolated ? 'alma_subject_name_dev' : 'alma_subject_name';
  const almaGenreKey = isIsolated ? 'alma_genre_dev' : 'alma_genre';
  const almaCollectedInfoKey = isIsolated ? 'alma_collected_info_dev' : 'alma_collected_info';
  const almaStyleKey = isIsolated ? 'alma_preferred_style_dev' : 'alma_preferred_style';
  const almaPrefillKey = isIsolated ? 'alma_prefill_dev' : 'alma_prefill';
  const almaCommunTypeKey = isIsolated ? 'alma_commun_type_dev' : 'alma_commun_type';
  // Map legacy contexts to new ones for internal consistency if needed, or handle all variations
  // 'funeral' -> 'honorer'
  // 'living_story' -> 'feter'
  // 'object_memory' -> 'transmettre'

  const getSuggestions = () => {
    const isObject = context === 'object_memory' || context === 'transmettre';
    const isLiving = context === 'living_story' || context === 'feter';

    if (isObject) {
      return {
        adjectifs: ["Patine ancienne", "Design moderne", "Fait main", "Bois massif", "Héritage familial", "Trouvaille de brocante", "Objet de voyage", "Souvenir d'enfance"],
        valeurs: ["La transmission", "Le sens du beau", "L'artisanat", "L'histoire des lieux", "La solidité", "La nostalgie", "Le quotidien", "La rareté"].map(v => `Cet objet représente : ${v}`),
        passions: ["Décorer", "Raconter une époque", "Habiter l'espace", "Servir tous les jours", "Être contemplé", "Traverser le temps"].map(v => `L'objet sert à ${v.toLowerCase()}`),
        souvenirs: ["Il était dans le salon de mes grands-parents", "Je l'ai reçu pour mes 20 ans", "Il a une fissure qui raconte son histoire", "Il sent bon la cire", "Il ne nous quitte jamais"].map(v => `Souvenir de l'objet : ${v}`)
      };
    }

    const isFem = genre === 'Elle';
    const isMasc = genre === 'Il';
    const genderKey = isFem ? 'f' : isMasc ? 'm' : 'n';

    const adjectifs = Object.values(ADJECTIVE_MAPPING).map(v => {
      let text = v[genderKey];
      if (isLiving) {
        text = text.replace('était', 'est').replace("C'était", "C'est");
      }
      return text;
    });

    const subject = isFem ? 'Elle' : isMasc ? 'Il' : 'Cette personne';
    const object = isFem ? 'elle' : isMasc ? 'lui' : 'elle/lui';
    const passionVerb = isLiving ? 'aime' : 'aimait';

    return {
      adjectifs,
      valeurs: ["La famille avant tout", "La valeur travail", "L'honnêteté", "La fidélité en amitié", "Le respect des autres", "La transmission", "La simplicité", "La justice", "L'entraide"].map(v => `Pour ${object}, c'${isLiving ? 'est' : 'était'} important : ${v}`),
      passions: ["Le sport", "La musique", "Les voyages", "Jardiner", "Cuisiner pour les autres", "La lecture", "La nature", "La mer", "La montagne", "Bricoler", "Les animaux", "L'histoire", "Le cinéma"].map(v => `${subject} ${passionVerb} passionnément ${v.toLowerCase()}`),
      souvenirs: ["Chaque jour est une aventure", "Son rire est contagieux", "Ses expressions cultes", "Les repas de famille", "Nos vacances ensemble"].map(v => {
        let s = v;
        if (!isLiving) {
          s = s.replace('est', 'était').replace('Chaque jour est', 'C\'était');
        }
        if (isFem) s = s.replace('Il/Elle', 'Elle').replace('Il', 'Elle');
        else if (isMasc) s = s.replace('Il/Elle', 'Il');
        else s = s.replace('Il/Elle', 'Cette personne');
        return `Je me souviens de ça : ${s}`;
      })
    };
  };

  const suggestions = getSuggestions();

  const [internalUserName, setInternalUserName] = useState(userName);

  const [messages, setMessages] = useState<Message[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Charger la conversation sauvegardée au démarrage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(conversationKey); // Save per context
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const restoredMessages = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          setMessages(restoredMessages);
          setHasInitialized(true);
          return;
        } catch (e) {
          console.error('Erreur chargement conversation ALMA');
        }
      }
    }

    // New logic for initial greeting based on context
    const getWelcomeMessage = (ctx: string) => {
      // Map old contexts to new logic
      if (ctx === 'living_story') ctx = 'feter';
      if (ctx === 'object_memory') ctx = 'transmettre';
      if (ctx === 'funeral') ctx = 'honorer';

      const messages: Record<string, string> = {
        feter: "Bonjour ! Je m'appelle Alma 🌟. Je vais t'aider à raconter l'histoire de cette personne que tu veux célébrer. Dis-moi, qui veux-tu mettre à l'honneur aujourd'hui ?",
        transmettre: "Bonjour ! Je m'appelle Alma 📖. Je vais t'aider à transmettre cette mémoire précieuse. Qu'aimerais-tu raconter ? Une personne chère ? Un objet de famille ?",
        honorer: "Bonjour ! Je m'appelle Alma 🕊️. Je suis là pour t'accompagner avec douceur dans ce moment. Parle-moi de cette personne que tu souhaites honorer..."
      };
      return messages[ctx] || messages['honorer'];
    };

    setMessages([
      {
        role: 'assistant',
        content: getWelcomeMessage(context),
        timestamp: new Date(),
      }
    ]);
    setHasInitialized(true);
  }, [context, conversationKey]);

  const [questionsCount, setQuestionsCount] = useState(0);
  const MAX_QUESTIONS = 6;
  const MIN_USER_MESSAGES = 3; // Minimum matière avant de pouvoir finir
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [styleSelectionError, setStyleSelectionError] = useState(''); // Nouveau: suivi erreur validation style
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // State for collected information
  const [collectedInfo, setCollectedInfo] = useState<Record<string, any>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(collectedInfoByContextKey);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(collectedInfoByContextKey, JSON.stringify(collectedInfo));
  }, [collectedInfo, collectedInfoByContextKey]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // IMPORTANT: If waiting for style, handle it separately
    if (isWaitingForStyle) {
      const styleInput = input;
      setInput('');
      await handleStyleSelection(styleInput);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Optimistic update
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    localStorage.setItem(conversationKey, JSON.stringify(newHistory));

    setInput('');
    setIsLoading(true);

    try {
      // 1. Analyser la réponse avec l'API dédiée
      const analysisResponse = await fetch('/api/alma/analyze-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userResponse: userMessage.content,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
          collectedInfo: collectedInfo,
          context: context,
          communType,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Erreur analyse réponse');
      }

      const analysis = await analysisResponse.json();
      console.log('🧠 Analyse ALMA:', analysis);

      // 2. Mettre à jour les infos collectées
      if (analysis.extractedInfo) {
        setCollectedInfo(prev => {
          const updated = { ...prev, ...analysis.extractedInfo };
          // Check for user name update specifically
          if (analysis.extractedInfo.firstname && !internalUserName) {
            setInternalUserName(analysis.extractedInfo.firstname);
          }
          return updated;
        });
      }

      // 3. Déterminer la réponse d'Alma
      // Si l'IA propose une question suivante pertinente, on l'utilise.
      // Sinon, on fallback sur l'ancienne logique (qui est moins "intelligente" mais sûre).

      let almaReply = analysis.nextQuestion;

      if (!almaReply || analysis.confidence < 0.5) {
        // Fallback si l'analyseur est perdu : on appelle le chat "classique"
        const chatResponse = await fetch('/api/alma', {
          method: 'POST',
          body: JSON.stringify({
            message: userMessage.content,
            conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
            context,
            communType,
            subjectName,
            userName: internalUserName,
            validatedThemes: getValidatedThemes(),
          })
        });
        const chatData = await chatResponse.json();
        almaReply = chatData.message;
      }


      const assistantMessage: Message = {
        role: 'assistant',
        content: almaReply || "Je vous écoute. Continuez...",
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        localStorage.setItem(conversationKey, JSON.stringify(updated));
        return updated;
      });

      // Gestion du compteur pour le recap (tous les 4 échanges environ)
      setQuestionsCount(prev => prev + 1);

      const newCount = userMessageCount + 1;
      setUserMessageCount(newCount);

      // Si on atteint le max, déclencher la fin
      if (newCount >= MAX_QUESTIONS) {
        // Laisser Alma répondre une dernière fois, puis rediriger
        setTimeout(() => {
          handleFinish();
        }, 3000);
        return; // Ne pas continuer la logique normale
      }

      // Auto-recap logic if needed could be integrated here or kept separate
      // For now, relying on the 'analyze-response' to guide the flow is better.
      // If questionsCount % 4 === 0, we could force a recap intent in the NEXT turn.

    } catch (error) {
      console.error('❌ Erreur ALMA Smart Loop:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Je suis désolée, j'ai eu un petit moment d'absence. Pouvez-vous répéter ?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSend = (text: string) => {
    if (isWaitingForStyle) {
      handleStyleSelection(text);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    // Optimistic update
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    localStorage.setItem(conversationKey, JSON.stringify(newHistory));

    setInput('');
    setIsLoading(true);

    (async () => {
      try {
        const analysisResponse = await fetch('/api/alma/analyze-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userResponse: userMessage.content,
            conversationHistory: messages.slice(-5),
            collectedInfo: collectedInfo,
            context,
            communType,
          })
        });

        if (!analysisResponse.ok) throw new Error('Erreur analyse QuickSend');

        const analysis = await analysisResponse.json();

        // Update collected info
        if (analysis.extractedInfo) {
          setCollectedInfo(prev => {
            const updated = { ...prev, ...analysis.extractedInfo };
            if (analysis.extractedInfo.firstname && !internalUserName) {
              setInternalUserName(analysis.extractedInfo.firstname);
            }
            return updated;
          });
        }

        let almaReply = analysis.nextQuestion;
        // Fallback logic
        if (!almaReply || analysis.confidence < 0.5) {
          const chatResponse = await fetch('/api/alma', {
            method: 'POST',
            body: JSON.stringify({
              message: text,
              conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
              context,
              communType,
              subjectName,
              userName: internalUserName,
              validatedThemes: getValidatedThemes(),
            })
          });
          const chatData = await chatResponse.json();
          almaReply = chatData.message;
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: almaReply || "Merci.",
          timestamp: new Date(),
        };

        setMessages(prev => {
          const updated = [...prev, assistantMessage];
          localStorage.setItem(conversationKey, JSON.stringify(updated));
          return updated;
        });

        setQuestionsCount(prev => prev + 1);

        if (onSuggestion) onSuggestion(assistantMessage.content);

      } catch (error) {
        console.error('Erreur ALMA QuickSend:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // State for style selection
  const [isWaitingForStyle, setIsWaitingForStyle] = useState(false);

  const handleFinish = async () => {
    // GARDE-FOU 1: Vérifier matière minimale
    if (userMessageCount < MIN_USER_MESSAGES) {
      const remaining = MIN_USER_MESSAGES - userMessageCount;
      const msg: Message = {
        role: 'assistant',
        content: `Je vous remercie pour ce début. 😊\n\nIl me manque encore ${remaining} ${remaining === 1 ? 'élément' : 'éléments'} pour rédiger une base fidèle.\n\nPouvez-vous partager :\n• Un souvenir ou anecdote\n• Un trait de caractère marquant\n• Quelque chose qui tenait à cœur\n\nEnsuite, je vous demanderai de choisir le ton, et nous pourrons générer votre aperçu.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, msg]);
      localStorage.setItem(conversationKey, JSON.stringify([...messages, msg]));
      return;
    }

    if (isLoading || isFinishing || isWaitingForStyle) return;

    setIsFinishing(true);
    setStyleSelectionError('');

    // 1. Acknowledge user finish
    const userMsg: Message = {
      role: 'user',
      content: "J'ai tout dit pour le moment.",
      timestamp: new Date(),
    };

    // 2. Ask for style preference with clearer wording
    const almaMsg: Message = {
      role: 'assistant',
      content: "Merci pour ce partage si riche. 💝\n\nAvant de générer votre aperçu, j'aimerais que vous confirmiez le ton. Quel style vous parle ?\n\n• 🕯️ Poétique et émouvant\n• 📖 Sobre et factuel\n• 🏡 Chaleureux et familial",
      timestamp: new Date(),
    };

    const alreadyPromptedForStyle = messages.some(
      (message) => message.role === 'assistant' && message.content === almaMsg.content
    );

    if (alreadyPromptedForStyle) {
      setIsFinishing(false);
      setIsWaitingForStyle(true);
      return;
    }

    setMessages(prev => {
      const newFromUser = [...prev, userMsg];
      const newWithAlma = [...newFromUser, almaMsg];
      localStorage.setItem(conversationKey, JSON.stringify(newWithAlma));
      return newWithAlma;
    });

    setIsFinishing(false);
    setIsWaitingForStyle(true);
    // Scroll to bottom handled by useEffect
  };

  const handleStyleSelection = async (styleInput: string) => {
    // VALIDATION: Vérifier que c'est un style valide (au minimum non-vide et pertinent)
    if (!styleInput.trim() || styleInput.length < 2) {
      setStyleSelectionError('Veuillez choisir ou décrire un ton.');
      return;
    }

    setIsLoading(true);
    setStyleSelectionError('');

    // Add user's style choice to chat
    const styleMsg: Message = {
      role: 'user',
      content: styleInput,
      timestamp: new Date(),
    };

    // Update local messages immediately for UX
    // But we need the *full* history for the API, including this choice
    const currentHistory = [...messages, styleMsg];
    setMessages(currentHistory);
    localStorage.setItem(conversationKey, JSON.stringify(currentHistory));

    try {
      // VALIDATION STEP 1: Vérifier que le teaser peut être généré (matière suffisante + style valide)
      const validationResponse = await fetch('/api/alma/validate-teaser-readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: currentHistory.map(m => ({ role: m.role, content: m.content })),
          collectedInfo: collectedInfo,
          userMessageCount: userMessageCount,
          minRequired: MIN_USER_MESSAGES,
        }),
      });

      if (!validationResponse.ok) {
        throw new Error('Erreur validation');
      }

      const validation = await validationResponse.json();

      if (!validation.isReady) {
        setStyleSelectionError(validation.message || 'Il manque encore des éléments. Pouvez-vous continuer ?');
        setIsLoading(false);
        return;
      }

      // VALIDATION STEP 2: Générer le teaser avec matière validée
      const response = await fetch('/api/alma/generate-teaser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: currentHistory.map(m => ({ role: m.role, content: m.content })),
          collectedInfo: collectedInfo,
          context: context,
          communType,
          genre: genre,
          subjectName: subjectName,
          preferredStyle: styleInput,
        }),
      });

      if (!response.ok) throw new Error('Erreur génération teaser');

      const data = await response.json();

      // Sauvegarde
      localStorage.setItem(teaserTextKey, data.teaserText);
      localStorage.setItem(almaContextKey, context);
      localStorage.setItem(almaSubjectKey, subjectName || '');
      localStorage.setItem(almaGenreKey, genre || 'Sans genre spécifié');
      localStorage.setItem(almaCollectedInfoKey, JSON.stringify(collectedInfo));
      localStorage.setItem(almaStyleKey, styleInput);
      localStorage.setItem(almaCommunTypeKey, communType || '');
      persistFinalizationPayload(
        buildFinalizationPayloadFromAlma({
          context,
          communType,
          subjectName,
          preferredStyle: styleInput,
          collectedInfo,
          teaserText: data.teaserText,
        }),
        isIsolated
      );

      // Transition Message
      const readyMsg: Message = {
        role: 'assistant',
        content: "C'est noté. Je prépare maintenant un aperçu fidèle à ce que vous m'avez confié. Vous allez être redirigé(e) automatiquement dans un instant.",
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updated = [...prev, readyMsg];
        localStorage.setItem(conversationKey, JSON.stringify(updated));
        return updated;
      });

      setTimeout(() => {
        window.location.assign(previewPath);
      }, 1200);

    } catch (error) {
      console.error('Erreur style:', error);
      setIsLoading(false);
      setIsWaitingForStyle(false); // Reset to allow retry
      setStyleSelectionError('Un problème technique est survenu. Veuillez réessayer votre choix de ton.');
      const errorMessage: Message = {
        role: 'assistant',
        content: "Je suis désolée, j'ai eu des difficultés à générer l'aperçu. Pouvez-vous répéter votre ton préféré ?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Bandeau explicatif - clarifie l'expérience */}
      <div className="p-3 bg-memoir-bg text-memoir-blue text-xs text-center border-b border-memoir-gold/20 font-serif italic">
        Alma vous écoute. Partagez librement — il vous faudra au moins {MIN_USER_MESSAGES} réponses avant de générer l'aperçu.
      </div>

      <div className="flex-1 flex overflow-hidden min-h-[calc(100vh-120px)] relative">
        {/* Chat Area (2/3) */}
        <div className="flex-1 flex flex-col border-r border-memoir-gold/10 bg-white md:w-2/3">
          {/* Header */}
          <div className="p-4 border-b border-memoir-gold/10 bg-memoir-bg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-memoir-blue/5 border border-memoir-gold/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-memoir-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-memoir-blue font-serif">Alma</h3>
                <p className="text-xs text-memoir-blue/60">Votre biographe personnelle</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileSuggestions(!showMobileSuggestions)}
                className="md:hidden p-2 text-memoir-gold hover:bg-memoir-gold/10 rounded-full transition-colors"
                title="Inspiration"
              >
                <Lightbulb className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Tout effacer et recommencer ?')) {
                    localStorage.removeItem(conversationKey);
                    window.location.reload();
                  }
                }}
                className="hidden sm:block p-2 text-memoir-blue/40 hover:text-red-500 transition-colors"
                title="Recommencer à zéro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  // Sauvegarder ce qu'Alma a collecté pour pré-remplir le questionnaire
                  const almaData = {
                    firstname: collectedInfo?.firstname || subjectName || '',
                    context: context,
                    communType: communType || '',
                    genre: genre || '',
                    collectedInfo: collectedInfo || {}
                  };
                  localStorage.setItem(almaPrefillKey, JSON.stringify(almaData));

                  // Rediriger vers le bon chemin
                  const params = new URLSearchParams({ context });
                  if (communType) {
                    params.set('communType', communType);
                  }
                  if (isIsolated) {
                    params.set('isolated', '1');
                  }
                  window.location.href = `${questionnairePath}?${params.toString()}`;
                }}
                className="hidden sm:block text-xs text-memoir-blue/60 hover:text-memoir-gold underline transition-colors"
              >
                Passer au questionnaire classique
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
            {hasInitialized && (
              messages.map((message, index) => {
                if (message.type === 'recap') {
                  return (
                    <div key={index} className="flex justify-start">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg my-2 max-w-[90%] shadow-sm">
                        <p className="text-blue-900 text-sm whitespace-pre-wrap leading-relaxed italic">{message.content}</p>
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => handleQuickSend('Oui, c\'est tout à fait ça.')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                          >
                            Oui, c'est ça ✓
                          </button>
                          <button
                            onClick={() => { setInput('Non, en fait... '); document.querySelector('textarea')?.focus(); }}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
                          >
                            Non, je corrige
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${message.role === 'user'
                        ? 'bg-memoir-blue text-white rounded-br-none'
                        : 'bg-gray-50 text-memoir-blue border border-memoir-gold/10 rounded-bl-none'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed font-light">{message.content}</p>
                    </div>
                  </div>
                );
              })
            )}

            {hasInitialized && isLoading && (
              <div className="flex justify-start">
                <div className="bg-memoir-bg rounded-2xl px-4 py-3 border border-memoir-gold/10">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-memoir-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-memoir-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-memoir-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Affichage des erreurs de validation du style */}
          {isWaitingForStyle && styleSelectionError && (
            <div className="p-4 border-t border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-800 font-medium">⚠️ {styleSelectionError}</p>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-memoir-gold/10 bg-white">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide flex-col">
              <div className="flex items-center justify-between w-full">
                {/* Barre de progression avec state clair */}
                <div className="flex-1 mr-4">
                  <div className="flex justify-between text-xs text-memoir-blue/40 mb-1">
                    <span>
                      {isWaitingForStyle 
                        ? 'Étape : Choix du ton' 
                        : `Matière collectée : ${userMessageCount}/${MIN_USER_MESSAGES}`}
                    </span>
                    <span>
                      {isWaitingForStyle 
                        ? '100%' 
                        : `${Math.round((userMessageCount / MIN_USER_MESSAGES) * 100)}%`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-memoir-blue/10 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isWaitingForStyle 
                          ? 'w-full bg-memoir-gold' 
                          : userMessageCount >= MIN_USER_MESSAGES
                          ? 'w-full bg-green-500'
                          : 'bg-memoir-gold'
                      }`}
                      style={{ width: `${isWaitingForStyle ? 100 : Math.min((userMessageCount / MIN_USER_MESSAGES) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Bouton "J'ai tout dit" avec logique d'état clair */}
                <button
                  onClick={handleFinish}
                  disabled={isLoading || isFinishing}
                  className="whitespace-nowrap px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Cliquez quand vous avez partagé ce que vous vouliez"
                >
                  {isWaitingForStyle 
                    ? '✓ Choisir le ton' 
                    : userMessageCount < MIN_USER_MESSAGES
                    ? `J'ai fini (${userMessageCount}/${MIN_USER_MESSAGES})`
                    : '✓ J\'ai tout dit'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez librement..."
                disabled={isLoading}
                rows={2}
                className="flex-1 px-4 py-3 border border-memoir-gold/20 rounded-xl focus:border-memoir-gold focus:outline-none resize-none text-sm text-memoir-blue bg-memoir-bg/30 placeholder:text-memoir-blue/30"
              />
              <VoiceInput
                value={input}
                onChange={setInput}
                className="mb-1"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 bg-memoir-gold text-white rounded-xl hover:bg-memoir-gold/90 transition-color