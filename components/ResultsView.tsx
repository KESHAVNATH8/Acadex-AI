import React from 'react';
import { GradingResult } from '../types';
import { Card } from './Card';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ResultsViewProps {
  result: GradingResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  const percentage = Math.round((result.totalScore / result.maxTotalScore) * 100);
  
  // Color code the score
  const scoreColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600';
  const progressColor = percentage >= 80 ? 'bg-green-600' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-600';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Section - Split into Score and Detailed Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <Card className="flex flex-col items-center justify-center text-center py-8 bg-white border-indigo-100 shadow-sm md:col-span-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Score</span>
          <div className="relative flex items-center justify-center w-40 h-40">
             <svg className="transform -rotate-90 w-full h-full">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className={scoreColor} strokeDasharray={440} strokeDashoffset={440 - (440 * percentage) / 100} strokeLinecap="round" />
             </svg>
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className={`text-4xl font-extrabold ${scoreColor}`}>{result.totalScore}</span>
                <span className="text-gray-400 text-lg block font-medium">/ {result.maxTotalScore}</span>
             </div>
          </div>
          <div className="mt-4 text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
             {percentage}% Accuracy
          </div>
        </Card>

        {/* Readable Feedback Section */}
        <Card className="md:col-span-2 bg-white flex flex-col" title="Assessment Feedback">
          <div className="flex-1 overflow-y-auto pr-2">
             <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-sans">
                <p className="text-lg font-medium text-gray-900 mb-4">
                  Student: <span className="text-indigo-600">{result.studentName}</span>
                </p>
                <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-50">
                   <p className="whitespace-pre-line text-base">{result.summaryFeedback}</p>
                </div>
             </div>
          </div>
        </Card>
      </div>

      {/* Question Breakdown Table */}
      <Card title="Detailed Question Breakdown" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 w-24">Q. No</th>
                <th className="px-6 py-4 font-semibold text-gray-700 w-32 text-center">Score</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Detailed Feedback</th>
                <th className="px-6 py-4 font-semibold text-gray-700 w-24 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.breakdown.map((item, idx) => {
                 const isPerfect = item.score === item.maxScore;
                 const isZero = item.score === 0;
                 return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                       <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                         {item.questionId}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`font-bold text-base ${isPerfect ? 'text-green-600' : isZero ? 'text-red-600' : 'text-gray-900'}`}>
                         {item.score}
                       </span>
                       <span className="text-gray-400 text-xs"> / {item.maxScore}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 leading-relaxed">
                       {item.feedback}
                    </td>
                    <td className="px-6 py-4 text-center">
                       {isPerfect ? (
                         <CheckCircle size={20} className="text-green-500 mx-auto" />
                       ) : isZero ? (
                         <AlertCircle size={20} className="text-red-500 mx-auto" />
                       ) : (
                         <div className="w-2 h-2 bg-yellow-400 rounded-full mx-auto"></div>
                       )}
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};