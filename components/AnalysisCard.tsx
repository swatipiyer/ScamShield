
import React from 'react';

interface AnalysisCardProps {
  title: string;
  children: React.ReactNode;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, children }) => {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm h-full flex flex-col">
      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
        {title}
      </h3>
      <div className="text-slate-800 flex-grow">
        {children}
      </div>
    </div>
  );
};

export default AnalysisCard;
