document.addEventListener('DOMContentLoaded', function () {
    // Inicialitzem el mapa centrats a la zona de Sant Feliu Sasserra
    const map = L.map('map').setView([41.9452222, 2.0209238], 14);

    // Afegim la capa base d'OpenStreetMap (terreny o estàndard)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    // Definim l'estil personalitzat per als elements del KML
    const customLayer = L.geoJson(null, {
        style: function (feature) {
            // Estil per a les rutes i polígons respectant els colors del KML
            let strokeColor = feature.properties.stroke || '#4d6135';
            let fillColor = feature.properties.fill || strokeColor;

            // Si l'analitzador no ha detectat stroke, provem d'extreure'l de l'styleUrl
            if (!feature.properties.stroke && feature.properties.styleUrl) {
                const match = feature.properties.styleUrl.match(/-([0-9A-F]{6})/i);
                if (match) {
                    strokeColor = '#' + match[1];
                    fillColor = strokeColor;
                }
            }

            return {
                color: strokeColor,
                weight: feature.properties['stroke-width'] || 5,
                opacity: feature.properties['stroke-opacity'] || 0.8,
                fillColor: fillColor,
                fillOpacity: feature.properties['fill-opacity'] || 0.4
            };
        },
        pointToLayer: function (feature, latlng) {
            // Extraure el color del marcador (pin) des del KML (del seu ID/styleUrl)
            let pinColor = '#4d6135';
            if (feature.properties && feature.properties.styleUrl) {
                const match = feature.properties.styleUrl.match(/-([0-9A-F]{6})/i);
                if (match) {
                    pinColor = '#' + match[1];
                }
            }

            // Marquers personalitzats estilitzats per pins
            const markerHtml = `<div class="marker-pin" style="background-color: ${pinColor};"></div>`;
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: markerHtml,
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                popupAnchor: [0, -20]
            });
            return L.marker(latlng, { icon: customIcon });
        },
        onEachFeature: function (feature, layer) {
            // Vinculem els popups llegint el nom i la descripció del KML
            if (feature.properties && feature.properties.name) {
                let popupContent = `<h3>${feature.properties.name}</h3>`;
                if (feature.properties.description) {
                    // Codi per netejar la descripció que ve del KML (que pot ser una taula HTML)
                    let descText = feature.properties.description;

                    // Si és una taula HTML generada per Earth/Maps, la netegem
                    if (descText.includes('<table')) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = descText;

                        let clearText = "";

                        // Trobar totes les cel·les que tenen informació
                        const rows = tempDiv.querySelectorAll('tr');
                        rows.forEach(row => {
                            const cells = row.querySelectorAll('td');
                            if (cells.length === 2) {
                                const labelText = cells[0].innerText.trim().toLowerCase();
                                const valueText = cells[1].innerText.trim();

                                // Ometem etiquetes "nombre" i "descripción" per no repetir-les passivament com etiquetes
                                // i només guardem el seu valor assignat.
                                if (valueText !== "") {
                                    if (labelText.includes("nombre")) {
                                        // ja tenim el nom en format <h3>
                                    } else if (labelText.includes("descripci")) {
                                        clearText += `<p>${valueText}</p>`;
                                    } else {
                                        // És una altra propietat (per si n'afegeixes de noves)
                                        clearText += `<p><strong>${cells[0].innerText.trim()}:</strong> ${valueText}</p>`;
                                    }
                                }
                            }
                        });

                        if (clearText) {
                            popupContent += `${clearText}`;
                        } else {
                            // Si no ha trobat taules estàndard de Google però hi ha text
                            popupContent += `<p>${tempDiv.innerText.replace(/^(descripció:|nombre:)\s*/gi, '').trim()}</p>`;
                        }
                    } else {
                        // Si no és una taula, sinó text pla amb salts de línia (<br>)
                        let lines = descText.split(/<br\s*\/?>/i);
                        let cleanLines = "";

                        lines.forEach(line => {
                            let text = line.trim();
                            // Ignorem el text si és buit, o només diu "nombre:" o "descripción:"
                            if (text !== "" && text.toLowerCase() !== "nombre:" && text.toLowerCase() !== "descripción:" && text.toLowerCase() !== "descripció:") {
                                // Netegem les línies que comencen just per l'etiqueta que no volem veure, ex: "descripció: Contingut reial" -> "Contingut reial"
                                let cleanedLine = text.replace(/^(descripci[óo]n?:|nombre:)\s*/i, '').trim();
                                if (cleanedLine) {
                                    cleanLines += `<p>${cleanedLine}</p>`;
                                }
                            }
                        });

                        popupContent += cleanLines;
                    }
                }

                // Afegim un botó per obrir a Google Maps si és un punt (marcador)
                if (feature.geometry && feature.geometry.type === 'Point') {
                    const coords = feature.geometry.coordinates;
                    // KML defineix coordinates com [longitud, latitud]
                    const lat = coords[1];
                    const lng = coords[0];
                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

                    popupContent += `
                        <div style="margin-top: 15px; text-align: center;">
                            <a href="${mapsUrl}" target="_blank" style="
                                display: inline-flex;
                                align-items: center;
                                background-color: var(--calm-green, #4d6135);
                                color: white;
                                padding: 8px 15px;
                                border-radius: 8px;
                                text-decoration: none;
                                font-family: 'Share Tech Mono', monospace;
                                font-size: 0.9em;
                                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                                transition: all 0.3s ease;
                            ">
                                Porta'm al lloc
                            </a>
                        </div>
                    `;
                }

                layer.bindPopup(popupContent);
            }
        }
    });

    // Cridem KML via omnivore
    omnivore.kml('cursa_serrat.kml', null, customLayer)
        .on('ready', function () {
            // Quan s'ha carregat tot el KML s'ajusta la càmera visualitzar-ho tot
            map.fitBounds(customLayer.getBounds(), { padding: [30, 30] });
        })
        .on('error', function (e) {
            console.error('Error carregant el KML:', e);
        })
        .addTo(map);
});
