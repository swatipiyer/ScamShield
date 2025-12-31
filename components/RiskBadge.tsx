
import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  confidence: number;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, confidence }) => {
  const getStyles = () => {
    switch (level) {
      case RiskLevel.HIGH:
        return { color: '#ef4444', label: 'DANGER', bg: 'bg-red-50', border: 'border-red-100' };
      case RiskLevel.MEDIUM:
        return { color: '#f97316', label: 'WARNING', bg: 'bg-orange-50', border: 'border-orange-100' };
      case RiskLevel.LOW:
        return { color: '#10b981', label: 'SAFE', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      default:
        return { color: '#64748b', label: 'UNKNOWN', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  const styles = getStyles();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <div className={`p-10 rounded-3xl flex flex-col items-center justify-center text-center border-2 ${styles.border} relative overflow-hidden bg-white shadow-sm`}>
      <div className={`absolute inset-0 opacity-10 pointer-events-none ${styles.bg}`} style={{ background: `radial-gradient(circle at center, ${styles.color}, transparent)` }}></div>
      <div className="relative mb-6">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="12"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke={styles.color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
          <span className="text-5xl font-black tracking-tighter" style={{ color: styles.color }}>{confidence}%</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</span>
        </div>
      </div>
      
      <div className="space-y-1 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnostic Status</span>
        <h4 className="text-3xl font-black uppercase tracking-tighter" style={{ color: styles.color }}>
          {level} Risk
        </h4>
      </div>
    </div>
  );
};

export default RiskBadge;
