'use client';
import React, { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async () => {
    if (inputValue.trim() === '') {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentGoal = inputValue;
    setInputValue('');

    try {
      const response = await fetch('/api/decompose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal: currentGoal }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse: Message = {
          id: Date.now() + 1, // Ensure unique ID if responses are very fast
          text: `Tasks: ${data.decomposedTasks.join(', ')}`,
          sender: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      } else {
        const errorData = await response.text(); // Or response.json() if error is JSON
        console.error('API error:', response.status, errorData);
        const aiErrorResponse: Message = {
          id: Date.now() + 1,
          text: `Sorry, I couldn't process that (${response.status}). Please try again.`,
          sender: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, aiErrorResponse]);
      }
    } catch (error) {
      console.error('Network or other error:', error);
      const aiErrorResponse: Message = {
        id: Date.now() + 1,
        text: 'Sorry, something went wrong. Please check your connection and try again.',
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, aiErrorResponse]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-4 border border-gray-200">
      <div className="message-display-area h-96 overflow-y-auto space-y-2 mb-4 p-2 bg-gray-50 rounded-md">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="input-area flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your goal..."
          className="flex-grow border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
