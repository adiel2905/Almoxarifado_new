import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc
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

if (localStorage.getItem("logado") !== "true") {
    window.location.href = "index.html";
}

const lista = document.getElementById("listaUsuarios");
const campoNome = document.getElementById("nomeUsuario");
const btnAdicionar = document.getElementById("btn-adicionar-usuario");
const btnSair = document.getElementById("btn-sair");
const usuarioAtualId = localStorage.getItem("usuarioId");

let usuarios = [];

async function carregarUsuarios() {
    try {
        const consulta = await getDocs(collection(db, "usuarios"));
        usuarios = [];

        consulta.forEach((documento) => {
            usuarios.push({ id: documento.id, ...documento.data() });
        });

        usuarios.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
        renderizarUsuarios();
    } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);
        lista.innerHTML = '<p class="vazio">Erro ao carregar as pessoas.</p>';
    }
}

function renderizarUsuarios() {
    lista.innerHTML = "";

    if (usuarios.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhuma pessoa cadastrada.</p>';
        return;
    }

    usuarios.forEach((usuario) => {
        const item = document.createElement("div");
        item.className = "usuario-item";

        const inicial = (usuario.nome || "?").trim().charAt(0).toUpperCase();
        const ehAtual = usuario.id === usuarioAtualId;

        item.innerHTML = `
            <div class="usuario-info">
                <div class="avatar">${inicial}</div>
                <div>
                    <span class="usuario-nome"></span>
                    ${ehAtual ? '<span class="usuario-atual">Você</span>' : ''}
                </div>
            </div>
            <button class="btn-excluir" ${ehAtual ? 'disabled title="Você não pode excluir o usuário que está conectado"' : ''}>
                Excluir
            </button>
        `;

        item.querySelector(".usuario-nome").textContent = usuario.nome;

        const btnExcluir = item.querySelector(".btn-excluir");

        if (!ehAtual) {
            btnExcluir.addEventListener("click", () => excluirUsuario(usuario));
        }

        lista.appendChild(item);
    });
}

async function adicionarUsuario() {
    const nome = campoNome.value.trim();

    if (!nome) {
        alert("Digite o nome da pessoa.");
        campoNome.focus();
        return;
    }

    const jaExiste = usuarios.some((usuario) =>
        (usuario.nome || "").trim().toLowerCase() === nome.toLowerCase()
    );

    if (jaExiste) {
        alert("Essa pessoa já está cadastrada.");
        return;
    }

    try {
        await addDoc(collection(db, "usuarios"), {
            nome,
            criadoEm: Date.now()
        });

        campoNome.value = "";

        await carregarUsuarios();

        alert("Pessoa adicionada com sucesso!");
    } catch (erro) {
        console.error("Erro ao adicionar usuário:", erro);
        alert("Erro ao adicionar pessoa.");
    }
}

async function excluirUsuario(usuario) {
    if (usuarios.length <= 1) {
        alert("O sistema precisa ter pelo menos uma pessoa cadastrada.");
        return;
    }

    const confirmar = confirm(`Excluir ${usuario.nome} da lista de acesso?`);

    if (!confirmar) {
        return;
    }

    try {
        await deleteDoc(doc(db, "usuarios", usuario.id));

        await carregarUsuarios();

        alert("Pessoa removida com sucesso!");
    } catch (erro) {
        console.error("Erro ao excluir usuário:", erro);
        alert("Erro ao remover pessoa.");
    }
}

btnAdicionar.addEventListener("click", adicionarUsuario);

campoNome.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        adicionarUsuario();
    }
});

btnSair.addEventListener("click", () => {
    localStorage.removeItem("logado");
    localStorage.removeItem("usuarioNome");
    localStorage.removeItem("usuarioId");

    window.location.href = "index.html";
});

carregarUsuarios();