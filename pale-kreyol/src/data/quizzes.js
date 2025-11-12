import { Volume2, Zap, Target, Brain } from 'lucide-react';

export const quizTypes = [
  { id: 'translate', name: 'Translation', icon: Target, color: 'from-blue-500 to-blue-600' },
  { id: 'listen', name: 'Listening', icon: Volume2, color: 'from-purple-500 to-purple-600' },
  { id: 'speed', name: 'Speed Round', icon: Zap, color: 'from-yellow-500 to-yellow-600' },
  { id: 'memory', name: 'Memory Match', icon: Brain, color: 'from-green-500 to-green-600' }
];
