        async function consultarDireitos() {
            const tema = document.getElementById('tema').value;
            const localizacao = document.getElementById('localizacao').value || "Não informada";
            const problema = document.getElementById('problema').value.trim();
            const btn = document.getElementById('btnConsultar');
            const resultadoDiv = document.getElementById('resultado');

            if (!problema) {
                alert("Por favor, descreva o seu problema antes de consultar.");
                return;
            }

            btn.disabled = true;
            btn.innerHTML = `<span class="animate-spin">🌀</span> Consultando Legislação...`;
            resultadoDiv.classList.add('hidden');

            const promptUsuario = `Tema: ${tema}\nLocalização: ${localizacao}\nProblema: ${problema}`;

            try {
                // 1. Faz a requisição para a função do Netlify
                const response = await fetch('https://constitucao-na-palma-da-mao.netlify.app/.netlify/functions/gemini', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        promptUsuario: promptUsuario,
                        systemInstructions: typeof SYSTEM_INSTRUCTIONS !== 'undefined' ? SYSTEM_INSTRUCTIONS : ""
                    })
                });

                // 2. Transforma a resposta em JSON
                const data = await response.json();

                // 3. Trata possíveis erros de resposta da API/Servidor
                if (!response.ok) {
                    let mensagem = "Erro no servidor";
                    if (typeof data.error === 'string') {
                        mensagem = data.error;
                    } else if (data.error && data.error.message) {
                        mensagem = data.error.message;
                    } else if (typeof data === 'object') {
                        mensagem = JSON.stringify(data);
                    }
                    throw new Error(mensagem);
                }

                // 4. Exibe o resultado renderizado com o MarkedJS
                const textoResposta = data.candidates[0].content.parts[0].text;
                resultadoDiv.innerHTML = marked.parse(textoResposta);
                resultadoDiv.classList.remove('hidden');
                resultadoDiv.scrollIntoView({ behavior: 'smooth' });

            } catch (erro) {
                alert("Erro ao consultar: " + erro.message);
                console.error("Erro na requisição:", erro);
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<span>Consultar Meus Direitos</span>`;
            }
        }
