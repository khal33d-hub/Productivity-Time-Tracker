
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TaskLogEntry, AiReport, SheetTaskData } from './types';
import { useTimer } from './hooks/useTimer';
import { generateProductivityReport, generateSheetData } from './services/geminiService';
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import TaskLog from './components/TaskLog';
import Report from './components/Report';
import { PomodoroIcon, ReportIcon, TaskIcon, CategoryIcon, AlertTriangleIcon, CloseIcon, DownloadIcon } from './components/Icons';

const App: React.FC = () => {
  const [taskName, setTaskName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [loggedTasks, setLoggedTasks] = useState<TaskLogEntry[]>([]);
  const [isPomodoro, setIsPomodoro] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<AiReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onTimerEnd = useCallback(() => {
    if (timerState.mode === 'work') {
      const duration = 25 * 60;
      const newTask: TaskLogEntry = {
        id: Date.now().toString(),
        taskName: taskName || 'Pomodoro Session',
        category: category || 'Uncategorized',
        duration,
        timestamp: new Date(),
      };
      setLoggedTasks(prev => [...prev, newTask]);
      startTimer('break');
    } else if (timerState.mode === 'break') {
      // Could add a notification here for break end
    }
  }, [taskName, category]);

  const { time, startTimer, pauseTimer, stopTimer, isRunning, timerState } = useTimer({ onTimerEnd });

  const handleStart = () => {
    if (isPomodoro) {
      startTimer('work');
    } else {
      startTimer('standard');
    }
  };

  const handleStop = () => {
    const duration = stopTimer();
    if (duration > 0 && !isPomodoro) {
      if (!taskName.trim() || !category.trim()) {
        setError('Task Name and Category are required to log an entry.');
        return;
      }
      const newTask: TaskLogEntry = {
        id: Date.now().toString(),
        taskName,
        category,
        duration,
        timestamp: new Date(),
      };
      setLoggedTasks(prev => [...prev, newTask]);
      setTaskName('');
      setCategory('');
    }
  };

  const handleGenerateReport = async () => {
    if (loggedTasks.length === 0) {
      setError("There are no tasks logged to generate a report.");
      return;
    }
    setIsLoadingReport(true);
    setError(null);
    setAiReport(null);
    try {
      const reportData = await generateProductivityReport(loggedTasks);
      setAiReport(reportData);
    } catch (err) {
      setError('Failed to generate AI report. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoadingReport(false);
    }
  };
  
  const handleDownloadSheet = async () => {
    if (loggedTasks.length === 0) {
        setError("There are no tasks logged to download.");
        return;
    }
    setIsDownloading(true);
    setError(null);
    try {
        const sheetData = await generateSheetData(loggedTasks);
        downloadAsCSV(sheetData);
    } catch (err) {
        setError('Failed to generate spreadsheet data. Please try again.');
        console.error(err);
    } finally {
        setIsDownloading(false);
    }
  };

  const downloadAsCSV = (data: SheetTaskData[]) => {
      const headers = ['Task Name', 'Category', 'Duration (Minutes)', 'Date', 'Time'];
      const csvRows = [headers.join(',')];

      const escapeCsvCell = (cell: any) => {
          const cellStr = String(cell ?? '').replace(/"/g, '""');
          return `"${cellStr}"`;
      };

      for (const row of data) {
          const values = [
              escapeCsvCell(row.taskName),
              escapeCsvCell(row.category),
              escapeCsvCell(row.durationInMinutes),
              escapeCsvCell(row.date),
              escapeCsvCell(row.time),
          ];
          csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'productivity_log.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-400">Productivity Time Tracker</h1>
          <p className="text-slate-400 mt-2">Focus on your tasks, we'll handle the rest.</p>
        </header>

        {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6 flex items-center justify-between shadow-lg animate-fade-in-down">
                <div className="flex items-center">
                    <AlertTriangleIcon className="w-6 h-6 mr-3"/>
                    <span>{error}</span>
                </div>
                <button onClick={clearError} className="p-1 rounded-full hover:bg-red-800/50 transition-colors">
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Timer and Controls */}
          <div className="bg-slate-800/50 rounded-2xl p-6 shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">Timer</h2>
                <div className="flex items-center space-x-3 bg-slate-700/50 p-2 rounded-full">
                    <PomodoroIcon className={`w-6 h-6 transition-colors ${isPomodoro ? 'text-orange-400' : 'text-slate-500'}`} />
                    <span className="text-sm font-medium">Pomodoro</span>
                    <button onClick={() => setIsPomodoro(!isPomodoro)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPomodoro ? 'bg-orange-500' : 'bg-slate-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPomodoro ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <TimerDisplay time={time} mode={timerState.mode} isPomodoro={isPomodoro} />

            <div className="space-y-4 my-6">
                <div className="relative">
                    <TaskIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                    <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="What are you working on?"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition"
                        disabled={isRunning && isPomodoro}
                    />
                </div>
                <div className="relative">
                    <CategoryIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Project / Category"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition"
                        disabled={isRunning && isPomodoro}
                    />
                </div>
            </div>

            <TimerControls
              onStart={handleStart}
              onPause={pauseTimer}
              onStop={handleStop}
              isRunning={isRunning}
              time={time}
            />
          </div>

          {/* Right Column: Task Log and Report */}
          <div className="space-y-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 shadow-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-white">Task Log</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleDownloadSheet}
                            disabled={isDownloading || loggedTasks.length === 0}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            <span>{isDownloading ? 'Preparing...' : 'Download'}</span>
                        </button>
                        <button
                            onClick={handleGenerateReport}
                            disabled={isLoadingReport || loggedTasks.length === 0}
                            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                        >
                            <ReportIcon className="w-5 h-5" />
                            <span>{isLoadingReport ? 'Generating...' : 'Report'}</span>
                        </button>
                    </div>
                </div>
                <TaskLog tasks={loggedTasks} />
            </div>

            {(isLoadingReport || aiReport) && (
              <div className="bg-slate-800/50 rounded-2xl p-6 shadow-2xl border border-slate-700 animate-fade-in">
                  <h2 className="text-2xl font-semibold text-white mb-4">AI Productivity Report</h2>
                  <Report report={aiReport} isLoading={isLoadingReport} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
