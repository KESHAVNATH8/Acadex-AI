import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { generateLessonPlan } from '../services/geminiService';
import { Sparkles, Copy, Share2, Check, Mail, FileDown, Printer, FileText, ChevronDown } from 'lucide-react';

// --- Markdown Formatter for Lesson Plans ---
const parseInline = (text: string) => {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const FormattedPlan: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="font-sans text-gray-700 leading-relaxed space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-3" />; // Spacer

        // Headers
        if (trimmed.startsWith('#')) {
            const match = trimmed.match(/^#+/);
            const level = match ? match[0].length : 1;
            const text = trimmed.replace(/^#+\s*/, '');
            
            if (level === 1) return <h1 key={i} className="text-2xl font-bold text-indigo-900 mt-6 mb-4 pb-2 border-b border-indigo-100">{parseInline(text)}</h1>;
            if (level === 2) return <h2 key={i} className="text-xl font-bold text-gray-800 mt-5 mb-3">{parseInline(text)}</h2>;
            return <h3 key={i} className="text-lg font-semibold text-gray-800 mt-4 mb-2 text-indigo-700">{parseInline(text)}</h3>;
        }

        // List items (Numbered)
        if (trimmed.match(/^\d+\./)) {
             const number = trimmed.split('.')[0];
             const rest = trimmed.replace(/^\d+\.\s*/, '');
             return (
               <div key={i} className="flex gap-3 ml-1 mb-2">
                 <span className="font-bold text-indigo-600 min-w-[20px] text-right">{number}.</span>
                 <div className="flex-1">{parseInline(rest)}</div>
               </div>
             );
        }
        
        // List items (Bullet)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const rest = trimmed.replace(/^[-*]\s*/, '');
            return (
               <div key={i} className="flex gap-3 ml-4 mb-2">
                 <span className="text-indigo-400 font-bold">•</span>
                 <div className="flex-1">{parseInline(rest)}</div>
               </div>
            );
        }

        return <p key={i} className="mb-1">{parseInline(line)}</p>;
      })}
    </div>
  );
};

export const PlanX: React.FC = () => {
  const [formData, setFormData] = useState({
    topic: '',
    grade: '5th Grade',
    language: 'English',
    context: 'Urban School'
  });
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = async () => {
    if (!formData.topic) return;
    setIsLoading(true);
    setPlan(''); // Clear previous plan
    const result = await generateLessonPlan(formData.topic, formData.grade, formData.language, formData.context);
    setPlan(result);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Helper to convert simple markdown to HTML for the print view
      let htmlContent = plan
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\d+\. (.*$)/gim, '<div class="list-item"><span class="number"></span>$1</div>') // CSS counters are better for numbers but simple replacement works for now
        .replace(/^[-*] (.*$)/gim, '<li>$1</li>')
        .replace(/\n/g, '<br/>');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Lesson Plan - ${formData.topic}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Open+Sans:wght@400;600&display=swap');
              
              body { 
                font-family: 'Merriweather', serif; 
                line-height: 1.6; 
                color: #1f2937; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 40px; 
              }
              
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
                margin-bottom: 40px;
              }
              
              .header h1 {
                font-family: 'Open Sans', sans-serif;
                font-size: 28px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 0 0 10px 0;
                color: #111;
              }
              
              .meta-info {
                font-family: 'Open Sans', sans-serif;
                font-size: 14px;
                color: #666;
                display: flex;
                justify-content: center;
                gap: 20px;
              }

              h1, h2, h3 { color: #111; margin-top: 25px; margin-bottom: 10px; font-family: 'Open Sans', sans-serif; }
              h1 { font-size: 24px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              h2 { font-size: 20px; font-weight: 700; color: #374151; }
              h3 { font-size: 16px; font-weight: 600; text-transform: uppercase; color: #4b5563; }
              
              strong { font-weight: 700; color: #000; }
              
              li { margin-bottom: 5px; margin-left: 20px; }
              
              .list-item { margin-bottom: 8px; margin-left: 5px; display: flex; }
              .list-item:before { content: "• "; margin-right: 10px; font-weight: bold; }
              
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                font-size: 12px;
                color: #999;
                font-family: 'Open Sans', sans-serif;
              }
              
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
                <h1>Lesson Plan</h1>
                <div class="meta-info">
                    <span><strong>Topic:</strong> ${formData.topic}</span>
                    <span><strong>Grade:</strong> ${formData.grade}</span>
                    <span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="content">
                ${htmlContent}
            </div>
            
            <div class="footer">
                Generated by Acadex AI • Empowering Educators
            </div>
            
            <script>
              window.onload = () => { setTimeout(() => window.print(), 500); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setIsShareOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Lesson Plan: ${formData.topic}`);
    // Replace newlines with %0D%0A for email body compatibility
    const formattedBody = plan.replace(/\n/g, '%0D%0A');
    const body = encodeURIComponent(
`Topic: ${formData.topic}
Grade: ${formData.grade}
--------------------------------

`) + formattedBody;
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsShareOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-[calc(100vh-100px)] flex flex-col">
      <header className="shrink-0">
        <h1 className="text-3xl font-bold text-gray-900">PlanX: Dynamic Lesson Planner</h1>
        <p className="text-gray-500 mt-1">Generate comprehensive, culturally-relevant lesson plans in multiple Indian languages.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Input Panel */}
        <Card title="Plan Details" className="lg:col-span-1 h-fit">
          <div className="space-y-5">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic / Concept</label>
               <input 
                 type="text" 
                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                 placeholder="e.g., The Indian Rebellion of 1857"
                 value={formData.topic}
                 onChange={(e) => setFormData({...formData, topic: e.target.value})}
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  >
                    {['KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                  >
                    {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">Context</label>
               <input 
                 type="text" 
                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                 placeholder="e.g. Rural Village, Digital Classroom"
                 value={formData.context}
                 onChange={(e) => setFormData({...formData, context: e.target.value})}
               />
             </div>

             <Button 
               onClick={handleGenerate} 
               disabled={!formData.topic || isLoading} 
               isLoading={isLoading}
               className="w-full bg-indigo-600 text-white hover:bg-indigo-700 mt-2"
             >
               <Sparkles size={18} /> Generate Plan
             </Button>
          </div>
        </Card>

        {/* Output Panel */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-[500px]">
           <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" /> 
                Generated Lesson Plan
              </h3>
              
              {plan && (
                <div className="flex gap-2 relative" ref={shareRef}>
                    <button 
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${copied ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />} 
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    
                    <button 
                      onClick={() => setIsShareOpen(!isShareOpen)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${isShareOpen ? 'text-indigo-700 bg-indigo-50 border-indigo-200' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      <Share2 size={14} /> Export <ChevronDown size={12} />
                    </button>

                    {isShareOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden animate-fade-in p-1">
                        <button 
                          onClick={handleEmail}
                          className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Mail size={16} /> Send via Email
                        </button>
                        <button 
                          onClick={handlePrint}
                          className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <FileDown size={16} /> Save as PDF
                        </button>
                      </div>
                    )}
                </div>
              )}
           </div>

           <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative shadow-inner">
               {plan ? (
                 <div className="absolute inset-0 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    {/* Paper Simulation */}
                    <div className="max-w-3xl mx-auto bg-white min-h-full shadow-lg rounded-sm p-8 md:p-12 relative">
                        {/* Header Decoration */}
                        <div className="border-b-2 border-gray-800 pb-6 mb-6 flex justify-between items-end">
                             <div>
                                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">{formData.topic}</h1>
                                <p className="text-gray-500 font-sans text-sm">Target: {formData.grade} • Context: {formData.context}</p>
                             </div>
                             <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-400 font-sans uppercase tracking-widest">Lesson Plan</p>
                                <p className="text-sm font-semibold text-gray-700 font-serif">{new Date().toLocaleDateString()}</p>
                             </div>
                        </div>

                        {/* Content */}
                        <FormattedPlan content={plan} />

                        {/* Footer Decoration */}
                        <div className="mt-12 pt-6 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400 font-sans">Created with Acadex AI Assistant</p>
                        </div>
                    </div>
                 </div>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Sparkles size={24} className="text-indigo-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-500">Ready to plan your next class?</p>
                    <p className="text-sm opacity-70">Enter details on the left to generate.</p>
                 </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};