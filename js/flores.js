document.addEventListener("DOMContentLoaded", function () {
    if (!document.body.classList.contains("flores-page")) return;

    const campoBusca = document.getElementById("campo-busca");
    const filtroCategoria = document.getElementById("filtro-categoria");
    const filtroOcasiao = document.getElementById("filtro-ocasiao");
    const seletorOrdem = document.getElementById("ordem");
    const contadorItens = document.getElementById("contador-itens");
    const mensagemSemResultados = document.querySelector(".mensagem-sem-resultados");
    const formularioFiltros = document.querySelector(".filtros-form");
    const grade = document.querySelector(".grade-produtos");
    let produtos = Array.prototype.slice.call(document.querySelectorAll(".grade-produtos .produto"));

    if (!grade || !produtos.length) return;

    const overlay = document.querySelector(".flores-page .modal-overlay");
    const modalDialog = document.querySelector(".flores-page .modal-dialog");
    const modalImg = document.querySelector(".flores-page .modal-image");
    const modalTitle = document.querySelector(".flores-page .modal-title");
    const modalDesc = document.querySelector(".flores-page .modal-desc");
    const modalPrice = document.querySelector(".flores-page .modal-price");
    const modalWhatsapp = document.querySelector(".flores-page .modal-whatsapp");
    const modalClose = document.querySelector(".flores-page .modal-close");
    const btnAnterior = document.querySelector(".flores-page .modal-anterior");
    const btnProximo = document.querySelector(".flores-page .modal-proximo");
    const thumbsLista = document.querySelector(".flores-page .modal-thumbs");

    let imagensAtuais = [];
    let indiceAtual = 0;
    let ultimoFocado = null;

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("produto-visivel");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        produtos.forEach(function (item, index) {
            item.style.transitionDelay = (0.03 * index) + "s";
            observer.observe(item);
        });
    } else {
        produtos.forEach(function (item) {
            item.classList.add("produto-visivel");
        });
    }

    function normalizarTexto(str) {
        return (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function aplicarOrdenacao(lista) {
        const criterio = seletorOrdem ? seletorOrdem.value : "relevancia";

        if (criterio === "preco-asc" || criterio === "preco-desc") {
            lista.sort(function (a, b) {
                const pa = parseFloat(a.getAttribute("data-preco")) || 0;
                const pb = parseFloat(b.getAttribute("data-preco")) || 0;
                return criterio === "preco-asc" ? pa - pb : pb - pa;
            });
        } else if (criterio === "nome-asc") {
            lista.sort(function (a, b) {
                const na = (a.querySelector("h3") ? a.querySelector("h3").textContent : "").toLowerCase();
                const nb = (b.querySelector("h3") ? b.querySelector("h3").textContent : "").toLowerCase();
                if (na < nb) return -1;
                if (na > nb) return 1;
                return 0;
            });
        }

        return lista;
    }

    function atualizarContador(qtd) {
        if (!contadorItens) return;
        contadorItens.textContent = qtd.toString();
    }

    function filtrarProdutos() {
        const termo = normalizarTexto(campoBusca ? campoBusca.value : "");
        const categoria = filtroCategoria ? filtroCategoria.value : "";
               const ocasiao = filtroOcasiao ? filtroOcasiao.value : "";

        let visiveis = 0;

        produtos.forEach(function (produto) {
            const catItem = produto.getAttribute("data-categoria") || "";
            const ocasiaoItem = produto.getAttribute("data-ocasiao") || "";
            const tagsItem = produto.getAttribute("data-tags") || "";

            const nome = produto.querySelector("h3")
                ? produto.querySelector("h3").textContent
                : "";

            const textoBusca = normalizarTexto(nome + " " + tagsItem);

            let passaBusca = true;
            let passaCategoria = true;
            let passaOcasiao = true;

            if (termo) {
                passaBusca = textoBusca.indexOf(termo) !== -1;
            }

            if (categoria) {
                passaCategoria = catItem === categoria;
            }

            if (ocasiao) {
                passaOcasiao = ocasiaoItem === ocasiao;
            }

            const mostrar = passaBusca && passaCategoria && passaOcasiao;

            if (mostrar) {
                produto.classList.remove("produto-oculto");
                visiveis++;
            } else {
                produto.classList.add("produto-oculto");
            }
        });

        atualizarContador(visiveis);

        if (mensagemSemResultados) {
            mensagemSemResultados.hidden = visiveis !== 0;
        }
    }

    function reordenarDOM() {
        const produtosOrdenados = produtos.slice();
        aplicarOrdenacao(produtosOrdenados);
        produtosOrdenados.forEach(function (produto) {
            grade.appendChild(produto);
        });
    }

    function atualizarImagemModal() {
        if (!imagensAtuais.length) return;
        if (indiceAtual < 0) indiceAtual = imagensAtuais.length - 1;
        if (indiceAtual >= imagensAtuais.length) indiceAtual = 0;
        const src = imagensAtuais[indiceAtual];
        modalImg.src = src;
        const titulo = modalTitle ? modalTitle.textContent : "";
        const idxHumano = indiceAtual + 1;
        modalImg.alt = titulo ? titulo + " - imagem " + idxHumano + " de " + imagensAtuais.length : "";
        if (!thumbsLista) return;
        const botoes = thumbsLista.querySelectorAll(".modal-thumb-btn");
        botoes.forEach(function (btn, index) {
            if (index === indiceAtual) {
                btn.classList.add("is-active");
            } else {
                btn.classList.remove("is-active");
            }
        });
    }

    function montarThumbs() {
        if (!thumbsLista) return;
        while (thumbsLista.firstChild) {
            thumbsLista.removeChild(thumbsLista.firstChild);
        }
        imagensAtuais.forEach(function (src, index) {
            const li = document.createElement("li");
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "modal-thumb-btn";
            botao.setAttribute("data-index", index.toString());
            const img = document.createElement("img");
            img.src = src;
            img.alt = "";
            botao.appendChild(img);
            botao.addEventListener("click", function () {
                indiceAtual = index;
                atualizarImagemModal();
            });
            li.appendChild(botao);
            thumbsLista.appendChild(li);
        });
    }

    function abrirModal(produto) {
        if (!overlay || !modalImg || !modalTitle || !modalDesc || !modalPrice || !modalWhatsapp) return;

        const figura = produto.querySelector("figure img");
        const tituloEl = produto.querySelector("h3");
        const resumoEl = produto.querySelector(".produto-resumo");
        const precoEl = produto.querySelector(".produto-preco");
        const botao = produto.querySelector(".btn");
        const galeriaAttr = produto.getAttribute("data-gallery") || "";
        const listaGaleria = galeriaAttr
            .split(",")
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s.length > 0; });

        imagensAtuais = listaGaleria.length ? listaGaleria : [];

        if (!imagensAtuais.length && figura && figura.getAttribute("src")) {
            imagensAtuais.push(figura.getAttribute("src"));
        }

        indiceAtual = 0;

        modalTitle.textContent = tituloEl ? tituloEl.textContent.trim() : "";
        modalDesc.textContent = resumoEl ? resumoEl.textContent.trim() : "";
        modalPrice.textContent = precoEl ? precoEl.textContent.trim() : "";
        modalWhatsapp.href = botao ? botao.getAttribute("href") : "#";

        montarThumbs();
        atualizarImagemModal();

        ultimoFocado = document.activeElement;
        overlay.classList.add("is-open");
        document.body.classList.add("modal-open");
        if (modalClose) modalClose.focus();
    }

    function fecharModal() {
        if (!overlay) return;
        overlay.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        if (ultimoFocado && typeof ultimoFocado.focus === "function") {
            ultimoFocado.focus();
        }
    }

    produtos.forEach(function (produto) {
        produto.addEventListener("click", function (event) {
            const alvo = event.target;
            if (alvo && alvo.tagName.toLowerCase() === "a" && alvo.classList.contains("btn")) {
                return;
            }
            abrirModal(produto);
        });
    });

    if (modalClose) {
        modalClose.addEventListener("click", function () {
            fecharModal();
        });
    }

    if (overlay) {
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                fecharModal();
            }
        });
    }

    if (btnAnterior) {
        btnAnterior.addEventListener("click", function (event) {
            event.stopPropagation();
            if (!imagensAtuais.length) return;
            indiceAtual--;
            atualizarImagemModal();
        });
    }

    if (btnProximo) {
        btnProximo.addEventListener("click", function (event) {
            event.stopPropagation();
            if (!imagensAtuais.length) return;
            indiceAtual++;
            atualizarImagemModal();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (!overlay || !overlay.classList.contains("is-open")) return;
        if (event.key === "Escape") {
            fecharModal();
        } else if (event.key === "ArrowRight") {
            if (!imagensAtuais.length) return;
            indiceAtual++;
            atualizarImagemModal();
        } else if (event.key === "ArrowLeft") {
            if (!imagensAtuais.length) return;
            indiceAtual--;
            atualizarImagemModal();
        }
    });

    if (campoBusca) {
        campoBusca.addEventListener("input", function () {
            filtrarProdutos();
        });
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener("change", filtrarProdutos);
    }

    if (filtroOcasiao) {
        filtroOcasiao.addEventListener("change", filtrarProdutos);
    }

    if (seletorOrdem) {
        seletorOrdem.addEventListener("change", function () {
            reordenarDOM();
            filtrarProdutos();
        });
    }

    if (formularioFiltros) {
        formularioFiltros.addEventListener("reset", function () {
            setTimeout(function () {
                reordenarDOM();
                filtrarProdutos();
            }, 0);
        });
    }

    reordenarDOM();
    filtrarProdutos();
});
