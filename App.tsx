import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { ChatInterface } from './components/ChatInterface';
import { parseExcelFile, fetchGoogleSheet } from './utils/excelParser';
import { generateDataAnalysis } from './services/geminiService';
import { ExcelData, ChatMessage, AppState } from './types';
import { Table, MessageSquare, ArrowLeft, FileText, Menu, Github, X, BarChart, Database, CloudLightning } from 'lucide-react';

const CARVUK_SHEET_ID = '11W-wGbHVoQ4YR4_HlHcckXRTNjsou2j8xEwWUy-GDk0';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'chat'>('chat');
  const [showCredits, setShowCredits] = useState(false);
  const [showUpload, setShowUpload] = useState(false); // Toggle between Auto-Connect and Manual Upload

  const processData = (data: ExcelData) => {
    setExcelData(data);
    setAppState(AppState.ANALYSIS);
    
    // Calculate total stats
    const totalSheets = data.sheets.length;
    const sheetNames = data.sheets.map(s => s.sheetName).join(', ');
    
    // Add initial greeting
    setMessages([{
      id: 'init',
      role: 'model',
      content: `Hi! I've connected to **${data.fileName}**. \n\nI found **${totalSheets} sheets**: ${sheetNames}. \n\nYou can ask me to analyze data from a specific sheet or cross-reference data between them (e.g., "Join data from Sheet A and Sheet B").`,
      timestamp: Date.now()
    }]);
  };

  const handleConnectToCarvuk = async () => {
    setIsProcessing(true);
    try {
      const data = await fetchGoogleSheet(CARVUK_SHEET_ID);
      processData(data);
    } catch (error) {
      console.error("Connection Error", error);
      alert("Failed to connect to Carvuk Google Sheet. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await parseExcelFile(file);
      processData(data);
    } catch (error) {
      console.error("Parse Error", error);
      alert("Failed to parse Excel file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!excelData) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
        // Prepare chat history for API (filter out internal init message)
        const history = messages
            .filter(m => m.id !== 'init')
            .map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

        const responseText = await generateDataAnalysis(text, excelData, history);

        const newAiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: responseText || "I couldn't generate a response.",
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, newAiMsg]);

    } catch (error) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            content: "Sorry, I encountered an error analyzing your request. Please try again.",
            timestamp: Date.now()
        }]);
    } finally {
        setIsTyping(false);
    }
  };

  const resetApp = () => {
    setAppState(AppState.UPLOAD);
    setExcelData(null);
    setMessages([]);
    setActiveTab('chat');
    setShowUpload(false);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200">
                <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ExcelChat <span className="text-indigo-600">AI</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setShowCredits(true)}
                className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors hidden sm:block"
            >
                Developed by Catalina
            </button>

            {appState === AppState.ANALYSIS && (
                <button 
                onClick={resetApp}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
                >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Change Source</span>
                </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative w-full max-w-7xl mx-auto">
        
        {appState === AppState.UPLOAD ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in custom-scrollbar">
             <div className="flex flex-col items-center justify-center min-h-[85%]">
                <div className="text-center mb-10 max-w-2xl px-4">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Chat with your <span className="text-indigo-600">Spreadsheet</span>
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        Instant analysis for your Carvuk data. Calculate CAC, ROAS, and visualize trends effortlessly with Gemini AI.
                    </p>
                </div>
                
                {showUpload ? (
                    <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                        <FileUpload onFileSelect={handleFileSelect} isLoading={isProcessing} />
                        <button 
                            onClick={() => setShowUpload(false)}
                            className="mt-6 text-sm text-slate-500 hover:text-indigo-600 font-medium underline-offset-4 hover:underline"
                        >
                            Back to Carvuk Connection
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
                        <button
                            onClick={handleConnectToCarvuk}
                            disabled={isProcessing}
                            className="w-full group relative bg-white border border-slate-200 hover:border-indigo-300 p-8 rounded-3xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                        >
                             <div className={`absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isProcessing ? 'animate-pulse opacity-100' : ''}`} />
                             
                             <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {isProcessing ? (
                                    <CloudLightning className="animate-pulse" size={40} />
                                ) : (
                                    <Database size={40} />
                                )}
                             </div>
                             
                             <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                {isProcessing ? 'Connecting...' : 'Connect to Carvuk Database'}
                             </h3>
                             <p className="text-slate-500 mb-6">
                                Automatically load data from the shared Google Sheet.
                             </p>
                             
                             <span className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold group-hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/10">
                                {isProcessing ? 'Loading Data...' : 'Start Analysis'}
                             </span>
                        </button>
                        
                        <div className="text-center mt-8">
                             <p className="text-sm text-slate-400 mb-2">Have a local file instead?</p>
                             <button 
                                onClick={() => setShowUpload(true)}
                                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                             >
                                <FileText size={16} />
                                Upload .xlsx file
                             </button>
                        </div>
                    </div>
                )}
                
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-center px-4 pb-10">
                    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CloudLightning size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">1. Connect Data</h3>
                        <p className="text-slate-500">Instant connection to live Google Sheets.</p>
                    </div>
                    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">2. Ask Questions</h3>
                        <p className="text-slate-500">Analyze metrics like CAC, ROAS, or AOV.</p>
                    </div>
                    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <BarChart size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">3. Visualize Data</h3>
                        <p className="text-slate-500">Auto-generate charts and visual insights.</p>
                    </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden p-3 md:p-6 gap-6 animate-fade-in">
            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 shrink-0 mb-2">
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                        activeTab === 'data' 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Table size={16} />
                        <span>Data View</span>
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                        activeTab === 'chat' 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <MessageSquare size={16} />
                        <span>Analysis</span>
                    </div>
                </button>
            </div>

            {/* Data Panel */}
            <div className={`
                flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300
                ${activeTab === 'data' ? 'h-full opacity-100' : 'hidden md:flex md:h-full md:opacity-100'}
            `}>
               {excelData && <DataTable data={excelData} />}
            </div>

            {/* Chat Panel */}
            <div className={`
                w-full md:w-[450px] lg:w-[500px] flex flex-col min-h-0 transition-all duration-300
                ${activeTab === 'chat' ? 'h-full opacity-100' : 'hidden md:flex md:h-full md:opacity-100'}
            `}>
               <ChatInterface 
                  messages={messages} 
                  onSendMessage={handleSendMessage}
                  isTyping={isTyping}
               />
            </div>
          </div>
        )}
      </main>

      {/* Credits Modal */}
      {showCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="p-4 flex justify-end">
                    <button 
                        onClick={() => setShowCredits(false)} 
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="px-8 pb-10 text-center flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-indigo-200 mb-6 transform hover:scale-105 transition-transform duration-300">
                         <img 
                            src="https://github.com/catalvarezs.png" 
                            alt="Catalina Alvarez" 
                            className="w-full h-full object-cover"
                         />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Prueba Técnica</h4>
                    <p className="text-lg font-semibold text-indigo-600 mb-4">Growth Engineer</p>
                    <div className="h-px w-16 bg-slate-200 mb-4"></div>
                    <p className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-wide">Developed for Carvuk</p>
                    
                    <a 
                        href="https://github.com/catalvarezs" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1 shadow-lg w-full justify-center group"
                    >
                        <Github size={20} className="text-slate-400 group-hover:text-white transition-colors"/>
                        <span className="font-semibold">github.com/catalvarezs</span>
                    </a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;