
import React from 'react';
import { TaskLogEntry } from '../types';
import { ClockIcon } from './Icons';

interface TaskLogProps {
  tasks: TaskLogEntry[];
}

const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
};

const TaskLog: React.FC<TaskLogProps> = ({ tasks }) => {
  return (
    <div className="h-64 overflow-y-auto pr-2 custom-scrollbar">
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <ClockIcon className="w-12 h-12 mb-2"/>
            <p>Your logged tasks will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.slice().reverse().map((task) => (
            <li
              key={task.id}
              className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center transition-all hover:bg-slate-700/80 animate-fade-in-up"
            >
              <div>
                <p className="font-semibold text-white">{task.taskName}</p>
                <p className="text-sm text-teal-400">{task.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{formatDuration(task.duration)}</p>
                <p className="text-xs text-slate-400">{task.timestamp.toLocaleTimeString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e293b; /* slate-800 */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #475569; /* slate-600 */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #64748b; /* slate-500 */
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
            animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TaskLog;
