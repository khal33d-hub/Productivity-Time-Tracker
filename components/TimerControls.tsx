
import React from 'react';
import { PlayIcon, PauseIcon, StopIcon } from './Icons';

interface TimerControlsProps {
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  isRunning: boolean;
  time: number;
}

const TimerControls: React.FC<TimerControlsProps> = ({ onStart, onPause, onStop, isRunning, time }) => {
  return (
    <div className="flex justify-center space-x-4">
      {!isRunning ? (
        <button
          onClick={onStart}
          className="flex items-center justify-center w-24 h-12 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
        >
          <PlayIcon className="w-6 h-6 mr-2" />
          <span>{time > 0 ? 'Resume' : 'Start'}</span>
        </button>
      ) : (
        <button
          onClick={onPause}
          className="flex items-center justify-center w-24 h-12 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
        >
          <PauseIcon className="w-6 h-6 mr-2" />
          <span>Pause</span>
        </button>
      )}
      <button
        onClick={onStop}
        disabled={!isRunning && time === 0}
        className="flex items-center justify-center w-24 h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
      >
        <StopIcon className="w-6 h-6 mr-2" />
        <span>Stop</span>
      </button>
    </div>
  );
};

export default TimerControls;
