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