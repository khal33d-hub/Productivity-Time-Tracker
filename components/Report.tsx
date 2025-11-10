
import React from 'react';
import { AiReport } from '../types';
import { TimeIcon, TopCategoryIcon, SummaryIcon } from './Icons';

interface ReportProps {
  report: AiReport | null;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-teal-400 animate-bounce"></div>
    </div>
);

const Report: React.FC<ReportProps> = ({ report, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!report) {
    return null;
  }

  return (
    <div className="space-y-4 text-slate-300">
      <div className="flex items-start p-3 bg-slate-700/50 rounded-lg">
        <TimeIcon className="w-6 h-6 mr-4 text-teal-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-white">Total Time Tracked</h3>
          <p>{report.totalHours} hours and {report.totalMinutes} minutes</p>
        </div>
      </div>
      <div className="flex items-start p-3 bg-slate-700/50 rounded-lg">
        <TopCategoryIcon className="w-6 h-6 mr-4 text-teal-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-white">Top Category</h3>
          <p>{report.topCategory}</p>
        </div>
      </div>
      <div className="flex items-start p-3 bg-slate-700/50 rounded-lg">
        <SummaryIcon className="w-6 h-6 mr-4 text-teal-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-white">Summary</h3>
          <p className="italic">"{report.summary}"</p>
        </div>
      </div>
    </div>
  );
};

export default Report;
