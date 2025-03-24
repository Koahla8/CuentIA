// Función para construir el prompt a partir de los datos del formulario
function generatePrompt() {
    // Obtener datos de los nuevos campos
    const protagonists = document.getElementById('protagonists').value;
    const description = document.getElementById('description').value;
    const ageRange = document.getElementById('ageRange').value;
    const wordCount = document.getElementById('wordCount').value;
    
    // Ajuste del límite de tokens según la opción de palabras:
    // 500 palabras: usamos 725 tokens
    // 1000 palabras: usamos 1550 tokens
    let tokenLimit;
    if (wordCount === '500') {
        tokenLimit = 725;
    } else if (wordCount === '1000') {
        tokenLimit = 1550;
    }
    
    // Construir el prompt para generar un cuento infantil
    const prompt = `Genera un cuento infantil completo con los siguientes elementos:
- Protagonistas: ${protagonists}.
- Debe tener aproximadamente ${wordCount} palabras (~${wordCount === '500' ? '2 minutos' : '4 minutos'} de lectura).
- Dirigido a niños de ${ageRange}.
- Descripción del tema: ${description}.
- Asegúrate de que el cuento tenga una estructura clara, un lenguaje sencillo y adecuado para la edad, y que no incluya notas, comentarios adicionales o indicaciones de producción.`;
  
    // Muestra el prompt en un textarea para que el usuario pueda revisarlo
    document.getElementById('promptOutput').innerHTML = `<textarea id='promptText'>${prompt}</textarea>`;
    
    // Crea y muestra el botón para generar el guion
    const generateScriptButton = document.createElement('button');
    generateScriptButton.innerText = 'Generar Cuento (puede tardar 10 segundos)';
    generateScriptButton.onclick = () => generateScript(prompt, tokenLimit);
    document.getElementById('promptOutput').appendChild(generateScriptButton);
}

// Función para enviar el prompt al backend y generar el cuento
function generateScript(prompt, tokenLimit) {
    fetch('/api/generateScript', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, tokenLimit })
    })
    .then(response => response.json())
    .then(data => {
        // Se asume que el endpoint devuelve data.choices[0].message.content
        const script = data.choices[0].message.content;
        document.getElementById('scriptOutput').innerHTML = `<textarea id='scriptText'>${script}</textarea>`;
        
        // Crea y muestra el botón para generar el audio a partir del cuento
        const generateAudioButton = document.createElement('button');
        generateAudioButton.innerText = 'Generar Audio (puede tardar 10 segundos)';
        generateAudioButton.onclick = () => {
            // Se toma el contenido actual del textarea, en caso de que el usuario lo haya modificado.
            const updatedScript = document.getElementById('scriptText').value;
            generateAudio(updatedScript);
        };
        document.getElementById('scriptOutput').appendChild(generateAudioButton);
    })
    .catch(error => console.error('Error:', error));
}

// Función para enviar el cuento al backend y generar el audio
function generateAudio(script) {
    fetch('/api/generateAudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.audioContent) {
            throw new Error("No se recibió contenido de audio");
        }
        // Asume que el audio se devuelve en formato Base64
        const audio = document.getElementById('audio');
        audio.src = 'data:audio/mp3;base64,' + data.audioContent;
        audio.play();
    })
    .catch(error => console.error('Error:', error));
}
