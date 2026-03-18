import React from 'react';

type TitleProps = {
    children: string; // Restrict to string for easier parsing
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p' | 'div';
    className?: string;
    style?: React.CSSProperties; // Add style prop
};

const Title: React.FC<TitleProps> = ({ children, as: Tag = 'h2', className = '', style }) => {
    if (typeof children !== 'string') {
        // If children is not a string (e.g. contains other elements), render as is but warn or just return
        // Ideally we should process text nodes recursively but that's complex for this task.
        return <Tag className={className} style={style}>{children}</Tag>;
    }

    // Split by punctuation chars
    const parts = children.split(/([.,!?:;])/g);

    return (
        <Tag className={className} style={style}>
            {parts.map((part, index) => {
                if (/^[.,!?:;]$/.test(part)) {
                    return <span key={index} className="text-memoir-neon text-inherit font-inherit">{part}</span>;
                }
                return part;
            })}
        </Tag>
    );
};

export default Title;
