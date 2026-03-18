'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
    value: string;
    onChange: (text: string) => void;
    className?: string;
}

export default function VoiceInput({ value, onChange, className }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);

    // Sync refs
    useEffect(() => { valueRef.current = value; }, [value]);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Browser support check
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Erreur vocale:', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const results = event.results;
            const lastResult = results[results.length - 1];

            if (lastResult.isFinal) {
                const transcript = lastResult[0].transcript;
                const currentVal = valueRef.current;

                // Smart spacing: add space if needed
                const prefix = (currentVal && !currentVal.endsWith(' ') && currentVal.length > 0) ? ' ' : '';

                onChangeRef.current(currentVal + prefix + transcript);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []); // Run once on mount

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Votre navigateur ne supporte pas la dictée vocale.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error('Erreur start:', e);
            }
        }
    };

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`
                p-3 rounded-full transition-all duration-200 shadow-md flex items-center justify-center
                ${isListening
                    ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                    : 'bg-memoir-blue hover:bg-memoir-blue/90'
                }
                ${className || ''}
            `}
            title={isListening ? "Arrêter l'enregistrement" : "Dictée vocale"}
        >
            {isListening ? (
                <MicOff className="w-5 h-5 text-white" />
            ) : (
                <Mic className="w-5 h-5 text-white" />
            )}
        </button>
    );
}
