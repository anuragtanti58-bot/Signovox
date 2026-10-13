import { GestureDefinition } from '../types';

/**
 * 20 Predefined SignoVox Gestures
 * Constraint: Every single recognized sentence contains NO MORE THAN FIVE (5) words.
 */
export const SIGN_GESTURES: GestureDefinition[] = [
  {
    id: 'G01',
    numericId: 1,
    name: 'Open Palm Wave',
    sentence: 'Hello, nice to meet you.',
    wordCount: 5,
    category: 'Social',
    iconName: 'Hand',
    shortDescription: 'All fingers open flat, gentle side-to-side wrist tilt',
    targetSensors: { thumb: 10, index: 10, middle: 10, ring: 10, pinky: 10, pitch: 15, roll: 20, yaw: 45 },
  },
  {
    id: 'G02',
    numericId: 2,
    name: 'Open Palm to Chest',
    sentence: 'I need some help please.',
    wordCount: 5,
    category: 'Emergency',
    iconName: 'HeartHandshake',
    shortDescription: 'Flat hand facing downward tapping over heart',
    targetSensors: { thumb: 20, index: 15, middle: 15, ring: 15, pinky: 15, pitch: -30, roll: 0, yaw: 0 },
  },
  {
    id: 'G03',
    numericId: 3,
    name: 'Fingertips to Chin Outward',
    sentence: 'Thank you very much.',
    wordCount: 4,
    category: 'Social',
    iconName: 'Sparkles',
    shortDescription: 'Flat hand tips touching chin and moving forward',
    targetSensors: { thumb: 10, index: 10, middle: 10, ring: 10, pinky: 10, pitch: 40, roll: -10, yaw: 0 },
  },
  {
    id: 'G04',
    numericId: 4,
    name: 'Closed Fist Nod',
    sentence: 'Yes, I understand.',
    wordCount: 3,
    category: 'Essential',
    iconName: 'CheckCircle2',
    shortDescription: 'Closed fist bobbing downward twice',
    targetSensors: { thumb: 85, index: 90, middle: 90, ring: 90, pinky: 90, pitch: -45, roll: 0, yaw: 0 },
  },
  {
    id: 'G05',
    numericId: 5,
    name: 'Index & Middle Snap to Thumb',
    sentence: 'No, thank you.',
    wordCount: 3,
    category: 'Essential',
    iconName: 'XCircle',
    shortDescription: 'Index and middle fingers snapping down to touch thumb',
    targetSensors: { thumb: 60, index: 70, middle: 70, ring: 95, pinky: 95, pitch: 10, roll: -15, yaw: 10 },
  },
  {
    id: 'G06',
    numericId: 6,
    name: 'W-Hand Shape to Lips',
    sentence: 'I need water please.',
    wordCount: 4,
    category: 'Essential',
    iconName: 'Droplets',
    shortDescription: 'Index, middle, and ring extended forming W touching chin',
    targetSensors: { thumb: 80, index: 10, middle: 10, ring: 10, pinky: 90, pitch: 35, roll: 0, yaw: 0 },
  },
  {
    id: 'G07',
    numericId: 7,
    name: 'C-Hand to Stomach',
    sentence: 'I am hungry now.',
    wordCount: 4,
    category: 'Daily',
    iconName: 'Utensils',
    shortDescription: 'Cupped C-hand moving down from throat to chest',
    targetSensors: { thumb: 40, index: 45, middle: 45, ring: 50, pinky: 50, pitch: -25, roll: 10, yaw: 0 },
  },
  {
    id: 'G08',
    numericId: 8,
    name: 'T-Hand Shake',
    sentence: 'Where is the restroom?',
    wordCount: 4,
    category: 'Assistance',
    iconName: 'HelpCircle',
    shortDescription: 'Thumb poking between index and middle fingers, shaking',
    targetSensors: { thumb: 75, index: 85, middle: 95, ring: 95, pinky: 95, pitch: 0, roll: 45, yaw: 90 },
  },
  {
    id: 'G09',
    numericId: 9,
    name: 'Middle Finger to Forehead',
    sentence: 'I am feeling unwell.',
    wordCount: 4,
    category: 'Emergency',
    iconName: 'AlertCircle',
    shortDescription: 'Middle finger bent touching forehead while others extend',
    targetSensors: { thumb: 15, index: 15, middle: 85, ring: 15, pinky: 15, pitch: 50, roll: 0, yaw: 0 },
  },
  {
    id: 'G10',
    numericId: 10,
    name: 'M-Hand Tapping Wrist Pulse',
    sentence: 'Please call my doctor.',
    wordCount: 4,
    category: 'Emergency',
    iconName: 'Stethoscope',
    shortDescription: 'Three fingers bent tapping opposite wrist artery pulse',
    targetSensors: { thumb: 85, index: 65, middle: 65, ring: 65, pinky: 90, pitch: -10, roll: -80, yaw: 0 },
  },
  {
    id: 'G11',
    numericId: 11,
    name: 'Open Palm Circling Upward',
    sentence: 'I am feeling happy.',
    wordCount: 4,
    category: 'Social',
    iconName: 'Smile',
    shortDescription: 'Open flat hand sweeping upward over heart in cheerful circular arc',
    targetSensors: { thumb: 10, index: 10, middle: 10, ring: 10, pinky: 10, pitch: 30, roll: 30, yaw: 15 },
  },
  {
    id: 'G12',
    numericId: 12,
    name: 'Both Hands Palm Down Push',
    sentence: 'Please wait a moment.',
    wordCount: 4,
    category: 'Assistance',
    iconName: 'Clock',
    shortDescription: 'Flat hand held out with palm forward, steady hold',
    targetSensors: { thumb: 15, index: 15, middle: 15, ring: 15, pinky: 15, pitch: 70, roll: 0, yaw: 0 },
  },
  {
    id: 'G13',
    numericId: 13,
    name: 'Folded Arms Over Chest',
    sentence: 'I want to rest.',
    wordCount: 4,
    category: 'Daily',
    iconName: 'Bed',
    shortDescription: 'Crossed flat hand resting against shoulder',
    targetSensors: { thumb: 30, index: 25, middle: 25, ring: 25, pinky: 25, pitch: -20, roll: 60, yaw: -30 },
  },
  {
    id: 'G14',
    numericId: 14,
    name: 'Cupped Hand Over Ear',
    sentence: 'Can you repeat that?',
    wordCount: 4,
    category: 'Assistance',
    iconName: 'Ear',
    shortDescription: 'Bent cupped hand hovering near right ear',
    targetSensors: { thumb: 35, index: 40, middle: 40, ring: 40, pinky: 40, pitch: 65, roll: -45, yaw: 0 },
  },
  {
    id: 'G15',
    numericId: 15,
    name: 'Thumb & Index Pinch Circle',
    sentence: 'Everything is alright here.',
    wordCount: 4,
    category: 'Social',
    iconName: 'ThumbsUp',
    shortDescription: 'OK gesture: index touches thumb while three fingers extend straight',
    targetSensors: { thumb: 50, index: 55, middle: 10, ring: 10, pinky: 10, pitch: 20, roll: 0, yaw: 45 },
  },
  {
    id: 'G16',
    numericId: 16,
    name: 'Rapid Shaking S-Fist',
    sentence: 'I need emergency assistance.',
    wordCount: 4,
    category: 'Emergency',
    iconName: 'Flame',
    shortDescription: 'High frequency oscillating tight fist in air',
    targetSensors: { thumb: 95, index: 95, middle: 95, ring: 95, pinky: 95, pitch: 60, roll: 80, yaw: 120 },
  },
  {
    id: 'G17',
    numericId: 17,
    name: 'Rising Sun Palm Sweep',
    sentence: 'Good morning to you.',
    wordCount: 4,
    category: 'Social',
    iconName: 'Sun',
    shortDescription: 'Hand moves upward in rising sun arc over horizon',
    targetSensors: { thumb: 15, index: 15, middle: 15, ring: 15, pinky: 15, pitch: 45, roll: 15, yaw: 0 },
  },
  {
    id: 'G18',
    numericId: 18,
    name: 'Descending Night Arc',
    sentence: 'Good night, sleep well.',
    wordCount: 4,
    category: 'Social',
    iconName: 'Moon',
    shortDescription: 'Hand arcs downward bending over forearm like setting darkness',
    targetSensors: { thumb: 45, index: 50, middle: 50, ring: 50, pinky: 50, pitch: -50, roll: 0, yaw: 0 },
  },
  {
    id: 'G19',
    numericId: 19,
    name: 'O-Hand Opening to 5-Spread',
    sentence: 'Please turn on lights.',
    wordCount: 4,
    category: 'Daily',
    iconName: 'Lightbulb',
    shortDescription: 'Fingers pinch together overhead then blossom wide open',
    targetSensors: { thumb: 10, index: 10, middle: 10, ring: 10, pinky: 10, pitch: 75, roll: 0, yaw: 0 },
  },
  {
    id: 'G20',
    numericId: 20,
    name: 'Two Thumbs Up Forward',
    sentence: 'I am ready now.',
    wordCount: 4,
    category: 'Daily',
    iconName: 'Zap',
    shortDescription: 'Thumb held straight upward while four fingers clasp firmly into palm',
    targetSensors: { thumb: 5, index: 95, middle: 95, ring: 95, pinky: 95, pitch: 10, roll: 0, yaw: 0 },
  },
];

export const GESTURE_DICTIONARY: Record<string, GestureDefinition> = SIGN_GESTURES.reduce(
  (acc, g) => {
    acc[g.id] = g;
    acc[g.numericId.toString()] = g;
    acc[`G${g.numericId}`] = g;
    acc[`G${g.numericId.toString().padStart(2, '0')}`] = g;
    return acc;
  },
  {} as Record<string, GestureDefinition>
);

export function getGestureById(id: string | number): GestureDefinition | undefined {
  const cleanId = String(id).trim().toUpperCase();
  if (GESTURE_DICTIONARY[cleanId]) {
    return GESTURE_DICTIONARY[cleanId];
  }
  const numericOnly = parseInt(cleanId.replace(/\D/g, ''), 10);
  if (!isNaN(numericOnly) && GESTURE_DICTIONARY[numericOnly.toString()]) {
    return GESTURE_DICTIONARY[numericOnly.toString()];
  }
  return undefined;
}
