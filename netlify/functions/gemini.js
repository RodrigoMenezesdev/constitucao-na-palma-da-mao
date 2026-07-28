exports.handler = async function(event, context) {
    // Permite apenas requisições POST
    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: "Método não permitido" }) 
        };
    }

    try {
        const { promptUsuario, systemInstructions } = JSON.parse(event.body || '{}');
        const API_KEY = process.env.GEMINI_API_KEY;

        // Validação da chave de API nas variáveis de ambiente
        if (!API_KEY) {
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "A chave GEMINI_API_KEY não foi encontrada nas variáveis de ambiente do Netlify." })
            };
        }

        // Chamada para o modelo gemini-2.0-flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { 
                    parts: [{ text: systemInstructions || "" }] 
                },
                contents: [{ 
                    parts: [{ text: promptUsuario }] 
                }]
            })
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
