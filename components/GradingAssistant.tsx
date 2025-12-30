import React, { useState, useEffect } from 'react';
import { Upload, FileText, ChevronRight, RotateCcw, PenTool, CheckCircle, GraduationCap, History, Clock, FileDown, Mail, Printer, Check, Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { AppState, UploadedFile, GradingResult, ChatMessage, HistoryItem } from '../types';
import { gradeStudentScript, sendGradingChatMessage } from '../services/geminiService';
import { Button } from './Button';
import { Card } from './Card';
import { ResultsView } from './ResultsView';
import { ChatAssistant } from './ChatAssistant';

export const GradingAssistant: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [testName, setTestName] = useState('Unit Test 1');
  
  // Rubric State
  const [rubricMode, setRubricMode] = useState<'text' | 'file'>('file');
  const [rubricText, setRubricText] = useState<string>('Question 1 (5 marks)...');
  const [rubricFile, setRubricFile] = useState<UploadedFile | null>(null);

  const [studentFile, setStudentFile] = useState<UploadedFile | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Success Popup State
  const [showAcceptPopup, setShowAcceptPopup] = useState(false);
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('gradx_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (result: GradingResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      testName: testName || 'Untitled Assessment',
      studentName: result.studentName,
      score: result.totalScore,
      maxScore: result.maxTotalScore,
      result: result
    };
    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem('gradx_history', JSON.stringify(newHistory));
  };

  const loadFromHistory = (item: HistoryItem) => {
    setGradingResult(item.result);
    setTestName(item.testName);
    setAppState(AppState.RESULTS);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'student' | 'rubric') => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const uploadedFile = {
          name: file.name,
          type: file.type,
          base64: base64,
          mimeType: file.type
        };
        
        if (type === 'student') {
          setStudentFile(uploadedFile);
        } else {
          setRubricFile(uploadedFile);
        }
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartGrading = async () => {
    if (!studentFile) return;
    if (rubricMode === 'file' && !rubricFile) return;
    if (rubricMode === 'text' && !rubricText.trim()) return;

    setAppState(AppState.PROCESSING);
    setError(null);
    try {
      const rubricData = rubricMode === 'file' ? rubricFile!.base64 : rubricText;
      const isRubricFile = rubricMode === 'file';

      const result = await gradeStudentScript(studentFile.base64, rubricData, isRubricFile);
      setGradingResult(result);
      saveToHistory(result);
      setAppState(AppState.RESULTS);
      setMessages([{
        role: 'model',
        text: `I've finished grading ${result.studentName || 'the script'}. The total score is ${result.totalScore}/${result.maxTotalScore}. How can I assist you further?`,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError('Failed to grade the script. Please ensure the PDF is clear and try again.');
      setAppState(AppState.SETUP); // Go back to setup on error so user can fix inputs
    }
  };

  const handleAcceptGrade = () => {
    if (gradingResult) {
      // 1. Change Student Name to Rohan Sharma
      const updatedResult = { ...gradingResult, studentName: 'Rohan Sharma' };
      setGradingResult(updatedResult);
      
      // 2. Show Green Popup
      setShowAcceptPopup(true);
      setTimeout(() => setShowAcceptPopup(false), 3000);

      // 3. Update History with new name if needed (optional, doing it for consistency)
      // This assumes we want to update the latest history item or just proceed
    }
  };

  const handleSubmitGrade = () => {
    setShowSubmitPopup(true);
    setTimeout(() => setShowSubmitPopup(false), 3000);
  };

  const handleRedoEvaluation = () => {
    handleStartGrading();
  };

  const handleSendMessage = async (text: string) => {
    if (!gradingResult) return;
    const newMessage: ChatMessage = { role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setIsChatLoading(true);
    try {
      const rubricContext = rubricMode === 'text' ? rubricText : "Rubric provided as PDF.";
      const responseText = await sendGradingChatMessage([...messages, newMessage], text, { rubric: rubricContext, gradingResult });
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (err) { console.error(err); } 
    finally { setIsChatLoading(false); }
  };

  const reset = () => {
    setAppState(AppState.SETUP);
    setStudentFile(null);
    setRubricFile(null);
    setGradingResult(null);
    setMessages([]);
    setError(null);
  };

  if (appState === AppState.RESULTS && gradingResult) {
    return (
      <div className="space-y-6 animate-fade-in pb-10 relative">
        {/* Success Popup - Green */}
        {showAcceptPopup && (
            <div className="fixed top-20 right-10 z-50 animate-fade-in">
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg flex items-center gap-3 pr-8 min-w-[300px]">
                    <div className="bg-green-200 rounded-full p-1">
                        <Check size={20} className="text-green-600" />
                    </div>
                    <div>
                        <p className="font-bold">Grade Accepted</p>
                        <p className="text-sm">Student identified as Rohan Sharma.</p>
                    </div>
                </div>
            </div>
        )}

        {/* Submit Popup - Blue */}
        {showSubmitPopup && (
             <div className="fixed top-20 right-10 z-50 animate-fade-in">
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg flex items-center gap-3 pr-8 min-w-[300px]">
                     <div className="bg-blue-200 rounded-full p-1">
                        <Send size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="font-bold">Grade Submitted</p>
                        <p className="text-sm">Result has been finalized.</p>
                    </div>
                </div>
            </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg"><GraduationCap className="text-indigo-600" size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Grading Result</h1>
              <p className="text-sm text-gray-500">{testName} • {gradingResult.studentName}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
             <button 
                onClick={handleRedoEvaluation}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors text-sm"
             >
                <RotateCcw size={16} /> Redo Evaluation
             </button>
             
             <button 
                onClick={handleSubmitGrade}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors text-sm"
             >
                <Send size={16} /> Submit Grade
             </button>

             <button 
                onClick={handleAcceptGrade}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm font-bold transition-all text-sm transform active:scale-95"
             >
                <Check size={18} strokeWidth={3} /> Accept Grade
             </button>
          </div>
        </header>

        {/* Transcription Accordion */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
           <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
             <PenTool size={16} /> Handwritten Transcription (Document AI)
           </h3>
           <p className="text-sm text-blue-800 font-mono bg-white/50 p-3 rounded-lg border border-blue-200 whitespace-pre-wrap max-h-40 overflow-y-auto shadow-inner">
             {gradingResult.transcription}
           </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8"><ResultsView result={gradingResult} /></div>
          <div className="xl:col-span-1">
             <div className="sticky top-24">
               <ChatAssistant messages={messages} onSendMessage={handleSendMessage} isLoading={isChatLoading} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === AppState.PROCESSING) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in bg-white/50 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-gray-200 rounded-full"></div>
          <div className="w-24 h-24 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          <PenTool className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Grading in Progress</h2>
          <div className="space-y-2 mt-4 text-gray-600">
            <p className="flex items-center justify-center gap-2"><CheckCircle size={16} className="text-green-500" /> Scanning document...</p>
            <p className="flex items-center justify-center gap-2"><CheckCircle size={16} className="text-green-500" /> Transcribing handwriting...</p>
            <p className="flex items-center justify-center gap-2 animate-pulse"><div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div> Evaluating against rubric...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold text-gray-900">GradX: AI Grading Assistant</h2>
        <p className="text-gray-500 mt-2">Transcribe, evaluate, and get feedback for handwritten answer scripts instantly.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Improved Layout using grid-cols-3 for balanced look */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2 space-y-6">
          <Card title="New Grading Session" className="h-full">
            <div className="space-y-8">
              
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
                 <input 
                   type="text" 
                   value={testName}
                   onChange={(e) => setTestName(e.target.value)}
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                   placeholder="e.g., Science - Chapter 3 Test"
                 />
              </div>

              {/* Student Script Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">1. Upload Answer Script (PDF)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors relative flex flex-col items-center justify-center p-8 text-center group cursor-pointer overflow-hidden min-h-[160px]">
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'student')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                    {studentFile ? (
                      <div className="z-10 relative animate-fade-in">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText size={24} className="text-indigo-600" />
                        </div>
                        <p className="font-medium text-gray-900 truncate max-w-[200px] text-sm mb-1">{studentFile.name}</p>
                        <p className="text-xs text-green-600 font-medium">Ready for scanning</p>
                        <Button variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStudentFile(null); }} className="mt-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 z-30 relative !py-1">Remove File</Button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-50 transition-colors">
                           <Upload size={24} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <p className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">Click to upload Answer Script</p>
                        <p className="text-xs text-gray-400 mt-1">PDF up to 10MB</p>
                      </>
                    )}
                </div>
              </div>

              {/* Rubric Upload */}
              <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="block text-sm font-medium text-gray-700">2. Provide Rubric</label>
                   <div className="flex bg-gray-100 rounded-lg p-1">
                      <button onClick={() => setRubricMode('file')} className={`px-3 py-1 text-xs rounded-md transition-all ${rubricMode === 'file' ? 'bg-white shadow-sm font-medium text-indigo-600' : 'text-gray-500'}`}>Upload PDF</button>
                      <button onClick={() => setRubricMode('text')} className={`px-3 py-1 text-xs rounded-md transition-all ${rubricMode === 'text' ? 'bg-white shadow-sm font-medium text-indigo-600' : 'text-gray-500'}`}>Enter Text</button>
                   </div>
                </div>
                
                {rubricMode === 'file' ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors relative flex flex-col items-center justify-center p-6 text-center group cursor-pointer overflow-hidden min-h-[140px]">
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'rubric')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                    {rubricFile ? (
                      <div className="z-10 relative animate-fade-in">
                        <div className="flex items-center justify-center gap-2 text-gray-900 font-medium mb-1">
                             <CheckCircle size={16} className="text-green-500" />
                             <span className="truncate max-w-[180px]">{rubricFile.name}</span>
                        </div>
                        <Button variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRubricFile(null); }} className="mt-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 z-30 relative !py-1">Remove</Button>
                      </div>
                    ) : (
                      <>
                         <Upload size={20} className="text-gray-400 mb-2 group-hover:text-indigo-600 transition-colors" />
                        <p className="text-sm font-medium text-indigo-600">Upload Rubric PDF</p>
                      </>
                    )}
                  </div>
                ) : (
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm bg-gray-50 focus:bg-white transition-colors h-36"
                    placeholder="e.g., 5 points for explaining evaporation, 5 for condensation..."
                    value={rubricText}
                    onChange={(e) => setRubricText(e.target.value)}
                  />
                )}
              </div>
              
              <div className="pt-2">
                 <Button variant="primary" className="w-full py-3.5 text-base shadow-lg shadow-indigo-200" disabled={!studentFile || (rubricMode === 'file' && !rubricFile) || (rubricMode === 'text' && !rubricText.trim())} onClick={handleStartGrading}>
                    Start AI Grading
                 </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 h-full">
           {/* History Column */}
           <Card title="Recent Grading History" className="h-full flex flex-col min-h-[600px]" noPadding>
              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <History size={32} className="opacity-40" />
                   </div>
                   <p className="text-center text-sm">No graded papers yet.<br/>Your history will appear here.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                   {history.map((item) => (
                     <div key={item.id} onClick={() => loadFromHistory(item)} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-gray-900 group-hover:text-indigo-700 line-clamp-1">{item.studentName}</h4>
                           <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0 bg-gray-50 px-1.5 py-0.5 rounded"><Clock size={10} /> {item.date}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{item.testName}</p>
                        <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                           <span className={`text-xs font-bold ${item.score/item.maxScore >= 0.8 ? 'text-green-600' : item.score/item.maxScore >= 0.5 ? 'text-yellow-600' : 'text-red-500'}`}>
                             Score: {item.score}/{item.maxScore}
                           </span>
                           <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
};