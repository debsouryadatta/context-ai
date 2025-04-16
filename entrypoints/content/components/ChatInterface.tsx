import { useRef, useEffect } from "react";
import ResizableContainer from "./ResizableContainer";
import { Message, Chat } from "../types";
import ChatMessage from "./ChatMessage";
import ChatHistory from "./ChatHistory";
import { 
  Moon, 
  Sun, 
  FileText, 
  Search, 
  Plus, 
  X, 
  Send, 
  ChevronDown,
  Menu
} from "lucide-react";

interface ChatInterfaceProps {
  messages: Message[];
  streamingMessage: string;
  isLoading: boolean;
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  onClose: () => void;
  chatDimensions: { width: number; height: number };
  saveChatDimensions: (width: number, height: number) => Promise<void>;
  chatHistory: Chat[];
  currentChatId: string;
  createNewChat: () => Promise<void>;
  switchChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string, event: React.MouseEvent) => Promise<void>;
  includePageContent: boolean;
  toggleIncludePageContent: () => Promise<void>;
  searchToolEnabled: boolean;
  toggleSearchToolEnabled: () => void;
  showChatList: boolean;
  toggleChatList: () => void;
  updateChatTitle?: (chatId: string, newTitle: string) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => Promise<void>;
  modelSelection: string;
  onModelChange: (model: string) => Promise<void>;
}

const ChatInterface = ({
  messages,
  streamingMessage,
  isLoading,
  inputValue,
  onInputChange,
  onKeyDown,
  onSendMessage,
  onClose,
  chatDimensions,
  saveChatDimensions,
  chatHistory,
  currentChatId,
  createNewChat,
  switchChat,
  deleteChat,
  includePageContent,
  toggleIncludePageContent,
  searchToolEnabled,
  toggleSearchToolEnabled,
  showChatList,
  toggleChatList,
  updateChatTitle,
  theme,
  toggleTheme,
  modelSelection,
  onModelChange,
}: ChatInterfaceProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  return (
    <ResizableContainer
      dimensions={chatDimensions}
      onDimensionsChange={saveChatDimensions}
      className={`mb-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border flex flex-col overflow-hidden transition-all duration-300 ease-in-out`}
      handlePosition="top-left"
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={toggleChatList}
            className="text-white hover:text-gray-200 focus:outline-none mr-2 relative group"
            aria-label="Chat history"
          >
            <Menu className="h-5 w-5" />
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              View chat history
            </div>
          </button>
          <h3 className="font-medium">Context AI</h3>
        </div>
        <div className="flex items-center">
          {/* Model Selector Dropdown */}
          <div className="relative group mr-2">
            <button
              className="text-white hover:text-gray-200 focus:outline-none flex items-center"
              aria-label="Select AI model"
            >
              <ChevronDown className="h-5 w-5 mr-1" />
              <span className="text-xs">
                {modelSelection === "gemini-2.0-flash-exp" ? "Gemini 2.0 Flash" : "Gemini 2.5 Pro"}
              </span>
            </button>
            <div className="absolute right-0 top-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 hidden group-hover:block">
              <div className="py-1">
                <button
                  onClick={() => onModelChange("gemini-2.0-flash-exp")}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    modelSelection === "gemini-2.0-flash-exp"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Gemini 2.0 Flash
                </button>
                <button
                  onClick={() => onModelChange("gemini-2.5-pro-preview-03-25")}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    modelSelection === "gemini-2.5-pro-preview-03-25"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Gemini 2.5 Pro
                </button>
              </div>
            </div>
          </div>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="relative group text-white hover:text-gray-200 focus:outline-none mr-2"
            aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
            </div>
          </button>
          {/* Include Page Content Toggle Button */}
          <button
            onClick={toggleIncludePageContent}
            className={`relative group text-white hover:text-gray-200 focus:outline-none mr-2 ${
              includePageContent ? "text-yellow-300" : "text-white"
            }`}
            aria-label={includePageContent ? "Disable page content" : "Enable page content"}
          >
            <FileText className="h-5 w-5" />
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {includePageContent 
                ? "Disable page content" 
                : "Enable page content"}
            </div>
          </button>
          {/* Search Tool Toggle Button */}
          <button
            onClick={toggleSearchToolEnabled}
            className={`text-white hover:text-gray-200 focus:outline-none mr-2 relative group ${
              searchToolEnabled ? "text-yellow-300" : "text-white"
            }`}
            aria-label={searchToolEnabled ? "Disable search tool" : "Enable search tool"}
          >
            <Search className="h-5 w-5" />
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {searchToolEnabled 
                ? "Disable search tool" 
                : "Enable search tool"}
            </div>
          </button>
          <button
            onClick={createNewChat}
            className="text-white hover:text-gray-200 focus:outline-none mr-2 relative group"
            aria-label="New chat"
          >
            <Plus className="h-5 w-5" />
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              New chat
            </div>
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat History Sidebar */}
      {showChatList && (
        <ChatHistory
          chatHistory={chatHistory}
          currentChatId={currentChatId}
          switchChat={switchChat}
          deleteChat={deleteChat}
          createNewChat={createNewChat}
          updateChatTitle={updateChatTitle}
          theme={theme}
        />
      )}

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className={`flex-1 p-3 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} scroll-smooth`}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className={`max-w-md p-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
              <h3 className="text-lg font-medium mb-2">Welcome to Context AI</h3>
              <p className="mb-4">
                Ask me anything or try one of these examples:
              </p>
              <div className="space-y-2">
                <div 
                  className={`p-2 rounded cursor-pointer ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  onClick={() => {
                    onInputChange({ target: { value: "Summarize this page for me" } } as any);
                    onSendMessage();
                  }}
                >
                  Summarize this page for me
                </div>
                <div 
                  className={`p-2 rounded cursor-pointer ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  onClick={() => {
                    onInputChange({ target: { value: "What are the main topics on this page?" } } as any);
                    onSendMessage();
                  }}
                >
                  What are the main topics on this page?
                </div>
                <div 
                  className={`p-2 rounded cursor-pointer ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  onClick={() => {
                    onInputChange({ target: { value: "Explain this concept in simple terms" } } as any);
                    onSendMessage();
                  }}
                >
                  Explain this concept in simple terms
                </div>
              </div>
              <div className="mt-4">
                <div className={`flex flex-col gap-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={toggleIncludePageContent}
                      className={`inline-flex items-center text-xs ${includePageContent ? 'text-yellow-500 hover:text-yellow-400' : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          name="toggle"
                          id="toggle"
                          checked={includePageContent}
                          onChange={toggleIncludePageContent}
                          className="sr-only"
                        />
                        <div className={`block h-6 rounded-full ${includePageContent ? 'bg-yellow-400' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} w-10`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${includePageContent ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="w-40 text-left">
                        {includePageContent ? 'Page content is enabled.' : 'Enable page content.'}
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={toggleSearchToolEnabled}
                      className={`inline-flex items-center text-xs ${searchToolEnabled ? 'text-yellow-500 hover:text-yellow-400' : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          name="toggle-search"
                          id="toggle-search"
                          checked={searchToolEnabled}
                          onChange={toggleSearchToolEnabled}
                          className="sr-only"
                        />
                        <div className={`block h-6 rounded-full ${searchToolEnabled ? 'bg-yellow-400' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} w-10`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${searchToolEnabled ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="w-40 text-left">
                        {searchToolEnabled ? 'Search tool is enabled.' : 'Enable search tool.'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Regular messages */}
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} theme={theme} />
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <ChatMessage
                message={{ role: "assistant", content: streamingMessage }}
                theme={theme}
              />
            )}

            {/* Loading indicator (only shown when no streaming content yet) */}
            {isLoading && !streamingMessage && (
              <ChatMessage
                message={{ role: "assistant", content: "" }}
                streaming={true}
                theme={theme}
              />
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`border-t p-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center">
          <textarea
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              } else {
                onKeyDown(e);
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className={`flex-1 border rounded-l-lg py-2 px-3 focus:outline-none resize-none overflow-y-auto max-h-24 min-h-[38px] ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-black placeholder-gray-500'
            }`}
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`p-2 rounded-r-lg h-[42px] ${
              !inputValue.trim() || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </ResizableContainer>
  );
};

export default ChatInterface;
