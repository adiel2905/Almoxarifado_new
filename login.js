import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc
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


const campoSenha = document.getElementById("senha");

const botao = document.getElementById("botao-login");

const listaUsuarios = document.getElementById("lista-usuarios");


/*
    A senha continua sendo única para todo mundo.
*/
const senhaCorreta = "terral2026";


let usuarioSelecionado = null;

let usuarios = [];


/*
    CARREGAR PESSOAS CADASTRADAS
*/

async function carregarUsuarios() {

    try {

        const consulta = await getDocs(
            collection(db, "usuarios")
        );


        usuarios = [];


        consulta.forEach((documento) => {

            usuarios.push({

                id: documento.id,

                ...documento.data()

            });

        });


        /*
            Se ainda não existir nenhuma pessoa cadastrada,
            cria automaticamente o Administrador.

            Isso evita que você fique sem conseguir entrar
            no sistema na primeira vez.
        */

        if (usuarios.length === 0) {

            const novoUsuario = await addDoc(
                collection(db, "usuarios"),
                {

                    nome: "Administrador",

                    criadoEm: Date.now()

                }
            );


            usuarios.push({

                id: novoUsuario.id,

                nome: "Administrador"

            });

        }


        usuarios.sort((a, b) => {

            return (a.nome || "").localeCompare(
                b.nome || "",
                "pt-BR"
            );

        });


        mostrarUsuarios();


    } catch (erro) {

        console.error(
            "Erro ao carregar usuários:",
            erro
        );


        listaUsuarios.innerHTML = `
            <p>
                Não foi possível carregar as pessoas.
            </p>
        `;

    }

}


/*
    MOSTRAR AS PESSOAS NA TELA
*/

function mostrarUsuarios() {

    listaUsuarios.innerHTML = "";


    usuarios.forEach((usuario) => {


        const botaoUsuario =
            document.createElement("button");


        botaoUsuario.type = "button";

        botaoUsuario.className = "usuario-login";


        botaoUsuario.textContent =
            usuario.nome;


        botaoUsuario.addEventListener(
            "click",
            function () {


                /*
                    Remove a seleção dos outros
                */

                document
                    .querySelectorAll(".usuario-login")
                    .forEach((botao) => {

                        botao.classList.remove(
                            "selecionado"
                        );

                    });


                /*
                    Marca o usuário escolhido
                */

                botaoUsuario.classList.add(
                    "selecionado"
                );


                usuarioSelecionado = usuario;


            }
        );


        listaUsuarios.appendChild(
            botaoUsuario
        );

    });

}


/*
    FAZER LOGIN
*/

function fazerLogin() {


    if (!usuarioSelecionado) {

        alert(
            "Escolha quem está entrando no sistema."
        );

        return;

    }


    const senhaDigitada =
        campoSenha.value.trim();


    if (senhaDigitada === senhaCorreta) {


        /*
            Informa que existe uma sessão aberta
        */

        localStorage.setItem(
            "logado",
            "true"
        );


        /*
            Guarda o nome da pessoa
        */

        localStorage.setItem(
            "usuarioNome",
            usuarioSelecionado.nome
        );


        /*
            Guarda também o ID dela no Firebase
        */

        localStorage.setItem(
            "usuarioId",
            usuarioSelecionado.id
        );


        /*
            Entra no Dashboard
        */

        window.location.href =
            "dashboard.html";


    } else {


        alert(
            "Senha incorreta"
        );


    }

}


/*
    BOTÃO ENTRAR
*/

botao.addEventListener(
    "click",
    fazerLogin
);


/*
    PERMITIR APERTAR ENTER
*/

campoSenha.addEventListener(
    "keydown",
    function (evento) {


        if (evento.key === "Enter") {

            fazerLogin();

        }


    }
);


/*
    CARREGA AS PESSOAS QUANDO
    A TELA DE LOGIN ABRIR
*/

carregarUsuarios();