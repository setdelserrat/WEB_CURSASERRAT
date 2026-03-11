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
                        // Creem un element temporal per parsejar l'HTML
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = descText;

                        // Busquem el text real. Normalment està en divs o tds.
                        let clearText = "";

                        // Intentem trobar les files de la taula
                        const rows = tempDiv.querySelectorAll('tr');
                        if (rows.length > 0) {
                            rows.forEach(row => {
                                const cells = row.querySelectorAll('td');
                                if (cells.length === 2) {
                                    const label = cells[0].innerText.trim().toLowerCase();
                                    const value = cells[1].innerText.trim();
                                    // Ignorem etiquetes buides o no desitjades si no tenen valor real (excepte si el valor és útil i no s'assembla a l'etiqueta)
                                    if (value && value !== "" && label !== "nombre" && !label.includes("descripci")) {
                                        clearText += `<p><strong>${cells[0].innerText.trim()}</strong> ${value}</p>`;
                                    } else if (value && value !== "" && (label === "nombre" || label.includes("descripci"))) {
                                        // Si és la descripció real o el nom però té valor, només posem el valor
                                        clearText += `<p>${value}</p>`;
                                    }
                                }
                            });
                        } else {
                            // Si no hi ha files (estructura diferent), agafem només el text net
                            clearText = tempDiv.innerText.trim();
                        }

                        // Netejar "descripció:" "nombre:" si han quedat com a text pla al principi
                        clearText = clearText.replace(/^(descripció:|nombre:)\s*/i, '').trim();

                        if (clearText) {
                            popupContent += `${clearText}`;
                        } else {
                            // Fallback si la neteja deixa el text buit però hi havia alguna cosa original
                            popupContent += `<p>${tempDiv.innerText.replace(/^(descripció:|nombre:)\s*/gi, '').trim()}</p>`;
                        }
                    } else {
                        // Si no és una taula, només netegem les etiquetes no desitjades si apareixen al principi
                        let cleanText = descText.replace(/^(descripció:|nombre:)\s*/i, '').trim();
                        popupContent += `<p>${cleanText}</p>`;
                    }
                    // Afegim un botó per obrir a Google Maps si és un punt (marcador)
                    if (feature.geometry.type === 'Point') {
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
                                <span style="margin-right: 8px; font-size: 1.2em;">📍</span> Porta'm al lloc
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
