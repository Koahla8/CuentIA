// Función para construir el prompt a partir de los datos del formulario
function generateStory() {
    const protagonists = document.getElementById('protagonists').value;
    const description = document.getElementById('description').value;
    const ageRange = document.getElementById('ageRange').value;
    const wordCount = document.getElementById('wordCount').value;
    const language = document.getElementById('language').value;

    let tokenLimit;
    if (wordCount === '500') {
        tokenLimit = 725;
    } else if (wordCount === '1000') {
        tokenLimit = 1550;
    }

    const prompt = `Genera un cuento infantil completo en ${language === 'en-US' ? 'inglés' : 'español'} con los siguientes elementos:
- Protagonistas: ${protagonists}.
- Debe tener aproximadamente ${wordCount} palabras (~${wordCount === '500' ? '2 minutos' : '4 minutos'} de lectura).
- Dirigido a niños de ${ageRange}.
- Descripción del tema: ${description}.
- Asegúrate de que el cuento tenga una estructura clara, un lenguaje sencillo y adecuado para la edad, y que no incluya notas, comentarios adicionales o indicaciones de producción.`;

    // Generar guion y audio directamente
    generateScriptAndAudio(prompt, tokenLimit, language);
}

// Función para generar el guion y el audio en una sola acción
function generateScriptAndAudio(prompt, tokenLimit, language) {
    fetch('/api/generateScript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tokenLimit })
    })
    .then(response => response.json())
    .then(data => {
        const script = data.script;
        if (!script) {
            throw new Error("No se generó el guion.");
        }

        document.getElementById('scriptOutput').innerHTML = `<textarea id='scriptText'>${script}</textarea>`;

        // Generar el audio automáticamente
        generateAudio(script, language);

        // Mostrar el botón para regenerar el audio si se modifica el texto
        const generateAudioButton = document.createElement('button');
        generateAudioButton.innerText = 'Generar Audio (puede tardar 10 segundos)';
        generateAudioButton.onclick = () => {
            const updatedScript = document.getElementById('scriptText').value;
            generateAudio(updatedScript, language);
        };
        document.getElementById('scriptOutput').appendChild(generateAudioButton);
    })
    .catch(error => console.error('Error:', error));
}

// Función para enviar el guion al backend y generar el audio
function generateAudio(script, language) {
    fetch('/api/generateAudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, language })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.audioContent) {
            throw new Error("No se recibió contenido de audio");
        }
        const audio = document.getElementById('audio');
        audio.src = 'data:audio/mp3;base64,' + data.audioContent;
        audio.play();
    })
    .catch(error => console.error('Error:', error));
}
