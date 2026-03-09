document.addEventListener('DOMContentLoaded', function() {
    // Inicialitzem el mapa centrats a la zona de Sant Feliu Sasserra
    const map = L.map('map').setView([41.9452222, 2.0209238], 14);

    // Afegim la capa base d'OpenStreetMap (terreny o estàndard)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    // Definim l'estil personalitzat per als elements del KML
    const customLayer = L.geoJson(null, {
        style: function(feature) {
            // Estil per a les rutes i polígons
            return {
                color: '#4d6135', // Verd de la web
                weight: 5,
                opacity: 0.8
            };
        },
        pointToLayer: function(feature, latlng) {
            // Marquers personalitzats estilitzats per pins
            const markerHtml = `<div class="marker-pin" style="background-color: #4d6135;"></div>`;
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: markerHtml,
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                popupAnchor: [0, -20]
            });
            return L.marker(latlng, {icon: customIcon});
        },
        onEachFeature: function(feature, layer) {
            // Vinculem els popups llegint el nom i la descripció del KML
            if (feature.properties && feature.properties.name) {
                let popupContent = `<h3>${feature.properties.name}</h3>`;
                if (feature.properties.description) {
                    popupContent += `<p>${feature.properties.description}</p>`;
                }
                layer.bindPopup(popupContent);
            }
        }
    });

    // Cridem KML via omnivore
    omnivore.kml('cursa_serrat.kml', null, customLayer)
        .on('ready', function() {
            // Quan s'ha carregat tot el KML s'ajusta la càmera visualitzar-ho tot
            map.fitBounds(customLayer.getBounds(), {padding: [30, 30]});
        })
        .on('error', function(e) {
            console.error('Error carregant el KML:', e);
        })
        .addTo(map);
});
