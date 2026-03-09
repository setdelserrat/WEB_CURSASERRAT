/* 
   Lògica de la web 
   Inclou configuració del domini, compte enrere i scroll suau.
*/

// Objecte de configuració de la web
// Aquesta variable serveix per quan es connecti el domini real.
// En entorns locals pot quedar buida o amb el placeholder.
const configuracioWeb = {
    dominiPreferit: "http://cursadelserrat.com/",
    dataEsdeveniment: "2026-06-06T09:00:00",
    nomEsdeveniment: "Cursa del Serrat"
};

// El compte enrere ara està integrat a countdown-flip.js
// que utilitza les dades `configuracioWeb.dataEsdeveniment` i GSAP.

// Funció per al desplaçament suau (Smooth Scroll) als enllaços interns
document.querySelectorAll('a[href^="#"]').forEach(ancora => {
    ancora.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Si és només '#' o no existeix l'element, no fem res especial
        if (href === '#' || !document.querySelector(href)) return;

        e.preventDefault();
        document.querySelector(href).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Gestió d'imatges placeholder (comentari per al client)
// Aquí es poden substituir les imatges per fotos oficials del perfil d'Instagram
// S'ha utilitzat una estructura de graella responsive per facilitar-ne el canvi.
// Lògica per al Marquee corbat animat
function startMarquee(id, pathId, content, speed) {
    const textPath = document.getElementById(id);
    const path = document.getElementById(pathId);
    if (!textPath || !path) return;

    const pathLength = path.getTotalLength();
    textPath.innerHTML = content;

    let offset = 0;

    function animateText() {
        offset -= speed;
        if (offset < 0) {
            offset = pathLength;
        } else if (offset > pathLength) {
            offset = 0;
        }
        textPath.setAttribute('startOffset', `${offset}px`);
        requestAnimationFrame(animateText);
    }

    animateText();
}

document.addEventListener('DOMContentLoaded', () => {
    // Spacer for separation
    const spacer = '&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;&nbsp;';
    const textContent = (`INSCRIPCIONS #CDS2026 PROPERAMENT ${spacer}`).repeat(20);
    startMarquee('marquee-text', 'text-path', textContent, -2);
});
