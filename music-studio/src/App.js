import React, { useState, useEffect } from 'react';
import CustomAudioPlayer from './CustomAudioPlayer';
import './styles.css';
import { BOT_TOKEN } from './not';  // Assuming you named the file `config.js`

function App() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [speed, setSpeed] = useState(1);
    const [showControls, setShowControls] = useState(false);
    const [isInputDisabled, setIsInputDisabled] = useState(false);
    const [gain, setGain] = useState(1);
    const [bassBoost, setBassBoost] = useState(0);
    const [webAppData, setWebAppData] = useState(null);

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const initData = {
                query_id: window.Telegram.WebApp.query_id,
                user: window.Telegram.WebApp.user,
                receiver: window.Telegram.WebApp.receiver,
                chat: window.Telegram.WebApp.chat,
                chat_type: window.Telegram.WebApp.chat_type,
                chat_instance: window.Telegram.WebApp.chat_instance,
                start_param: window.Telegram.WebApp.start_param,
                can_send_after: window.Telegram.WebApp.can_send_after,
                auth_date: window.Telegram.WebApp.auth_date,
                hash: window.Telegram.WebApp.hash
            };
            setWebAppData(initData);
        }
    }, []);

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
            window.Telegram.WebApp.ready();
        }
    }, []);

    const sendAudioToTelegram = async (audioBlob) => {
        if (webAppData && webAppData.chat && webAppData.chat.id) {
            const formData = new FormData();
            formData.append('chat_id', webAppData.chat.id);
            formData.append('audio', audioBlob, 'editedAudio.mp3');

            try {
                const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error("Error sending audio to Telegram:", error);
            }
        } else {
            console.error("Chat data not available. Cannot send audio.");
        }
    };

    return (
        <div className="container">
            <div className={`upload-title ${file ? 'hidden' : ''}`}>Upload your song</div>
            <div className="file-types">MP3, WAV, FLAC</div>
            <label className={`dropzone ${file ? 'expanded' : ''} ${isInputDisabled ? 'disabled' : ''}`} htmlFor="fileInput" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
                <input type="file" accept="audio/*" onChange={onDrop} style={{ display: 'none' }} id="fileInput" disabled={isInputDisabled} />
                {file && (
                    <div className={`controls ${showControls ? 'show' : ''}`}>
                        <CustomAudioPlayer src={file} speed={speed} gain={gain} bassBoost={bassBoost} onDownload={sendAudioToTelegram} />
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
                            <label className="convert-another" htmlFor="convertInput">
                                Convert Another Song
                                <input type="file" accept="audio/*" onChange={(e) => onDrop(e, true)} style={{ display: 'none' }} id="convertInput" />
                            </label>
                        </div>
                    </div>
                )}
            </label>
        </div>
    );
}

export default App;
