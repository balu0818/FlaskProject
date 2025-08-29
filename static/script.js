 document.addEventListener("DOMContentLoaded", async () => {
    let appState = "idle"; 
    let mediaRecorder = null;
    let recordedChunks = [];
    let sessionId = null;

    const recordBtn = document.getElementById("recordBtn");
    const statusDisplay = document.getElementById("statusDisplay");
    const audioPlayer = document.getElementById("audioPlayer");
    const transcriptContainer = document.getElementById("transcriptContainer");
    const transcriptBox = document.getElementById("transcriptBox"); 
    const transcriptToggleBtn = document.getElementById("transcriptToggleBtn");
    
    const ICONS = {
        mic: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14c-1.66 0-3-1.34-3-3V5c0-1.66 1.34-3 3-3s3 1.34 3 3v6c0 1.66-1.34 3-3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>`,
        spinner: `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`
    };

    const urlParams = new URLSearchParams(window.location.search);
    sessionId = urlParams.get('session_id');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        window.history.replaceState({}, '', `?session_id=${sessionId}`);
    }

    const updateUI = (newState) => {
        appState = newState;
        switch (appState) {
            case "idle":
                recordBtn.disabled = false;
                recordBtn.classList.remove("recording");
                recordBtn.innerHTML = ICONS.mic;
                statusDisplay.textContent = "Tap the icon to speak.";
                break;
            case "recording":
                recordBtn.disabled = false; 
                recordBtn.classList.add("recording");
                recordBtn.innerHTML = ICONS.mic;
                statusDisplay.textContent = "Recording... Tap again to stop.";
                recordedChunks = [];
                break;
            case "processing":
                recordBtn.disabled = true;
                recordBtn.classList.remove("recording");
                recordBtn.innerHTML = ICONS.spinner;
                statusDisplay.textContent = "Thinking...";
                break;
            case "error":
                recordBtn.disabled = false;
                recordBtn.classList.remove("recording");
                recordBtn.innerHTML = ICONS.mic;
                break;
        }
    };

    const addMessageToTranscript = (sender, text) => {
        if (!text || text.trim() === "") return;

        const entry = document.createElement("div");
        entry.classList.add("transcript-entry");

        const senderElem = document.createElement("strong");
        senderElem.textContent = `${sender}:`;

        const textNode = document.createTextNode(` ${text}`);

        entry.appendChild(senderElem);
        entry.appendChild(textNode);
        transcriptContainer.appendChild(entry);
        transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            statusDisplay.textContent = "Audio recording is not supported.";
            updateUI("error");
            return;
        }
        updateUI("recording");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunks.push(event.data);
            };
            mediaRecorder.onstop = handleStopRecording;
            mediaRecorder.start();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            statusDisplay.textContent = "Please enable microphone permissions.";
            updateUI("error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
    };

    const handleStopRecording = async () => {
        updateUI("processing");
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio_file", audioBlob, "user_recording.webm");

        try {
            const response = await fetch(`/agent/chat/${sessionId}`, {
                method: "POST",
                body: formData,
            });

            if (response.headers.get("X-Error") === "true") {
                statusDisplay.textContent = "Sorry, an error occurred on my end.";
                const fallbackBlob = await response.blob();
                audioPlayer.src = URL.createObjectURL(fallbackBlob);
                audioPlayer.play();
                return;
            }

            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

            const result = await response.json();
            if (result.audio_url) {
                statusDisplay.textContent = "Here's my response...";

                addMessageToTranscript("You", result.user_text);
                addMessageToTranscript("Agent", result.agent_text);

                audioPlayer.src = result.audio_url;
                audioPlayer.play();
            } else {
                throw new Error("API response did not contain an audio URL.");
            }
        } catch (error) {
            console.error("Error in conversation chain:", error);
            statusDisplay.textContent = "An error occurred. Please try again.";
            updateUI("error");
        }
    };

    recordBtn.addEventListener("click", () => {
        if (appState === "idle" || appState === "error") {
            startRecording();
        } else if (appState === "recording") {
            stopRecording();
        }
    });

    audioPlayer.addEventListener('ended', () => {
        updateUI('idle');
    });
    
    audioPlayer.addEventListener('play', () => {
        recordBtn.disabled = true;
    });

    transcriptToggleBtn.addEventListener("click", () => {
        const isHidden = transcriptBox.hasAttribute("hidden");
        if (isHidden) {
            transcriptBox.removeAttribute("hidden");
        } else {
            transcriptBox.setAttribute("hidden", true);
            transcriptToggleBtn.textContent = "Show Transcript";
        }
    });

    updateUI("idle");
});
