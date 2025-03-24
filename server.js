const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// 🔹 Endpoint para generar el guion
app.post('/api/generateScript', async (req, res) => {
    const { prompt, tokenLimit } = req.body;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: tokenLimit || 200
            })
        });

        const data = await response.json();

        // ✔️ Extraer solo el texto del guion del JSON recibido
        const scriptText = data.choices?.[0]?.message?.content;

        if (!scriptText) {
            throw new Error("No se generó contenido en el guion.");
        }

        res.json({ script: scriptText });  // Solo enviamos el texto del guion

    } catch (error) {
        console.error('Error al generar el guion:', error);
        res.status(500).json({ error: 'Error al generar el guion. Por favor, intenta de nuevo.' });
    }
});

// 🔹 Endpoint para generar el audio con Google TTS
app.post('/api/generateAudio', async (req, res) => {
    const { script, language } = req.body;

    const voiceConfig = {
        languageCode: language || 'es-ES',
        ssmlGender: 'FEMALE'
    };

    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text: script },
                voice: voiceConfig,
                audioConfig: { audioEncoding: 'MP3' }
            })
        });

        const data = await response.json();

        if (!data.audioContent) {
            throw new Error("No se recibió contenido de audio.");
        }

        res.json(data);
    } catch (error) {
        console.error('Error al generar el audio:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 🔹 Servir el frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});
