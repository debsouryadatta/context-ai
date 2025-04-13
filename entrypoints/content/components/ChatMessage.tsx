import React from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";

interface ChatMessageProps {
  message: Message;
  streaming?: boolean;
  theme?: 'light' | 'dark';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  streaming = false,
  theme = 'light'
}) => {
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";
  const isDark = theme === 'dark';

  // Function to render message content with or without markdown
  const renderMessageContent = (content: string) => {
    if (isAssistant) {
      return (
        <div className={`prose prose-sm max-w-none ${
          isDark 
            ? 'prose-invert prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-gray-100 prose-code:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-code:border prose-code:border-gray-700' 
            : 'prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-code:text-gray-100 prose-code:bg-gray-800'
        } prose-pre:p-2 prose-pre:rounded prose-pre:text-xs prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:whitespace-pre-wrap prose-pre:break-words prose-code:whitespace-pre-wrap prose-code:break-words`}>
          <ReactMarkdown children={content} />
        </div>
      );
    }
    return content;
  };

  return (
    <div
      className={`flex items-start ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {isAssistant && (
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
        className={`${
          isUser
            ? isDark 
              ? "bg-indigo-900 text-gray-100 rounded-lg rounded-tr-none ml-auto" 
              : "bg-indigo-100 text-gray-800 rounded-lg rounded-tr-none ml-auto"
            : isDark 
              ? "bg-gray-700 border border-gray-600 text-gray-100 rounded-lg rounded-bl-none" 
              : "bg-white border border-gray-200 text-gray-800 rounded-lg rounded-bl-none"
        } p-3 max-w-[80%]`}
      >
        {streaming && isAssistant ? (
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
        ) : (
          renderMessageContent(message.content)
        )}
      </div>
      {isUser && (
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0 ${
          isDark 
            ? "bg-indigo-900 border border-indigo-700 text-indigo-300" 
            : "bg-indigo-100 border border-indigo-200 text-indigo-500"
        }`}>
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
  );
};

export default ChatMessage;
