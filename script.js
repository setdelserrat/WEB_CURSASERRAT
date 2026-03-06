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

// Funció que actualitza el compte enrere de la cursa
function actualitzaComptador() {
    const ara = new Date().getTime();
    const dataCursa = new Date(configuracioWeb.dataEsdeveniment).getTime();
    const diferencia = dataCursa - ara;

    const elementComptador = document.getElementById('comptador');

    if (diferencia <= 0) {
        elementComptador.innerHTML = "<div class='esdeveniment-iniciat'>L'esdeveniment ha començat!</div>";
        return;
    }

    // Càlcul de dies, hores, minuts i segons
    const dies = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const hores = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minuts = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segons = Math.floor((diferencia % (1000 * 60)) / 1000);

    // Actualització del DOM amb els nous valors
    elementComptador.innerHTML = `
        <div class="segment-comptador"><span>${dies.toString().padStart(2, '0')}</span> dies</div>
        <div class="segment-comptador"><span>${hores.toString().padStart(2, '0')}</span> hores</div>
        <div class="segment-comptador"><span>${minuts.toString().padStart(2, '0')}</span> minuts</div>
        <div class="segment-comptador"><span>${segons.toString().padStart(2, '0')}</span> segons</div>
    `;
}

// Inicialització del compte enrere cada segon
setInterval(actualitzaComptador, 1000);
actualitzaComptador();

// Funció per al desplaçament suau (Smooth Scroll) als enllaços interns
document.querySelectorAll('a[href^="#"]').forEach(ancora => {
    ancora.addEventListener('click', function(e) {
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

console.log(`${configuracioWeb.nomEsdeveniment} configurada correctament al domini: ${configuracioWeb.dominiPreferit}`);

