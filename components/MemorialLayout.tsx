'use client';

import { ReactNode } from 'react';
import { BlockType, getLayout } from '@/lib/layouts';

interface MemorialLayoutProps {
  layout: string;
  blockOrder: BlockType[];
  blocks: Record<BlockType, ReactNode>;
}

export default function MemorialLayout({ layout, blockOrder, blocks }: MemorialLayoutProps) {
  const config = getLayout(layout);

  // Fonction pour rendre un bloc
  const renderBlock = (blockId: BlockType) => {
    return blocks[blockId] || null;
  };

  // Layout classique : 1 colonne (ou fallback si pas de colonnes définies)
  if (layout === 'classic' || !config.columnBlocks) {
    return (
      <div className="space-y-8">
        {blockOrder.map(blockId => (
          <div key={blockId}>{renderBlock(blockId)}</div>
        ))}
      </div>
    );
  }

  // Layouts multi-colonnes dynamiques
  const { left, center, right } = config.columnBlocks;

  return (
    <div className={`grid gap-8 ${layout === 'triptych' ? 'md:grid-cols-3' :
        layout === 'editorial' ? 'md:grid-cols-[350px_1fr]' :
          'md:grid-cols-[2fr_1fr]' // magazine as default 2-col
      }`}>
      {left && (
        <div className="space-y-8">
          {left.map(id => (
            <div key={id}>{renderBlock(id)}</div>
          ))}
        </div>
      )}

      {center && (
        <div className="space-y-8">
          {center.map(id => (
            <div key={id}>{renderBlock(id)}</div>
          ))}
        </div>
      )}

      {right && (
        <div className="space-y-8">
          {right.map(id => (
            <div key={id}>{renderBlock(id)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

