/*
  Lògica de classificacions
  S’implementa el desplegable d’any, el cercador i el detall “i”.
*/
(function () {
  // Elements principals del panell
  const panell = document.getElementById("panell-resultats");
  const titol = document.getElementById("titol-resultats");
  const inputCercador = document.getElementById("cercador-resultats");
  const botoNetejar = document.getElementById("boto-netejar");
  const cosTaula = document.getElementById("cos-taula-resultats");

  // Elements del modal
  const modal = document.getElementById("modal-detall");
  const modalContingut = document.getElementById("modal-contingut");

  // Botons d’any
  const botonsAny = Array.from(document.querySelectorAll(".boto-any"));

  // Estat intern
  let anyActiu = null;
  let dadesActives = [];
  let dadesFiltrades = [];

  // Normalitza text per buscar sense accents i sense diferenciar majúscules
  function normalitza(text) {
    return String(text ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  // Pinta la taula amb les dades donades
  function pintaTaula(files) {
    cosTaula.innerHTML = "";

    if (!files.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7" class="fila-buida">No s’han trobat resultats.</td>`;
      cosTaula.appendChild(tr);
      return;
    }

    for (const r of files) {
      const tr = document.createElement("tr");

      // Botó “i” per obrir el detall
      tr.innerHTML = `
        <td>${r.posicio ?? ""}</td>
        <td>${r.dorsal ?? ""}</td>
        <td class="col-nom">${r.nom ?? ""}</td>
        <td>${r.arribada ?? ""}</td>
        <td><strong>${r.temps ?? ""}</strong></td>
        <td>${r.ritme ?? ""}</td>
        <td class="col-accio">
          <button class="boto-info" type="button" title="Veure detall" aria-label="Veure detall" data-dorsal="${r.dorsal}">
            i
          </button>
        </td>
      `;
      cosTaula.appendChild(tr);
    }
  }

  // Filtra segons el text del cercador
  function aplicaFiltre() {
    const q = normalitza(inputCercador.value);

    if (!q) {
      dadesFiltrades = [...dadesActives];
      pintaTaula(dadesFiltrades);
      return;
    }

    dadesFiltrades = dadesActives.filter((r) => {
      const nom = normalitza(r.nom);
      const dorsal = normalitza(r.dorsal);
      return nom.includes(q) || dorsal.includes(q);
    });

    pintaTaula(dadesFiltrades);
  }

  // Obre el modal amb la info del dorsal
  function obreModalPerDorsal(dorsal) {
    const r = dadesActives.find((x) => String(x.dorsal) === String(dorsal));
    if (!r) return;

    // Aquí es construeix un detall tipus “fitxa” (com l’exemple de la “i”)
    modalContingut.innerHTML = `
      <div class="detall-grid">
        <div class="detall-item">
          <div class="detall-label">Posició</div>
          <div class="detall-valor">${r.posicio ?? "-"}</div>
        </div>
        <div class="detall-item">
          <div class="detall-label">Dorsal</div>
          <div class="detall-valor">${r.dorsal ?? "-"}</div>
        </div>
        <div class="detall-item detall-nom">
          <div class="detall-label">Nom</div>
          <div class="detall-valor">${r.nom ?? "-"}</div>
        </div>
        <div class="detall-item">
          <div class="detall-label">Arribada</div>
          <div class="detall-valor">${r.arribada ?? "-"}</div>
        </div>
        <div class="detall-item">
          <div class="detall-label">Temps</div>
          <div class="detall-valor"><strong>${r.temps ?? "-"}</strong></div>
        </div>
        <div class="detall-item">
          <div class="detall-label">Ritme</div>
          <div class="detall-valor">${r.ritme ?? "-"}</div>
        </div>
      </div>
    `;

    modal.hidden = false;
  }

  // Tanca el modal
  function tancaModal() {
    modal.hidden = true;
    modalContingut.innerHTML = "";
  }

  // Activa un any i mostra panell
  function activaAny(any) {
    anyActiu = any;

    // Només hi ha dades del 2025 (de moment)
    if (any === "2025") {
      dadesActives = Array.isArray(window.resultats2025) ? window.resultats2025 : [];
      titol.textContent = "Resultats edició 2025";
    } else {
      dadesActives = [];
      titol.textContent = `Resultats edició ${any} (properament)`;
    }

    // Mostrar panell
    panell.hidden = false;

    // Reset de cercador i pinta inicial
    inputCercador.value = "";
    dadesFiltrades = [...dadesActives];
    pintaTaula(dadesFiltrades);

    // Scroll suau fins el panell (per sensació de desplegable “real”)
    panell.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Gestió clic a targetes/botons any
  botonsAny.forEach((btn) => {
    btn.addEventListener("click", () => {
      const any = btn.getAttribute("data-any");

      // Actualitza aria-expanded per accessibilitat
      botonsAny.forEach((b) => b.setAttribute("aria-expanded", "false"));
      btn.setAttribute("aria-expanded", "true");

      activaAny(any);
    });
  });

  // Cercador
  inputCercador.addEventListener("input", aplicaFiltre);
  botoNetejar.addEventListener("click", () => {
    inputCercador.value = "";
    aplicaFiltre();
    inputCercador.focus();
  });

  // Delegació d’events per al botó “i”
  cosTaula.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".boto-info");
    if (!btn) return;
    const dorsal = btn.getAttribute("data-dorsal");
    obreModalPerDorsal(dorsal);
  });

  // Tancar modal (clic al fons o botó)
  document.addEventListener("click", (ev) => {
    const t = ev.target;
    if (t && t.getAttribute && t.getAttribute("data-tancar-modal") === "1") {
      tancaModal();
    }
  });

  // Tancar modal amb ESC
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && !modal.hidden) tancaModal();
  });
})();