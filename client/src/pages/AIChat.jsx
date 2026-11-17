import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

import API_BASE_URL from '../config/api';
import { chatWithAI } from '../services/aiService';
import './AIChat.css';

function AIChat() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');

    const isVoiceMode = mode === 'voice';

    const [message, setMessage] = useState('');
    const [listening, setListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [isVoiceCommand, setIsVoiceCommand] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: isVoiceMode
                ? "Hi! Welcome to Foodie Voice Ordering. Tap the microphone and tell me what you want to add, remove or check in your cart!"
                : "Hi! I'm Foodie AI. Tell me what you're craving, your food preferences or your budget. I'll help you discover delicious food!"
        }
    ]);

    const [loading, setLoading] = useState(false);
    const recognitionRef = useRef(null);

    // Speak AI response
    const speakResponse = (text) => {
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(text);

        speech.lang = 'en-IN';
        speech.rate = 1;
        speech.pitch = 1;

        window.speechSynthesis.speak(speech);
    };

    // Stop speech when leaving page
    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel();
            recognitionRef.current?.stop();
        };
    }, []);

    // Voice recognition
    const handleVoiceInput = () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Voice recognition is not supported. Please use Google Chrome.');
            return;
        }

        if (listening) {
            recognitionRef.current?.stop();
            setListening(false);
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;

            setMessage(transcript);
            setIsVoiceCommand(true);
        };

        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    // Format cart response
    const formatCartDetails = (cart, totalPrice) => {
        if (!cart?.items?.length) {
            return 'Your cart is empty.';
        }

        const items = cart.items.map(item => {
            const foodName = item.food?.name || 'Food item';
            const quantity = item.quantity;
            const price = item.food?.price || 0;

            return `${foodName} x ${quantity} = ₹${price * quantity}`;
        });

        return (
            '\n\nYour Cart:\n' +
            items.join('\n') +
            `\n\nTotal: ₹${totalPrice}`
        );
    };

    // Send message
    const handleSend = async (e) => {
        e.preventDefault();

        if (!message.trim() || loading) return;

        const userMessage = message.trim();
        const wasVoiceCommand = isVoiceCommand;

        setMessages(prev => [
            ...prev,
            {
                role: 'user',
                text: userMessage
            }
        ]);

        setMessage('');
        setIsVoiceCommand(false);
        setLoading(true);

        try {
            let reply;
            let recommendations = [];

            // Voice command API
            if (wasVoiceCommand) {
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Please login to use voice cart commands.');
                }

                const response = await axios.post(
                    `${API_BASE_URL}/api/ai/voice-command`,
                    {
                        message: userMessage
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = response.data;

                // If not a cart command, use Gemini chat
                if (data.action === 'none') {
                    const chatData = await chatWithAI(userMessage);

                    reply = chatData.reply;
                    recommendations = chatData.recommendations || [];

                } else {
                    reply = data.reply || 'Command processed successfully.';

                    if (data.matchingFoods?.length > 0) {
                        reply += '\n\nAvailable choices:\n' +
                            data.matchingFoods
                                .map(food => `${food.name} - ₹${food.price}`)
                                .join('\n');
                    }

                    if (data.action === 'view') {
                        reply += formatCartDetails(
                            data.cart,
                            data.totalPrice || 0
                        );
                    }
                }

            } else {
                // Normal typed Gemini chat
                const data = await chatWithAI(userMessage);

                reply = data.reply || 'Here are your food suggestions.';
                recommendations = data.recommendations || [];
            }

            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    text: reply,
                    recommendations
                }
            ]);

            if (voiceEnabled) {
                speakResponse(reply);
            }

        } catch (error) {
            console.error('AI Chat Error:', error);

            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.reply ||
                error.message ||
                'Sorry, something went wrong. Please try again.';

            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    text: errorMessage
                }
            ]);

            if (voiceEnabled) {
                speakResponse(errorMessage);
            }

        } finally {
            setLoading(false);
        }
    };

    // Toggle spoken responses
    const toggleVoice = () => {
        if (voiceEnabled) {
            window.speechSynthesis?.cancel();
        }

        setVoiceEnabled(prev => !prev);
    };

    return (
        <div className="ai-chat-page">

            <div className="ai-chat-container">

                {/* Header */}
                <div className="ai-chat-header">

                    <div>
                        <h1>
                            {isVoiceMode
                                ? 'Foodie Voice Ordering'
                                : 'Foodie AI Assistant'}
                        </h1>

                        <p>
                            {isVoiceMode
                                ? 'Manage your food cart using voice commands'
                                : 'Your personal AI food discovery assistant'}
                        </p>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={toggleVoice}
                            style={{
                                padding: '9px 12px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginRight: '12px'
                            }}
                        >
                            {voiceEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
                        </button>

                        <span className="ai-status">
                            ● AI Online
                        </span>
                    </div>

                </div>

                {/* Messages */}
                <div className="ai-chat-messages">

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-message ${msg.role}`}
                        >

                            <div className="chat-bubble">
                                {msg.text}
                            </div>

                            {msg.role === 'ai' && (
                                <button
                                    type="button"
                                    onClick={() => speakResponse(msg.text)}
                                    title="Listen to this response"
                                >
                                    🔊 Listen
                                </button>
                            )}

                            {msg.recommendations?.length > 0 && (
                                <div className="ai-recommendations">

                                    <h3>Recommended Food</h3>

                                    {msg.recommendations.map(food => (
                                        <div
                                            className="ai-food-card"
                                            key={food.id}
                                        >

                                            <div>
                                                <h4>{food.name}</h4>
                                                <p>{food.description}</p>
                                                <span>{food.category}</span>
                                            </div>

                                            <div className="ai-food-price">
                                                <strong>₹{food.price}</strong>

                                                <Link to={`/food/${food.id}`}>
                                                    View Food
                                                </Link>
                                            </div>

                                        </div>
                                    ))}

                                </div>
                            )}

                        </div>
                    ))}

                    {loading && (
                        <div className="chat-message ai">
                            <div className="chat-bubble">
                                Foodie AI is thinking...
                            </div>
                        </div>
                    )}

                </div>

                {/* Input */}
                <form
                    className="ai-chat-input"
                    onSubmit={handleSend}
                >

                    <button
                        type="button"
                        className={`voice-button ${listening ? 'listening' : ''}`}
                        onClick={handleVoiceInput}
                        disabled={loading}
                    >
                        {listening ? '🔴 Listening...' : '🎤 Voice'}
                    </button>

                    <input
                        type="text"
                        placeholder={
                            isVoiceMode
                                ? 'Say or type a cart command...'
                                : 'Ask me about food or use voice...'
                        }
                        value={message}
                        onChange={e => {
                            setMessage(e.target.value);
                            setIsVoiceCommand(false);
                        }}
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                    >
                        {loading ? 'Wait...' : 'Send'}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AIChat;