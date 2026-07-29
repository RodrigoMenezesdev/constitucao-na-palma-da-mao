exports.handler = async function(event, context) {
    // 🌐 Cabeçalhos de CORS para liberar o acesso do GitHub Pages
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // Trata a pré-requisição do navegador (preflight request)
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            headers,
            body: JSON.stringify({ error: "Método não permitido" }) 
        };
    }

    try {
        const { promptUsuario, systemInstructions } = JSON.parse(event.body || '{}');
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Chave GEMINI_API_KEY não encontrada nas variáveis do Netlify." })
            };
        }

        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY;
        
        const payload = {
            system_instruction: { parts: [{ text: systemInstructions || "" }] },
            contents: [{ parts: [{ text: promptUsuario }] }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
