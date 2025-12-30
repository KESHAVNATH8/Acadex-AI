import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Legend, Rectangle } from 'recharts';
import { FileText, ClipboardCheck, MessageSquare, CheckCircle, Calendar, ChevronDown, TrendingUp, BarChart2, X, ExternalLink } from 'lucide-react';

const data = [
  { name: 'January', score: 180, total: 240 },
  { name: 'February', score: 320, total: 350 },
  { name: 'March', score: 350, total: 380 },
  { name: 'April', score: 100, total: 220 },
  { name: 'May', score: 250, total: 280 },
  { name: 'June', score: 260, total: 300 },
];

// Mock Data for Social Science Table - Sorted Alphabetically
const socialScienceMarks = [
  { name: 'Aarav Sharma', ch1: 42, ch2: 45 },
  { name: 'Aditi Rao', ch1: 38, ch2: 41 },
  { name: 'Ananya Gupta', ch1: 48, ch2: 49 },
  { name: 'Dev Reddy', ch1: 35, ch2: 38 },
  { name: 'Ishaan Kumar', ch1: 40, ch2: 36 },
  { name: 'Kabir Das', ch1: 45, ch2: 47 },
  { name: 'Mira Nair', ch1: 39, ch2: 42 },
  { name: 'Priya Patel', ch1: 44, ch2: 46 },
  { name: 'Rohan Mehta', ch1: 41, ch2: 43 },
  { name: 'Sana Khan', ch1: 47, ch2: 48 },
  { name: 'Vikram Singh', ch1: 32, ch2: 35 },
].sort((a, b) => a.name.localeCompare(b.name));

const StatCard = ({ title, value, sub, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <Icon className="text-gray-400" size={20} />
    </div>
    <div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  </div>
);

// Custom bar shape for the striped pattern effect
const StripeBar = (props: any) => {
    const { fill, x, y, width, height } = props;
    return (
      <g>
        <defs>
          <pattern id="stripePattern" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <line x1="0" y="0" x2="0" y2="4" stroke={fill} strokeWidth="2" />
          </pattern>
        </defs>
        <rect x={x} y={y} width={width} height={height} fill="url(#stripePattern)" stroke={fill} strokeWidth="2" />
      </g>
    );
};

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // State for Pop-out Chart
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const dateOptions = ['Today', 'Last 7 Days', 'This Month', 'Last Month', 'This Year'];

  // Calculate Class Averages
  const classAvgCh1 = Math.round(socialScienceMarks.reduce((acc, curr) => acc + curr.ch1, 0) / socialScienceMarks.length);
  const classAvgCh2 = Math.round(socialScienceMarks.reduce((acc, curr) => acc + curr.ch2, 0) / socialScienceMarks.length);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSubtext = () => {
    switch(dateRange) {
      case 'Today': return 'today';
      case 'Last 7 Days': return 'this week';
      case 'This Month': return 'this month';
      case 'Last Month': return 'last month';
      case 'This Year': return 'this year';
      default: return 'this month';
    }
  };

  const periodText = getSubtext();

  // Generate chart data for specific student including simulated future data for visualization
  const getStudentChartData = (student: any) => {
      // Simulation logic for Ch3, Ch4 and Term 1 based on student's performance trend
      const trendFactor = (student.ch1 + student.ch2) / 100; // rough performance factor
      
      const ch3Student = Math.min(50, Math.round(45 * trendFactor + 2)); 
      const ch4Student = Math.min(50, Math.round(48 * trendFactor + 1));
      
      const avgCh3 = 42;
      const avgCh4 = 44;

      const term1Student = Math.round(((student.ch1 + student.ch2 + ch3Student + ch4Student) / 200) * 100);
      const term1Avg = Math.round(((classAvgCh1 + classAvgCh2 + avgCh3 + avgCh4) / 200) * 100);

      return [
          { name: 'Chapter 1', student: (student.ch1 / 50) * 100, average: (classAvgCh1 / 50) * 100 },
          { name: 'Chapter 2', student: (student.ch2 / 50) * 100, average: (classAvgCh2 / 50) * 100 },
          { name: 'Chapter 3', student: (ch3Student / 50) * 100, average: (avgCh3 / 50) * 100 },
          { name: 'Chapter 4', student: (ch4Student / 50) * 100, average: (avgCh4 / 50) * 100 },
          { name: 'Term 1', student: term1Student, average: term1Avg },
      ];
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, Teacher!</h1>
            <p className="text-gray-500 mt-1">Here's your co-pilot's summary for {periodText}.</p>
        </div>
        
        {/* Custom Date Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
           <button 
             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
             className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm hover:bg-gray-50 transition-colors w-40 justify-between"
           >
             <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
               <Calendar size={16} className="text-gray-500" />
               <span className="truncate">{dateRange}</span>
             </div>
             <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
           </button>
           
           {isDropdownOpen && (
             <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
               {dateOptions.map((option) => (
                 <button
                   key={option}
                   onClick={() => { setDateRange(option); setIsDropdownOpen(false); }}
                   className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${dateRange === option ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700'}`}
                 >
                   {option}
                 </button>
               ))}
             </div>
           )}
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tests Conducted" value="15" sub={`+2 ${periodText}`} icon={ClipboardCheck} />
        <StatCard title="Uploaded Answer Scripts" value="352" sub={`+60 ${periodText}`} icon={FileText} />
        <StatCard title="Graded Answer Scripts" value="231" sub={`+32 ${periodText}`} icon={CheckCircle} />
        <StatCard title="Feedbacks Given" value="184" sub={`+25 ${periodText}`} icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <Card title="Student Performance Overview" className="h-[450px]">
           <div className="h-full w-full pb-10 pt-4">
              <p className="text-sm text-gray-500 mb-4 px-4">A summary of assessment outcomes across the academic year.</p>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} barGap={8} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10}>
                    <Label value="Academic Timeline" offset={-10} position="insideBottom" fill="#9ca3af" fontSize={12} />
                  </XAxis>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}}>
                     <Label value="Scale (Count / Score)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#9ca3af" fontSize={12} />
                  </YAxis>
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="total" fill="#3758f9" radius={[4, 4, 0, 0]} barSize={20} name="Total Students" />
                  <Bar dataKey="score" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* GradX Overview List */}
        <Card title="GradX Overview" className="h-[450px] overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
             <p className="text-sm text-gray-500">Review and approve recently graded assignments.</p>
          </div>
          <div className="overflow-auto flex-1">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Subject</th>
                    <th className="px-6 py-3 font-medium">Grade</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { name: 'Aarav Sharma', subject: 'Science', grade: '85/100', status: 'Accepted' },
                    { name: 'Priya Patel', subject: 'History', grade: '78/100', status: 'Pending' },
                    { name: 'Rohan Mehta', subject: 'Math', grade: '92/100', status: 'Modified' },
                    { name: 'Ananya Gupta', subject: 'English', grade: '88/100', status: 'Accepted' },
                    { name: 'Vikram Singh', subject: 'Physics', grade: '65/100', status: 'Pending' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                      <td className="px-6 py-4 text-gray-500">{row.subject}</td>
                      <td className="px-6 py-4 text-gray-900">{row.grade}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-1 border border-gray-200 rounded-lg hover:border-indigo-200 transition-all">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </Card>
      </div>

      {/* New Section: Subject Performance Table */}
      <Card title="Subject: Social Science" className="w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Student Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Chapter 1 <span className="text-gray-400 font-normal">(50 Marks)</span></th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Chapter 2 <span className="text-gray-400 font-normal">(50 Marks)</span></th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Total %</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Term 1 Performance</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {socialScienceMarks.map((student, idx) => {
                const total = student.ch1 + student.ch2;
                const percentage = Math.round(total); // Since max is 100 (50+50)
                const isImproved = student.ch2 > student.ch1;
                
                // Calculate student average vs class average for the table display
                const studentAvg = Math.round((student.ch1 + student.ch2) / 2);
                const classTotalAvg = Math.round((classAvgCh1 + classAvgCh2) / 2);

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-center text-gray-600 font-mono bg-gray-50/50">{student.ch1}</td>
                    <td className="px-6 py-4 text-center text-gray-600 font-mono bg-gray-50/50">{student.ch2}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                        percentage >= 90 ? 'bg-green-100 text-green-700' :
                        percentage >= 75 ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-xs">
                                <span className="font-semibold text-gray-700">St: {studentAvg}%</span>
                                <span className="text-gray-400 mx-1">|</span>
                                <span className="text-gray-500">Avg: {classTotalAvg}%</span>
                            </div>
                            <button 
                              onClick={() => setSelectedStudent(student)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                              title="View Comparison Chart"
                            >
                                <BarChart2 size={16} />
                            </button>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs font-medium">
                        {isImproved ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <TrendingUp size={14} /> +{(student.ch2 - student.ch1)}
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">
                            <TrendingUp size={14} className="rotate-180" /> {(student.ch2 - student.ch1)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pop-out Chart Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
               {/* Modal Header */}
               <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {selectedStudent.name} 
                        <span className="text-sm font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">Term 1 Report</span>
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Comparative performance analysis against class averages.</p>
                  </div>
                  <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-indigo-600 transition-colors hidden sm:block">
                          <ExternalLink size={20} />
                      </button>
                      <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                      </button>
                  </div>
               </div>
               
               {/* Modal Content - Chart */}
               <div className="p-8 flex-1 min-h-[400px] bg-white">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={getStudentChartData(selectedStudent)} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        barGap={0} // No gap between bars in a group
                        barCategoryGap="20%" // Gap between groups
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={{stroke: '#000', strokeWidth: 1.5}} tickLine={false} tick={{fill: '#374151', fontSize: 13, fontWeight: 500}} dy={10} />
                      <YAxis axisLine={{stroke: '#000', strokeWidth: 1.5}} tickLine={{stroke: '#000'}} tick={{fill: '#374151', fontSize: 13}}>
                         <Label value="Marks" angle={-90} position="insideLeft" fill="#1f2937" fontSize={16} fontWeight="bold" style={{ textAnchor: 'middle' }} offset={10} />
                      </YAxis>
                      <Tooltip 
                        cursor={{fill: '#f9fafb'}} 
                        contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} 
                        formatter={(value: number) => [`${Math.round(value)}%`, '']}
                      />
                      <Legend verticalAlign="top" height={50} align="right" wrapperStyle={{paddingBottom: '20px'}} />
                      
                      {/* Student Score Bar - Solid Blue */}
                      <Bar dataKey="student" name="Student score" fill="#60a5fa" stroke="#000" strokeWidth={1} barSize={40} />
                      
                      {/* Class Average Bar - Hatched Pattern */}
                      <Bar dataKey="average" name="Class Average" shape={<StripeBar />} fill="#0ea5e9" barSize={40} />
                      
                    </BarChart>
                  </ResponsiveContainer>
               </div>
               
               {/* Modal Footer */}
               <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                   <span>Data reflects performance across simulated Term 1 curriculum.</span>
                   <span className="font-medium text-indigo-600 cursor-pointer hover:underline">Download Full Report</span>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};