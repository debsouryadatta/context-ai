import { useRef, useEffect } from "react";
import ResizableContainer from "./ResizableContainer";
import { Message, Chat } from "../types";
import ChatMessage from "./ChatMessage";
import ChatHistory from "./ChatHistory";

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
            </div>
          </button>
          <button
            onClick={toggleIncludePageContent}
            className={`relative group text-white hover:text-gray-200 focus:outline-none mr-2 ${
              includePageContent ? "text-yellow-300" : "text-white"
            }`}
            aria-label={includePageContent ? "Disable page content" : "Include page content"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {includePageContent 
                ? "Disable page content" 
                : "Include page content"}
            </div>
          </button>
          <button
            onClick={createNewChat}
            className="text-white hover:text-gray-200 focus:outline-none mr-2 relative group"
            aria-label="New chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              New chat
            </div>
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
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
        className={`flex-1 p-3 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} scroll-smooth hide-scrollbar`}
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
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="flex items-center">
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
                        {includePageContent ? 'Page content is enabled.' : 'Enable page content.'}
                      </button>
                    </span>
                </p>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </ResizableContainer>
  );
};

export default ChatInterface;
