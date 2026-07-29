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
    const telefone = obterDado("Telefone");
    const cargo = obterDado("Vaga/Cargo");
    const unidade = obterDado("Unidade solicitante");
    const periodo = obterDado("Período teste") || obterDado("Período do teste");
    const anamnese = obterDado("Anamnese");
    const unidadeVivencia = obterDado("Unidade da Vivência");


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
    pdf.setTextColor(31, 78, 121); // Cor azul profissional / ardósia
    pdf.text("Encaminhamento para Vivência", 20, currentY);
    
    currentY += 4;
    pdf.setDrawColor(31, 78, 121);
    pdf.setLineWidth(0.8);
    pdf.line(20, currentY, 190, currentY); // Linha divisória sob o título
    
    currentY += 8;


    // 3. Bloco de Informações do Candidato e da Vaga (Estilo Card)
    pdf.setDrawColor(220, 224, 230);
    pdf.setFillColor(248, 249, 250);
    pdf.roundedRect(20, currentY, 170, 42, 3, 3, "FD");

    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);

    const startXCol1 = 24;
    const startXCol2 = 114;

    // Row 1
    let rowY = currentY + 7;
    pdf.setFont("Helvetica", "bold");
    pdf.text("Nome do Candidato:", startXCol1, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(nome, startXCol1 + 35, rowY);

    pdf.setFont("Helvetica", "bold");
    pdf.text("E-mail / Contato:", startXCol2, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(telefone, startXCol2 + 30, rowY);

    // Row 2
    rowY += 8;
    pdf.setFont("Helvetica", "bold");
    pdf.text("Vaga/Cargo:", startXCol1, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(cargo, startXCol1 + 22, rowY);

    pdf.setFont("Helvetica", "bold");
    pdf.text("Unidade Solicitante:", startXCol2, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(unidade, startXCol2 + 35, rowY);

    // Row 3
    rowY += 8;
    pdf.setFont("Helvetica", "bold");
    pdf.text("Data da Vivência:", startXCol1, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(data, startXCol1 + 32, rowY);

    pdf.setFont("Helvetica", "bold");
    pdf.text("Período do Teste:", startXCol2, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(periodo, startXCol2 + 32, rowY);

    // Row 4
    rowY += 8;
    pdf.setFont("Helvetica", "bold");
    pdf.text("Unidade da Vivência:", startXCol1, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(unidadeVivencia, startXCol1 + 38, rowY);

    currentY += 42 + 10;


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

    const linhasAnamnese = pdf.splitTextToSize(anamnese || "Nenhuma anamnese registrada.", 160);
    const totalLinhas = linhasAnamnese.length;
    const alturaTexto = totalLinhas * 5.5; 
    const alturaBox = alturaTexto + 8; // padding

    pdf.setDrawColor(235, 238, 242);
    pdf.setFillColor(252, 252, 252);
    pdf.roundedRect(20, currentY, 170, alturaBox, 2, 2, "FD");

    pdf.text(linhasAnamnese, 25, currentY + 6.5);

    currentY += alturaBox + 12;


    // Função de verificação de quebra de página
    function checkNewPage(neededHeight) {
        if (currentY + neededHeight > 270) {
            pdf.addPage();
            currentY = 25; // Reinicia no topo da nova página
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


    // Termos regulamentares
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


    // Salvar o arquivo PDF
    pdf.save(`Vivencia-${nome.replace(/\s+/g, '_') || 'candidato'}.pdf`);


}