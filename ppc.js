import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
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


/* =========================================================
   CONTROLE DE LOGIN
========================================================= */

if (localStorage.getItem("logado") !== "true") {

    window.location.href = "index.html";

}


/* =========================================================
   LISTA DE PRODUTOS
========================================================= */

let listaProdutos = [];


/* =========================================================
   CARREGAR PRODUTOS PARA REPOSIÇÃO
========================================================= */

async function carregarProdutosReposicao() {

    listaProdutos = [];


    const tabela =
        document.getElementById(
            "tabelaProdutos"
        );


    tabela.innerHTML = "";


    const consulta =
        await getDocs(
            collection(
                db,
                "produtos"
            )
        );


    consulta.forEach(
        (documento) => {


            const produto =
                documento.data();


            const quantidade =
                Number(
                    produto.quantidade
                );


            const minimo =
                Number(
                    produto.estoqueMinimo
                );


            let situacao;

            let status;


            /* =============================================
               ABAIXO DO MÍNIMO
            ============================================= */

            if (
                quantidade < minimo
            ) {

                situacao =
                    "abaixo";


                status = `

                    <span class="vermelho">

                        🔴 Abaixo do mínimo

                    </span>

                `;

            }


            /* =============================================
               ALERTA
            ============================================= */

            else if (
                quantidade <=
                minimo * 1.2
            ) {

                situacao =
                    "alerta";


                status = `

                    <span class="amarelo">

                        🟡 Alerta

                    </span>

                `;

            }


            /* =============================================
               NORMAL
            ============================================= */

            else {

                situacao =
                    "normal";


                status = `

                    <span class="verde">

                        🟢 Normal

                    </span>

                `;

            }


            listaProdutos.push({

                codigo:
                    produto.codigo,

                nome:
                    produto.nome,

                quantidade:
                    quantidade,

                estoqueMinimo:
                    minimo,

                situacao:
                    situacao,

                status:
                    status

            });

        }
    );


    mostrarProdutos();

}


/* =========================================================
   MOSTRAR PRODUTOS
========================================================= */

function mostrarProdutos() {


    const tabela =
        document.getElementById(
            "tabelaProdutos"
        );


    tabela.innerHTML = "";


    const filtro =
        document.getElementById(
            "filtroSituacao"
        ).value;


    const pesquisa =
        document
            .getElementById(
                "pesquisarProduto"
            )
            .value
            .toLowerCase();


    listaProdutos.forEach(
        (produto) => {


            /* =============================================
               FILTRO DE SITUAÇÃO
            ============================================= */

            if (
                filtro !== "todos"
                &&
                filtro !==
                produto.situacao
            ) {

                return;

            }


            /* =============================================
               PESQUISA
            ============================================= */

            const correspondePesquisa =

                String(
                    produto.nome || ""
                )
                .toLowerCase()
                .includes(
                    pesquisa
                )

                ||

                String(
                    produto.codigo || ""
                )
                .toLowerCase()
                .includes(
                    pesquisa
                );


            if (
                !correspondePesquisa
            ) {

                return;

            }


            /* =============================================
               ADICIONAR NA TABELA
            ============================================= */

            tabela.innerHTML += `

                <tr>

                    <td>
                        ${produto.codigo || ""}
                    </td>

                    <td>
                        ${produto.nome || ""}
                    </td>

                    <td>
                        ${produto.quantidade}
                    </td>

                    <td>
                        ${produto.estoqueMinimo}
                    </td>

                    <td>
                        ${produto.status}
                    </td>

                </tr>

            `;

        }
    );

}


/* =========================================================
   EVENTOS DOS FILTROS
========================================================= */

const filtroSituacao =
    document.getElementById(
        "filtroSituacao"
    );


if (filtroSituacao) {

    filtroSituacao.addEventListener(
        "change",
        mostrarProdutos
    );

}


const pesquisarProduto =
    document.getElementById(
        "pesquisarProduto"
    );


if (pesquisarProduto) {

    pesquisarProduto.addEventListener(
        "input",
        mostrarProdutos
    );

}


/* =========================================================
   INICIAR
========================================================= */

carregarProdutosReposicao();