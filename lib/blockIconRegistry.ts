/**
 * Shared icon registry for block icon pickers.
 * Used by SortableBlockEditor (list badges) and PublishedMemorialRenderer (preview badges).
 */
import type { ElementType } from 'react';
import {
  Heart, Sparkles, Flower, Flower2, Star, Sun, Moon, Cloud, Waves,
  Leaf, TreeDeciduous, TreePine, Mountain, Anchor, Ship, Sailboat,
  Music, Mic, Headphones, Book, BookOpen, PenTool, PenLine, Palette,
  Camera, Video, Image, Flame, Bird, Cat, Dog,
  Home, MapPin, Compass, Globe, Clock, History, Gift, Trophy,
  Coffee, Utensils, GlassWater, Wine, Church, Infinity,
  Smile, Users, Baby, Crown, Diamond, Gem, Key, Lock, Lightbulb,
  Rocket, Plane, Bike, Car, Milestone, Award,
} from 'lucide-react';

export const BLOCK_ICON_COMPONENTS: Record<string, ElementType> = {
  Heart, Sparkles, Flower, Flower2, Star, Sun, Moon, Cloud, Waves,
  Leaf, TreeDeciduous, TreePine, Mountain, Anchor, Ship, Sailboat,
  Music, Mic, Headphones, Book, BookOpen, PenTool, PenLine, Palette,
  Camera, Video, Image, Flame, Bird, Cat, Dog,
  Home, MapPin, Compass, Globe, Clock, History, Gift, Trophy,
  Coffee, Utensils, GlassWater, Wine, Church, Infinity,
  Smile, Users, Baby, Crown, Diamond, Gem, Key, Lock, Lightbulb,
  Rocket, Plane, Bike, Car, Milestone, Award,
};

export function resolveBlockIcon(name: string | undefined): ElementType | null {
  if (!name) return null;
  return BLOCK_ICON_COMPONENTS[name] ?? null;
}
