# 🎙️ 30 Days of AI Voice Agents

## 📖 About the Project
The AI Voice Agent is an interactive web application that lets users have real-time conversations with an AI using voice input and output.  
You can speak into your microphone, the system will transcribe your speech, send it to an AI model for processing, and then respond back in natural-sounding speech.

This project is part of the **30 Days of AI Voice Agents** challenge.

---

## 🛠️ Technologies Used
- **HTML** – Structure for the frontend.

- **CSS** – Styling for the UI.

- **JavaScript** – Handles frontend logic and API communication.

- **Python** – Backend programming language.

- **FastAPI** – Framework for building the backend API.

- **AssemblyAI API** – Converts speech to text (STT).

- **Murf API** – Converts text to natural-sounding speech (TTS).

- **Google Gemini API** – Processes text and generates AI responses.

---

## 📂 Project Structure
```FlaskProject
FlaskProject/
│── app.py # Main Flask backend
│── .env # Stores environment variables securely
│── templates/
│ └── IndexAI.html # Frontend HTML page
│── static/
│ └── script.js # Frontend JavaScript file
│── requirements.txt # Python dependencies
│── README.md # Project documentation
``` 

---

## 🔄 Process Flow
- **User speaks** into the microphone on the web page.

- **Frontend (HTML/JS)** records the audio and sends it to the backend.

- **Backend (FastAPI)** receives the audio file and sends it to **AssemblyAI API** for transcription (speech-to-text).

- The transcribed text is sent to **Google Gemini API** (or another LLM) to generate a smart AI reply.

- The AI reply is sent to **Murf API** for text-to-speech conversion.

- The generated voice file is returned to the **frontend**, which plays the AI’s spoken response.

- If any API fails, a fallback audio message is played.

---

## ✨ Features
- **Voice Recording** – Capture voice directly from the browser.

- **Speech-to-Text** – Convert voice into text using AssemblyAI.

- **AI Processing** – Send the text to an LLM for smart responses.

- **Text-to-Speech** – Convert AI's reply into natural voice with Murf API.

- **Error Handling** – Provides fallback responses if APIs fail.

---

## 🔑 Environment Variables

- Create a `.env` file in the root directory with the following:

```env
MURF_API_KEY=your_murf_api_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here