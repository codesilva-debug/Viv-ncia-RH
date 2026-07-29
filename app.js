// ==========================================
// VIVÊNCIA RH - STANDALONE WEB APPLICATION
// ==========================================

const STORAGE_KEY = "vivencia_rh_form_data";

// Mapeamento dos Elementos do Formulário
const formElements = {
    nomeCandidato: document.getElementById("nomeCandidato"),
    telefone: document.getElementById("telefone"),
    vagaCargo: document.getElementById("vagaCargo"),
    unidadeSolicitante: document.getElementById("unidadeSolicitante"),
    unidadeVivencia: document.getElementById("unidadeVivencia"),
    dataVivencia: document.getElementById("dataVivencia"),
    periodoTeste: document.getElementById("periodoTeste"),
    horarioVaga: document.getElementById("horarioVaga"),
    anamnese: document.getElementById("anamnese")
};

const whatsPreview = document.getElementById("whatsPreview");
const btnCopyWhats = document.getElementById("btnCopyWhats");
const btnExportPDF = document.getElementById("btnExportPDF");
const btnClearForm = document.getElementById("btnClearForm");
const saveBadge = document.getElementById("saveBadge");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

// ==========================================
// PERSISTÊNCIA EM LOCALSTORAGE (AUTO-SAVE)
// ==========================================

function salvarDados() {
    const dados = {};
    for (const key in formElements) {
        if (formElements[key]) {
            dados[key] = formElements[key].value;
        }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    
    // Animação visual do badge de salvamento
    saveBadge.classList.add("saving");
    setTimeout(() => {
        saveBadge.classList.remove("saving");
    }, 400);

    atualizarPreviewWhatsApp();
}

function carregarDados() {
    const salvos = localStorage.getItem(STORAGE_KEY);
    if (!salvos) return;

    try {
        const dados = JSON.parse(salvos);
        for (const key in dados) {
            if (formElements[key]) {
                formElements[key].value = dados[key] || "";
            }
        }
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage:", e);
    }
    atualizarPreviewWhatsApp();
}

function limparFormulario() {
    if (confirm("Tem certeza que deseja iniciar uma nova vivência? Os dados preenchidos serão limpos.")) {
        for (const key in formElements) {
            if (formElements[key]) {
                formElements[key].value = "";
            }
        }
        localStorage.removeItem(STORAGE_KEY);
        atualizarPreviewWhatsApp();
        exibirToast("Formulário limpo com sucesso!");
    }
}

// ==========================================
// FORMATADORES AUXILIARES
// ==========================================

function formatarDataBR(dataStr) {
    if (!dataStr) return "";
    const partes = dataStr.split("-");
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
}

function aplicarMascaraTelefone(e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    
    if (v.length > 10) {
        v = v.replace(/^(\d\d)(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (v.length > 6) {
        v = v.replace(/^(\d\d)(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
        v = v.replace(/^(\d\d)(\d{0,5})$/, "($1) $2");
    } else if (v.length > 0) {
        v = v.replace(/^(\d*)$/, "($1");
    }
    e.target.value = v;
}

// ==========================================
// GERADOR E PREVIEW DO WHATSAPP
// ==========================================

function gerarMensagemWhatsApp() {
    const cargo = formElements.vagaCargo.value.trim();
    const horario = formElements.horarioVaga.value.trim();
    const unidade = formElements.unidadeSolicitante.value.trim();
    const data = formatarDataBR(formElements.dataVivencia.value);
    const periodo = formElements.periodoTeste.value.trim();
    const nome = formElements.nomeCandidato.value.trim();
    const emailContato = formElements.telefone.value.trim();

    if (!cargo && !unidade && !nome) {
        return "Preencha os campos do formulário para gerar o resumo do WhatsApp...";
    }

    return `${cargo.toUpperCase()} ${horario.toUpperCase()} ${unidade.toUpperCase()} - Vivência em ${data} - ${periodo.toUpperCase()} - ${nome} - ${emailContato}`;
}

function atualizarPreviewWhatsApp() {
    const texto = gerarMensagemWhatsApp();
    whatsPreview.innerText = texto;
}

function copiarWhatsApp() {
    const texto = gerarMensagemWhatsApp();
    if (!formElements.nomeCandidato.value && !formElements.vagaCargo.value) {
        exibirToast("Preencha o formulário antes de copiar!", true);
        return;
    }

    navigator.clipboard.writeText(texto).then(() => {
        exibirToast("Mensagem copiada para a área de transferência!");
    }).catch(err => {
        console.error("Erro ao copiar:", err);
        exibirToast("Erro ao copiar mensagem.", true);
    });
}

function exibirToast(mensagem, isError = false) {
    toastMessage.innerText = mensagem;
    toast.className = `toast ${isError ? 'error' : ''} show`;
    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

// ==========================================
// CARREGAR IMAGEM LOGO (PROMISE)
// ==========================================

function loadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

// ==========================================
// GERADOR DE PDF (jsPDF)
// ==========================================

async function gerarPDF() {
    const nome = formElements.nomeCandidato.value.trim();
    const telefone = formElements.telefone.value.trim();
    const cargo = formElements.vagaCargo.value.trim();
    const unidade = formElements.unidadeSolicitante.value.trim();
    const unidadeVivencia = formElements.unidadeVivencia.value.trim();
    const data = formatarDataBR(formElements.dataVivencia.value);
    const periodo = formElements.periodoTeste.value.trim();
    const horarioVaga = formElements.horarioVaga ? formElements.horarioVaga.value.trim() : "";
    const anamnese = formElements.anamnese.value.trim();

    if (!nome || !cargo || !unidade) {
        exibirToast("Preencha ao menos Nome, Cargo e Unidade para gerar o PDF!", true);
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // 1. Carregar Logotipo do Fadelito
    const logoImg = await loadImage("Fadelito-esc-Completo-Horizontal-md.png");
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
    pdf.setTextColor(31, 78, 121); // Azul Fadelito
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

    // Função para medir e ajustar texto do campo (evita que vazamentos e sobreposições ocorram)
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

    // Definir as 4 linhas de pares de campos
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
            right: { label: "Horário da Vaga", value: horarioVaga }
        }
    ];

    // Calcular medidas de todos os campos e alturas de cada linha
    const computedRows = rowsData.map(row => {
        const mLeft = measureField(row.left.label, row.left.value, col1AvailW);
        const mRight = measureField(row.right.label, row.right.value, col2AvailW);
        const rowHeight = Math.max(mLeft.height, mRight.height, 6);
        return { left: row.left, mLeft, right: row.right, mRight, rowHeight };
    });

    // Calcular altura total do Card
    let totalContentHeight = 6; // Padding topo
    computedRows.forEach((r, idx) => {
        totalContentHeight += r.rowHeight;
        if (idx < computedRows.length - 1) totalContentHeight += 2.5; // Gap entre linhas
    });
    totalContentHeight += 5; // Padding fundo

    const cardHeight = Math.max(totalContentHeight, 42);

    // Desenhar Card (fundo e borda)
    pdf.setDrawColor(220, 224, 230);
    pdf.setFillColor(248, 249, 250);
    pdf.roundedRect(20, cardStartY, 170, cardHeight, 3, 3, "FD");

    // Renderizar o texto dos campos dentro do Card
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

    // Verificação de quebra de página
    function checkNewPage(neededHeight) {
        if (currentY + neededHeight > 270) {
            pdf.addPage();
            currentY = 25;
            return true;
        }
        return false;
    }

    // 5. Linha de divisão e Termos de Compromisso
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

    // Salvar o arquivo PDF
    const nomeArquivo = `Vivencia-${nome.replace(/\s+/g, '_') || 'candidato'}.pdf`;
    pdf.save(nomeArquivo);
    exibirToast(`PDF "${nomeArquivo}" gerado com sucesso!`);
}

// ==========================================
// INICIALIZAÇÃO E EVENT LISTENERS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Carregar dados salvos no localStorage
    carregarDados();

    // Event listeners para auto-save nos inputs
    for (const key in formElements) {
        if (formElements[key]) {
            formElements[key].addEventListener("input", salvarDados);
            formElements[key].addEventListener("change", salvarDados);
        }
    }

    // Botões
    btnCopyWhats.addEventListener("click", copiarWhatsApp);
    btnExportPDF.addEventListener("click", gerarPDF);
    btnClearForm.addEventListener("click", limparFormulario);
});
