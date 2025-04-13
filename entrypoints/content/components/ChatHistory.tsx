import React, { useState } from "react";
import { format } from "date-fns";
import { Chat } from "../types";

interface ChatHistoryProps {
  chatHistory: Chat[];
  currentChatId: string;
  switchChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string, event: React.MouseEvent) => Promise<void>;
  createNewChat: () => Promise<void>;
  updateChatTitle?: (chatId: string, newTitle: string) => Promise<void>;
  theme?: 'light' | 'dark';
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chatHistory,
  currentChatId,
  switchChat,
  deleteChat,
  createNewChat,
  updateChatTitle,
  theme = 'light'
}) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const isDark = theme === 'dark';

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Unknown date";
    }
  };

  // Function to get chat title
  const getChatTitle = (chat: Chat) => {
    // If the chat has a custom title, use it
    if (chat.title) {
      return chat.title;
    }
    
    // If the chat has messages, use the first user message as the title
    if (chat.messages.length > 0) {
      const firstUserMessage = chat.messages.find(msg => msg.role === "user");
      if (firstUserMessage) {
        // Truncate the message if it's too long
        const title = firstUserMessage.content;
        return title.length > 30 ? title.substring(0, 30) + "..." : title;
      }
    }
    // Otherwise, use the creation date
    return `New Chat (${formatDate(chat.created_at)})`;
  };

  // Start editing a chat title
  const startEditingTitle = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the switchChat function
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setEditTitle(chat.title || getChatTitle(chat));
      setEditingChatId(chatId);
    }
  };

  // Save the edited title
  const saveTitle = async (chatId: string, event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (updateChatTitle && editTitle.trim()) {
      await updateChatTitle(chatId, editTitle.trim());
    }
    
    setEditingChatId(null);
  };

  // Cancel editing
  const cancelEditing = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingChatId(null);
  };

  // Sort chats by updated_at in descending order (newest first)
  const sortedChats = [...chatHistory].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className={`absolute top-12 left-0 w-64 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-lg h-[calc(100%-48px)] z-10 overflow-y-auto`}>
      <div className={`p-3 border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} flex justify-between items-center`}>
        <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Chat History</h4>
        <button
          onClick={createNewChat}
          className={`${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} focus:outline-none`}
          title="New chat"
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
        </button>
      </div>
      <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
        {sortedChats.length === 0 ? (
          <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No chats yet. Start a new conversation!
          </div>
        ) : (
          sortedChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              className={`p-3 ${
                isDark 
                  ? `hover:bg-gray-700 ${chat.id === currentChatId ? 'bg-gray-700' : ''}` 
                  : `hover:bg-gray-50 ${chat.id === currentChatId ? 'bg-indigo-50' : ''}`
              } cursor-pointer flex justify-between items-start`}
            >
              <div className="flex-1 min-w-0">
                {editingChatId === chat.id ? (
                  <form onSubmit={(e) => saveTitle(chat.id, e)} className="flex items-center">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={`w-full p-1 text-sm border rounded ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-black'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      className={`ml-1 ${isDark ? 'text-green-500 hover:text-green-400' : 'text-green-600 hover:text-green-800'}`}
                      onClick={(e) => saveTitle(chat.id, e)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className={`ml-1 ${isDark ? 'text-red-500 hover:text-red-400' : 'text-red-600 hover:text-red-800'}`}
                      onClick={cancelEditing}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center">
                    <p className={`font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {getChatTitle(chat)}
                    </p>
                    <button 
                      onClick={(e) => startEditingTitle(chat.id, e)}
                      className={`ml-1 focus:outline-none ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Edit title"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatDate(chat.updated_at)}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {chat.messages.length} messages
                  </span>
                  {chat.page_content_included && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                      Page content
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className={`${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} focus:outline-none ml-2`}
                title="Delete chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
