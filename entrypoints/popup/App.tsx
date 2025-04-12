import { useState, useEffect } from 'react';

// Cross-browser compatibility
declare const chrome: any;
declare const browser: any;
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// Config type definition
interface ExtensionConfig {
  geminiApiKey?: string;
  extensionEnabled?: boolean;
  [key: string]: any;
}

function App() {
  const [isToggled, setIsToggled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [inputApiKey, setInputApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from browser storage when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Get the entire config object
        const result = await browserAPI.storage.sync.get(['config']);
        console.log('Loaded settings:', result);
        
        const config: ExtensionConfig = result.config || {};
        
        // Set API key if it exists in storage
        if (config.geminiApiKey) {
          setApiKey(config.geminiApiKey);
          setInputApiKey(config.geminiApiKey);
        }
        
        // Set toggle state if it exists in storage
        if (config.extensionEnabled !== undefined) {
          setIsToggled(config.extensionEnabled);
        }
      } catch (error) {
        console.error('Error loading settings from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage with proper error handling
  const saveToStorage = async (key: keyof ExtensionConfig, value: any) => {
    try {
      // Get current config
      const result = await browserAPI.storage.sync.get(['config']);
      const config: ExtensionConfig = result.config || {};
      
      // Update config with new value
      const updatedConfig = {
        ...config,
        [key]: value
      };
      
      console.log(`Saving to config: ${key}:`, value);
      console.log('Updated config:', updatedConfig);
      
      // Save updated config
      await browserAPI.storage.sync.set({ config: updatedConfig });
      console.log('Config saved successfully');

      // Send message to content scripts about config change
      try {
        await browserAPI.tabs.query({}, (tabs: any[]) => {
          tabs.forEach(tab => {
            browserAPI.tabs.sendMessage(tab.id, {
              type: 'CONFIG_UPDATED',
              config: updatedConfig
            }).catch((err: any) => {
              // Suppress errors from inactive tabs
              console.log('Could not send message to tab:', tab.id);
            });
          });
        });
        console.log('Config update message sent to content scripts');
      } catch (error) {
        console.error('Error sending config update message:', error);
        // Continue even if messaging fails
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving ${key} to config:`, error);
      return false;
    }
  };

  // Toggle extension state and save to storage
  const toggleButton = async () => {
    const newToggleState = !isToggled;
    setIsToggled(newToggleState);
    
    const saved = await saveToStorage('extensionEnabled', newToggleState);
    if (!saved) {
      // Revert UI state if save failed
      setIsToggled(isToggled);
      console.error('Failed to save toggle state to storage');
    }
  };

  // Handle input change without saving
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputApiKey(e.target.value);
  };
  
  // Save API key to storage
  const saveApiKey = async () => {
    if (!inputApiKey.trim()) {
      return; // Don't save empty API keys
    }
    
    const saved = await saveToStorage('geminiApiKey', inputApiKey);
    if (saved) {
      setApiKey(inputApiKey);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      console.error('Failed to save API key to storage');
    }
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy API key:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between p-5  font-sans bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 text-gray-800 rounded-2xl shadow-lg border border-white/40">
      <div className="flex flex-col items-center w-full">
        {/* Header with logo and title */}
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center mr-3 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <span className="text-xl">🤖</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Gemini API
          </h2>
        </div>
        
        {/* Status toggle card */}
        <div className="w-full mb-3 p-3 rounded-xl bg-white shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Extension Status
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isToggled ? 'Active and running' : 'Currently disabled'}
              </p>
            </div>
            <button 
              onClick={toggleButton} 
              className={`relative w-14 h-7 rounded-full cursor-pointer border-none outline-none transition-all duration-300 ease-in-out ${
                isToggled 
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20" 
                  : "bg-gray-200"
              }`}
              aria-label={isToggled ? "Disable extension" : "Enable extension"}
            >
              <span 
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out ${
                  isToggled ? "left-8" : "left-1"
                }`} 
              />
            </button>
          </div>
        </div>

        {/* API Key input card */}
        <div className="w-full mb-3 p-4 rounded-xl bg-white shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg relative">
          <label 
            htmlFor="apiKey" 
            className="block mb-1 text-sm font-semibold text-gray-700"
          >
            Gemini API Key
          </label>
          <p className="text-xs text-gray-500 mb-2">Enter your API key to connect with Gemini services</p>
          
          <div className="relative flex w-full mb-3">
            <input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={inputApiKey}
              onChange={handleApiKeyChange}
              placeholder="Paste your Gemini API key here"
              className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white/90"
            />
            
            {inputApiKey && (
              <button
                onClick={toggleShowApiKey}
                className="absolute right-12 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-indigo-500 text-base p-1.5 flex items-center justify-center transition-colors duration-200"
                title={showApiKey ? 'Hide API Key' : 'Show API Key'}
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            )}
            
            {apiKey && (
              <button
                onClick={copyApiKey}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-indigo-500 text-base p-1.5 flex items-center justify-center transition-colors duration-200"
                title="Copy API Key"
              >
                {isCopied ? '✓' : '📋'}
              </button>
            )}
          </div>
          
          {/* Save button */}
          <button
            onClick={saveApiKey}
            disabled={!inputApiKey.trim()}
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 flex items-center justify-center gap-2 ${
              !inputApiKey.trim() 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-md hover:shadow-indigo-500/20"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            Save API Key
          </button>
          
          {/* Notification messages - absolute positioned to not affect layout */}
          <div className="absolute -bottom-6 left-0 right-0 px-5">
            {isSaved && (
              <div className="text-xs text-indigo-600 flex items-center gap-1 animate-fadeIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                API key saved successfully!
              </div>
            )}
            
            {isCopied && (
              <div className="text-xs text-indigo-600 flex items-center gap-1 animate-fadeIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                API key copied to clipboard!
              </div>
            )}
          </div>
        </div>
        
        {/* Security note card */}
        <div className="w-full p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <span className="font-semibold">Security Note:</span> Your API key is securely stored in browser sync storage and is only used to access Gemini services.
            </div>
          </div>
        </div>
        
        {/* Status indicator - fixed height reserved */}
        <div className={`mt-3 w-full h-10 flex items-center justify-center ${isToggled ? 'visible' : 'invisible'}`}>
          {isToggled && (
            <div className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-200/50 text-sm text-indigo-700 flex items-center justify-center gap-2 animate-fadeIn">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              Extension is active and ready to use
            </div>
          )}
        </div>
      </div>
      
      {/* Version indicator */}
      <div className="text-[10px] text-gray-400 self-center mt-4">
        Version 1.0.0
      </div>
    </div>
  );
}

export default App;
