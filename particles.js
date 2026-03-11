/* =========================================
   FONS ANIMAT 3D PERLIN NOISE
   ========================================= */

// Importació dinàmica de l'algorisme de "Perlin Noise" per generar el relleu
import("./perlin-noise.js").then(ChriscoursesPerlinNoise => {
    
    // Valors configurables
    let thresholdIncrement = 5; // Salt de desnivell entre línies isolínies (topogràfiques)
    let thickLineThresholdMultiple = 3; // Cada quantes línies se'n dibuixa una de més gruixuda
    let res = 6.5; // Resolució (mida de la cel·la de la graella)
    let baseZOffset = 0.0002; // Velocitat a la que canvia el relleu amb el temps (animació Z)
    let lineColor = "#4d6135"; // Color verd fosc de les línies, definit pel tema
    
    const incrementValue = 0.005; // Increment d'alçada quan el ratolí passa per damunt (interacció)
    const radius = 30; // Radi d'afectació del ratolí sobre el relleu

    let canvas = document.getElementById("res-canvas");
    if (!canvas) return; // Sortir si no existeix el canvas
    
    let ctx = canvas.getContext("2d");
    let inputValues = []; // Matriu per guardar l'alçada de cada punt de la graella

    let currentThreshold = 0; // Nivell d'alçada actual que s'està dibuixant
    let cols = 0; // Nombre de columnes de la graella
    let rows = 0; // Nombre de files de la graella
    let zOffset = 0; // Controla l'evolució del relleu en el temps
    let zBoostValues = []; // Modificadors d'alçada afegits per la interacció del ratolí
    let noiseMin = 100; // Alçada mínima de la pantalla (s'actualitza a cada frame)
    let noiseMax = 0; // Alçada màxima de la pantalla (s'actualitza a cada frame)

    // Variables per fer el seguiment del punt més alt de la muntanya (Serrat Llobater)
    let peakX = 0;
    let peakY = 0;

    let mousePos = { x: -99, y: -99 };
    let mouseDown = true; // Activat sempre per simular una influència contínua

    setupCanvas();
    animate();

    // Configura el canvas i els esdeveniments de redimensionament i interacció
    function setupCanvas() {
        canvasSize();
        window.addEventListener("resize", canvasSize);

        // Registrarem la posició del ratolí al moure'l per influir sobre la Z del relleu
        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            mousePos = { 
                x: e.clientX - rect.left, 
                y: e.clientY - rect.top 
            };
        });
        
        // Suport per a pantalles tàctils (mòbils)
        canvas.addEventListener("touchmove", (e) => {
            const rect = canvas.getBoundingClientRect();
            mousePos = { 
                x: e.touches[0].clientX - rect.left, 
                y: e.touches[0].clientY - rect.top 
            };
        });
    }

    // Calcula les dimensions correctes del canvas tenint en compte el pixel ratio de la pantalla
    function canvasSize() {
        const parent = canvas.parentElement;
        const rect = parent.getBoundingClientRect();
        
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        canvas.style.width = Math.floor(rect.width) + "px";
        canvas.style.height = Math.floor(rect.height) + "px";
        
        // Assegurem que la graella ocupa tot l'espai i no deixa vores lliures (Math.ceil en lloc de Math.floor)
        cols = Math.ceil(rect.width / res) + 1;
        rows = Math.ceil(rect.height / res) + 1;

        // Inicialitzem la matriu d'interacció del ratolí
        for (let y = 0; y <= rows; y++) {
            zBoostValues[y] = [];
            for (let x = 0; x <= cols; x++) {
                zBoostValues[y][x] = 0;
            }
        }
    }

    // Bucle principal de l'animació (frame a frame)
    function animate() {
        requestAnimationFrame(animate);
        
        // Si el ratolí interactua, modifiquem el relleu afegint més volum
        if (mouseDown) {
            mouseOffset();
        }
        
        // Netejem el canvas per començar a dibuixar un el frame nou sense restes
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Avancem l'animació en Z (pas del temps del relleu, fent que sembli avançar o deformar-se contínuament)
        zOffset += baseZOffset;
        generateNoise();

        // Arrodonim els topalls als llindars dissenyats
        const roundedNoiseMin = Math.floor(noiseMin / thresholdIncrement) * thresholdIncrement;
        const roundedNoiseMax = Math.ceil(noiseMax / thresholdIncrement) * thresholdIncrement;
        
        // Dibuixem les línies topogràfiques de menys a més alçada d'acord al "marching squares"
        for (let threshold = roundedNoiseMin; threshold < roundedNoiseMax; threshold += thresholdIncrement) {
            currentThreshold = threshold;
            renderAtThreshold();
        }

        // Un cop dibuixat tot el relleu topogràfic, col·loquem el punt més alt actuant de marcador
        dibuixarSerratLlobater();
        
        // Reiniciem les variables abans del pròxim frame (durant 'generateNoise' és refaran)
        noiseMin = 100;
        noiseMax = 0;
    }

    // Afegeix volum/alçada allà on es mou el cursor per atreure o aixecar el terreny cap aquesta direcció
    function mouseOffset() {
        let x = Math.floor(mousePos.x / res);
        let y = Math.floor(mousePos.y / res);
        if (inputValues[y] === undefined || inputValues[y][x] === undefined) return;
        
        // Creem un increment circular decreixent al voltant del cursor o toc tàctil
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                const distanceSquared = i * i + j * j;
                const radiusSquared = radius * radius;

                if (distanceSquared <= radiusSquared && zBoostValues[y + i]?.[x + j] !== undefined) {
                    zBoostValues[y + i][x + j] += incrementValue * (1 - distanceSquared / radiusSquared);
                }
            }
        }
    }

    // Calcula els valors matemàtics del soroll tipus Perlin per a cada un dels nusos de la graella 
    function generateNoise() {
        for (let y = 0; y <= rows; y++) {
            if(!inputValues[y]) inputValues[y] = [];
            
            for (let x = 0; x <= cols; x++) {
                let boost = zBoostValues[y]?.[x] || 0;
                
                // Càlcul de l'alçada barrejant posició i un modificador extra impulsat al fer hover
                inputValues[y][x] = ChriscoursesPerlinNoise.noise(
                    x * 0.02,
                    y * 0.02,
                    zOffset + boost
                ) * 100;
                
                // Actualitzem l'alçada mínima de la pantalla
                if (inputValues[y][x] < noiseMin) noiseMin = inputValues[y][x];
                
                // Actualitzem l'alçada màxima actual del render a la vista... i el punt de la muntanya local!
                if (inputValues[y][x] > noiseMax) {
                    noiseMax = inputValues[y][x];
                    peakX = x; // Guardem on es troba el punt més alt actual que serà batejat com a "Serrat Llobater"
                    peakY = y;
                }
                
                // L'alçada generada manualment pel cursor es va "desfent" poc a poc fent que torni a la normalitat
                if (boost > 0) {
                    zBoostValues[y][x] *= 0.99;
                }
            }
        }
    }

    // Dibuixa el punt dinàmic "Serrat Llobater" a les coordenades enregistrades com les més altes de la malla topogràfica
    function dibuixarSerratLlobater() {
        const drawX = peakX * res;
        const drawY = peakY * res;

        // Dibuixa un punt indicador (cercle verd fosc del mateix to que la xarxa)
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Preparem el text "Serrat Llobater" i calculem la seva llargada pel seu fons adaptatiu
        const text = "📍 Serrat Llobater";
        ctx.font = "bold 14px 'Share Tech Mono', monospace";
        ctx.textAlign = "center";
        
        const textWidth = ctx.measureText(text).width;
        
        // Afegim un petit rectangle amb fons clar/transparent darrere capcel·lat pel text per facilitar-ne la lectura sense tapar totalment el relleu 
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        const bgX = drawX - textWidth / 2 - 8;
        const bgY = drawY - 26;
        const bgWidth = textWidth + 16;
        const bgHeight = 20;

        ctx.beginPath();
        // Compatibilitat robusta, usem roundrect per suavitzar vores si es suporta al navegador
        if (ctx.roundRect) {
            ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 4);
        } else {
            ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
        }
        ctx.fill();

        // Pintem finalment el nom a l'alçada correcte sobre l'icona i rectancle creat anteriorment
        ctx.fillStyle = "#111"; // Text molt fosc i constrastant
        ctx.fillText(text, drawX, drawY - 11);
    }

    // Pinta les línies de l'isoplana topogràfica utilitzant l'algorisme Marching Squares per extreure les "vores correcte" del terreny
    function renderAtThreshold() {
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = currentThreshold % (thresholdIncrement * thickLineThresholdMultiple) === 0 ? 2 : 1;

        for (let y = 0; y < inputValues.length - 1; y++) {
            for (let x = 0; x < inputValues[y].length - 1; x++) {
                // Determine quins dels 4 vèrtexs de la cel·la estan per damunt o per sota del topall altimètric (del nivell o de la secció del terreny actual analitzada)
                let vNW = inputValues[y][x] > currentThreshold;
                let vNE = inputValues[y][x + 1] > currentThreshold;
                let vSE = inputValues[y + 1][x + 1] > currentThreshold;
                let vSW = inputValues[y + 1][x] > currentThreshold;

                // Si tots els racons estan sobre o sota exclusiuemnt passem al no influir-hi
                if (vNW && vNE && vSE && vSW) continue;
                if (!vNW && !vNE && !vSE && !vSW) continue;

                // Determinem el cas Marching Squares en format binari i operem connectant arestes
                let gridValue = binaryToType(vNW ? 1 : 0, vNE ? 1 : 0, vSE ? 1 : 0, vSW ? 1 : 0);
                placeLines(gridValue, x, y);
            }
        }
        ctx.stroke();
    }

    // Tradueix la valoració de la cel·la referida a com s'han de connectar i interpolar els segments topogràfics
    function placeLines(gridValue, x, y) {
        let nw = inputValues[y][x];
        let ne = inputValues[y][x + 1];
        let se = inputValues[y + 1][x + 1];
        let sw = inputValues[y + 1][x];
        let a, b, c, d;

        switch (gridValue) {
            case 1:
            case 14:
                c = [x * res + res * linInterpolate(sw, se), y * res + res];
                d = [x * res, y * res + res * linInterpolate(nw, sw)];
                line(d, c);
                break;
            case 2:
            case 13:
                b = [x * res + res, y * res + res * linInterpolate(ne, se)];
                c = [x * res + res * linInterpolate(sw, se), y * res + res];
                line(b, c);
                break;
            case 3:
            case 12:
                b = [x * res + res, y * res + res * linInterpolate(ne, se)];
                d = [x * res, y * res + res * linInterpolate(nw, sw)];
                line(d, b);
                break;
            case 11:
            case 4:
                a = [x * res + res * linInterpolate(nw, ne), y * res];
                b = [x * res + res, y * res + res * linInterpolate(ne, se)];
                line(a, b);
                break;
            case 5:
                a = [x * res + res * linInterpolate(nw, ne), y * res];
                b = [x * res + res, y * res + res * linInterpolate(ne, se)];
                c = [x * res + res * linInterpolate(sw, se), y * res + res];
                d = [x * res, y * res + res * linInterpolate(nw, sw)];
                line(d, a);
                line(c, b);
                break;
            case 6:
            case 9:
                a = [x * res + res * linInterpolate(nw, ne), y * res];
                c = [x * res + res * linInterpolate(sw, se), y * res + res];
                line(c, a);
                break;
            case 7:
            case 8:
                a = [x * res + res * linInterpolate(nw, ne), y * res];
                d = [x * res, y * res + res * linInterpolate(nw, sw)];
                line(d, a);
                break;
            case 10:
                a = [x * res + res * linInterpolate(nw, ne), y * res];
                b = [x * res + res, y * res + res * linInterpolate(ne, se)];
                c = [x * res + res * linInterpolate(sw, se), y * res + res];
                d = [x * res, y * res + res * linInterpolate(nw, sw)];
                line(a, b);
                line(c, d);
                break;
        }
    }

    // Funció ajundant que s'encarrega d'unir amb una línia continua els diferents punts passats pel càlcul "lineal" a la paret de canvas
    function line(from, to) {
        ctx.moveTo(from[0], from[1]);
        ctx.lineTo(to[0], to[1]);
    }

    // Calcula la interpretació de la diferència d'alçades intermèdies per a suavitzar altures creant valls realistes i ondul·lacions mes elegants 
    function linInterpolate(x0, x1, y0 = 0, y1 = 1) {
        if (x0 === x1) return 0;
        return y0 + ((y1 - y0) * (currentThreshold - x0)) / (x1 - x0);
    }

    // Reduir els 4 vèrtex representants a l'interior d'un quadre per convertir una combinació seqüencial binària a nombre decimal 
    function binaryToType(nw, ne, se, sw) {
        return [nw, ne, se, sw].reduce((res, x) => (res << 1) | x);
    }

}).catch(err => {
    console.error("Failed to load perlin noise script:", err);
});
