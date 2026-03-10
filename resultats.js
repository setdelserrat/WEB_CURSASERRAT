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
      </div>
      <div class="modal-accions" style="text-align: center; margin-top: 20px;">
        <button id="boto-descarregar-certificat" class="boto-primari" data-dorsal="${r.dorsal}">Descarregar Certificat</button>
      </div>
    `; modal.hidden = false;
  }

  // Tanca el modal
  function tancaModal() {
    modal.hidden = true;
    modalContingut.innerHTML = "";
  }

  // Activa un any i mostra panell
  function activaAny(any) {
    if (anyActiu === any && !panell.hidden) {
      panell.hidden = true;
      botonsAny.forEach((b) => b.setAttribute("aria-expanded", "false"));
      anyActiu = null;
      return;
    }

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

  // Delegació d'events per descarregar el certificat al modal
  modalContingut.addEventListener("click", (ev) => {
    if (ev.target.id === "boto-descarregar-certificat") {
      const dorsal = ev.target.getAttribute("data-dorsal");
      generaCertificat(dorsal);
    }
  });

  // Generar i descarregar certificat tipus diploma en un canvas fora de pantalla (Pur JS per evitar problemes CORS)
  function generaCertificat(dorsal) {
    const r = dadesActives.find((x) => String(x.dorsal) === String(dorsal));
    if (!r) return;

    // Crear el canvas (Mesures A4 Apaisat a 150 DPI)
    const canvas = document.createElement("canvas");
    canvas.width = 1754;
    canvas.height = 1240;
    const ctx = canvas.getContext("2d");

    // Colors oficials de la web
    const colorFons = "#f5f5dc";
    const colorPrimari = "#4d6135";
    const colorTextFosc = "#1f2937";
    const colorLinies = "rgba(77, 97, 53, 0.25)";

    // 1. Dibuixar fons net beix
    ctx.fillStyle = colorFons;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Dibuixar patró de corbes de nivell (topogràfic) molt més natural
    ctx.strokeStyle = colorLinies;
    ctx.lineWidth = 1.5;

    // Funció pseudo-aleatòria per fer soroll ("Noise") rudimentari en 1D
    const simpleNoise = (x, y, scale = 0.05) => {
      return Math.sin(x * scale) * Math.cos(y * scale) + Math.sin((x + y) * scale * 0.5);
    };

    // Generar corbes travessant la pantalla que ondulin orgànicament
    const numLines = 45;
    for (let i = 0; i < numLines; i++) {
      ctx.beginPath();
      let startY = -400 + (i * 45); // Espaiat base entre corbes
      ctx.moveTo(0, startY);

      for (let x = 0; x <= canvas.width; x += 30) {
        // Desplaçament vertical combinant freqüències de soroll perquè el traç sigui terrós
        let offsetY = simpleNoise(x, i * 100, 0.01) * 80 + simpleNoise(x, i * 100, 0.003) * 200;
        ctx.lineTo(x, startY + offsetY);
      }
      ctx.stroke();
    }

    // Generar també uns quants cercles / cims concèntrics naturals distorsionats
    const drawTopoPeak = (cx, cy, maxRadius, step) => {
      for (let rConfig = step; rConfig < maxRadius; rConfig += step) {
        ctx.beginPath();
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
          // Afegir soroll radial per deformar el cercle
          let rDistorted = rConfig + simpleNoise(cx + Math.cos(angle) * rConfig, cy + Math.sin(angle) * rConfig, 0.02) * 15;
          let x = cx + Math.cos(angle) * rDistorted;
          let y = cy + Math.sin(angle) * rDistorted;
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    };

    // Un parell de cims suaus espargits per la pàgina per fer de topo real
    drawTopoPeak(1400, 300, 500, 45);
    drawTopoPeak(200, 1000, 400, 45);
    drawTopoPeak(800, -100, 300, 45);

    // 3. Marc exterior fi d'estil mapa
    ctx.strokeStyle = colorPrimari;
    ctx.lineWidth = 6;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // 4. Carregar el LOGO real de la cursa i continuar el dibuix via onload
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibuixar logo
      const logoTargetWidth = 550;
      const logoTargetHeight = (logoImg.height / logoImg.width) * logoTargetWidth;
      ctx.drawImage(logoImg, canvas.width / 2 - logoTargetWidth / 2, 120, logoTargetWidth, logoTargetHeight);

      // 5. Textos Principals del Corredor
      ctx.textAlign = "center";
      ctx.fillStyle = colorTextFosc;
      ctx.font = "bold 90px 'Share Tech Mono', monospace, Arial";

      const nomCorredor = (r.nom || "Corredor").toUpperCase();
      if (nomCorredor.length > 25) ctx.font = "bold 70px 'Share Tech Mono', monospace, Arial";

      ctx.fillText(nomCorredor, canvas.width / 2, 530);

      // Línia separadora sota el nom
      ctx.strokeStyle = colorPrimari;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 350, 580);
      ctx.lineTo(canvas.width / 2 + 350, 580);
      ctx.stroke();

      // 6. Bloques de dades (graella tipus finisher)
      const paintDataBlock = (label, value, x, y) => {
        // Fons semitransparent per llegibilitat
        ctx.fillStyle = "rgba(245, 245, 220, 0.85)";
        ctx.fillRect(x - 170, y - 50, 340, 160);
        ctx.strokeStyle = colorPrimari;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 170, y - 50, 340, 160);

        ctx.fillStyle = colorPrimari;
        ctx.font = "bold 26px Arial";
        ctx.fillText(label.toUpperCase(), x, y - 5);

        ctx.fillStyle = colorTextFosc;
        ctx.font = "bold 58px 'Share Tech Mono', Arial";
        ctx.fillText(value, x, y + 65);
      };

      // Temps central destacat
      const ampladaCaixaTemps = 580; // Ampliada per tancar bé tot el temps
      ctx.fillStyle = "rgba(245, 245, 220, 0.9)";
      ctx.fillRect(canvas.width / 2 - (ampladaCaixaTemps / 2), 650, ampladaCaixaTemps, 180);
      ctx.strokeStyle = colorPrimari;
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width / 2 - (ampladaCaixaTemps / 2), 650, ampladaCaixaTemps, 180);

      ctx.fillStyle = colorPrimari;
      ctx.font = "bold 26px Arial";
      ctx.fillText("TEMPS OFICIAL", canvas.width / 2, 700);
      ctx.fillStyle = colorTextFosc;
      // Text de temps ben gran i al centre
      ctx.font = "bold 85px 'Share Tech Mono', Arial";
      ctx.fillText(r.temps || "-", canvas.width / 2, 800);

      // Bloques laterals inferiors
      paintDataBlock("Posició", r.posicio || "-", canvas.width / 2 - 400, 930);
      paintDataBlock("Ritme", r.ritme || "-", canvas.width / 2, 930);
      paintDataBlock("Distància", r.distancia || "12km", canvas.width / 2 + 400, 930);

      // 7. Missatge felicitació o Edició
      ctx.fillStyle = colorPrimari;
      ctx.font = "italic bold 42px Arial";
      ctx.fillText("FINISHER · EDICIÓ 2025", canvas.width / 2, 1150);

      // Procés de descàrrega
      try {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `Certificat_A4_CDS_${r.nom ? r.nom.replace(/\s+/g, "_") : "Corredor"}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        console.error("Error al descarregar:", e);
        alert("No s'ha pogut descarregar el certificat automàticament.");
      }
    };

    // Si REALLOGO_B64 està disponible des de logo_b64.js, ho fem servir:
    if (typeof REALLOGO_B64 !== "undefined") {
      logoImg.src = REALLOGO_B64;
    } else {
      logoImg.src = "Imatges/logo.png";
    }
  }

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