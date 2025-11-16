document.addEventListener("DOMContentLoaded", function () {
    if (!document.body.classList.contains("catalogo-page")) return;

    const items = document.querySelectorAll(".catalogo-page .catalogo .item");
    const overlay = document.querySelector(".catalogo-page .modal-overlay");
    const imgEl = document.querySelector(".catalogo-page .modal-img");
    const titleEl = document.querySelector(".catalogo-page .modal-title");
    const priceEl = document.querySelector(".catalogo-page .modal-price");
    const descEl = document.querySelector(".catalogo-page .modal-description");
    const whatsappBtn = document.querySelector(".catalogo-page .modal-whatsapp");
    const closeBtn = document.querySelector(".catalogo-page .modal-close");

    if (!overlay || !imgEl || !titleEl || !priceEl || !descEl || !whatsappBtn || !closeBtn) {
        return;
    }

    let lastFocusedElement = null;

    function abrirModal(dados) {
        imgEl.src = dados.imgSrc || "";
        imgEl.alt = dados.imgAlt || dados.titulo || "";
        titleEl.textContent = dados.titulo || "";
        priceEl.textContent = dados.preco || "";
        descEl.textContent = dados.descricao || "";
        whatsappBtn.href = dados.whatsapp || "#";
        lastFocusedElement = document.activeElement;
        overlay.classList.add("is-open");
        document.body.classList.add("modal-open");
        closeBtn.focus();
    }

    function fecharModal() {
        overlay.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    }

    items.forEach(function (item) {
        item.addEventListener("click", function (event) {
            const target = event.target;
            if (target.tagName.toLowerCase() === "a" && target.classList.contains("btn")) {
                return;
            }

            const img = item.querySelector("img");
            const titulo = item.querySelector("h3");
            const preco = item.querySelector("p");
            const botao = item.querySelector(".btn");
            const descricao = item.getAttribute("data-descricao") || "";

            const dados = {
                imgSrc: img ? img.getAttribute("src") : "",
                imgAlt: img ? img.getAttribute("alt") : "",
                titulo: titulo ? titulo.textContent.trim() : "",
                preco: preco ? preco.textContent.trim() : "",
                descricao: descricao,
                whatsapp: botao ? botao.getAttribute("href") : "#"
            };

            abrirModal(dados);
        });
    });

    closeBtn.addEventListener("click", function () {
        fecharModal();
    });

    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
            fecharModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) {
            fecharModal();
        }
    });

    if ("IntersectionObserver" in window && items.length) {
        const observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2
            }
        );

        items.forEach(function (item) {
            observer.observe(item);
        });
    } else {
        items.forEach(function (item) {
            item.classList.add("is-visible");
        });
    }
});
