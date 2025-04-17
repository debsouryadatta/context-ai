import { useState, useEffect } from "react";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { v4 as uuidv4 } from "uuid";
import ChatInterface from "./ChatInterface";
import { Message, Chat } from "../types";
import { X, HelpCircle } from "lucide-react";

// Cross-browser compatibility
declare const chrome: any;
declare const browser: any;
const browserAPI = typeof chrome !== "undefined" ? chrome : browser;

// Default dimensions
const DEFAULT_WIDTH = 484; // w-96 = 24rem = 384px
const DEFAULT_HEIGHT = 600;

const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [includePageContent, setIncludePageContent] = useState(false);
  const [searchToolEnabled, setSearchToolEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [modelSelection, setModelSelection] = useState<string>("gemini-2.0-flash-exp");
  const [chatDimensions, setChatDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");

  // Load settings from storage when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await browserAPI.storage.sync.get(["config"]);
        console.log("Loaded config:", result);

        if (result.config) {
          setApiKey(result.config.geminiApiKey || "");
          setIsEnabled(result.config.extensionEnabled || false);
          
          // Load saved model if it exists
          if (result.config.geminiModel) {
            setModelSelection(result.config.geminiModel);
          }
          
          // Load saved theme if it exists
          if (result.config.theme) {
            setTheme(result.config.theme);
          }
          
          // Load saved dimensions if they exist
          if (result.config.chatDimensions) {
            setChatDimensions(result.config.chatDimensions);
          }
          
          // Load chat history if it exists
          if (result.config.chat_history) {
            setChatHistory(result.config.chat_history);
          } else {
            // Initialize with an empty chat history array
            const updatedConfig = {
              ...result.config,
              chat_history: []
            };
            await browserAPI.storage.sync.set({ config: updatedConfig });
          }
          
          // Set current chat ID if it exists
          if (result.config.current_chat_id) {
            setCurrentChatId(result.config.current_chat_id);
            
            // Load messages for current chat
            const currentChat = result.config.chat_history?.find(
              (chat: Chat) => chat.id === result.config.current_chat_id
            );
            
            if (currentChat) {
              setMessages(currentChat.messages);
              setIncludePageContent(currentChat.page_content_included);
              setSearchToolEnabled(currentChat.search_tool_enabled);
            }
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();

    // Add storage change listener to sync state across tabs
    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === 'sync' && changes.config) {
        const newConfig = changes.config.newValue;
        
        // Update state with new config values
        if (newConfig) {
          setApiKey(newConfig.geminiApiKey || "");
          setIsEnabled(newConfig.extensionEnabled || false);
          
          if (newConfig.geminiModel) {
            setModelSelection(newConfig.geminiModel);
          }
          
          if (newConfig.theme) {
            setTheme(newConfig.theme);
          }
          
          if (newConfig.chatDimensions) {
            setChatDimensions(newConfig.chatDimensions);
          }
          
          if (newConfig.chat_history) {
            setChatHistory(newConfig.chat_history);
          }
          
          // Always update current chat ID and messages to match the storage
          // This ensures that when switching back to a tab, it shows the most recent chat
          if (newConfig.current_chat_id) {
            // Only update if the chat ID has changed or if we're viewing the same chat
            // that was updated elsewhere
            const shouldUpdateChat = 
              newConfig.current_chat_id !== currentChatId || 
              (newConfig.current_chat_id === currentChatId && changes.config.oldValue?.chat_history);
              
            if (shouldUpdateChat) {
              setCurrentChatId(newConfig.current_chat_id);
              
              const updatedCurrentChat = newConfig.chat_history?.find(
                (chat: Chat) => chat.id === newConfig.current_chat_id
              );
              
              if (updatedCurrentChat) {
                setMessages(updatedCurrentChat.messages);
                setIncludePageContent(updatedCurrentChat.page_content_included);
                setSearchToolEnabled(updatedCurrentChat.search_tool_enabled);
              }
            }
          }
        }
      }
    };

    // Add the storage listener
    browserAPI.storage.onChanged.addListener(handleStorageChange);


    // Add listener for configuration changes from popup
    const handleMessage = (message: any) => {
      console.log("Received message in content script:", message);

      if (message.type === "CONFIG_UPDATED" && message.config) {
        console.log("Updating config in content script:", message.config);
        setApiKey(message.config.geminiApiKey || "");
        setIsEnabled(message.config.extensionEnabled || false);
        
        // Update model if it exists in the updated config
        if (message.config.geminiModel) {
          setModelSelection(message.config.geminiModel);
        }
        
        // Update theme if it exists in the updated config
        if (message.config.theme) {
          setTheme(message.config.theme);
        }
        
        // Update dimensions if they exist in the updated config
        if (message.config.chatDimensions) {
          setChatDimensions(message.config.chatDimensions);
        }
        
        // Update chat history if it exists
        if (message.config.chat_history) {
          setChatHistory(message.config.chat_history);
        }
        
        // Update current chat ID if it exists
        if (message.config.current_chat_id) {
          setCurrentChatId(message.config.current_chat_id);
          
          // Load messages for current chat
          const currentChat = message.config.chat_history?.find(
            (chat: Chat) => chat.id === message.config.current_chat_id
          );
          
          if (currentChat) {
            setMessages(currentChat.messages);
            setIncludePageContent(currentChat.page_content_included);
            setSearchToolEnabled(currentChat.search_tool_enabled);
          }
        }
      }
    };
    browserAPI.runtime.onMessage.addListener(handleMessage);

    // Clean up listener when component unmounts
    return () => {
      browserAPI.runtime.onMessage.removeListener(handleMessage);
      browserAPI.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // This function is now handled directly in the ChatInterface component
    // We keep it here for compatibility with the interface
  };

  // Save chat dimensions to storage
  const saveChatDimensions = async (width: number, height: number) => {
    try {
      // Get current config
      const result = await browserAPI.storage.sync.get(["config"]);
      const config = result.config || {};
      
      // Update config with new dimensions
      const updatedConfig = {
        ...config,
        chatDimensions: { width, height }
      };
      
      // Save updated config
      await browserAPI.storage.sync.set({ config: updatedConfig });
      console.log("Chat dimensions saved:", { width, height });
      
      // Update local state
      setChatDimensions({ width, height });
    } catch (error) {
      console.error("Error saving chat dimensions:", error);
    }
  };

  // Create a new chat
  const createNewChat = async () => {
    try {
      // Generate a new chat ID
      const newChatId = uuidv4();
      const now = new Date().toISOString();
      
      // Create a new chat object
      const newChat: Chat = {
        id: newChatId,
        messages: [],
        page_content_included: includePageContent,
        search_tool_enabled: searchToolEnabled,
        created_at: now,
        updated_at: now,
        title: "New Chat" // Default title
      };
      
      // Get current config
      const result = await browserAPI.storage.sync.get(["config"]);
      const config = result.config || {};
      
      // Update chat history with new chat
      const updatedChatHistory = [...(config.chat_history || []), newChat];
      
      // Update config with new chat history and current chat ID
      const updatedConfig = {
        ...config,
        chat_history: updatedChatHistory,
        current_chat_id: newChatId
      };
      
      // Save updated config
      await browserAPI.storage.sync.set({ config: updatedConfig });
      
      // Update local state
      setChatHistory(updatedChatHistory);
      setCurrentChatId(newChatId);
      setMessages([]);
      setShowChatList(false);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  // Switch to a different chat
  const switchChat = async (chatId: string) => {
    try {
      // Get current config
      const result = await browserAPI.storage.sync.get(["config"]);
      const config = result.config || {};
      
      // Find the selected chat
      const selectedChat = config.chat_history?.find(
        (chat: Chat) => chat.id === chatId
      );
      
      if (selectedChat) {
        // Update config with new current chat ID
        const updatedConfig = {
          ...config,
          current_chat_id: chatId
        };
        
        // Save updated config
        await browserAPI.storage.sync.set({ config: updatedConfig });
        
        // Update local state
        setCurrentChatId(chatId);
        setMessages(selectedChat.messages);
        setIncludePageContent(selectedChat.page_content_included);
        setSearchToolEnabled(selectedChat.search_tool_enabled);
        setShowChatList(false);
      }
    } catch (error) {
      console.error("Error switching chat:", error);
    }
  };

  // Delete a chat
  const deleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the switchChat function
    
    try {
      // Get current config
      const result = await browserAPI.storage.sync.get(["config"]);
      const config = result.config || {};
      
      // Filter out the chat to delete
      const updatedChatHistory = config.chat_history?.filter(
        (chat: Chat) => chat.id !== chatId
      );
      
      // Determine new current chat ID
      let newCurrentChatId = currentChatId;
      if (chatId === currentChatId) {
        // If we're deleting the current chat, switch to the last available chat
        // or create a new one if there are no chats left
        newCurrentChatId = updatedChatHistory.length > 0 ? updatedChatHistory[updatedChatHistory.length - 1].id : "";
      }
      
      // Update config with new chat history and current chat ID
      const updatedConfig = {
        ...config,
        chat_history: updatedChatHistory,
        current_chat_id: newCurrentChatId
      };
      
      // Save updated config
      await browserAPI.storage.sync.set({ config: updatedConfig });
      
      // Update local state
      setChatHistory(updatedChatHistory);
      
      if (chatId === currentChatId) {
        if (updatedChatHistory.length > 0) {
          // Switch to the last available chat
          setCurrentChatId(updatedChatHistory[updatedChatHistory.length - 1].id);
          setMessages(updatedChatHistory[updatedChatHistory.length - 1].messages);
          setIncludePageContent(updatedChatHistory[updatedChatHistory.length - 1].page_content_included);
          setSearchToolEnabled(updatedChatHistory[updatedChatHistory.length - 1].search_tool_enabled);
        } else {
          // No chats left, create a new one
          await createNewChat();
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Toggle including page content
  const toggleIncludePageContent = async () => {
    const newIncludePageContent = !includePageContent;
    setIncludePageContent(newIncludePageContent);
    
    // If we have a current chat, update its page_content_included property
    if (currentChatId) {
      try {
        // Get current config
        const result = await browserAPI.storage.sync.get(["config"]);
        const config = result.config || {};
        
        // Update the current chat
        const updatedChatHistory = config.chat_history?.map((chat: Chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              page_content_included: newIncludePageContent,
              updated_at: new Date().toISOString()
            };
          }
          return chat;
        });
        
        // Update config with new chat history
        const updatedConfig = {
          ...config,
          chat_history: updatedChatHistory
        };
        
        // Save updated config
        await browserAPI.storage.sync.set({ config: updatedConfig });
        
        // Update local state
        setChatHistory(updatedChatHistory);
      } catch (error) {
        console.error("Error toggling page content inclusion:", error);
      }
    }
  };

  // Toggle search tool
  const toggleSearchToolEnabled = async () => {
    const newSearchToolEnabled = !searchToolEnabled;
    setSearchToolEnabled(newSearchToolEnabled);
    
    // If we have a current chat, update its search_tool_enabled property
    if (currentChatId) {
      try {
        // Get current config
        const result = await browserAPI.storage.sync.get(["config"]);
        const config = result.config || {};
        
        // Update the current chat
        const updatedChatHistory = config.chat_history?.map((chat: Chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              search_tool_enabled: newSearchToolEnabled,
              updated_at: new Date().toISOString()
            };
          }
          return chat;
        });
        
        // Update config with new chat history
        const updatedConfig = {
          ...config,
          chat_history: updatedChatHistory
        };
        
        // Save updated config
        await browserAPI.storage.sync.set({ config: updatedConfig });
        
        // Update local state
        setChatHistory(updatedChatHistory);
      } catch (error) {
        console.error("Error toggling search tool:", error);
      }
    }
  };

  // Update chat title
  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      // Get current config
      const result = await browserAPI.storage.sync.get(["config"]);
      const config = result.config || {};
      
      // Update the chat title
      const updatedChatHistory = config.chat_history?.map((chat: Chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            title: newTitle,
            updated_at: new Date().toISOString()
          };
        }
        return chat;
      });
      
      // Update config with new chat history
      const updatedConfig = {
        ...config,
        chat_history: updatedChatHistory
      };
      
      // Save updated config
      await browserAPI.storage.sync.set({ config: updatedConfig });
      
      // Update local state
      setChatHistory(updatedChatHistory);
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  // Toggle theme between light and dark
  const toggleTheme = async () => {
    try {
      // Toggle theme
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      
      // Get current config
      const result = await browserAPI.storage.sync.get(["config"]);
      const config = result.config || {};
      
      // Update config with new theme
      const updatedConfig = {
        ...config,
        theme: newTheme
      };
      
      // Save updated config
      await browserAPI.storage.sync.set({ config: updatedConfig });
      
      console.log(`Theme switched to ${newTheme} mode`);
    } catch (error) {
      console.error("Error toggling theme:", error);
    }
  };

  // Handle model selection change
  const handleModelChange = async (model: string) => {
    setModelSelection(model);
    
    try {
      // Get current config
      const result = await browserAPI.storage.sync.get(["config"]);
      
      if (result.config) {
        // Update config with new model
        const updatedConfig = {
          ...result.config,
          geminiModel: model
        };
        
        // Save updated config
        await browserAPI.storage.sync.set({ config: updatedConfig });
      }
    } catch (error) {
      console.error("Error saving model selection:", error);
    }
  };

  // Get page content to include as context
  const getPageContent = async () => {
    // This function extracts the current page content
    // We'll use document.body.innerText to get the text content of the page
    // You might want to refine this to extract more relevant content
    const pageContent = document.body.innerText;
    
    // Truncate to a reasonable length (e.g., first 1000 characters)
    // Gemini has context limits, so we need to be mindful of that
    return pageContent.substring(0, 1000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if API key is available
    if (!apiKey) {
      setMessages([
        ...messages,
        { role: "user", content: inputValue },
        {
          role: "assistant",
          content:
            "Please add your Gemini API key in the extension popup to use this feature.",
        },
      ]);
      setInputValue("");
      return;
    }

    // Create a new chat if there isn't one already
    if (!currentChatId) {
      await createNewChat();
    }

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // Add user message to the chat
    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);

    try {
      // Initialize the Gemini model with the API key
      const genAI = createGoogleGenerativeAI({
        apiKey: apiKey,
      });

      // Get page content if it's enabled for this chat
      let contextMessage = null;
      if (includePageContent) {
        const pageContent = await getPageContent();
        if (pageContent) {
          contextMessage = {
            role: "system" as const,
            content: `Context from current page:\n${pageContent}`,
          };
        }
      }

      // Format messages for the AI SDK
      const formattedMessages = messages
        .map((msg) => {
          // Ensure proper typing for roles
          switch (msg.role) {
            case "user":
              return { role: "user" as const, content: msg.content };
            case "assistant":
              return { role: "assistant" as const, content: msg.content };
            case "system":
              return { role: "system" as const, content: msg.content };
            default:
              // Handle any other roles appropriately
              console.warn(`Unrecognized role: ${msg.role}`);
              // Default to user if unknown
              return { role: "user" as const, content: msg.content };
          }
        })
        .concat({ role: "user" as const, content: userMessage });

      // Add context message if available
      if (contextMessage) {
        formattedMessages.unshift(contextMessage);
      }

      // Use the Vercel AI SDK to stream the response
      const { textStream } = streamText({
        model: genAI(modelSelection, { useSearchGrounding: searchToolEnabled }),
        messages: formattedMessages,
        temperature: 0.7,
      });

      // Process the text stream
      let fullResponse = "";
      for await (const chunk of textStream) {
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      }

      // When stream is complete, add the full response to messages
      const messagesWithResponse = [
        ...updatedMessages,
        { role: "assistant", content: fullResponse },
      ];
      setMessages(messagesWithResponse);
      setStreamingMessage("");

      // Save the updated messages to the current chat
      try {
        // Get current config
        const result = await browserAPI.storage.sync.get(["config"]);
        const config = result.config || {};
        
        // Update the current chat
        const updatedChatHistory = config.chat_history?.map((chat: Chat) => {
          if (chat.id === config.current_chat_id) {
            // If this is the first message and no custom title has been set, use the user message as title
            let chatTitle = chat.title;
            if (updatedMessages.length === 1 && updatedMessages[0].role === "user" && (!chat.title || chat.title === "New Chat")) {
              // Truncate the message if it's too long
              const userMessageContent = updatedMessages[0].content;
              chatTitle = userMessageContent.length > 30 ? userMessageContent.substring(0, 30) + "..." : userMessageContent;
            }
            
            return {
              ...chat,
              messages: messagesWithResponse,
              updated_at: new Date().toISOString(),
              title: chatTitle
            };
          }
          return chat;
        });
        
        // Update config with new chat history
        const updatedConfig = {
          ...config,
          chat_history: updatedChatHistory
        };
        
        // Save updated config
        await browserAPI.storage.sync.set({ config: updatedConfig });
        
        // Update local state
        setChatHistory(updatedChatHistory);
      } catch (error) {
        console.error("Error saving chat messages:", error);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please check your API key and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // If extension is disabled, don't render anything
  if (!isEnabled) return null;

  return (
    <div className="fixed right-10 bottom-10 flex flex-col items-end z-[500] font-sans">
      {/* Chat Interface */}
      {isOpen && (
        <ChatInterface
          messages={messages}
          streamingMessage={streamingMessage}
          isLoading={isLoading}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSendMessage={handleSendMessage}
          onClose={toggleChat}
          chatDimensions={chatDimensions}
          saveChatDimensions={saveChatDimensions}
          chatHistory={chatHistory}
          currentChatId={currentChatId}
          createNewChat={createNewChat}
          switchChat={switchChat}
          deleteChat={deleteChat}
          includePageContent={includePageContent}
          toggleIncludePageContent={toggleIncludePageContent}
          showChatList={showChatList}
          toggleChatList={() => setShowChatList(!showChatList)}
          updateChatTitle={updateChatTitle}
          theme={theme}
          toggleTheme={toggleTheme}
          modelSelection={modelSelection}
          onModelChange={handleModelChange}
          searchToolEnabled={searchToolEnabled}
          toggleSearchToolEnabled={toggleSearchToolEnabled}
        />
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="flex items-center">
            <HelpCircle className="h-6 w-6 mr-2" />
            <span>Ask AI</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default Assistant;
