//  document.addEventListener("DOMContentLoaded", async () => {
//     let appState = "idle"; 
//     let mediaRecorder = null;
//     let recordedChunks = [];
//     let sessionId = null;

//     const recordBtn = document.getElementById("recordBtn");
//     const statusDisplay = document.getElementById("statusDisplay");
//     const audioPlayer = document.getElementById("audioPlayer");
//     const transcriptContainer = document.getElementById("transcriptContainer");
//     const transcriptBox = document.getElementById("transcriptBox"); 
//     const transcriptToggleBtn = document.getElementById("transcriptToggleBtn");
    
//     const ICONS = {
//         mic: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
//         <path d="M12 14c-1.66 0-3-1.34-3-3V5c0-1.66 1.34-3 3-3s3 1.34 3 3v6c0 1.66-1.34 3-3 3z"/>
//         <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
//     </svg>`,
//         spinner: `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`
//     };

//     const urlParams = new URLSearchParams(window.location.search);
//     sessionId = urlParams.get('session_id');
//     if (!sessionId) {
//         sessionId = crypto.randomUUID();
//         window.history.replaceState({}, '', `?session_id=${sessionId}`);
//     }

//     const updateUI = (newState) => {
//         appState = newState;
//         switch (appState) {
//             case "idle":
//                 recordBtn.disabled = false;
//                 recordBtn.classList.remove("recording");
//                 recordBtn.innerHTML = ICONS.mic;
//                 statusDisplay.textContent = "Tap the icon to speak.";
//                 break;
//             case "recording":
//                 recordBtn.disabled = false; 
//                 recordBtn.classList.add("recording");
//                 recordBtn.innerHTML = ICONS.mic;
//                 statusDisplay.textContent = "Recording... Tap again to stop.";
//                 recordedChunks = [];
//                 break;
//             case "processing":
//                 recordBtn.disabled = true;
//                 recordBtn.classList.remove("recording");
//                 recordBtn.innerHTML = ICONS.spinner;
//                 statusDisplay.textContent = "Thinking...";
//                 break;
//             case "error":
//                 recordBtn.disabled = false;
//                 recordBtn.classList.remove("recording");
//                 recordBtn.innerHTML = ICONS.mic;
//                 break;
//         }
//     };

//     const addMessageToTranscript = (sender, text) => {
//         if (!text || text.trim() === "") return;

//         const entry = document.createElement("div");
//         entry.classList.add("transcript-entry");

//         const senderElem = document.createElement("strong");
//         senderElem.textContent = `${sender}:`;

//         const textNode = document.createTextNode(` ${text}`);

//         entry.appendChild(senderElem);
//         entry.appendChild(textNode);
//         transcriptContainer.appendChild(entry);
//         transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
//     };

//     const startRecording = async () => {
//         if (!navigator.mediaDevices?.getUserMedia) {
//             statusDisplay.textContent = "Audio recording is not supported.";
//             updateUI("error");
//             return;
//         }
//         updateUI("recording");
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             mediaRecorder = new MediaRecorder(stream);
//             mediaRecorder.ondataavailable = (event) => {
//                 if (event.data.size > 0) recordedChunks.push(event.data);
//             };
//             mediaRecorder.onstop = handleStopRecording;
//             mediaRecorder.start();
//         } catch (err) {
//             console.error("Error accessing microphone:", err);
//             statusDisplay.textContent = "Please enable microphone permissions.";
//             updateUI("error");
//         }
//     };

//     const stopRecording = () => {
//         if (mediaRecorder && mediaRecorder.state === "recording") {
//             mediaRecorder.stop();
//         }
//     };

//     const handleStopRecording = async () => {
//         updateUI("processing");
//         const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
//         const formData = new FormData();
//         formData.append("audio_file", audioBlob, "user_recording.webm");

//         try {
//             const response = await fetch(`/agent/chat/${sessionId}`, {
//                 method: "POST",
//                 body: formData,
//             });

//             if (response.headers.get("X-Error") === "true") {
//                 statusDisplay.textContent = "Sorry, an error occurred on my end.";
//                 const fallbackBlob = await response.blob();
//                 audioPlayer.src = URL.createObjectURL(fallbackBlob);
//                 audioPlayer.play();
//                 return;
//             }

//             if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

//             const result = await response.json();
//             if (result.audio_url) {
//                 statusDisplay.textContent = "Here's my response...";

//                 addMessageToTranscript("You", result.user_text);
//                 addMessageToTranscript("Agent", result.agent_text);

//                 audioPlayer.src = result.audio_url;
//                 audioPlayer.play();
//             } else {
//                 throw new Error("API response did not contain an audio URL.");
//             }
//         } catch (error) {
//             console.error("Error in conversation chain:", error);
//             statusDisplay.textContent = "An error occurred. Please try again.";
//             updateUI("error");
//         }
//     };

//     recordBtn.addEventListener("click", () => {
//         if (appState === "idle" || appState === "error") {
//             startRecording();
//         } else if (appState === "recording") {
//             stopRecording();
//         }
//     });

//     audioPlayer.addEventListener('ended', () => {
//         updateUI('idle');
//     });
    
//     audioPlayer.addEventListener('play', () => {
//         recordBtn.disabled = true;
//     });

//     transcriptToggleBtn.addEventListener("click", () => {
//         const isHidden = transcriptBox.hasAttribute("hidden");
//         if (isHidden) {
//             transcriptBox.removeAttribute("hidden");
//         } else {
//             transcriptBox.setAttribute("hidden", true);
//             transcriptToggleBtn.textContent = "Show Transcript";
//         }
//     });

//     updateUI("idle");
// });



//---------------------------------------------------------------------------------------------------




// static/script.js
document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const recordBtn = document.getElementById("recordBtn");
    const statusDisplay = document.getElementById("statusDisplay");
    const chatLog = document.getElementById('chat-log');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveKeysBtn = document.getElementById('saveKeysBtn');

    // API Key Inputs
    const assemblyaiKeyInput = document.getElementById('assemblyaiKey');
    const geminiKeyInput = document.getElementById('geminiKey');
    const murfKeyInput = document.getElementById('murfKey');
    const serpapiKeyInput = document.getElementById('serpapiKey');

    // State
    let isRecording = false;
    let ws = null;
    let audioContext;
    let mediaStream;
    let processor;
    let audioQueue = [];
    let isPlaying = false;
    
    // --- API Key Management ---
    const loadKeys = () => {
        assemblyaiKeyInput.value = localStorage.getItem('assemblyai_key') || '';
        geminiKeyInput.value = localStorage.getItem('gemini_key') || '';
        murfKeyInput.value = localStorage.getItem('murf_key') || '';
        serpapiKeyInput.value = localStorage.getItem('serpapi_key') || '';
    };

    const saveKeys = () => {
        localStorage.setItem('assemblyai_key', assemblyaiKeyInput.value);
        localStorage.setItem('gemini_key', geminiKeyInput.value);
        localStorage.setItem('murf_key', murfKeyInput.value);
        localStorage.setItem('serpapi_key', serpapiKeyInput.value);
        alert('API Keys saved successfully!');
        settingsModal.style.display = 'none';
    };
    
    // --- Modal Control ---
    settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => settingsModal.style.display = 'none');
    saveKeysBtn.addEventListener('click', saveKeys);
    
    // --- UI Helpers ---
    const addMessage = (text, type) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`; // 'user' or 'assistant'
        messageDiv.textContent = text;
        chatLog.appendChild(messageDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
    };

    // --- Audio Playback Logic ---
    const playNextInQueue = async () => {
        if (isPlaying || audioQueue.length === 0) {
            if (audioQueue.length === 0 && !isPlaying) {
                // All audio has finished playing
                statusDisplay.textContent = "Tap the mic to speak again.";
                recordBtn.disabled = false;
            }
            return;
        }
        isPlaying = true;

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        const base64Audio = audioQueue.shift();
        try {
            const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
            const buffer = await audioContext.decodeAudioData(audioData);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.onended = () => {
                isPlaying = false;
                playNextInQueue();
            };
            source.start();
        } catch (e) {
            console.error("Error playing audio:", e);
            isPlaying = false;
            playNextInQueue();
        }
    };
    
    // --- Core Recording Logic ---
    const startRecording = async () => {
        const assemblyaiKey = localStorage.getItem('assemblyai_key');
        const geminiKey = localStorage.getItem('gemini_key');
        const murfKey = localStorage.getItem('murf_key');

        if (!assemblyaiKey || !geminiKey || !murfKey) {
            alert("Please set your AssemblyAI, Gemini, and Murf.ai API keys in the settings first!");
            settingsModal.style.display = 'flex';
            return;
        }

        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            }

            const source = audioContext.createMediaStreamSource(mediaStream);
            processor = audioContext.createScriptProcessor(4096, 1, 1);
            source.connect(processor);
            processor.connect(audioContext.destination);

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
                }
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(pcmData.buffer);
                }
            };

            const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const queryParams = new URLSearchParams({
                assemblyai_key: assemblyaiKey,
                gemini_key: geminiKey,
                murf_key: murfKey,
                serpapi_key: localStorage.getItem('serpapi_key') || ''
            }).toString();

            ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws?${queryParams}`);

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === "final") {
                    addMessage(msg.text, "user");
                    statusDisplay.textContent = "Thinking...";
                    recordBtn.disabled = true;
                } else if (msg.type === "assistant") {
                    addMessage(msg.text, "assistant");
                    statusDisplay.textContent = "Speaking...";
                } else if (msg.type === "audio") {
                    audioQueue.push(msg.b64);
                    playNextInQueue();
                } else if (msg.type === "error") {
                    console.error("Error from server:", msg.message);
                    addMessage(`Error: ${msg.message}`, "assistant");
                    stopRecording();
                }
            };
            
            ws.onopen = () => {
                isRecording = true;
                recordBtn.classList.add("recording");
                statusDisplay.textContent = "Listening...";
            };

            ws.onclose = () => {
                console.log("WebSocket connection closed.");
                if (isRecording) stopRecording(false); // Don't try to close ws again
            };
            
            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                if (isRecording) stopRecording();
            };

        } catch (error) {
            console.error("Could not start recording:", error);
            alert("Microphone access is required. Please grant permission and try again.");
        }
    };

    const stopRecording = (closeWs = true) => {
        if (processor) processor.disconnect();
        if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
        if (closeWs && ws && ws.readyState === WebSocket.OPEN) ws.close();
        
        isRecording = false;
        recordBtn.classList.remove("recording");
        statusDisplay.textContent = "Processing...";
    };

    recordBtn.addEventListener("click", () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    // Initialize
    loadKeys();
});