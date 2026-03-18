'use client';

import { MessageCircle } from 'lucide-react';

interface Message {
  author?: string;
  content: string;
  date?: string;
}

interface PersonalMessagesProps {
  messages: Message[];
  accentColor: string;
  textColor: string;
  bgColor: string;
  typography: 'sans-serif' | 'serif' | 'calligraphy';
}

export default function PersonalMessages({ 
  messages, 
  accentColor, 
  textColor, 
  bgColor,
  typography 
}: PersonalMessagesProps) {
  if (messages.length === 0) return null;

  const getFontClass = () => {
    if (typography === 'calligraphy') return 'font-calli italic';
    if (typography === 'serif') return 'font-serif';
    return 'font-sans';
  };

  return (
    <div 
      className="rounded-xl shadow p-8"
      style={{ 
        backgroundColor: bgColor === '#FFFFFF' || bgColor === '#FFFDF7' || bgColor === '#F5EFE6' 
          ? 'rgba(0,0,0,0.02)' 
          : 'rgba(255,255,255,0.05)'
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6" style={{ color: accentColor }} />
        <h3 
          className="text-2xl font-light tracking-wide"
          style={{ color: textColor }}
        >
          Messages personnels
        </h3>
      </div>

      <div className="space-y-8">
        {messages.map((message, index) => (
          <div 
            key={index}
            className="relative pl-6 border-l-2"
            style={{ borderColor: `${accentColor}40` }}
          >
            {message.author && (
              <p 
                className="text-sm font-medium mb-2 tracking-wide"
                style={{ color: accentColor }}
              >
                {message.author}
              </p>
            )}
            <p 
              className={`${getFontClass()} leading-loose whitespace-pre-line`}
              style={{ 
                color: textColor, 
                opacity: 0.88,
                fontSize: typography === 'calligraphy' ? '1.05rem' : '1rem'
              }}
            >
              {message.content}
            </p>
            {message.date && (
              <p 
                className="text-xs mt-3 tracking-wider"
                style={{ color: textColor, opacity: 0.5 }}
              >
                {new Date(message.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
