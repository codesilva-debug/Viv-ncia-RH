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

    // 3. Bloco de Informações do Candidato (Card com fundo claro)
    pdf.setDrawColor(220, 224, 230);
    pdf.setFillColor(248, 249, 250);
    pdf.roundedRect(20, currentY, 170, 42, 3, 3, "FD");

    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);

    const startXCol1 = 24;
    const startXCol2 = 114;

    // Linha 1
    let rowY = currentY + 7;
    pdf.setFont("Helvetica", "bold");
    pdf.text("Nome do Candidato:", startXCol1, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(nome, startXCol1 + 35, rowY);

    pdf.setFont("Helvetica", "bold");
    pdf.text("E-mail / Contato:", startXCol2, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(telefone, startXCol2 + 30, rowY);

    // Linha 2
    rowY += 8;
    pdf.setFont("Helvetica", "bold");
    pdf.text("Vaga/Cargo:", startXCol1, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(cargo, startXCol1 + 22, rowY);

    pdf.setFont("Helvetica", "bold");
    pdf.text("Unidade Solicitante:", startXCol2, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(unidade, startXCol2 + 35, rowY);

    // Linha 3
    rowY += 8;
    pdf.setFont("Helvetica", "bold");
    pdf.text("Data da Vivência:", startXCol1, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(data, startXCol1 + 32, rowY);

    pdf.setFont("Helvetica", "bold");
    pdf.text("Período do Teste:", startXCol2, rowY);
    pdf.setFont("Helvetica", "normal");
    pdf.text(periodo, startXCol2 + 32, rowY);

    // Linha 4
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
    const alturaBox = alturaTexto + 8;

    pdf.setDrawColor(235, 238, 242);
    pdf.setFillColor(252, 252, 252);
    pdf.roundedRect(20, currentY, 170, alturaBox, 2, 2, "FD");

    pdf.text(linhasAnamnese, 25, currentY + 6.5);

    currentY += alturaBox + 12;

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
