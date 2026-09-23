import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { 
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Configuração do Firebase

const firebaseConfig = {

    apiKey: "AIzaSyDFefXIwyDhoKdvuetuMW5YAHRwf1ucanw",
    authDomain: "almoxerifado-e0734.firebaseapp.com",
    projectId: "almoxerifado-e0734",
    storageBucket: "almoxerifado-e0734.firebasestorage.app",
    messagingSenderId: "729405108901",
    appId: "1:729405108901:web:21a59a27ef0f251725d34c"

};


// Inicializar Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =========================================================
   CONTROLE DE LOGIN
========================================================= */

if (localStorage.getItem("logado") !== "true") {

    window.location.href = "index.html";

}


/* =========================================================
   VARIÁVEIS
========================================================= */

let todasMovimentacoes = [];

let movimentacoesFiltradas = [];


console.log(
    "Firebase conectado na página de movimentações!"
);


/* =========================================================
   CONVERTER DATA PARA ORDENAÇÃO
========================================================= */

function converterData(data) {

    if (!data) return null;


    data = data.replace(",", "");


    let partes =
        data.split(" ");


    let dataParte =
        partes[0].split("/");


    let horaParte =
        partes[1]
            ? partes[1].split(":")
            : [0, 0, 0];


    return new Date(

        Number(dataParte[2]),

        Number(dataParte[1]) - 1,

        Number(dataParte[0]),

        Number(horaParte[0]),

        Number(horaParte[1]),

        Number(horaParte[2] || 0)

    );
}


/* =========================================================
   PESQUISA
========================================================= */

const campoPesquisa =
    document.getElementById(
        "pesquisaMovimentacao"
    );


if (campoPesquisa) {

    campoPesquisa.addEventListener(
        "input",
        pesquisarMovimentacoes
    );

}


/* =========================================================
   FILTRO E GERAÇÃO DO PDF
========================================================= */

function abrirFiltroPDF() {
    const modal = document.getElementById("modalFiltroPDF");
    const hoje = new Date();
    const dataLocal = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];

    document.getElementById("tipoPeriodoPDF").value = "dia";
    document.getElementById("dataDiaPDF").value = dataLocal;
    document.getElementById("dataInicioPDF").value = dataLocal;
    document.getElementById("dataFimPDF").value = dataLocal;
    document.getElementById("tipoMovimentoPDF").value = "todos";

    atualizarCamposPeriodoPDF();
    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
}

function fecharFiltroPDF() {
    const modal = document.getElementById("modalFiltroPDF");
    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
}

function atualizarCamposPeriodoPDF() {
    const tipo = document.getElementById("tipoPeriodoPDF").value;
    document.getElementById("campoDiaPDF").style.display = tipo === "dia" ? "block" : "none";
    document.getElementById("camposPeriodoPDF").style.display = tipo === "periodo" ? "grid" : "none";
}

function mesmaData(a, b) {
    return a.getDate() === b.getDate()
        && a.getMonth() === b.getMonth()
        && a.getFullYear() === b.getFullYear();
}

function criarDataLocal(valor, fimDoDia = false) {
    const partes = valor.split("-").map(Number);
    return new Date(
        partes[0], partes[1] - 1, partes[2],
        fimDoDia ? 23 : 0,
        fimDoDia ? 59 : 0,
        fimDoDia ? 59 : 0,
        fimDoDia ? 999 : 0
    );
}

function gerarPDF() {
    const tipoPeriodo = document.getElementById("tipoPeriodoPDF").value;
    const tipoMovimento = document.getElementById("tipoMovimentoPDF").value;
    let inicio;
    let fim;
    let descricaoPeriodo;

    if (tipoPeriodo === "dia") {
        const valor = document.getElementById("dataDiaPDF").value;
        if (!valor) {
            alert("Escolha a data do relatório.");
            return;
        }
        inicio = criarDataLocal(valor);
        fim = criarDataLocal(valor, true);
        descricaoPeriodo = inicio.toLocaleDateString("pt-BR");
    } else {
        const valorInicio = document.getElementById("dataInicioPDF").value;
        const valorFim = document.getElementById("dataFimPDF").value;
        if (!valorInicio || !valorFim) {
            alert("Escolha a data inicial e a data final.");
            return;
        }
        inicio = criarDataLocal(valorInicio);
        fim = criarDataLocal(valorFim, true);
        if (inicio > fim) {
            alert("A data inicial não pode ser posterior à data final.");
            return;
        }
        descricaoPeriodo = `${inicio.toLocaleDateString("pt-BR")} a ${fim.toLocaleDateString("pt-BR")}`;
    }

    const dadosPDF = todasMovimentacoes.filter((mov) => {
        const dataMov = converterData(mov.dataHora);
        if (!dataMov || dataMov < inicio || dataMov > fim) return false;
        if (tipoMovimento !== "todos" && mov.movimento !== tipoMovimento) return false;
        return true;
    });

    if (dadosPDF.length === 0) {
        alert("Nenhuma movimentação foi encontrada para os filtros escolhidos.");
        return;
    }

    const nomesMovimento = {
        todos: "Todas",
        adicionado: "Entrada / Adicionado",
        retirado: "Retirada",
        apagado: "Excluído",
        cadastrado: "Cadastrado"
    };

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "landscape" });

    pdf.setFontSize(16);
    pdf.text("Relatório de Movimentações", 14, 15);
    pdf.setFontSize(9);
    pdf.text(`Período: ${descricaoPeriodo}`, 14, 21);
    pdf.text(`Tipo: ${nomesMovimento[tipoMovimento]}`, 14, 26);

    pdf.autoTable({
        startY: 32,
        styles: { fontSize: 7 },
        head: [[
            "Data", "Código", "Produto", "Tipo", "Antes",
            "Depois", "Qtd", "Medida", "Responsável", "Movimento"
        ]],
        body: dadosPDF.map((dados) => [
            dados.dataHora || "-",
            dados.codigo || "-",
            dados.produto || "-",
            dados.tipo || "-",
            dados.antes ?? 0,
            dados.depois ?? 0,
            dados.quantidade ?? 0,
            dados.medida || "-",
            dados.responsavel || "-",
            dados.movimento || "-"
        ])
    });

    fecharFiltroPDF();
    pdf.save("movimentacoes.pdf");
}

document.getElementById("modalFiltroPDF")?.addEventListener("click", (evento) => {
    if (evento.target.id === "modalFiltroPDF") fecharFiltroPDF();
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fecharFiltroPDF();
});


/* =========================================================
   CARREGAR MOVIMENTAÇÕES
========================================================= */

async function carregarMovimentacoes() {

    const consulta =
        await getDocs(
            collection(
                db,
                "movimentacoes"
            )
        );


    let movimentacoes = [];


    consulta.forEach(
        (documento) => {

            movimentacoes.push(
                documento.data()
            );

        }
    );


    // Mais recente primeiro

    movimentacoes.sort(
        (a, b) => {

            return (
                converterData(
                    b.dataHora
                )
                -
                converterData(
                    a.dataHora
                )
            );

        }
    );


    todasMovimentacoes =
        movimentacoes;


    mostrarMovimentacoes(
        todasMovimentacoes
    );
}


/* =========================================================
   MOSTRAR TABELA
========================================================= */

function mostrarMovimentacoes(lista) {

    movimentacoesFiltradas =
        lista;


    const tabela =
        document.getElementById(
            "lista-movimentacoes"
        );


    tabela.innerHTML = "";


    lista.forEach(
        (dados) => {


            tabela.innerHTML += `

                <tr>

                    <td>
                        ${dados.dataHora || "-"}
                    </td>

                    <td>
                        ${dados.codigo || "-"}
                    </td>

                    <td>
                        ${dados.produto || "-"}
                    </td>

                    <td>
                        ${dados.tipo || "-"}
                    </td>

                    <td>
                        ${dados.antes || 0}
                    </td>

                    <td>
                        ${dados.depois || 0}
                    </td>

                    <td>
                        ${dados.quantidade || 0}
                    </td>

                    <td>
                        ${dados.medida || "-"}
                    </td>

                    <td>
                        ${dados.responsavel || "-"}
                    </td>

                    <td>

                        ${
                            dados.movimento === "adicionado"

                            ? "🟢 Adicionado"

                            : dados.movimento === "retirado"

                            ? "🔴 Retirado"

                            : dados.movimento === "cadastrado"

                            ? "🔵 Cadastrado"

                            : "⚫ Apagado"
                        }

                    </td>

                </tr>

            `;

        }
    );
}


/* =========================================================
   FILTROS
========================================================= */

function filtrarMovimentacoes() {


    let filtro =
        document.getElementById(
            "filtroPeriodo"
        ).value;


    console.log(filtro);


    let movimentoSelecionado =
        document.getElementById(
            "filtroMovimento"
        ).value;


    let hoje =
        new Date();


    let filtradas =
        todasMovimentacoes.filter(
            (mov) => {


                let dataMov =
                    converterData(
                        mov.dataHora
                    );


                console.log(
                    mov.dataHora,
                    dataMov
                );


                // Se não tiver data, ignora

                if (!dataMov) {

                    return false;

                }


                if (

                    movimentoSelecionado &&

                    mov.movimento !==
                    movimentoSelecionado

                ) {

                    return false;

                }


                if (
                    filtro === "todos"
                ) {

                    return true;

                }


                if (
                    filtro === "hoje"
                ) {

                    return (

                        dataMov.getDate()
                        ===
                        hoje.getDate()

                        &&

                        dataMov.getMonth()
                        ===
                        hoje.getMonth()

                        &&

                        dataMov.getFullYear()
                        ===
                        hoje.getFullYear()

                    );

                }


                if (
                    filtro === "semana"
                ) {


                    let seteDias =
                        new Date();


                    seteDias.setDate(

                        hoje.getDate() - 7

                    );


                    return (
                        dataMov >= seteDias
                    );

                }


                if (
                    filtro === "mes"
                ) {

                    return (

                        dataMov.getMonth()
                        ===
                        hoje.getMonth()

                        &&

                        dataMov.getFullYear()
                        ===
                        hoje.getFullYear()

                    );

                }


                if (
                    filtro === "semestre"
                ) {


                    let semestreAtual =

                        hoje.getMonth() < 6
                            ? 0
                            : 1;


                    let semestreMov =

                        dataMov.getMonth() < 6
                            ? 0
                            : 1;


                    return (

                        semestreAtual
                        ===
                        semestreMov

                        &&

                        dataMov.getFullYear()
                        ===
                        hoje.getFullYear()

                    );

                }


                if (
                    filtro === "ano"
                ) {

                    return (

                        dataMov.getFullYear()
                        ===
                        hoje.getFullYear()

                    );

                }


                return true;

            }
        );


    mostrarMovimentacoes(
        filtradas
    );

}


/* =========================================================
   BARRA DE PESQUISA
========================================================= */

function pesquisarMovimentacoes() {


    let texto =
        document.getElementById(
            "pesquisaMovimentacao"
        )
        .value
        .toLowerCase();


    let resultado =
        todasMovimentacoes.filter(
            (mov) => {


                let produto =
                    String(
                        mov.produto || ""
                    )
                    .toLowerCase();


                let codigo =
                    String(
                        mov.codigo || ""
                    )
                    .toLowerCase();


                let data =
                    String(
                        mov.dataHora || ""
                    )
                    .toLowerCase();


                let responsavel =
                    String(
                        mov.responsavel || ""
                    )
                    .toLowerCase();


                let movimento =
                    String(
                        mov.movimento || ""
                    )
                    .toLowerCase();


                return (

                    produto.includes(texto)

                    ||

                    codigo.includes(texto)

                    ||

                    data.includes(texto)

                    ||

                    responsavel.includes(texto)

                    ||

                    movimento.includes(texto)

                );

            }
        );


    mostrarMovimentacoes(
        resultado
    );

}


/* =========================================================
   DISPONIBILIZAR FUNÇÕES PARA O HTML
========================================================= */

window.filtrarMovimentacoes =
    filtrarMovimentacoes;


window.gerarPDF =
    gerarPDF;

window.abrirFiltroPDF =
    abrirFiltroPDF;

window.fecharFiltroPDF =
    fecharFiltroPDF;

window.atualizarCamposPeriodoPDF =
    atualizarCamposPeriodoPDF;


/* =========================================================
   INICIAR
========================================================= */

carregarMovimentacoes();