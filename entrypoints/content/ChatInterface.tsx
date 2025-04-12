import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import ResizableContainer from "./ResizableContainer";

interface Message {
  role: string;
  content: string;
}

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
}: ChatInterfaceProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  // Function to render message content with or without markdown
  const renderMessageContent = (content: string, isAssistant: boolean) => {
    if (isAssistant) {
      return (
        <div className="prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:p-2 prose-pre:rounded prose-pre:text-xs prose-code:text-gray-100 prose-code:bg-gray-800 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown children={content} />
        </div>
      );
    }
    return content;
  };

  return (
    <ResizableContainer
      dimensions={chatDimensions}
      onDimensionsChange={saveChatDimensions}
      className="mb-4 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
      handlePosition="top-left"
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white p-3 flex justify-between items-center">
        <h3 className="font-medium">Gemini AI Assistant</h3>
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none ml-2"
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

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-3 overflow-y-auto bg-gray-50 scroll-smooth hide-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div>
              <div className="text-4xl mb-2">👋</div>
              <p>How can I help you today?</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-white mr-2 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-indigo-500 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {renderMessageContent(message.content, message.role === "assistant")}
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white ml-2 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming message display */}
            {streamingMessage && (
              <div className="flex items-start justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-white mr-2 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                  <div className="prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:p-2 prose-pre:rounded prose-pre:text-xs prose-code:text-gray-100 prose-code:bg-gray-800 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none">
                    <ReactMarkdown children={streamingMessage} />
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator (only shown when no streaming content yet) */}
            {isLoading && !streamingMessage && (
              <div className="flex items-start justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-white mr-2 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 bg-white">
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
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none bg-white text-black resize-none overflow-y-auto max-h-24 min-h-[38px] border border-gray-300"
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
