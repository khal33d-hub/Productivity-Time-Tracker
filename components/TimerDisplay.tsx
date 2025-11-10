
import React from 'react';

interface TimerDisplayProps {
  time: number;
  mode: 'standard' | 'work' | 'break';
  isPomodoro: boolean;
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, mode, isPomodoro }) => {
  const displayTime = formatTime(time);
  
  let modeText = 'Standard Timer';
  let modeColor = 'text-teal-400';

  if (isPomodoro) {
    if (mode === 'work') {
      modeText = 'Focus Session';
      modeColor = 'text-orange-400';
    } else if (mode === 'break') {
      modeText = 'Break Time';
      modeColor = 'text-green-400';
    }
  }

  return (
    <div className="bg-slate-900/50 rounded-lg p-6 text-center my-4 border border-slate-700">
      <div className={`text-6xl md:text-7xl font-mono font-bold tracking-widest ${modeColor} transition-colors`}>
        {displayTime}
      </div>
      <p className={`mt-2 text-sm font-medium uppercase tracking-wider ${modeColor} transition-colors`}>
        {modeText}
      </p>
    </div>
  );
};

export default TimerDisplay;
