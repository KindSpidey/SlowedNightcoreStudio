import React, { useState, useEffect } from 'react';
import CustomAudioPlayer from './CustomAudioPlayer';
import './styles.css';

function App() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [speed, setSpeed] = useState(1);
    const [showControls, setShowControls] = useState(false);
    const [isInputDisabled, setIsInputDisabled] = useState(false);
    const [gain, setGain] = useState(1);
    const [bassBoost, setBassBoost] = useState(0);

    const onDrop = (event, replacing = false) => {
        event.preventDefault();
        if (isInputDisabled && !replacing) {
            return;
        }
        const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        if (files.length) {
            const audioUrl = URL.createObjectURL(files[0]);
            setFile(audioUrl);
            setFileName(files[0].name);
            if (!replacing) {
                setShowControls(true);
            }
            setIsInputDisabled(true);
        }
    };

    const handleSpeedChange = (event) => {
        setSpeed(event.target.value);
    };

    const handleGainChange = (event) => {
        setGain(event.target.value);
    };

    const handleBassBoostChange = (event) => {
        setBassBoost(event.target.value);
    };

    useEffect(() => {
        if (file) {
            setShowControls(true);
        }
    }, [file]);

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            // The app is running inside Telegram as a Mini App
            window.Telegram.WebApp.ready();
        }
    }, []);

    // Extract the chat ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('chat_id');

    const handleDownload = (audioBlob) => {
        // Convert the audio blob to a FormData for sending via HTTP POST
        const formData = new FormData();
        formData.append('audio', audioBlob, 'editedAudio.wav');
        formData.append('chatId', chatId);

        // Send the audio blob to your server
        fetch('https://b8c4-51-15-17-109.ngrok.io/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Audio sent successfully:', data);
        })
        .catch(error => {
            console.error('Error sending audio:', error);
        });
    };

    return (
        <div className="container">
            <div className={`upload-title ${file ? 'hidden' : ''}`}>Upload your song</div>
            <div className="file-types">MP3, WAV, FLAC</div>
            <label className={`dropzone ${file ? 'expanded' : ''} ${isInputDisabled ? 'disabled' : ''}`} htmlFor="fileInput" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
                <input type="file" accept="audio/*" onChange={onDrop} style={{ display: 'none' }} id="fileInput" disabled={isInputDisabled} />
                {file && (
                    <>
                        <div className={`controls ${showControls ? 'show' : ''}`}>
                            <CustomAudioPlayer src={file} speed={speed} gain={gain} bassBoost={bassBoost} onDownload={handleDownload}/>
                            <div className={`song-title ${showControls ? 'hidden' : ''}`}>{fileName}</div>
                            <label className="slider-label">Speed</label>
                            <input className="slider" type="range" min="0.5" max="1.5" step="0.01" value={speed} onChange={handleSpeedChange} />
                            <div className="slider-value">{speed}</div>
                            <label className="slider-label">Volume (Gain)</label>
                            <input className="slider" type="range" min="0" max="2" step="0.01" value={gain} onChange={handleGainChange} />
                            <div className="slider-value">{gain}</div>
                            <label className="slider-label">Bass Boost</label>
                            <input className="slider" type="range" min="-10" max="10" step="0.1" value={bassBoost} onChange={handleBassBoostChange} />
                            <div className="slider-value">{bassBoost}</div>
                            <div className="convert-wrapper">
                                <button className="convert-another" onClick={handleDownload}>
                                    Download changed song
                                </button>
                            </div>
                            <div className="convert-wrapper">
                                <label className="convert-another" htmlFor="convertInput">
                                    Convert Another Song
                                    <input type="file" accept="audio/*" onChange={(e) => onDrop(e, true)} style={{ display: 'none' }} id="convertInput" />
                                </label>
                            </div>
                        </div>
                    </>
                )}
            </label>
        </div>
    );
}

export default App;
