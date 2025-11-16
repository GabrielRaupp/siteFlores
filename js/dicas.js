document.addEventListener("DOMContentLoaded", function () {
    if (!document.body.classList.contains("dicas-page")) return;

    const animated = document.querySelectorAll("[data-animate-dica]");
    const backToTopBtn = document.querySelector(".back-to-top");

    const dicasLink = document.querySelector('nav a[href*="dicas"]');
    if (dicasLink) {
        dicasLink.classList.add("current");
    }

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
            {
                threshold: 0.2,
            }
        );

        animated.forEach((el) => observer.observe(el));
    } else {
        animated.forEach((el) => el.classList.add("in-view"));
    }

    if (backToTopBtn) {
        const toggleBackToTop = () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add("visible");
            } else {
                backToTopBtn.classList.remove("visible");
            }
        };

        window.addEventListener("scroll", toggleBackToTop);
        toggleBackToTop();

        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });
    }
});
