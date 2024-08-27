const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const gainNode = audioContext.createGain();
let audioBuffer = null;
let sourceNode = null;
let audioPlaying = false;
let startTime = 0;
let pausedAt = 0;
let lastStopTime = 0;
let currentPlaybackRate = 1.0;
let volume = 0.0;

function fetchAudio(url) {
    audioBuffer = null;
    if (sourceNode) {
        stopAudio();
    }
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => {
            audioBuffer = buffer;
            console.log('Audio loaded');
        })
        .catch(error => {
            console.error('Error loading audio:', error);
            throw error;
        });
}

function playAudio() {
    if (sourceNode) {
        stopAudio();
    }
    if (audioBuffer) {
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = volume;
        sourceNode.start(0, pausedAt);
        changePlaybackRateAudio(currentPlaybackRate);
        startTime = audioContext.currentTime - pausedAt;
        audioPlaying = true;
    }
}

function pauseAudio() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
        pausedAt = audioContext.currentTime - startTime;
        audioPlaying = false;
    }
}

function stopAudio() {
    if (sourceNode) {
        sourceNode.stop();
        lastStopTime = audioContext.currentTime;
        sourceNode = null;
        pausedAt = 0;
        audioPlaying = false;
    }
}

function seekAudio(time = 0.0) {
    const seekTime = parseFloat(time);
    if (audioBuffer) {
        if (seekTime >= 0 && seekTime <= audioBuffer.duration) {
            if (audioPlaying) {
                stopAudio();
            }
            pausedAt = seekTime;
        }
    }
}

function changePlaybackRateAudio(rate = 1.0) {
    const playbackRate = parseFloat(rate);
    if (sourceNode) {
        sourceNode.playbackRate.value = playbackRate;
        currentPlaybackRate = playbackRate;
    }
}

function getCurrentTime() {
    if (audioPlaying && sourceNode) {
        const currentTime = (audioContext.currentTime - lastStopTime) * currentPlaybackRate + pausedAt;
        return currentTime;
    }
    return pausedAt;
}