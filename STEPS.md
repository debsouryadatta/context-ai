### Steps to build Context AI

1. Setting up the wxt project, taking reference from my older projects
2. Set up tailwind css inside the project
3. Building the popup interface asking for Gemini API key and enabling and disabling the extension
4. Saving the keys and other stuff inside a single "config" object
5. Building the content ui in shadow root format so that it doesn't conflict with the website
6. Building the ask ai button and the chat interface as overlay at the bottom right corner
7. Using browser message api for sending messages between popup and content script when the config object is updated
8. Used vercel ai sdk for calling the Gemini API and showing the response in a streaming fashion
9. Added Markdown support inside the chat interface
10. Adding new chat functionality, saving each of the chats into the config object, user can switch back to previous chats
11. Users can add the page content as context when option is enabled
12. Adding theme options for light and dark mode
13. Adding model options for Gemini 2.0 Flash and Gemini 2.5 Pro
14. Adding the option to include search tool(ai sdk has search tool option with gemini) in each of the Chat
15. Using lucide icons instead of svgs/emojis
16. Bug: Config changes were not being synced across tabs, Fix: Added storage listener (It was arised since diff tabs have diff instances of content script, it was fixed by adding a storage listener which listens for changes in the config object and updates the state accordingly)