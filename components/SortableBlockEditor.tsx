'use client';

import { useState, createElement } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, GripVertical, Lock, Smile } from 'lucide-react';
import { AVAILABLE_BLOCKS, type BlockType } from '@/lib/layouts';
import { resolveBlockIcon } from '@/lib/blockIconRegistry';

function BlockIconDisplay({ iconName }: { iconName?: string }) {
  const Icon = resolveBlockIcon(iconName);
  if (!Icon) return <Smile className="h-3.5 w-3.5 opacity-40" />;
  return createElement(Icon, { className: 'h-3.5 w-3.5' });
}

interface SortableBlockEditorProps {
  blocks: BlockType[];
  lockedBlocks?: BlockType[];
  onOrderChange: (newBlocks: BlockType[]) => void;
  blockIcons?: Record<string, string>;
  onOpenIconPicker?: (blockId: string) => void;
}

function getBlockLabel(blockId: BlockType): string {
  return AVAILABLE_BLOCKS.find((b) => b.id === blockId)?.label ?? blockId;
}

interface SortableItemProps {
  id: BlockType;
  isLocked: boolean;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isDragging?: boolean;
  iconName?: string;
  onIconClick?: () => void;
}

function SortableItem({
  id,
  isLocked,
  index,
  total,
  onMoveUp,
  onMoveDown,
  isDragging = false,
  iconName,
  onIconClick,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, active } = useSortable({
    id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isBeingDragged = active?.id === id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
        isBeingDragged
          ? 'border-[#A27C53] bg-[#FFF8EE] opacity-60 shadow-lg'
          : isLocked
            ? 'border-[#E9E3DA] bg-[#FAFAF8] opacity-70'
            : 'border-[#E9E3DA] bg-white hover:border-[#C9A24D]/40'
      }`}
    >
      {isLocked ? (
        <Lock className="h-4 w-4 shrink-0 text-[#B5A898]" aria-label="Bloc verrouillé" />
      ) : (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="shrink-0 cursor-grab touch-none text-[#B5A898] hover:text-[#A27C53] active:cursor-grabbing"
          aria-label="Déplacer ce bloc"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      <span className={`flex-1 text-sm font-medium ${isLocked ? 'text-[#9E9585]' : 'text-[#0F2A44]'}`}>
        {getBlockLabel(id)}
        {isLocked && (
          <span className="ml-2 text-xs font-normal text-[#B5A898]">(fixe)</span>
        )}
      </span>

      {!isLocked && (
        <div className="flex items-center gap-1">
          {onIconClick && (
            <button
              type="button"
              onClick={onIconClick}
              aria-label="Choisir une icône"
              title={iconName ?? 'Choisir une icône'}
              className="rounded p-1.5 text-[#A27C53] hover:bg-[#FFF8EE] transition-colors"
            >
              <BlockIconDisplay iconName={iconName} />
            </button>
          )}
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Monter ce bloc"
            className="rounded p-1 text-[#A27C53] hover:bg-[#FFF8EE] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Descendre ce bloc"
            className="rounded p-1 text-[#A27C53] hover:bg-[#FFF8EE] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SortableBlockEditor({
  blocks,
  lockedBlocks = [],
  onOrderChange,
  blockIcons = {},
  onOpenIconPicker,
}: SortableBlockEditorProps) {
  const [activeId, setActiveId] = useState<BlockType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const lockedSet = new Set(lockedBlocks);

  // Only non-locked blocks are draggable IDs for SortableContext
  const sortableIds = blocks.filter((b) => !lockedSet.has(b));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as BlockType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = blocks.indexOf(active.id as BlockType);
    const newIndex = blocks.indexOf(over.id as BlockType);

    if (oldIndex === -1 || newIndex === -1) return;

    // Don't allow moving a locked block or moving on top of a locked block's
    // position if that would displace locked blocks
    if (lockedSet.has(active.id as BlockType)) return;

    onOrderChange(arrayMove(blocks, oldIndex, newIndex));
  };

  const moveBlock = (index: number, direction: 1 | -1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    // Skip over locked blocks when moving
    if (lockedSet.has(blocks[targetIndex])) return;
    onOrderChange(arrayMove(blocks, index, targetIndex));
  };

  // Compute per-block index within sortable (non-locked) blocks for up/down limits
  const sortableOnly = blocks.filter((b) => !lockedSet.has(b));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {blocks.map((block, index) => {
            const isLocked = lockedSet.has(block);
            const sortableIndex = sortableOnly.indexOf(block);
            const sortableTotal = sortableOnly.length;

            return (
              <SortableItem
                key={block}
                id={block}
                isLocked={isLocked}
                index={isLocked ? 0 : sortableIndex}
                total={sortableTotal}
                onMoveUp={() => moveBlock(index, -1)}
                onMoveDown={() => moveBlock(index, 1)}
                iconName={blockIcons[block]}
                onIconClick={!isLocked && onOpenIconPicker ? () => onOpenIconPicker(block) : undefined}
              />
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="flex items-center gap-3 rounded-xl border-2 border-[#A27C53] bg-[#FFF8EE] px-4 py-3 shadow-xl">
            <GripVertical className="h-4 w-4 text-[#A27C53]" />
            <span className="flex-1 text-sm font-medium text-[#0F2A44]">
              {getBlockLabel(activeId)}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
