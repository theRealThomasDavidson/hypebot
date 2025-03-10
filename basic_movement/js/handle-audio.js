/**
 * Audio handling module for Ohmni robot
 * Handles audio capture, processing, and preparation for Whisper API
 */

/**
 * Resample audio data to 16kHz for Whisper API
 * @param {Blob} audioBlob - Original WAV audio blob
 * @returns {Promise<Blob>} Resampled audio blob
 * @private
 */
async function resampleAudioTo16k(audioBlob) {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Read the blob as array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create offline context for resampling
    const offlineCtx = new OfflineAudioContext(
        1, // mono
        audioBuffer.duration * 16000, // target sample rate * duration
        16000 // target sample rate
    );
    
    // Create buffer source
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();
    
    // Render the resampled audio
    const renderedBuffer = await offlineCtx.startRendering();
    
    // Convert to WAV format
    const wavData = audioBufferToWav(renderedBuffer);
    
    // Create new blob with resampled data
    return new Blob([wavData], { type: 'audio/wav' });
}

/**
 * Convert AudioBuffer to WAV format
 * @param {AudioBuffer} buffer - Audio buffer to convert
 * @returns {ArrayBuffer} WAV file data
 * @private
 */
function audioBufferToWav(buffer) {
    const numChannels = 1; // Force mono for Whisper
    const sampleRate = 16000;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    // Create WAV header
    const headerBuffer = new ArrayBuffer(44);
    const headerView = new DataView(headerBuffer);
    
    // "RIFF" chunk descriptor
    headerView.setUint8(0, "R".charCodeAt(0));
    headerView.setUint8(1, "I".charCodeAt(0));
    headerView.setUint8(2, "F".charCodeAt(0));
    headerView.setUint8(3, "F".charCodeAt(0));
    
    // File length
    const samples = buffer.getChannelData(0);
    const dataLength = samples.length * bytesPerSample;
    const fileLength = 36 + dataLength;
    headerView.setUint32(4, fileLength, true);
    
    // "WAVE" format
    headerView.setUint8(8, "W".charCodeAt(0));
    headerView.setUint8(9, "A".charCodeAt(0));
    headerView.setUint8(10, "V".charCodeAt(0));
    headerView.setUint8(11, "E".charCodeAt(0));
    
    // "fmt " sub-chunk
    headerView.setUint8(12, "f".charCodeAt(0));
    headerView.setUint8(13, "m".charCodeAt(0));
    headerView.setUint8(14, "t".charCodeAt(0));
    headerView.setUint8(15, " ".charCodeAt(0));
    headerView.setUint32(16, 16, true); // fmt chunk size
    headerView.setUint16(20, format, true); // audio format
    headerView.setUint16(22, numChannels, true);
    headerView.setUint32(24, sampleRate, true);
    headerView.setUint32(28, sampleRate * blockAlign, true); // byte rate
    headerView.setUint16(32, blockAlign, true);
    headerView.setUint16(34, bitDepth, true);
    
    // "data" sub-chunk
    headerView.setUint8(36, "d".charCodeAt(0));
    headerView.setUint8(37, "a".charCodeAt(0));
    headerView.setUint8(38, "t".charCodeAt(0));
    headerView.setUint8(39, "a".charCodeAt(0));
    headerView.setUint32(40, dataLength, true);
    
    // Create data view for samples
    const dataBuffer = new ArrayBuffer(dataLength);
    const dataView = new DataView(dataBuffer);
    
    // Write samples as 16-bit PCM
    let offset = 0;
    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        dataView.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
    }
    
    // Combine header and data
    const wavBuffer = new Uint8Array(headerBuffer.byteLength + dataBuffer.byteLength);
    wavBuffer.set(new Uint8Array(headerBuffer), 0);
    wavBuffer.set(new Uint8Array(dataBuffer), headerBuffer.byteLength);
    
    return wavBuffer.buffer;
}

/**
 * Captures audio from Ohmni and prepares it for Whisper API
 * @param {number} duration - Recording duration in milliseconds
 * @returns {Promise<FormData>} FormData ready for Whisper API
 */
async function captureAndPrepareAudio(duration = 5000) {
    // Reset recording state
    let recordAudio = [''];
    let isRecording = false;

    function captureAudioCb(data) {
        if (!isRecording) return;
        
        if (data.length < 4096) {
            // Set header of audio file
            recordAudio[0] = data;
        } else {
            recordAudio.push(data);
        }
    }

    try {
        // Register callback BEFORE starting capture
        window.captureAudioCb = captureAudioCb;
        
        const audioBlob = await new Promise((resolve, reject) => {
            if (isRecording) {
                reject(new Error('Already recording'));
                return;
            }

            isRecording = true;
            console.log('Starting audio capture...');
            
            // Start audio capture
            Ohmni.captureAudio();

            // Stop recording after duration
            setTimeout(() => {
                Ohmni.stopCaptureAudio();
                isRecording = false;
                console.log('Audio capture complete');

                // Create WAV blob
                const audioBlob = new Blob(recordAudio, { type: 'audio/wav' });
                resolve(audioBlob);
            }, duration);
        });

        // Resample audio to 16kHz
        console.log('Resampling audio to 16kHz...');
        const resampledBlob = await resampleAudioTo16k(audioBlob);
        
        // Check file size (Whisper limit is 25MB)
        if (resampledBlob.size > 25 * 1024 * 1024) {
            throw new Error('Audio file too large for Whisper API (max 25MB)');
        }

        // Prepare FormData for Whisper API
        const formData = new FormData();
        formData.append('file', resampledBlob, 'audio.wav');
        formData.append('model', 'whisper-1');
        
        console.log('Audio prepared, size:', resampledBlob.size, 'bytes');
        return formData;

    } catch (error) {
        console.error('Error capturing audio:', error);
        throw error;
    } finally {
        // Cleanup
        isRecording = false;
        window.captureAudioCb = null;
    }
}

/**
 * Send captured audio to Whisper API
 * @param {number} duration - Recording duration in milliseconds
 * @returns {Promise<FormData>} FormData ready for Whisper API
 */
async function sendAudioToWhisper(duration = 5000) {
    try {
        return await captureAndPrepareAudio(duration);
    } catch (error) {
        console.error('Audio capture failed:', error);
        throw error;
    }
}

// Export public functions
module.exports = {
    sendAudioToWhisper,
    captureAndPrepareAudio
}; 