<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <img src="https://res.cloudinary.com/diyxwdtjd/image/upload/v1744564843/projects/context-ai-logo.png" alt="Logo" width="250" height="280">
  <h1 align="center">Context AI</h1>

  <p align="center">
    A browser extension that integrates Gemini AI to enhance your browsing experience
    <br />
    <br />
    <a href="https://github.com/debsouryadatta/context-ai">View on GitHub</a>
    ·
    <a href="https://github.com/debsouryadatta/context-ai/issues">Report Bug</a>
    ·
    <a href="https://github.com/debsouryadatta/context-ai/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
        <li><a href="#demo">Demo</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#configuration">Configuration</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Context AI is a powerful browser extension that brings the capabilities of Google's Gemini AI directly into your web browser. It provides a chat interface that contextually enhances your browsing experience by allowing you to interact with web content through AI assistance.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Key Features

- **Contextual Web Page Chat**: Chat with an AI assistant about the content of any webpage you're browsing
- **Multi-Chat Support**: Create and manage multiple conversations with a convenient chat history interface
- **Page Content Integration**: Toggle the ability to include current page content in your conversations for more contextual responses
- **Search Tool Integration**: Enable Gemini's search grounding capability to provide more accurate and up-to-date information
- **Theme Customization**: Switch between light and dark mode themes based on your preference
- **Model Selection**: Choose between different Gemini AI models:
  - Gemini 2.0 Flash (default) - Faster response times
  - Gemini 2.5 Pro - More advanced capabilities
- **Resizable Interface**: Easily resize the chat window to suit your needs
- **API Key Management**: Securely store and manage your Gemini API key
- **Cross-Browser Compatibility**: Works with Chrome, Firefox, and other Chromium-based browsers

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ### Demo

[Demo screenshot placeholder]

<p align="right">(<a href="#readme-top">back to top</a>)</p> -->

### Built With

* [WXT Framework](https://wxt.dev/) - Modern web extension framework
* [React](https://reactjs.org/) - UI framework
* [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
* [Gemini API](https://ai.google.dev/) - Google's generative AI models
* [AI SDK](https://sdk.vercel.ai/docs) - AI framework for streaming responses
* [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icon set

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v16 or higher)
* npm or yarn
* A Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/debsouryadatta/context-ai.git
   cd context-ai
   ```

2. Install dependencies
   ```sh
   npm install
   # or
   yarn install
   ```

3. Build the extension
   ```sh
   npm run build
   # or
   yarn build
   ```

4. Load the extension in your browser:
   - Chrome: Go to `chrome://extensions/`, enable Developer mode, and click "Load unpacked" to select the `dist` folder
   - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `dist` folder

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Configuration

After installing the extension:

1. Click on the Context AI extension icon in your browser's toolbar
2. Enter your Gemini API key in the provided field
3. Click the toggle switch to enable the extension
4. Configure any additional preferences as needed

Your settings will be automatically saved to the browser's storage and synced across your devices if you're signed into your browser.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

1. **Starting a Conversation**:
   - Navigate to any webpage
   - Click the "Ask AI" button in the bottom-right corner of the page
   - Type your question or request in the chat input

2. **Including Page Content**:
   - Toggle the "Include page content" switch to let the AI consider the content of the current page in its responses

3. **Using Search Tool**:
   - Toggle the "Enable search tool" switch to allow the AI to search for up-to-date information when answering your questions
   - This feature is particularly useful for factual queries or when you need the most current information

4. **Managing Chats**:
   - Click the chat history icon to view, switch between, or delete previous conversations
   - Create a new chat by clicking the "+" button in the chat list

5. **Changing Models**:
   - Select between Gemini models using the dropdown in the chat interface header:
     - Gemini 2.0 Flash (default): For faster responses
     - Gemini 2.5 Pro: For more advanced capabilities

6. **Customizing the Interface**:
   - Toggle between light and dark themes
   - Resize the chat window by dragging from the top-left corner

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Project Link: [https://github.com/debsouryadatta/context-ai](https://github.com/debsouryadatta/context-ai)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- STORAGE SCHEMA -->
## Storage Schema

The extension uses the following storage schema to maintain chat history and settings:

```json
{
    "config": {
        "geminiApiKey": "your-api-key",
        "extensionEnabled": true,
        "geminiModel": "gemini-2.0-flash-exp",
        "theme": "light",
        "chatDimensions": {
            "width": 384,
            "height": 600
        },
        "current_chat_id": "uuid-of-current-chat",
        "chat_history": [
            {
                "id": "chat-uuid-1",
                "title": "Chat Title",
                "messages": [
                    {"role": "user", "content": "User message"},
                    {"role": "assistant", "content": "Assistant response"}
                ],
                "page_content_included": true,
                "search_tool_enabled": true,
                "created_at": "ISO-date-string",
                "updated_at": "ISO-date-string"
            }
        ]
    }
}
