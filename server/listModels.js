
require('dotenv').config();

const checkModels = async () => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('Gemini API key not found in .env');
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Unable to fetch models');
        }

        const models = data.models.filter(model =>
            model.supportedGenerationMethods?.includes('generateContent')
        );

        console.log('\nAvailable Gemini models:\n');

        models.forEach(model => {
            console.log(model.name);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
};

checkModels();
