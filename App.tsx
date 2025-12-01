import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { ChatInterface } from './components/ChatInterface';
import { parseExcelFile } from './utils/excelParser';
import { generateDataAnalysis } from './services/geminiService';
import { ExcelData, ChatMessage, AppState } from './types';
import { Table, MessageSquare, ArrowLeft, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'chat'>('chat');

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await parseExcelFile(file);
      setExcelData(data);
      setAppState(AppState.ANALYSIS);
      
      // Calculate total stats
      const totalSheets = data.sheets.length;
      const sheetNames = data.sheets.map(s => s.sheetName).join(', ');
      
      // Add initial greeting
      setMessages([{
        id: 'init',
        role: 'model',
        content: `Hi! I've analyzed **${data.fileName}**. \n\nI found **${totalSheets} sheets**: ${sheetNames}. \n\nYou can ask me to analyze data from a specific sheet or cross-reference data between them (e.g., "Join data from Sheet A and Sheet B").`,
        timestamp: Date.now()
      }]);
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
        // Prepare chat history for API
        const history = messages.map(m => ({
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-1.5 rounded-lg">
                <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">ExcelChat AI</h1>
          </div>
          
          {appState === AppState.ANALYSIS && (
            <button 
              onClick={resetApp}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={16} />
              Upload New File
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        
        {appState === AppState.UPLOAD ? (
          <div className="h-full flex flex-col items-center justify-center py-20 animate-fade-in">
             <div className="text-center mb-10 max-w-2xl">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Chat with your spreadsheet</h2>
                <p className="text-lg text-slate-600">
                    Upload your Excel file and instantly get answers, summaries, and insights using the power of Gemini AI.
                </p>
             </div>
             <FileUpload onFileSelect={handleFileSelect} isLoading={isProcessing} />
             
             <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-center">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">1. Upload Excel</h3>
                    <p className="text-sm text-slate-500">Drag & drop your .xlsx file securely.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">2. Ask Questions</h3>
                    <p className="text-sm text-slate-500">Ask about trends, totals, or specific rows.</p>
                </div>
                 <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Table size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">3. Get Insights</h3>
                    <p className="text-sm text-slate-500">Receive instant analysis and summaries.</p>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-fade-in">
            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex bg-white rounded-lg p-1 border border-slate-200 mb-2">
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'data' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
                >
                    Data View
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'chat' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
                >
                    Chat Analysis
                </button>
            </div>

            {/* Data Panel */}
            <div className={`
                flex-1 flex flex-col h-full min-h-0 transition-all duration-300
                ${activeTab === 'data' ? 'block' : 'hidden md:flex'}
            `}>
               {excelData && <DataTable data={excelData} />}
            </div>

            {/* Chat Panel */}
            <div className={`
                w-full md:w-[450px] lg:w-[500px] flex flex-col h-full min-h-0 transition-all duration-300
                ${activeTab === 'chat' ? 'block' : 'hidden md:flex'}
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
    </div>
  );
};

export default App;