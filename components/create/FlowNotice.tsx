'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type FlowNoticeProps = {
  variant?: 'error' | 'info' | 'success';
  title: string;
  message: string;
  className?: string;
};

const VARIANTS = {
  error: {
    icon: AlertCircle,
    wrapper: 'border-[#E7D9C8] bg-[#FFF9F5] text-[#7A3F1E]',
    iconClassName: 'text-[#C06A3A]',
  },
  info: {
    icon: Info,
    wrapper: 'border-[#D8E4EC] bg-[#F6FAFD] text-[#21445A]',
    iconClassName: 'text-[#2B5F7D]',
  },
  success: {
    icon: CheckCircle2,
    wrapper: 'border-[#D9E8DC] bg-[#F7FBF7] text-[#27593A]',
    iconClassName: 'text-[#3E8A57]',
  },
} as const;

export default function FlowNotice({
  variant = 'info',
  title,
  message,
  className = '',
}: FlowNoticeProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-4 ${config.wrapper} ${className}`.trim()}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${config.iconClassName}`} />
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-sm/6 opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}
