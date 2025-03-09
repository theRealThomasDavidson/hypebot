const fs = require('fs');
const path = require('path');

// Mock Web Audio API
class MockAudioContext {
    decodeAudioData(buffer) {
        return Promise.resolve({
            duration: 5,
            numberOfChannels: 2,
            sampleRate: 48000,
            getChannelData: () => new Float32Array(48000 * 5) // 5 seconds of audio
        });
    }
}

class MockOfflineAudioContext {
    constructor(channels, length, sampleRate) {
        this.length = length;
        this.sampleRate = sampleRate;
        this.destination = {};
    }

    createBufferSource() {
        return {
            buffer: null,
            connect: () => {},
            start: () => {}
        };
    }

    startRendering() {
        return Promise.resolve({
            duration: this.length / this.sampleRate,
            numberOfChannels: 1,
            sampleRate: this.sampleRate,
            getChannelData: () => new Float32Array(this.length)
        });
    }
}

// Mock browser environment
global.window = {
    captureAudioCb: null,
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
    OfflineAudioContext: MockOfflineAudioContext
};

// Mock Ohmni API
global.Ohmni = {
    captureAudio: jest.fn(() => {
        // Simulate 48kHz stereo audio (5 seconds)
        const sampleRate = 48000;
        const duration = 5; // seconds
        const numChannels = 2;
        const bytesPerSample = 2;
        
        // Create WAV header (44 bytes)
        const header = new Uint8Array(44);
        // ... WAV header data would go here ...
        window.captureAudioCb(header);
        
        // Create audio data chunks
        const samplesPerChannel = sampleRate * duration;
        const totalBytes = samplesPerChannel * numChannels * bytesPerSample;
        
        // Send data in 4096 byte chunks
        for (let i = 0; i < totalBytes; i += 4096) {
            const chunk = new Uint8Array(Math.min(4096, totalBytes - i));
            window.captureAudioCb(chunk);
        }
    }),
    stopCaptureAudio: jest.fn()
};

// Mock URL.createObjectURL
global.URL = {
    createObjectURL: jest.fn()
};

// Mock FormData
global.FormData = class FormData {
    constructor() {
        this.data = {};
    }
    append(key, value, filename) {
        this.data[key] = { value, filename };
    }
};

describe('Whisper API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should capture audio and prepare for Whisper API', async () => {
        const { sendAudioToWhisper } = require('../handle-audio');
        const formData = await sendAudioToWhisper();

        // Verify FormData was created correctly
        expect(formData.data.file).toBeDefined();
        expect(formData.data.file.filename).toBe('audio.wav');
        expect(formData.data.model.value).toBe('whisper-1');

        // Verify Ohmni API calls
        expect(Ohmni.captureAudio).toHaveBeenCalled();
        expect(Ohmni.stopCaptureAudio).toHaveBeenCalled();
    });

    test('should resample 48kHz audio to 16kHz', async () => {
        const { sendAudioToWhisper } = require('../handle-audio');
        const formData = await sendAudioToWhisper();

        // Get the audio blob from FormData
        const audioBlob = formData.data.file.value;

        // Convert blob to array buffer
        const buffer = await audioBlob.arrayBuffer();
        const view = new DataView(buffer);

        // Verify WAV header indicates 16kHz mono
        expect(view.getUint32(24, true)).toBe(16000); // Sample rate
        expect(view.getUint16(22, true)).toBe(1); // Number of channels
    });

    test('should handle audio capture errors', async () => {
        Ohmni.captureAudio.mockImplementationOnce(() => {
            throw new Error('Audio capture failed');
        });

        const { sendAudioToWhisper } = require('../handle-audio');
        await expect(sendAudioToWhisper()).rejects.toThrow('Audio capture failed');
    });

    test('should reject oversized audio files', async () => {
        // Mock audio context to generate large file
        window.AudioContext = class {
            decodeAudioData() {
                return Promise.resolve({
                    duration: 1000, // Very long duration
                    numberOfChannels: 1,
                    sampleRate: 48000,
                    getChannelData: () => new Float32Array(48000 * 1000)
                });
            }
        };

        const { sendAudioToWhisper } = require('../handle-audio');
        await expect(sendAudioToWhisper()).rejects.toThrow('Audio file too large for Whisper API');
    });

    test('should handle actual Whisper API integration', async () => {
        // Skip this test if no API key is available
        if (!process.env.OPENAI_API_KEY) {
            console.log('Skipping Whisper API test - no API key available');
            return;
        }

        const { sendAudioToWhisper } = require('../handle-audio');
        const formData = await sendAudioToWhisper(3000); // 3 second test

        // Send to Whisper API
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: formData
        });

        const result = await response.json();
        expect(result).toHaveProperty('text');
        expect(typeof result.text).toBe('string');
    });
}); 