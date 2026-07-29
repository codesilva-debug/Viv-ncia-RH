console.log("Vivência RH iniciado");


let dadosVivencia = {};
let horarioVaga = "";


// ===============================
// CAPTURAR FORMULÁRIO
// ===============================

function capturarDados(){

    const perguntas = document.querySelectorAll('[role="listitem"]');

    const dados = {};


    perguntas.forEach((pergunta)=>{


        const tituloElemento = pergunta.querySelector('.M7eMe');

        if(!tituloElemento) return;


        const titulo = tituloElemento.innerText.trim();


        let resposta = "";


        // Inputs normais
        const campo = pergunta.querySelector(
            "input, textarea"
        );


        if(campo){
            resposta = campo.value;
        }


        // Radio Google Forms
        const selecionado = pergunta.querySelector(
            '[aria-checked="true"]'
        );


        if(selecionado){

            resposta =
            selecionado.getAttribute(
                "aria-label"
            );

        }


        dados[titulo] = resposta;


    });


    dadosVivencia = dados;


    atualizarPainel();


    console.log(
        "Dados capturados:",
        dadosVivencia
    );

}


// ===============================
// AUXILIAR: OBTER DADO ROBUSTO
// ===============================

function obterDado(campoSemDoisPontos) {
    if (!dadosVivencia) return "";
    const chaves = Object.keys(dadosVivencia);
    const termo = campoSemDoisPontos.toLowerCase().trim().replace(/:$/, "");
    for (const chave of chaves) {
        const chaveLimpa = chave.toLowerCase().trim().replace(/:$/, "");
        if (chaveLimpa === termo) {
            return dadosVivencia[chave];
        }
    }
    return "";
}


// ===============================
// GERAR TEXTO WHATSAPP
// ===============================


function gerarMensagem(){
    const cargo = obterDado("Vaga/Cargo");
    const unidade = obterDado("Unidade solicitante");
    const data = formatarData(obterDado("Data Vivência") || obterDado("Data da Vivência"));
    const periodo = obterDado("Período teste") || obterDado("Período do teste");
    const nome = obterDado("Nome do Candidato");
    const emailContato = obterDado("E-mail / Contato") || obterDado("E-mail") || obterDado("Telefone");

    return `${cargo.toUpperCase()} ${horarioVaga.toUpperCase()} ${unidade.toUpperCase()} - Vivência em ${data} - ${periodo.toUpperCase()} - ${nome} - ${emailContato}`;
}



// ===============================
// FORMATAR DATA
// ===============================


function formatarData(data){


    if(!data)
        return "";


    const partes=data.split("-");


    if(partes.length!==3)
        return data;


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}



// ===============================
// COPIAR WHATSAPP
// ===============================


function copiarWhatsApp(){


    const texto = gerarMensagem();


    navigator.clipboard.writeText(texto);


    alert(
        "Mensagem copiada!"
    );

}



// ===============================
// CRIAR PAINEL
// ===============================


function criarPainel(){


    const painel=document.createElement(
        "div"
    );


    painel.id="painelVivencia";


    painel.innerHTML=`
        <div class="painel-header">
            <h3>Vivência RH</h3>
            <span class="version-tag">v1.0</span>
        </div>

        <div id="statusVivencia" class="status-aguardando">
            Aguardando captura de dados
        </div>

        <div class="input-group">
            <label for="horarioVaga">Horário da Vaga</label>
            <input 
                id="horarioVaga"
                placeholder="Ex: 09:30 às 19:30"
            />
        </div>

        <button id="btnWhats" class="btn-whatsapp">
            Copiar texto WhatsApp
        </button>
        
        <button id="btnPDF" class="btn-pdf">
            Exportar PDF
        </button>
    `;


    document.body.appendChild(
        painel
    );



    document
    .getElementById("horarioVaga")
    .addEventListener(
        "input",
        (e)=>{

            horarioVaga =
            e.target.value;

        }
    );



    document
    .getElementById("btnWhats")
    .onclick=()=>{

        copiarWhatsApp();

    };


    document
    .getElementById("btnPDF")
    .onclick=()=>{

        gerarPDF();

    };


    // Captura inicial de dados do formulário
    capturarDados();


    // Captura automática a cada 1,5 segundos para atualização em tempo real
    setInterval(capturarDados, 1500);


}




// ===============================
// ATUALIZAR PAINEL
// ===============================


function atualizarPainel(){


    const status =
    document.getElementById(
        "statusVivencia"
    );


    if(!status)
        return;


    const preenchidos =
    Object.values(dadosVivencia)
    .filter(v=>v)
    .length;


    status.className = "status-sucesso";
    status.innerHTML = `${preenchidos} campos capturados`;


}



// Inicializar

setTimeout(()=>{

    criarPainel();

},3000);


// ===============================
// CARREGAR IMAGEM AUXILIAR
// ===============================

function loadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });
}


// ===============================
// GERAR PDF COM jspdf
// ===============================

async function gerarPDF(){
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const nome = obterDado("Nome do Candidato");
    const data = formatarData(obterDado("Data Vivência") || obterDado("Data da Vivência"));
    const telefone = obterDado("Telefone") || obterDado("E-mail / Contato") || obterDado("E-mail");
    const cargo = obterDado("Vaga/Cargo");
    const unidade = obterDado("Unidade solicitante");
    const periodo = obterDado("Período teste") || obterDado("Período do teste");
    const anamnese = obterDado("Anamnese");
    const unidadeVivencia = obterDado("Unidade da Vivência");
    const horarioVagaStr = horarioVaga || obterDado("Horário da Vaga");

    // 1. Carregar Logotipo do Fadelito da extensão
    const logoUrl = chrome.runtime.getURL("Fadelito-esc-Completo-Horizontal-md.png");
    const logoImg = await loadImage(logoUrl);

    let currentY = 20;

    if (logoImg) {
        const imgWidth = 50;
        const imgHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * imgWidth;
        pdf.addImage(logoImg, 'PNG', 20, currentY, imgWidth, imgHeight);
        currentY += Math.max(imgHeight, 15) + 8;
    } else {
        currentY += 10;
    }

    // 2. Título do Documento
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(31, 78, 121);
    pdf.text("Encaminhamento para Vivência", 20, currentY);
    
    currentY += 4;
    pdf.setDrawColor(31, 78, 121);
    pdf.setLineWidth(0.8);
    pdf.line(20, currentY, 190, currentY);
    
    currentY += 8;

    // 3. Bloco de Informações do Candidato (Card Dinâmico com auto-ajuste)
    const cardStartY = currentY;
    const col1X = 24;
    const col1MaxX = 103;
    const col1AvailW = col1MaxX - col1X; // 79mm

    const col2X = 107;
    const col2MaxX = 186;
    const col2AvailW = col2MaxX - col2X; // 79mm

    function measureField(label, value, availW) {
        const labelText = label + ": ";
        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(9.5);
        const labelWidth = pdf.getTextWidth(labelText);
        const valAvailW = Math.max(availW - labelWidth - 1, 20);

        const valStr = value || "—";
        pdf.setFont("Helvetica", "normal");

        let fontSize = 9.5;
        pdf.setFontSize(fontSize);

        let w = pdf.getTextWidth(valStr);
        while (fontSize > 7.5 && w > valAvailW) {
            fontSize -= 0.5;
            pdf.setFontSize(fontSize);
            w = pdf.getTextWidth(valStr);
        }

        if (w <= valAvailW) {
            return { fontSize, lines: [valStr], height: 5.5, labelWidth };
        }

        fontSize = 8.5;
        pdf.setFontSize(fontSize);
        let rawLines = pdf.splitTextToSize(valStr, valAvailW);
        let lines = [];
        for (let line of rawLines) {
            if (pdf.getTextWidth(line) > valAvailW) {
                let chunk = "";
                for (let char of line) {
                    if (pdf.getTextWidth(chunk + char) > valAvailW) {
                        lines.push(chunk);
                        chunk = char;
                    } else {
                        chunk += char;
                    }
                }
                if (chunk) lines.push(chunk);
            } else {
                lines.push(line);
            }
        }
        return { fontSize, lines, height: lines.length * 4.5 + 1, labelWidth };
    }

    function drawField(label, measured, x, y) {
        const labelText = label + ": ";
        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(9.5);
        pdf.setTextColor(40, 40, 40);
        pdf.text(labelText, x, y);

        const valX = x + measured.labelWidth + 1;

        pdf.setFont("Helvetica", "normal");
        pdf.setFontSize(measured.fontSize);
        pdf.setTextColor(60, 60, 60);

        let lineY = y;
        for (let i = 0; i < measured.lines.length; i++) {
            pdf.text(measured.lines[i], valX, lineY);
            if (i < measured.lines.length - 1) {
                lineY += 4.5;
            }
        }
    }

    const rowsData = [
        {
            left: { label: "Nome do Candidato", value: nome },
            right: { label: "E-mail / Contato", value: telefone }
        },
        {
            left: { label: "Vaga/Cargo", value: cargo },
            right: { label: "Unidade Solicitante", value: unidade }
        },
        {
            left: { label: "Data da Vivência", value: data },
            right: { label: "Período do Teste", value: periodo }
        },
        {
            left: { label: "Unidade da Vivência", value: unidadeVivencia },
            right: { label: "Horário da Vaga", value: horarioVagaStr }
        }
    ];

    const computedRows = rowsData.map(row => {
        const mLeft = measureField(row.left.label, row.left.value, col1AvailW);
        const mRight = measureField(row.right.label, row.right.value, col2AvailW);
        const rowHeight = Math.max(mLeft.height, mRight.height, 6);
        return { left: row.left, mLeft, right: row.right, mRight, rowHeight };
    });

    let totalContentHeight = 6;
    computedRows.forEach((r, idx) => {
        totalContentHeight += r.rowHeight;
        if (idx < computedRows.length - 1) totalContentHeight += 2.5;
    });
    totalContentHeight += 5;

    const cardHeight = Math.max(totalContentHeight, 42);

    pdf.setDrawColor(220, 224, 230);
    pdf.setFillColor(248, 249, 250);
    pdf.roundedRect(20, cardStartY, 170, cardHeight, 3, 3, "FD");

    let rY = cardStartY + 6.5;
    computedRows.forEach((r, idx) => {
        drawField(r.left.label, r.mLeft, col1X, rY);
        drawField(r.right.label, r.mRight, col2X, rY);
        rY += r.rowHeight;
        if (idx < computedRows.length - 1) rY += 2.5;
    });

    currentY += cardHeight + 10;

    // 4. Seção Anamnese
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(31, 78, 121);
    pdf.text("Anamnese", 20, currentY);

    currentY += 4;
    pdf.setDrawColor(220, 224, 230);
    pdf.setLineWidth(0.4);
    pdf.line(20, currentY, 190, currentY);

    currentY += 6;

    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);

    const maxAnamneseW = 160;
    const rawAnamneseLines = pdf.splitTextToSize(anamnese || "Nenhuma anamnese registrada.", maxAnamneseW);
    const linhasAnamnese = [];
    for (let line of rawAnamneseLines) {
        if (pdf.getTextWidth(line) > maxAnamneseW) {
            let chunk = "";
            for (let char of line) {
                if (pdf.getTextWidth(chunk + char) > maxAnamneseW) {
                    linhasAnamnese.push(chunk);
                    chunk = char;
                } else {
                    chunk += char;
                }
            }
            if (chunk) linhasAnamnese.push(chunk);
        } else {
            linhasAnamnese.push(line);
        }
    }

    const totalLinhas = linhasAnamnese.length;
    const alturaTexto = totalLinhas * 5; 
    const alturaBox = alturaTexto + 8;

    pdf.setDrawColor(235, 238, 242);
    pdf.setFillColor(252, 252, 252);
    pdf.roundedRect(20, currentY, 170, alturaBox, 2, 2, "FD");

    pdf.text(linhasAnamnese, 25, currentY + 6.5);

    currentY += alturaBox + 10;

    function checkNewPage(neededHeight) {
        if (currentY + neededHeight > 270) {
            pdf.addPage();
            currentY = 25;
            return true;
        }
        return false;
    }

    // 5. Linha de divisão para o Termo de Compromisso e Instruções
    checkNewPage(10);
    pdf.setDrawColor(210, 215, 223);
    pdf.setLineWidth(0.5);
    pdf.line(20, currentY, 190, currentY);
    currentY += 6;

    pdf.setFont("Helvetica", "italic");
    pdf.setFontSize(8.5);
    pdf.setTextColor(110, 110, 110);

    const termos = [
        "Lembrando que todos os candidatos(as) enviados(as) para a vivência, estão cientes de salário, horário, condições de contratação e particularidades da vaga e seu ofício.",
        "Caso haja discordância, por favor entrar em contato conosco imediatamente para acessarmos o candidato(a) a fim de sanar quaisquer dúvidas.",
        "E como instituído em nosso protocolo de recrutamento e seleção, pedimos a gentileza de nos informar sobre o resultado da vivência em até 48hs da data do envio. Caso contrário, entenderemos que a vaga foi fechada. Obrigado."
    ];

    termos.forEach(termo => {
        const linhasTermo = pdf.splitTextToSize(termo, 170);
        const h = linhasTermo.length * 4.5;
        checkNewPage(h + 4);
        pdf.text(linhasTermo, 20, currentY);
        currentY += h + 4;
    });

    pdf.save(`Vivencia-${nome.replace(/\s+/g, '_') || 'candidato'}.pdf`);
}