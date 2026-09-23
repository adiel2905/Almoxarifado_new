import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { 
    getFirestore, 
    addDoc, 
    collection, 
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyDFefXIwyDhoKdvuetuMW5YAHRwf1ucanw",

    authDomain: "almoxerifado-e0734.firebaseapp.com",

    projectId: "almoxerifado-e0734",

    storageBucket: "almoxerifado-e0734.firebasestorage.app",

    messagingSenderId: "729405108901",

    appId: "1:729405108901:web:21a59a27ef0f251725d34c"

};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


let produtos = [];


console.log("Firebase conectado!");



/* =========================================================
   CONTROLE DE LOGIN
========================================================= */


if (localStorage.getItem("logado") !== "true") {

    window.location.href = "index.html";

}


const usuarioNome =
    localStorage.getItem("usuarioNome")
    || "Usuário";


const boasVindas =
    document.getElementById("boas-vindas");


if (boasVindas) {

    boasVindas.textContent =
        `Bem-vindo, ${usuarioNome}, ao seu controle do Almoxarifado.`;

}



/* =========================================================
   REGISTRAR MOVIMENTAÇÃO
========================================================= */


async function registrarMovimentacao(dados) {

    await addDoc(
        collection(db, "movimentacoes"),
        dados
    );

    console.log(
        "Movimentação registrada!"
    );

}



/* =========================================================
   ABRIR FORMULÁRIO
========================================================= */


function abrirFormulario() {

    let formulario =
        document.getElementById("formulario");


    if (
        formulario.style.display === "block"
    ) {

        formulario.style.display = "none";

    } else {

        formulario.style.display = "block";

    }

}



/* =========================================================
   SALVAR PRODUTO
========================================================= */


async function salvarProduto() {

    let codigo =
        document.getElementById("codigo").value;

    let nome =
        document.getElementById("nome").value;

    let quantidade =
        document.getElementById("quantidade").value;

    let medida =
        document.getElementById("medida").value;

    let localizacao =
        document.getElementById("localizacao").value;

    let tipo =
        document.getElementById("tipo").value;

    let informacao =
        document.getElementById("informacao").value;

    let estoqueMinimo =
        Number(
            document
                .getElementById("estoqueMinimo")
                .value
        );


    try {

        const documento =
            await addDoc(
                collection(db, "produtos"),
                {

                    codigo: codigo,

                    nome: nome,

                    quantidade:
                        Number(quantidade),

                    medida: medida,

                    localizacao:
                        localizacao,

                    tipo: tipo,

                    informacao:
                        informacao,

                    detalhes:
                        informacao,

                    estoqueMinimo:
                        estoqueMinimo,

                    dataCadastro:
                        Date.now(),

                    ultimaModificacao:
                        Date.now()

                }
            );


        console.log(
            "Produto salvo no Firebase!"
        );


        await registrarMovimentacao({

            codigo:
                codigo,

            produto:
                nome,

            tipo:
                tipo,

            antes:
                0,

            depois:
                Number(quantidade),

            quantidade:
                Number(quantidade),

            medida:
                medida,

            responsavel:
                usuarioNome,

            movimento:
                "cadastrado",

            dataHora:
                new Date()
                    .toLocaleString(
                        "pt-BR"
                    ),

            timestamp:
                Date.now()

        });


        let tabela =
            document.getElementById(
                "lista-produtos"
            );


        let novaLinha =
            tabela.insertRow();


        novaLinha.dataset.id =
            documento.id;


        novaLinha.innerHTML = `

            <td>${codigo}</td>

            <td>${nome}</td>

            <td>${tipo}</td>

            <td>${quantidade}</td>

            <td>${medida}</td>

            <td>${localizacao}</td>

            <td>

                <button
                    class="editar"
                    onclick="editarProduto(this)"
                >
                    ✏️
                </button>

                <button
                    class="movimentar"
                    onclick="abrirMovimentacao(this)"
                >
                    ↕
                </button>

                <button
                    class="excluir"
                    onclick="excluirProduto(this)"
                >
                    🗑️
                </button>

                <button
                    class="btn-seta"
                    onclick="abrirDetalhes(this)"
                >
                    ↓
                </button>

            </td>

        `;


        document
            .getElementById("codigo")
            .value = "";


        document
            .getElementById("nome")
            .value = "";


        document
            .getElementById("tipo")
            .value = "";


        document
            .getElementById("quantidade")
            .value = "";


        document
            .getElementById("medida")
            .selectedIndex = 0;


        document
            .getElementById("localizacao")
            .value = "";


        document
            .getElementById("informacao")
            .value = "";


        document
            .getElementById("estoqueMinimo")
            .value = "";


        document
            .getElementById("formulario")
            .style.display = "none";


    } catch (erro) {

        console.error(
            "Erro ao salvar produto:",
            erro
        );


        alert(
            "Erro ao salvar produto"
        );

    }

}



/* =========================================================
   CARREGAR DETALHES
========================================================= */


async function carregarDetalhes(
    idProduto,
    linhaDetalhes
) {

    const campo =
        linhaDetalhes
            .querySelector(
                ".campo-detalhes"
            );


    const consulta =
        await getDocs(
            collection(
                db,
                "produtos"
            )
        );


    consulta.forEach(
        (documento) => {


            if (
                documento.id ===
                idProduto
            ) {

                campo.value =

                    documento
                        .data()
                        .detalhes

                    ||

                    documento
                        .data()
                        .informacao

                    ||

                    "";

            }

        }
    );

}



/* =========================================================
   SALVAR DETALHES
========================================================= */


async function salvarDetalhes(botao) {

    let linhaDetalhes =
        botao.closest("tr");


    let linhaProduto =
        linhaDetalhes
            .previousElementSibling;


    let idProduto =
        linhaProduto.dataset.id;


    let texto =
        linhaDetalhes
            .querySelector(
                ".campo-detalhes"
            )
            .value;


    await updateDoc(
        doc(
            db,
            "produtos",
            idProduto
        ),
        {

            detalhes:
                texto,

            ultimaModificacao:
                Date.now()

        }
    );


    linhaProduto
        .dataset
        .detalhes =
        texto;


    alert(
        "Informações salvas!"
    );

}



/* =========================================================
   CARREGAR PRODUTOS
========================================================= */


async function carregarProdutos() {

    const tabela =
        document.getElementById(
            "lista-produtos"
        );

    tabela.innerHTML = "";

    // Carrega produtos e histórico para descobrir qual produto
    // foi modificado mais recentemente.
    const [consultaProdutos, consultaMovimentacoes] =
        await Promise.all([
            getDocs(collection(db, "produtos")),
            getDocs(collection(db, "movimentacoes"))
        ]);

    const ultimaMovimentacaoPorCodigo = {};

    consultaMovimentacoes.forEach((documento) => {

        const mov = documento.data();
        const codigo = String(mov.codigo || "").trim();
        const momento = Number(mov.timestamp || 0);

        if (
            codigo &&
            momento > Number(ultimaMovimentacaoPorCodigo[codigo] || 0)
        ) {
            ultimaMovimentacaoPorCodigo[codigo] = momento;
        }

    });

    produtos = [];

    consultaProdutos.forEach((documento) => {

        let produto = documento.data();
        produto.id = documento.id;

        const codigo = String(produto.codigo || "").trim();

        // Prioridade: alteração salva no produto -> última movimentação
        // registrada -> data em que o produto foi cadastrado.
        produto.ultimaModificacao = Math.max(
            Number(produto.ultimaModificacao || 0),
            Number(ultimaMovimentacaoPorCodigo[codigo] || 0),
            Number(produto.dataCadastro || 0)
        );

        produtos.push(produto);

    });

    // Ao abrir o Dashboard, "Mais recente" já fica selecionado
    // e os últimos produtos modificados aparecem primeiro.
    const filtroOrdenacao =
        document.getElementById("filtroOrdenacao");

    if (filtroOrdenacao) {
        filtroOrdenacao.value = "recente";
    }

    ordenarProdutos();
}



/* =========================================================
   EXCLUIR PRODUTO
========================================================= */


async function excluirProduto(botao) {

    let linha =
        botao.parentNode.parentNode;


    let id =
        linha.dataset.id;


    let codigo =
        linha.cells[0].innerText;


    let nome =
        linha.cells[1].innerText;


    let tipo =
        linha.cells[2].innerText;


    let quantidade =
        Number(
            linha.cells[3].innerText
        );


    let medida =
        linha.cells[4].innerText;


    let motivo =
        prompt(
            "Digite o motivo da exclusão:"
        );


    if (!motivo) {

        alert(
            "Informe um motivo para excluir o produto."
        );

        return;

    }


    try {


        await registrarMovimentacao({

            codigo:
                codigo,

            produto:
                nome,

            tipo:
                tipo,

            antes:
                quantidade,

            depois:
                0,

            quantidade:
                quantidade,

            medida:
                medida,

            responsavel:
                usuarioNome,

            movimento:
                "apagado",

            motivo:
                motivo,

            dataHora:
                new Date()
                    .toLocaleString(
                        "pt-BR"
                    ),

            timestamp:
                Date.now()

        });


        await deleteDoc(
            doc(
                db,
                "produtos",
                id
            )
        );


        linha.remove();


        produtos =
            produtos.filter(
                produto =>
                    produto.id !== id
            );


        alert(
            "Produto excluído com sucesso!"
        );


    } catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao excluir produto."
        );

    }

}



/* =========================================================
   MEDIDA
========================================================= */


let medidaSelecionada = "";

let resolverMedida = null;


function confirmarMedida() {

    medidaSelecionada =
        document
            .getElementById(
                "novaMedida"
            )
            .value;


    document
        .getElementById(
            "editarMedida"
        )
        .style.display =
        "none";


    if (resolverMedida) {

        resolverMedida(
            medidaSelecionada
        );

    }

}



/* =========================================================
   MOVIMENTAÇÃO
========================================================= */


let produtoMovimentacao = null;


function abrirMovimentacao(botao) {

    let linha =
        botao.parentNode.parentNode;


    produtoMovimentacao =
        linha;


    let nome =
        linha.cells[1]
            .innerText;


    document
        .getElementById(
            "nomeProdutoMovimentacao"
        )
        .innerHTML =
        "Produto: " + nome;


    document
        .getElementById(
            "movimentacao"
        )
        .style.display =
        "block";

}



/* =========================================================
   EDITAR PRODUTO
========================================================= */


async function editarProduto(botao) {

    let linha =
        botao.parentNode.parentNode;


    let id =
        linha.dataset.id;


    let nome =
        linha.cells[1].innerText;


    let tipo =
        linha.cells[2].innerText;


    let quantidade =
        linha.cells[3].innerText;


    let medida =
        linha.cells[4].innerText;


    let localizacao =
        linha.cells[5].innerText;


    let produto =
        produtos.find(
            p =>
                p.id === id
        );


    let estoqueMinimoAtual =

        produto

            ? produto.estoqueMinimo || 0

            : 0;


    let novoNome =
        prompt(
            "Editar nome:",
            nome
        );


    let novoTipo =
        prompt(
            "Editar tipo:",
            tipo
        );


    let novaQuantidade =
        prompt(
            "Editar quantidade:",
            quantidade
        );


    let novoEstoqueMinimo =
        prompt(
            "Editar estoque mínimo:",
            estoqueMinimoAtual
        );


    let novaMedida =
        prompt(

`Escolha a medida:

1 - Unidade (un)
2 - Quilo (kg)
3 - Grama (g)
4 - Litro (L)
5 - Metro (m)

Digite o número da opção:`,

            medida

        );


    if (
        novaMedida == "1"
    ) {

        novaMedida =
            "un";

    }

    else if (
        novaMedida == "2"
    ) {

        novaMedida =
            "kg";

    }

    else if (
        novaMedida == "3"
    ) {

        novaMedida =
            "g";

    }

    else if (
        novaMedida == "4"
    ) {

        novaMedida =
            "L";

    }

    else if (
        novaMedida == "5"
    ) {

        novaMedida =
            "m";

    }

    else {

        novaMedida =
            medida;

    }


    let novaLocalizacao =
        prompt(
            "Editar localização:",
            localizacao
        );


    if (
        novoNome != null
    ) {

        linha.cells[1]
            .innerText =
            novoNome;

    }


    if (
        novoTipo != null
    ) {

        linha.cells[2]
            .innerText =
            novoTipo;

    }


    if (
        novaQuantidade != null
    ) {

        linha.cells[3]
            .innerText =
            novaQuantidade;

    }


    if (
        novaMedida != null
    ) {

        linha.cells[4]
            .innerText =
            novaMedida;

    }


    if (
        novaLocalizacao != null
    ) {

        linha.cells[5]
            .innerText =
            novaLocalizacao;

    }


    await updateDoc(
        doc(
            db,
            "produtos",
            id
        ),
        {

            nome:
                linha.cells[1]
                    .innerText,

            tipo:
                linha.cells[2]
                    .innerText,

            quantidade:
                Number(
                    linha.cells[3]
                        .innerText
                ),

            medida:
                linha.cells[4]
                    .innerText,

            localizacao:
                linha.cells[5]
                    .innerText,

            estoqueMinimo:
                Number(
                    novoEstoqueMinimo
                ),

            ultimaModificacao:
                Date.now()

        }
    );


    if (produto) {

        produto.nome =
            linha.cells[1]
                .innerText;


        produto.tipo =
            linha.cells[2]
                .innerText;


        produto.quantidade =
            Number(
                linha.cells[3]
                    .innerText
            );


        produto.medida =
            linha.cells[4]
                .innerText;


        produto.localizacao =
            linha.cells[5]
                .innerText;


        produto.estoqueMinimo =
            Number(
                novoEstoqueMinimo
            );

    }


    alert(
        "Produto atualizado com sucesso!"
    );

}



/* =========================================================
   RETIRADA
========================================================= */


let produtoSelecionado = null;


function abrirRetirada() {

    let retirada =
        document.getElementById(
            "retirada"
        );


    if (
        retirada.style.display ===
        "block"
    ) {

        retirada.style.display =
            "none";

    } else {

        retirada.style.display =
            "block";

    }

}



/* =========================================================
   PESQUISAR PRODUTO PARA RETIRADA
========================================================= */


function pesquisarProduto() {

    let pesquisa =
        document
            .getElementById(
                "pesquisaProduto"
            )
            .value
            .toLowerCase();


    let tabela =
        document
            .getElementById(
                "lista-produtos"
            );


    let resultado =
        document
            .getElementById(
                "resultadoPesquisa"
            );


    resultado.innerHTML =
        "";


    for (
        let linha of tabela.rows
    ) {


        if (
            !linha.cells
            ||
            linha.cells.length < 4
        ) {

            continue;

        }


        let codigo =
            linha.cells[0]
                .innerText
                .toLowerCase();


        let nome =
            linha.cells[1]
                .innerText
                .toLowerCase();


        let quantidade =
            linha.cells[3]
                .innerText;


        if (
            codigo.includes(
                pesquisa
            )

            ||

            nome.includes(
                pesquisa
            )
        ) {

            resultado.innerHTML += `

                <button

                    onclick="selecionarProduto(this)"

                    data-codigo="${linha.cells[0].innerText}"

                    data-nome="${linha.cells[1].innerText}"

                    data-quantidade="${quantidade}"

                >

                    Código:
                    ${linha.cells[0].innerText}

                    |

                    Produto:
                    ${linha.cells[1].innerText}

                    |

                    Estoque:
                    ${quantidade}

                </button>

                <br><br>

            `;

        }

    }

}



/* =========================================================
   SELECIONAR PRODUTO
========================================================= */


function selecionarProduto(botao) {

    produtoSelecionado =
        botao;


    document
        .getElementById(
            "pesquisaProduto"
        )
        .value =
        botao.dataset.nome;

}



/* =========================================================
   RETIRAR PRODUTO
========================================================= */


async function retirarProduto() {


    if (
        produtoSelecionado ==
        null
    ) {

        alert(
            "Escolha um produto"
        );

        return;

    }


    const responsavel =
        usuarioNome;


    let quantidadeRetirar =
        Number(
            document
                .getElementById(
                    "quantidadeRetirar"
                )
                .value
        );


    let quantidadeAtual =
        Number(
            produtoSelecionado
                .dataset
                .quantidade
        );


    if (
        quantidadeRetirar >
        quantidadeAtual
    ) {

        alert(
            "Quantidade maior que o estoque disponível"
        );

        return;

    }


    if (
        quantidadeRetirar <= 0
    ) {

        alert(
            "Informe uma quantidade válida"
        );

        return;

    }


    let novaQuantidade =
        quantidadeAtual -
        quantidadeRetirar;


    await registrarMovimentacao({

        codigo:
            produtoSelecionado
                .dataset
                .codigo,

        produto:
            produtoSelecionado
                .dataset
                .nome,

        tipo:
            "",

        antes:
            quantidadeAtual,

        depois:
            novaQuantidade,

        quantidade:
            quantidadeRetirar,

        medida:
            "",

        responsavel:
            responsavel,

        movimento:
            "retirado",

        dataHora:
            new Date()
                .toLocaleString(
                    "pt-BR"
                ),

        timestamp:
            Date.now()

    });


    let tabela =
        document
            .getElementById(
                "lista-produtos"
            );


    for (
        let linha of tabela.rows
    ) {


        if (
            !linha.cells
            ||
            linha.cells.length < 4
        ) {

            continue;

        }


        if (
            linha.cells[1]
                .innerText
            ==
            produtoSelecionado
                .dataset
                .nome
        ) {


            linha.cells[3]
                .innerText =
                novaQuantidade;


            await updateDoc(
                doc(
                    db,
                    "produtos",
                    linha.dataset.id
                ),
                {

                    quantidade:
                        novaQuantidade,

                    ultimaModificacao:
                        Date.now()

                }
            );


            produtoSelecionado
                .dataset
                .quantidade =
                novaQuantidade;


            let produto =
                produtos.find(
                    p =>
                        p.id ===
                        linha.dataset.id
                );


            if (produto) {

                produto.quantidade =
                    novaQuantidade;

            }

        }

    }


    alert(
        "Produto retirado com sucesso"
    );


    document
        .getElementById(
            "retirada"
        )
        .style.display =
        "none";

}



/* =========================================================
   CONFIRMAR MOVIMENTAÇÃO
========================================================= */


async function confirmarMovimentacao() {


    if (
        !produtoMovimentacao
    ) {

        alert(
            "Nenhum produto selecionado"
        );

        return;

    }


    let quantidadeMovimentar =
        Number(
            document
                .getElementById(
                    "quantidadeMovimentacao"
                )
                .value
        );


    let tipo =
        document
            .getElementById(
                "tipoMovimentacao"
            )
            .value;


    let responsavel =
        usuarioNome;


    if (
        quantidadeMovimentar <= 0
    ) {

        alert(
            "Digite uma quantidade válida"
        );

        return;

    }


    let quantidadeAntes =
        Number(
            produtoMovimentacao
                .cells[3]
                .innerText
        );


    let quantidadeDepois;


    if (
        tipo === "entrada"
    ) {

        quantidadeDepois =

            quantidadeAntes

            +

            quantidadeMovimentar;

    }

    else {


        if (
            quantidadeMovimentar >
            quantidadeAntes
        ) {

            alert(
                "Quantidade maior que o estoque disponível"
            );

            return;

        }


        quantidadeDepois =

            quantidadeAntes

            -

            quantidadeMovimentar;

    }


    produtoMovimentacao
        .cells[3]
        .innerText =
        quantidadeDepois;


    await updateDoc(
        doc(
            db,
            "produtos",
            produtoMovimentacao
                .dataset
                .id
        ),
        {

            quantidade:
                quantidadeDepois,

            ultimaModificacao:
                Date.now()

        }
    );


    let produto =
        produtos.find(
            p =>
                p.id ===
                produtoMovimentacao
                    .dataset
                    .id
        );


    if (produto) {

        produto.quantidade =
            quantidadeDepois;

        produto.ultimaModificacao =
            Date.now();

    }


    await registrarMovimentacao({

        dataHora:
            new Date()
                .toLocaleString(
                    "pt-BR"
                ),

        codigo:
            produtoMovimentacao
                .cells[0]
                .innerText,

        produto:
            produtoMovimentacao
                .cells[1]
                .innerText,

        movimento:

            tipo === "entrada"

                ? "adicionado"

                : "retirado",

        antes:
            quantidadeAntes,

        depois:
            quantidadeDepois,

        quantidade:
            quantidadeMovimentar,

        medida:
            produtoMovimentacao
                .cells[4]
                .innerText,

        responsavel:
            responsavel,

        timestamp:
            Date.now()

    });


    alert(
        "Movimentação realizada com sucesso!"
    );


    document
        .getElementById(
            "movimentacao"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "quantidadeMovimentacao"
        )
        .value =
        "";

}



/* =========================================================
   TESTE FIREBASE
========================================================= */


async function testeFirebase() {

    console.log(
        "Iniciando teste..."
    );


    try {

        await addDoc(
            collection(
                db,
                "produtos"
            ),
            {

                nome:
                    "Teste",

                quantidade:
                    10

            }
        );


        console.log(
            "Produto salvo no Firebase!"
        );


    } catch (erro) {

        console.error(
            "Erro ao salvar:"
        );


        console.error(
            erro
        );

    }

}



/* =========================================================
   ABRIR DETALHES
========================================================= */


function abrirDetalhes(botao) {

    let linhaProduto =
        botao.closest("tr");


    let proximaLinha =
        linhaProduto
            .nextElementSibling;


    if (

        proximaLinha

        &&

        proximaLinha
            .classList
            .contains(
                "linha-detalhes"
            )

    ) {

        proximaLinha.remove();

        botao.innerHTML =
            "↓";

        return;

    }


    let idProduto =
        linhaProduto
            .dataset
            .id;


    let linhaDetalhes =
        document
            .createElement(
                "tr"
            );


    linhaDetalhes
        .classList
        .add(
            "linha-detalhes"
        );


    linhaDetalhes
        .dataset
        .produto =
        linhaProduto
            .dataset
            .id;


    linhaDetalhes.innerHTML = `

        <td colspan="7">

            <textarea

                class="campo-detalhes"

                placeholder="Digite as informações do produto..."

            ></textarea>


            <br>


            <button

                class="salvar-detalhes"

                onclick="salvarDetalhes(this)"

            >

                Salvar

            </button>

        </td>

    `;


    linhaProduto.after(
        linhaDetalhes
    );


    botao.innerHTML =
        "↑";


    carregarDetalhes(
        idProduto,
        linhaDetalhes
    );

}



/* =========================================================
   PESQUISAR NA TABELA
========================================================= */


function pesquisarTabela() {

    let pesquisa =
        document
            .getElementById(
                "pesquisaTabela"
            )
            .value
            .toLowerCase()
            .trim();


    let tabela =
        document
            .getElementById(
                "lista-produtos"
            );


    let linhas =
        Array.from(
            tabela
                .querySelectorAll(
                    "tr"
                )
        );


    let produtosPesquisa =
        [];


    linhas.forEach(
        linha => {


            if (
                !linha.cells
                ||
                linha.cells.length < 2
            ) {

                return;

            }


            let codigo =
                linha.cells[0]
                    .innerText
                    .toLowerCase();


            let nome =
                linha.cells[1]
                    .innerText
                    .toLowerCase();


            let pontos =
                0;


            if (
                pesquisa !== ""
            ) {


                if (
                    codigo.startsWith(
                        pesquisa
                    )
                ) {

                    pontos +=
                        10;

                }


                if (
                    nome.startsWith(
                        pesquisa
                    )
                ) {

                    pontos +=
                        8;

                }


                if (
                    codigo.includes(
                        pesquisa
                    )
                ) {

                    pontos +=
                        5;

                }


                if (
                    nome.includes(
                        pesquisa
                    )
                ) {

                    pontos +=
                        3;

                }

            }


            produtosPesquisa.push({

                linha:
                    linha,

                pontos:
                    pontos

            });

        }
    );


    produtosPesquisa.sort(
        (a, b) => {

            return (
                b.pontos
                -
                a.pontos
            );

        }
    );


    produtosPesquisa.forEach(
        produto => {

            tabela.appendChild(
                produto.linha
            );

        }
    );

}



/* =========================================================
   ORDENAR PRODUTOS
========================================================= */


function ordenarProdutos() {

    let filtro =
        document
            .getElementById(
                "filtroOrdenacao"
            )
            .value;


    let tabela =
        document
            .getElementById(
                "lista-produtos"
            );


    let produtosOrdenados =
        [...produtos];


    if (
        filtro === "maior"
    ) {

        produtosOrdenados.sort(
            (a, b) => {

                return (
                    Number(
                        b.codigo
                    )
                    -
                    Number(
                        a.codigo
                    )
                );

            }
        );

    }


    if (
        filtro === "menor"
    ) {

        produtosOrdenados.sort(
            (a, b) => {

                return (
                    Number(
                        a.codigo
                    )
                    -
                    Number(
                        b.codigo
                    )
                );

            }
        );

    }


    if (
        filtro === "recente"
    ) {

        produtosOrdenados.sort(
            (a, b) => {

                return (

                    Number(
                        b.ultimaModificacao || b.dataCadastro || 0
                    )

                    -

                    Number(
                        a.ultimaModificacao || a.dataCadastro || 0
                    )

                );

            }
        );

    }


    if (
        filtro === "antigo"
    ) {

        produtosOrdenados.sort(
            (a, b) => {

                return (

                    Number(
                        a.dataCadastro || 0
                    )

                    -

                    Number(
                        b.dataCadastro || 0
                    )

                );

            }
        );

    }


    tabela.innerHTML =
        "";


    produtosOrdenados.forEach(
        produto => {


            let novaLinha =
                tabela.insertRow();


            novaLinha.dataset.id =
                produto.id;


            novaLinha.dataset.detalhes =

                produto.detalhes

                ||

                produto.informacao

                ||

                "";


            novaLinha.innerHTML = `

                <td>
                    ${produto.codigo || ""}
                </td>

                <td>
                    ${produto.nome}
                </td>

                <td>
                    ${produto.tipo || ""}
                </td>

                <td>
                    ${produto.quantidade}
                </td>

                <td>
                    ${produto.medida || ""}
                </td>

                <td>
                    ${produto.localizacao || ""}
                </td>

                <td>

                    <button
                        class="editar"
                        onclick="editarProduto(this)"
                    >
                        ✏️
                    </button>

                    <button
                        class="movimentar"
                        onclick="abrirMovimentacao(this)"
                    >
                        ↕
                    </button>

                    <button
                        class="excluir"
                        onclick="excluirProduto(this)"
                    >
                        🗑️
                    </button>

                    <button
                        class="btn-seta"
                        onclick="abrirDetalhes(this)"
                    >
                        ↓
                    </button>

                </td>

            `;

        }
    );

}



/* =========================================================
   ENTRADA DE PRODUTO
========================================================= */


async function entradaProduto(botao) {

    let linha =
        botao.parentNode.parentNode;


    let id =
        linha.dataset.id;


    let nome =
        linha.cells[1]
            .innerText;


    let quantidadeAtual =
        Number(
            linha.cells[3]
                .innerText
        );


    let quantidadeEntrada =
        Number(
            prompt(
                "Quantidade recebida:"
            )
        );


    if (
        !quantidadeEntrada
        ||
        quantidadeEntrada <= 0
    ) {

        alert(
            "Informe uma quantidade válida"
        );

        return;

    }


    let novaQuantidade =

        quantidadeAtual

        +

        quantidadeEntrada;


    await updateDoc(
        doc(
            db,
            "produtos",
            id
        ),
        {

            quantidade:
                novaQuantidade,

            ultimaModificacao:
                Date.now()

        }
    );


    linha.cells[3]
        .innerText =
        novaQuantidade;


    let produto =
        produtos.find(
            p =>
                p.id === id
        );


    if (produto) {

        produto.quantidade =
            novaQuantidade;

        produto.ultimaModificacao =
            Date.now();

    }


    await registrarMovimentacao({

        codigo:
            linha.cells[0]
                .innerText,

        produto:
            nome,

        tipo:
            linha.cells[2]
                .innerText,

        antes:
            quantidadeAtual,

        depois:
            novaQuantidade,

        quantidade:
            quantidadeEntrada,

        medida:
            linha.cells[4]
                .innerText,

        responsavel:
            usuarioNome,

        movimento:
            "adicionado",

        dataHora:
            new Date()
                .toLocaleString(
                    "pt-BR"
                ),

        timestamp:
            Date.now()

    });


    alert(
        "Entrada registrada com sucesso!"
    );

}



/* =========================================================
   SAIR
========================================================= */


console.log(
    "Função pesquisa carregada"
);


const btnSair =
    document.getElementById(
        "btn-sair"
    );


if (btnSair) {

    btnSair.addEventListener(
        "click",
        function () {


            localStorage.removeItem(
                "logado"
            );


            localStorage.removeItem(
                "usuarioNome"
            );


            localStorage.removeItem(
                "usuarioId"
            );


            window.location.href =
                "index.html";

        }
    );

}



/* =========================================================
   INICIAR SISTEMA
========================================================= */


carregarProdutos();



/* =========================================================
   DISPONIBILIZAR FUNÇÕES PARA O HTML
========================================================= */


window.abrirFormulario =
    abrirFormulario;


window.salvarProduto =
    salvarProduto;


window.abrirRetirada =
    abrirRetirada;


window.pesquisarProduto =
    pesquisarProduto;


window.selecionarProduto =
    selecionarProduto;


window.retirarProduto =
    retirarProduto;


window.editarProduto =
    editarProduto;


window.excluirProduto =
    excluirProduto;


window.abrirDetalhes =
    abrirDetalhes;


window.salvarDetalhes =
    salvarDetalhes;


window.pesquisarTabela =
    pesquisarTabela;


window.ordenarProdutos =
    ordenarProdutos;


window.entradaProduto =
    entradaProduto;


window.abrirMovimentacao =
    abrirMovimentacao;


window.confirmarMovimentacao =
    confirmarMovimentacao;


window.confirmarMedida =
    confirmarMedida;