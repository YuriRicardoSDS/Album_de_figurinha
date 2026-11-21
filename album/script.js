// Dados iniciais caso o usuário abra o site pela primeira ve
let quadrinhos = JSON.parse(localStorage.getItem("album_quadrinhos_v1")) || quadrinhosIniciais;
let filtroAtual = "TODOS";
let termoBusca = "";
let imagemBase64Temporaria = "";

// Elementos do DOM
const grade = document.getElementById("gradeQuadrinhos");
const estadoVazio = document.getElementById("estadoVazio");
const contador = document.getElementById("contadorQuadrinhos");
const formQuadrinho = document.getElementById("formQuadrinho");
const arquivoImagemInput = document.getElementById("arquivoImagemInput");
const urlImagemInput = document.getElementById("urlImagemInput");
const previewContainer = document.getElementById("previewContainer");
const previewImagem = document.getElementById("previewImagem");

// Salvar no navegador
function salvarNoLocalStorage() {
	localStorage.setItem("album_quadrinhos_v1", JSON.stringify(quadrinhos));
}

// Renderizar todos os cards na tela
function renderizarAlbum() {
	grade.innerHTML = "";

	const filtrados = quadrinhos.filter(hq => {
		const bateEditora = filtroAtual === "TODOS" || hq.editora === filtroAtual;
		const texto = (hq.titulo + " " + hq.descricao).toLowerCase();
		const bateBusca = texto.includes(termoBusca.toLowerCase());
		return bateEditora && bateBusca;
	});

	contador.textContent = quadrinhos.length;

	if (filtrados.length === 0) {
		estadoVazio.classList.remove("d-none");
		return;
	}
	estadoVazio.classList.add("d-none");

	filtrados.forEach((hq, index) => {
		const numeroFormatado = "#" + String(index + 1).padStart(3, "0");
		const classeBadge = hq.editora === "MARVEL" ? "badge-marvel" : (hq.editora === "DC" ? "badge-dc" : "badge-outra");

		const col = document.createElement("div");
		col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

		col.innerHTML = `
			<div class="img-container" onclick="alternarDescricao(this)">
				<span class="badge-editora ${classeBadge}">${hq.editora}</span>
				<span class="numero">${numeroFormatado}</span>
				
				<img src="${hq.imagem}" alt="${hq.titulo}" class="imgfig" onerror="this.src='https://placehold.co/400x600/161152/ffcc00?text=Sem+Capa'">
				
				<div class="card-titulo-barra text-truncate">
					${hq.titulo}
				</div>

				<div class="overlay-text">
					<div>
						<h6 class="fw-bold text-warning mb-2">${hq.titulo}</h6>
						<p class="overlay-descricao mb-0">${hq.descricao}</p>
					</div>
					
					<div class="d-flex gap-2 pt-2 border-top border-secondary border-opacity-50" onclick="event.stopPropagation()">
						<button class="btn btn-sm btn-outline-light flex-grow-1" onclick="editarQuadrinho(${hq.id})">
							<i class="bi bi-pencil"></i> Editar
						</button>
						<button class="btn btn-sm btn-outline-danger" onclick="excluirQuadrinho(${hq.id})" title="Remover">
							<i class="bi bi-trash"></i>
						</button>
					</div>
				</div>
			</div>
		`;

		grade.appendChild(col);
	});
}

// Abre ou fecha a descrição ao clicar no card
function alternarDescricao(card) {
	card.classList.toggle("ativo");
}

// Converter arquivo de imagem enviado pelo usuário para Base64
arquivoImagemInput.addEventListener("change", function (e) {
	const arquivo = e.target.files[0];
	if (!arquivo) return;

	const leitor = new FileReader();
	leitor.onload = function (evento) {
		imagemBase64Temporaria = evento.target.result;
		urlImagemInput.value = "";
		mostrarPreview(imagemBase64Temporaria);
	};
	leitor.readAsDataURL(arquivo);
});

urlImagemInput.addEventListener("input", function () {
	imagemBase64Temporaria = "";
	if (urlImagemInput.value.trim() !== "") {
		mostrarPreview(urlImagemInput.value.trim());
	} else {
		previewContainer.classList.add("d-none");
	}
});

function mostrarPreview(src) {
	previewImagem.src = src;
	previewContainer.classList.remove("d-none");
}

// Preparar modal para adicionar novo quadrinho
function prepararNovoQuadrinho() {
	document.getElementById("modalTitulo").textContent = "Adicionar Novo Quadrinho";
	document.getElementById("quadrinhoId").value = "";
	formQuadrinho.reset();
	imagemBase64Temporaria = "";
	previewContainer.classList.add("d-none");
}

// Preencher modal para editar um quadrinho existente
function editarQuadrinho(id) {
	const hq = quadrinhos.find(item => item.id === id);
	if (!hq) return;

	document.getElementById("modalTitulo").textContent = "Editar Quadrinho";
	document.getElementById("quadrinhoId").value = hq.id;
	document.getElementById("tituloInput").value = hq.titulo;
	document.getElementById("editoraInput").value = hq.editora;
	document.getElementById("descricaoInput").value = hq.descricao;
	arquivoImagemInput.value = "";

	if (hq.imagem.startsWith("data:image")) {
		imagemBase64Temporaria = hq.imagem;
		urlImagemInput.value = "";
	} else {
		imagemBase64Temporaria = "";
		urlImagemInput.value = hq.imagem;
	}

	mostrarPreview(hq.imagem);

	const modal = new bootstrap.Modal(document.getElementById("modalQuadrinho"));
	modal.show();
}

// Salvar formulário (Novo ou Edição)
formQuadrinho.addEventListener("submit", function (e) {
	e.preventDefault();

	const id = document.getElementById("quadrinhoId").value;
	const titulo = document.getElementById("tituloInput").value.trim();
	const editora = document.getElementById("editoraInput").value;
	const descricao = document.getElementById("descricaoInput").value.trim();
	const imagemFinal = imagemBase64Temporaria || urlImagemInput.value.trim() || "https://placehold.co/400x600/161152/ffcc00?text=Capa+HQ";

	if (id) {
		// Editando existente
		const index = quadrinhos.findIndex(item => item.id === Number(id));
		if (index !== -1) {
			quadrinhos[index] = { id: Number(id), titulo, editora, imagem: imagemFinal, descricao };
		}
	} else {
		// Criando novo
		const novoQuadrinho = {
			id: Date.now(),
			titulo,
			editora,
			imagem: imagemFinal,
			descricao
		};
		quadrinhos.push(novoQuadrinho);
	}

	salvarNoLocalStorage();
	renderizarAlbum();

	const modalEl = document.getElementById("modalQuadrinho");
	bootstrap.Modal.getInstance(modalEl).hide();
});

// Excluir quadrinho
function excluirQuadrinho(id) {
	if (confirm("Tem certeza que deseja remover este quadrinho do álbum?")) {
		quadrinhos = quadrinhos.filter(item => item.id !== id);
		salvarNoLocalStorage();
		renderizarAlbum();
	}
}

// Eventos de Busca e Filtro
document.getElementById("campoBusca").addEventListener("input", function (e) {
	termoBusca = e.target.value;
	renderizarAlbum();
});

document.querySelectorAll("[data-filtro]").forEach(botao => {
	botao.addEventListener("click", function () {
		document.querySelectorAll("[data-filtro]").forEach(b => b.classList.remove("active"));
		this.classList.add("active");
		filtroAtual = this.getAttribute("data-filtro");
		renderizarAlbum();
	});
});

// Inicializa a página
renderizarAlbum();