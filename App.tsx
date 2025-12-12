import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { ChatInterface } from './components/ChatInterface';
import { parseExcelFile, fetchGoogleSheet } from './utils/excelParser';
import { generateDataAnalysis } from './services/geminiService';
import { ExcelData, ChatMessage, AppState } from './types';
import { Table, MessageSquare, ArrowLeft, Link as LinkIcon, Menu, Github, X, BarChart, Database, Zap, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'chat'>('chat');
  const [sheetInput, setSheetInput] = useState('');
  const [showCredits, setShowCredits] = useState(false);

  const processData = (data: ExcelData) => {
    setExcelData(data);
    setAppState(AppState.ANALYSIS);
    
    const totalSheets = data.sheets.length;
    
    setMessages([{
      id: 'init',
      role: 'model',
      content: `I've connected to **${data.fileName}** (${totalSheets} sheets detected). \n\nReady to analyze your growth metrics.`,
      timestamp: Date.now()
    }]);
  };

  const handleConnectToSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetInput.trim()) return;

    setIsProcessing(true);
    try {
      const data = await fetchGoogleSheet(sheetInput);
      processData(data);
    } catch (error: any) {
      console.error("Connection Error", error);
      alert(error.message || "Failed to connect to Google Sheet.");
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
            content: responseText || "No response generated.",
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, newAiMsg]);

    } catch (error) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            content: "Analysis failed. Please check your query.",
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
    setSheetInput('');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1.5 rounded-md">
                <BarChart size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">Growth Marketing <span className="text-gray-400 font-normal">APP</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowCredits(true)}
                className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
            >
                About
            </button>
            {appState === AppState.ANALYSIS && (
                <button 
                onClick={resetApp}
                className="text-xs font-medium text-gray-600 hover:text-black flex items-center gap-1 transition-colors px-3 py-1.5 rounded hover:bg-gray-100"
                >
                <ArrowLeft size={14} />
                <span>Disconnect</span>
                </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative w-full max-w-6xl mx-auto">
        
        {appState === AppState.UPLOAD ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-10 animate-fade-in custom-scrollbar">
             <div className="max-w-2xl mx-auto mt-10">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                        Connect your data
                    </h2>
                    <p className="text-gray-500 leading-relaxed">
                        Analyze your Growth & Marketing metrics effortlessly. Connect any Google Sheet or upload an Excel file to get started with our AI Analyst.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Option 1: Google Sheet */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 text-green-700 rounded-lg">
                                <Database size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Google Sheets</h3>
                                <p className="text-xs text-gray-500">Paste a link to any public or shared sheet</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleConnectToSheet} className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="https://docs.google.com/spreadsheets/d/..." 
                                value={sheetInput}
                                onChange={(e) => setSheetInput(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md focus:ring-1 focus:ring-black focus:border-black block w-full p-2.5 outline-none transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={isProcessing || !sheetInput}
                                className="text-white bg-black hover:bg-gray-800 font-medium rounded-md text-sm px-5 py-2.5 text-center inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isProcessing ? 'Connecting...' : 'Connect'}
                                {!isProcessing && <Zap size={14} />}
                            </button>
                        </form>
                        <p className="mt-2 text-[10px] text-gray-400">
                            *Ensure the sheet is accessible to "Anyone with the link".
                        </p>
                    </div>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Option 2: File Upload */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                             <div className="p-2 bg-gray-50 text-gray-700 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Local Excel File</h3>
                                <p className="text-xs text-gray-500">Upload .xlsx or .xls files directly</p>
                            </div>
                        </div>
                        <FileUpload onFileSelect={handleFileSelect} isLoading={isProcessing} />
                    </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden p-4 gap-4 animate-fade-in">
            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex bg-gray-100 rounded-lg p-1 shrink-0 mb-2">
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                        activeTab === 'data' 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-gray-500'
                    }`}
                >
                    Data View
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                        activeTab === 'chat' 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-gray-500'
                    }`}
                >
                    Analysis
                </button>
            </div>

            {/* Data Panel */}
            <div className={`
                flex-1 flex flex-col min-h-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-300
                ${activeTab === 'data' ? 'h-full opacity-100' : 'hidden md:flex md:h-full md:opacity-100'}
            `}>
               {excelData && <DataTable data={excelData} />}
            </div>

            {/* Chat Panel */}
            <div className={`
                w-full md:w-[420px] lg:w-[480px] flex flex-col min-h-0 transition-all duration-300
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
                <div className="p-4 flex justify-end">
                    <button 
                        onClick={() => setShowCredits(false)} 
                        className="p-1 text-gray-400 hover:text-black rounded hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="px-8 pb-10 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 mb-4">
                         <img 
                            src="https://github.com/catalvarezs.png" 
                            alt="Catalina Alvarez" 
                            className="w-full h-full object-cover"
                         />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-6">Code by Catalina, 2025</h4>
                    
                    <a 
                        href="https://github.com/catalvarezs" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all w-full justify-center text-sm font-medium"
                    >
                        <Github size={16} />
                        <span>github.com/catalvarezs</span>
                    </a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;