/* =========================================================
   ASM PAINTING LLC
   Main JavaScript
   =========================================================

   Este archivo es compartido por TODAS las páginas.

   La página actual se determina mediante:

       <body data-page="home">

   o:

       <body data-page="gallery">

   De esta manera no necesitamos un JS diferente para
   cada página.

   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIG = {

    /* Component files */

    headerPath: "components/header.html",
    footerPath: "components/footer.html",

    /* GitHub gallery */

    galleryApi: "https://api.github.com/repos/VagoAx89/AlonsoDB/contents/gallery",

    galleryRawBase: "https://raw.githubusercontent.com/VagoAx89/AlonsoDB/main/gallery/",

    /* Contact */

    contactEmail: "info@asmpaintingllc.com"
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {


    await loadComponents();

    initializeNavigation();

    initializeCopyright();

    initializePage();

    initializeScrollEffects();

});


/* =========================================================
   LOAD HEADER + FOOTER
   ========================================================= */

async function loadComponents() {

    const headerContainer =
        document.getElementById("site-header");

    const footerContainer =
        document.getElementById("site-footer");


    try {

        if (headerContainer) {

            const response =
                await fetch(CONFIG.headerPath);

            if (!response.ok) {
                throw new Error(
                    `Header HTTP error: ${response.status}`
                );
            }

            headerContainer.innerHTML =
                await response.text();
        }


        if (footerContainer) {

            const response =
                await fetch(CONFIG.footerPath);

            if (!response.ok) {
                throw new Error(
                    `Footer HTTP error: ${response.status}`
                );
            }

            footerContainer.innerHTML =
                await response.text();
        }

    } catch (error) {

        console.error(
            "Unable to load site components:",
            error
        );

    }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    const menuToggle =
        document.getElementById("menu-toggle");

    const mainNav =
        document.getElementById("main-nav");


    /* ---------- Mobile menu ---------- */

    if (menuToggle && mainNav) {

        menuToggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    mainNav.classList.toggle("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    isOpen
                );
            }
        );


        /* Close menu after clicking a link */

        mainNav
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mainNav.classList.remove(
                            "open"
                        );

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                );

            });
    }


    /* ---------- Active page ---------- */

    const currentPage =
        document.body.dataset.page;

    if (!currentPage) {
        return;
    }


    document
        .querySelectorAll(".main-nav__link")
        .forEach(link => {

            if (
                link.dataset.page === currentPage
            ) {

                link.classList.add("active");

                link.setAttribute(
                    "aria-current",
                    "page"
                );
            }

        });
}


/* =========================================================
   COPYRIGHT YEAR
   ========================================================= */

function initializeCopyright() {

    const year =
        document.getElementById("current-year");

    if (year) {

        year.textContent =
            new Date().getFullYear();

    }
}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

function initializePage() {

    const page =
        document.body.dataset.page;


    switch (page) {

        case "gallery":
            initializeGallery();
            break;

        case "contact":
            initializeContactForm();
            break;

        case "home":
        case "about":
        default:
            break;
    }
}


/* =========================================================
   GALLERY
   =========================================================

   Instead of hard-coding image names, this function asks
   GitHub which files currently exist inside /gallery.

   Therefore:

       Add image to GitHub
              ↓
       Gallery automatically sees it
              ↓
       No HTML changes required

   ========================================================= */

async function initializeGallery() {

    const gallery =
        document.getElementById("gallery-grid");

    if (!gallery) {
        return;
    }


    try {

        const response =
            await fetch(CONFIG.galleryApi);


        if (!response.ok) {

            throw new Error(
                `GitHub API error: ${response.status}`
            );

        }


        const files =
            await response.json();


        /* Only accept common image formats */

        const imageFiles =
            files.filter(file => {

                if (file.type !== "file") {
                    return false;
                }

                return /\.(jpg|jpeg|png|webp|gif)$/i
                    .test(file.name);
            });


        if (imageFiles.length === 0) {

            gallery.innerHTML = `
                <p class="text-muted">
                    No images are currently available.
                </p>
            `;

            return;
        }


        gallery.innerHTML = "";


        imageFiles.forEach(file => {

            const imageUrl =
                CONFIG.galleryRawBase +
                encodeURIComponent(file.name)
                    .replace(/%2F/g, "/");


            const item =
                document.createElement("button");

            item.type = "button";

            item.className =
                "gallery-item";


            const image =
                document.createElement("img");

            image.src = imageUrl;

            image.alt =
                prettifyFilename(file.name);

            image.loading = "lazy";

            image.decoding = "async";


            const caption =
                document.createElement("span");

            caption.className =
                "gallery-item__caption";

            caption.textContent =
                prettifyFilename(file.name);


            item.appendChild(image);

            //item.appendChild(caption);

            gallery.appendChild(item);


            /* Lightbox */

            item.addEventListener(
                "click",
                () => {

                    openLightbox(
                        imageUrl,
                        image.alt
                    );

                }
            );

        });


    } catch (error) {

        console.error(
            "Gallery loading failed:",
            error
        );


        gallery.innerHTML = `
            <p class="text-muted">
                We couldn't load the gallery right now.
                Please try again later.
            </p>
        `;
    }


    initializeLightbox();
}


/* =========================================================
   FILENAME → HUMAN READABLE TITLE
   ========================================================= */

function prettifyFilename(filename) {

    return filename
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}


/* =========================================================
   LIGHTBOX
   ========================================================= */

function initializeLightbox() {

    const lightbox =
        document.getElementById("lightbox");

    const closeButton =
        document.getElementById("lightbox-close");


    if (!lightbox || !closeButton) {
        return;
    }


    closeButton.addEventListener(
        "click",
        closeLightbox
    );


    lightbox.addEventListener(
        "click",
        event => {

            /* Clicking the dark background closes it */

            if (
                event.target === lightbox
            ) {

                closeLightbox();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeLightbox();

            }

        }
    );
}


function openLightbox(src, alt) {

    const lightbox =
        document.getElementById("lightbox");

    const image =
        document.getElementById("lightbox-image");


    if (!lightbox || !image) {
        return;
    }


    image.src = src;

    image.alt = alt || "";

    lightbox.classList.add("open");


    document.body.style.overflow =
        "hidden";
}


function closeLightbox() {

    const lightbox =
        document.getElementById("lightbox");

    const image =
        document.getElementById("lightbox-image");


    if (!lightbox) {
        return;
    }


    lightbox.classList.remove("open");


    document.body.style.overflow =
        "";


    if (image) {
        image.src = "";
    }
}


/* =========================================================
   CONTACT FORM
   =========================================================

   IMPORTANT:

   GitHub Pages is static. It cannot receive POST requests
   by itself.

   For now this form creates an email using mailto:.

   Later we can replace this with:
       - Formspree
       - Web3Forms
       - your own API
       - Cloudflare Worker
       - your Node.js server

   The rest of the website does NOT need to change.
   ========================================================= */

function initializeContactForm() {

    const form =
        document.getElementById("contact-form");

    const status =
        document.getElementById("contact-status");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const formData =
                new FormData(form);


            const name =
                formData.get("name");

            const email =
                formData.get("email");

            const phone =
                formData.get("phone");

            const message =
                formData.get("message");


            const subject =
                encodeURIComponent(
                    "New Project Inquiry - ASM Painting LLC"
                );


            const body =
                encodeURIComponent(
                    `Name: ${name}\n` +
                    `Email: ${email}\n` +
                    `Phone: ${phone || "Not provided"}\n\n` +
                    `Project details:\n${message}`
                );


            const mailto =
                `mailto:${CONFIG.contactEmail}` +
                `?subject=${subject}` +
                `&body=${body}`;


            window.location.href =
                mailto;


            if (status) {

                status.textContent =
                    "Opening your email application...";

            }

        }
    );
}

/* =========================================================
   SCROLL EFFECTS
   =========================================================

   Observa elementos con la clase .reveal.

   Cuando entran en pantalla, agrega .visible.

   Esto evita estar ejecutando cálculos constantemente
   mientras el usuario hace scroll.
   ========================================================= */

function initializeScrollEffects() {

    initializeScrollHeader();

    initializeScrollReveal();
}


/* =========================================================
   HEADER SCROLL EFFECT
   ========================================================= */

function initializeScrollHeader() {

    const header =
        document.querySelector(".site-header");

    if (!header) {
        return;
    }


    const updateHeader =
        () => {

            if (window.scrollY > 10) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }
        };


    updateHeader();


    window.addEventListener(
        "scroll",
        updateHeader, { passive: true }
    );
}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function initializeScrollReveal() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (!elements.length) {
        return;
    }


    /* Fallback for browsers without IntersectionObserver */

    if (!("IntersectionObserver" in window)) {

        elements.forEach(
            element =>
                element.classList.add("visible")
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.add(
                        "visible"
                    );


                    /*
                       Una vez que apareció no necesitamos
                       observarlo nuevamente.
                    */

                    observer.unobserve(
                        entry.target
                    );

                });

            }, {
            /*
               Empieza la animación ligeramente antes
               de que el elemento llegue al centro.
            */

            threshold: 0.12,

            rootMargin: "0px 0px -40px 0px"
        }
        );


    elements.forEach(
        element =>
            observer.observe(element)
    );
}
