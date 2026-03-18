'use client';

import PersonalMessages from '@/components/PersonalMessages';

interface MessagesBlockProps {
  message: any;
  template: any;
}

export default function MessagesBlock({ message, template }: MessagesBlockProps) {
  if (!message || !message.hasMessage || !message.content) return null;
  
  return (
    <PersonalMessages
      messages={[{ content: message.content }]}
      accentColor={template.colors.accent}
      textColor={template.colors.text}
      bgColor={template.colors.bg}
      typography={template.typography}
    />
  );
}
