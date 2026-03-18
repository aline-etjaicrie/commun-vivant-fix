'use client';

import { useState } from 'react';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { BlockType, AVAILABLE_BLOCKS } from '@/lib/layouts';

interface BlockOrderEditorProps {
  blocks: BlockType[];
  onOrderChange: (newBlocks: BlockType[]) => void;
}

export default function BlockOrderEditor({ blocks, onOrderChange }: BlockOrderEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getBlockLabel = (blockId: BlockType) => {
    return AVAILABLE_BLOCKS.find(b => b.id === blockId)?.label || blockId;
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    onOrderChange(newBlocks);
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      moveBlock(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < blocks.length - 1) {
      moveBlock(index, index + 1);
    }
  };

  const handleDragStart = (index: number) => {
    return (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
      setDraggedIndex(index);
    };
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromRaw = e.dataTransfer.getData('text/plain');
    const fromIndex = fromRaw ? Number(fromRaw) : draggedIndex;
    if (fromIndex !== null && !Number.isNaN(fromIndex) && fromIndex !== toIndex) {
      moveBlock(fromIndex, toIndex);
    }
    setDraggedIndex(null);
  };

  const isRequired = (blockId: BlockType) => {
    return AVAILABLE_BLOCKS.find(b => b.id === blockId)?.required;
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-memoir-blue mb-4">
        Organiser les blocs
      </h3>
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        {blocks.map((block, index) => (
          <div
                key={block}
                draggable={!isRequired(block)}
                onDragStart={handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={() => setDraggedIndex(null)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              draggedIndex === index
                ? 'border-memoir-gold bg-memoir-gold/10 opacity-50'
                : 'border-memoir-blue/10 hover:border-memoir-gold/30 bg-memoir-blue/5'
            } ${isRequired(block) ? 'opacity-60' : 'cursor-move'}`}
          >
            {!isRequired(block) && (
              <GripVertical className="w-5 h-5 text-memoir-blue/30" />
            )}
            
            <div className="flex-1">
              <p className="font-medium text-memoir-blue">
                {getBlockLabel(block)}
                {isRequired(block) && (
                  <span className="text-xs text-memoir-blue/50 ml-2">(obligatoire)</span>
                )}
              </p>
            </div>

            {!isRequired(block) && (
              <div className="flex gap-1">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1 hover:bg-memoir-gold/20 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4 text-memoir-blue" />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === blocks.length - 1}
                  className="p-1 hover:bg-memoir-gold/20 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4 text-memoir-blue" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 p-3 bg-memoir-blue/5 rounded-lg">
        <p className="text-xs text-memoir-blue/70">
          💡 Glissez-déposez ou utilisez les flèches pour réorganiser. 
          Les blocs obligatoires (photo & texte) ne peuvent pas être déplacés.
        </p>
      </div>
    </div>
  );
}
