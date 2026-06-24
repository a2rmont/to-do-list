// Pegando os elementos do HTML que vamos manipular
const formTarefa = document.getElementById("formTarefa");
const inputTarefa = document.getElementById("inputTarefa");
const listaTarefas = document.getElementById("listaTarefas");
const estadoVazio = document.getElementById("estadoVazio");
const resumo = document.getElementById("resumo");
const botoesFiltro = document.querySelectorAll(".filtro");
 
// Nosso "banco de dados" de tarefas: um array de objetos.
// Cada tarefa é um objeto com id, texto e se está concluída.
// Tentamos carregar do localStorage; se não existir nada salvo, começamos com array vazio.
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let filtroAtual = "todas";
 
// Função que salva o array de tarefas no localStorage.
// O localStorage só guarda texto, então usamos JSON.stringify para
// transformar o array/objeto em uma string antes de salvar.
function salvarTarefas() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}
 
// Função que decide quais tarefas mostrar, de acordo com o filtro ativo
function tarefasFiltradas() {
    if (filtroAtual === "pendentes") {
        return tarefas.filter(function (tarefa) {
            return !tarefa.concluida;
        });
    }
 
    if (filtroAtual === "concluidas") {
        return tarefas.filter(function (tarefa) {
            return tarefa.concluida;
        });
    }
 
    return tarefas;
}
 
// Função principal: redesenha a lista de tarefas na tela
// Sempre que algo muda (adiciona, remove, marca como feita), chamamos essa função
function renderizarTarefas() {
    listaTarefas.innerHTML = "";
 
    const visiveis = tarefasFiltradas();
 
    visiveis.forEach(function (tarefa) {
        const item = document.createElement("li");
        item.className = "tarefa" + (tarefa.concluida ? " concluida" : "");
        item.dataset.id = tarefa.id;
 
        item.innerHTML = `
            <span class="checkbox"></span>
            <span class="texto">${tarefa.texto}</span>
            <button class="remover" title="Remover tarefa">✕</button>
        `;
 
        listaTarefas.appendChild(item);
    });
 
    // Mostra a mensagem de "vazio" só se não tiver nenhuma tarefa visível
    estadoVazio.classList.toggle("oculto", visiveis.length > 0);
 
    atualizarResumo();
}
 
// Atualiza o texto de resumo no final do card (ex: "3 de 5 tarefas concluídas")
function atualizarResumo() {
    const total = tarefas.length;
    const concluidas = tarefas.filter(function (tarefa) {
        return tarefa.concluida;
    }).length;
 
    if (total === 0) {
        resumo.innerText = "0 tarefas no total";
    } else {
        resumo.innerText = concluidas + " de " + total + " tarefas concluídas";
    }
}
 
// Adiciona uma nova tarefa ao array
function adicionarTarefa(texto) {
    const novaTarefa = {
        id: Date.now(), // Date.now() gera um número único baseado no horário atual — ótimo como ID simples
        texto: texto,
        concluida: false,
    };
 
    tarefas.push(novaTarefa);
    salvarTarefas();
    renderizarTarefas();
}
 
// Alterna o estado "concluída" de uma tarefa, pelo id
function alternarConclusao(id) {
    tarefas = tarefas.map(function (tarefa) {
        if (tarefa.id === id) {
            return { ...tarefa, concluida: !tarefa.concluida };
        }
        return tarefa;
    });
 
    salvarTarefas();
    renderizarTarefas();
}
 
// Remove uma tarefa do array, pelo id
function removerTarefa(id) {
    tarefas = tarefas.filter(function (tarefa) {
        return tarefa.id !== id;
    });
 
    salvarTarefas();
    renderizarTarefas();
}
 
// Evento: quando o formulário é enviado (clique no botão OU Enter no input)
formTarefa.addEventListener("submit", function (evento) {
    evento.preventDefault(); // impede o comportamento padrão do form de recarregar a página
 
    const texto = inputTarefa.value.trim(); // .trim() remove espaços em branco do início/fim
 
    if (texto === "") {
        return; // não adiciona tarefa vazia
    }
 
    adicionarTarefa(texto);
    inputTarefa.value = ""; // limpa o input depois de adicionar
    inputTarefa.focus(); // já deixa o cursor pronto pra digitar a próxima tarefa
});
 
// Evento: clique dentro da lista de tarefas
// Usamos "delegação de eventos" — em vez de adicionar um listener em cada tarefa
// individualmente, adicionamos um listener só na lista (#listaTarefas), e verificamos
// onde exatamente o clique aconteceu. Isso funciona até para tarefas adicionadas depois.
listaTarefas.addEventListener("click", function (evento) {
    const item = evento.target.closest(".tarefa");
    if (!item) return;
 
    const id = Number(item.dataset.id);
 
    if (evento.target.classList.contains("remover")) {
        removerTarefa(id);
    } else if (
        evento.target.classList.contains("checkbox") ||
        evento.target.classList.contains("texto")
    ) {
        alternarConclusao(id);
    }
});
 
// Evento: clique nos botões de filtro
botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () {
        filtroAtual = botao.dataset.filtro;
 
        botoesFiltro.forEach(function (b) {
            b.classList.remove("ativo");
        });
        botao.classList.add("ativo");
 
        renderizarTarefas();
    });
});
 