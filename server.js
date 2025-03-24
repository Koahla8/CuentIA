const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Variables de entorno
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// 🔹 1️⃣ Endpoint para generar el guion con OpenAI
app.post('/api/generateScript', async (req, res) => {
  try {
    const { prompt, tokenLimit } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'El prompt es requerido' });
    }

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

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error al generar el guion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🔹 2️⃣ Endpoint para generar el audio con Google TTS
app.post('/api/generateAudio', async (req, res) => {
  try {
    const { script } = req.body;
    if (!script) {
      return res.status(400).json({ error: 'El script es requerido' });
    }

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: script },
        voice: { languageCode: 'es-ES', ssmlGender: 'FEMALE' },
        audioConfig: { audioEncoding: 'MP3' }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error al generar el audio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🔹 Fallback para servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🔹 Iniciar servidor en el puerto correcto
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});
