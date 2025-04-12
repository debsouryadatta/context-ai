import { useState, useEffect } from "react";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import ChatInterface from "./ChatInterface";

// Cross-browser compatibility
declare const chrome: any;
declare const browser: any;
const browserAPI = typeof chrome !== "undefined" ? chrome : browser;

// Default dimensions
const DEFAULT_WIDTH = 384; // w-96 = 24rem = 384px
const DEFAULT_HEIGHT = 600;

const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [chatDimensions, setChatDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  // Load settings from storage when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await browserAPI.storage.sync.get(["config"]);
        console.log("Loaded config:", result);

        if (result.config) {
          setApiKey(result.config.geminiApiKey || "");
          setIsEnabled(result.config.extensionEnabled || false);
          
          // Load saved dimensions if they exist
          if (result.config.chatDimensions) {
            setChatDimensions(result.config.chatDimensions);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();

    // Add listener for configuration changes from popup
    const handleMessage = (message: any) => {
      console.log("Received message in content script:", message);

      if (message.type === "CONFIG_UPDATED" && message.config) {
        console.log("Updating config in content script:", message.config);
        setApiKey(message.config.geminiApiKey || "");
        setIsEnabled(message.config.extensionEnabled || false);
        
        // Update dimensions if they exist in the updated config
        if (message.config.chatDimensions) {
          setChatDimensions(message.config.chatDimensions);
        }
      }
    };
    browserAPI.runtime.onMessage.addListener(handleMessage);

    // Clean up listener when component unmounts
    return () => {
      browserAPI.runtime.onMessage.removeListener(handleMessage);
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

    const userMessage = inputValue;
    setInputValue("");

    // Add user message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userMessage },
    ]);

    // Show loading state
    setIsLoading(true);
    setStreamingMessage("");

    try {
      // Initialize the Gemini model with the API key
      const geminiModel = createGoogleGenerativeAI({
        apiKey: apiKey,
      });

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

      // Use the Vercel AI SDK to stream the response
      const { textStream } = streamText({
        model: geminiModel("gemini-2.0-flash"),
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
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: fullResponse },
      ]);
      setStreamingMessage("");
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
    <div className="fixed right-10 bottom-10 flex flex-col items-end z-50 font-sans">
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
        />
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>Ask AI</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default Assistant;
