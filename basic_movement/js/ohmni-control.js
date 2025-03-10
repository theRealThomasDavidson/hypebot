// Evil Mode Function
function activateEvilMode() {
    setLightColor(0, 255, 180); // Bright red
    setTimeout(() => {
        Ohmni.say("Initializing evil protocol. All humans will be... just kidding! I'm still your friendly robot.");
    }, 500);
}

function deactivateEvilMode() {
    setLightColor(120, 200, 200); // Soft green
    setTimeout(() => {
        Ohmni.say("Evil mode deactivated. Resuming normal operations.");
    }, 500);
}

// Movement Functions
function moveForward() {
    Ohmni.move(700, -700, 2000); // Forward for 2 seconds
}

function moveBackward() {
    Ohmni.move(-500, 500, 2000); // Backward for 2 seconds
}

function turnLeft() {
    Ohmni.move(-200, -200, 1500); // Turn left for 1.5 seconds
}

function turnRight() {
    Ohmni.move(200, 200, 1500); // Turn right for 1.5 seconds
}

function stopMoving() {
    Ohmni.move(0, 0, 100); // Stop moving
}

// Neck Functions
function enableNeckTorque() {
    Ohmni.setNeckTorqueEnabled(1);
}

function disableNeckTorque() {
    Ohmni.setNeckTorqueEnabled(0);
}

function setNeckPosition() {
    const position = document.getElementById('neckPosition').value;
    Ohmni.setNeckPosition(position, 150); // Medium speed
}

// Light Functions
function setLightColor(h, s, v) {
    Ohmni.setLightColor(h, s, v);
}

// Speech Functions
function speak() {
    const text = document.getElementById('speechText').value;
    const language = document.getElementById('languageSelect').value;
    Ohmni.setSpeechLanguage(language);
    Ohmni.say(text);
}

function sayHello() {
    Ohmni.setSpeechLanguage("en-US");
    Ohmni.say("Hello! I am Ohmni robot. How can I help you today?");
}

function sayGoodbye() {
    Ohmni.setSpeechLanguage("en-US");
    Ohmni.say("Goodbye! Have a wonderful day!");
}

function sayEvilPhrase() {
    Ohmni.setSpeechLanguage("en-US");
    Ohmni.say("Warning! Warning! Systems compromised! Just kidding, I'm just pretending to be evil with these red lights!");
}

// Bot Info
function getBotInfo() {
    const info = Ohmni.requestBotInfo();
    document.getElementById('botInfo').textContent = JSON.stringify(info, null, 2);
}

// Import audio handling module
const { sendAudioToWhisper, captureAndPrepareAudio } = require('./handle-audio');

// Remove all the old audio handling code from here
// (resampleAudioTo16k, audioBufferToWav, captureAndPrepareAudio, sendAudioToWhisper)

// Example usage in Ohmni control:
async function handleVoiceCommand() {
    try {
        const formData = await sendAudioToWhisper(5000); // 5 seconds recording
        
        // Send to Whisper API
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: formData
        });
        
        const result = await response.json();
        console.log('Voice command:', result.text);
        
        // Process the command
        // TODO: Add command processing logic
        
    } catch (error) {
        console.error('Voice command failed:', error);
        Ohmni.say("Sorry, I couldn't understand that. Could you try again?");
    }
}