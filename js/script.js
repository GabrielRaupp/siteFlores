document.addEventListener("DOMContentLoaded", function () {
    const header = document.querySelector("header");

    function atualizarHeader() {
        if (!header) return;
        if (window.scrollY > 10) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    atualizarHeader();
    window.addEventListener("scroll", atualizarHeader);

    const carouselInner = document.querySelector(".carousel-inner");
    const dotsContainer = document.querySelector(".carousel-dots");
    const prevBtn = document.querySelector(".carousel-control.prev");
    const nextBtn = document.querySelector(".carousel-control.next");

    if (carouselInner && dotsContainer) {
        let index = 0;
        const imgs = Array.from(carouselInner.querySelectorAll("img"));
        let intervalId = null;

        const dots = imgs.map((_, i) => {
            const button = document.createElement("button");
            if (i === 0) button.classList.add("active");
            button.setAttribute("aria-label", "Ir para imagem " + (i + 1));
            button.addEventListener("click", function () {
                irParaSlide(i, true);
            });
            dotsContainer.appendChild(button);
            return button;
        });

        function atualizarSlides() {
            imgs.forEach((img, i) => {
                img.classList.toggle("active", i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
            });
        }

        function irParaSlide(novoIndex, pararAutoPlay) {
            if (novoIndex < 0) {
                index = imgs.length - 1;
            } else if (novoIndex >= imgs.length) {
                index = 0;
            } else {
                index = novoIndex;
            }
            atualizarSlides();
            if (pararAutoPlay) {
                reiniciarAutoPlay();
            }
        }

        function trocaImagem() {
            irParaSlide(index + 1, false);
        }

        function proximoSlide() {
            irParaSlide(index + 1, true);
        }

        function anteriorSlide() {
            irParaSlide(index - 1, true);
        }

        function iniciarAutoPlay() {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(trocaImagem, 2000);
        }

        function pararAutoPlay() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        function reiniciarAutoPlay() {
            pararAutoPlay();
            iniciarAutoPlay();
        }

        if (nextBtn) nextBtn.addEventListener("click", proximoSlide);
        if (prevBtn) prevBtn.addEventListener("click", anteriorSlide);

        const carousel = document.querySelector(".carousel");
        if (carousel) {
            carousel.addEventListener("mouseenter", pararAutoPlay);
            carousel.addEventListener("mouseleave", iniciarAutoPlay);
            carousel.addEventListener("focusin", pararAutoPlay);
            carousel.addEventListener("focusout", iniciarAutoPlay);
        }

        atualizarSlides();
        iniciarAutoPlay();
    }

    const animated = document.querySelectorAll("[data-animate], .item, .oc-item, .texto");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        animated.forEach((el) => observer.observe(el));
    } else {
        animated.forEach((el) => el.classList.add("in-view"));
    }
});