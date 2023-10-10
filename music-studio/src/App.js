import React, { useState, useEffect } from 'react';
import CustomAudioPlayer from './CustomAudioPlayer';
import './styles.css';


// const TelegramApi = require('node-telegram-bot-api');
// const token = '6497923379:AAHb8_bjIE3vfM0lcwM45qtOVY3SAyq6Ku0';
// const bot = new TelegramApi(token,{polling:true});
// bot.on('message', msg=>{
//     const text = msg.text;
//     const chatId = msg.chat.id;
//
//     if (text === '/start'){
//         bot.sendMessage(chatId, 'Hello! This is slowed reverb bot!')
//     }
// })
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
    return (
        <div className="container">
            <div className={`upload-title ${file ? 'hidden' : ''}`}>Upload your song</div>
            <div className="file-types">MP3, WAV, FLAC</div>
            <label className={`dropzone ${file ? 'expanded' : ''} ${isInputDisabled ? 'disabled' : ''}`} htmlFor="fileInput" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
                <input type="file" accept="audio/*" onChange={onDrop} style={{ display: 'none' }} id="fileInput" disabled={isInputDisabled} />
                {file && (
                    <>
                        <div className={`controls ${showControls ? 'show' : ''}`}>
                            <CustomAudioPlayer src={file} speed={speed} gain={gain} bassBoost={bassBoost} />
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

                            <div className="download-section">
                                <div className="download-title">Download as</div>
                                <div className="button-group">
                                    <button className="format-button">MP3</button>
                                    <button className="format-button">WAV</button>
                                    <button className="format-button">FLAC</button>
                                </div>
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
