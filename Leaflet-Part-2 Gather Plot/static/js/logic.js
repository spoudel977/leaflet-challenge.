// STEP 1: Create Leaflet map

var myMap = L.map('map', {
    layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
    ]
}).setView([0, 0], 2); // Center the map at [0, 0] with a zoom level of 2 for a global view

// STEP 2:  Define base layers
var baseLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    "Satellite": L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    })
};

// STEP 3: Define overlay layers (earthquakes, boundaries, orogens, plates)
var overlayLayers = {
    "Earthquakes": L.layerGroup(),
    "Boundaries": L.layerGroup(),
    "Orogens": L.layerGroup(),
    "Plates": L.layerGroup()
};

// STEP 4: Add layers control
L.control.layers(baseLayers, overlayLayers).addTo(myMap);

// STEP 5: Function to determine marker color based on depth
function getColor(depth) {
    if (depth < 10) {
        return 'green';
    } else if (depth < 30) {
        return 'yellow';
    } else if (depth < 50) {
        return 'orange';
    } else {
        return 'red';
    }
}

// STEP 6: Fetch earthquake data

fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
    .then(response => response.json())
    .then(earthquakeData => {
        // Add earthquake data as circle markers
        L.geoJSON(earthquakeData, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: feature.properties.mag * 3.5,
                    fillColor: getColor(feature.geometry.coordinates[2]),
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8,
                    interactive: true
                }).bindPopup(`<b>Location:</b> ${feature.properties.place}<br><b>Magnitude:</b> ${feature.properties.mag}<br><b>Depth:</b> ${feature.geometry.coordinates[2]} km<br><b>Time:</b> ${new Date(feature.properties.time).toLocaleString()}`);
            }
        }).addTo(overlayLayers["Earthquakes"]);
    })
    .catch(error => console.error('Error fetching earthquake data:', error));

// STEP 7: Fetch and add tectonic plates boundaries data

fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
    .then(response => response.json())
    .then(tectonicPlateData => {
        // Add tectonic plates boundaries data as a GeoJSON layer
        L.geoJSON(tectonicPlateData, {
            style: {
                color: 'blue',
                weight: 2
            }
        }).addTo(overlayLayers["Boundaries"]);
    })
    .catch(error => console.error('Error fetching tectonic plates boundaries data:', error));

// STEP 8: Fetch and add tectonic plates orogens data

fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_orogens.json')
    .then(response => response.json())
    .then(tectonicPlateData => {
        // Add tectonic plates orogens data as a GeoJSON layer
        L.geoJSON(tectonicPlateData, {
            style: {
                color: 'blue',
                weight: 2
            }
        }).addTo(overlayLayers["Orogens"]);
    })
    .catch(error => console.error('Error fetching tectonic plates orogens data:', error));

// STEP 9:  Fetch and add tectonic plates - plates data

fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json')
    .then(response => response.json())
    .then(tectonicPlateData => {
        // Add tectonic plates -plates data as a GeoJSON layer
        L.geoJSON(tectonicPlateData, {
            style: {
                color: 'purple',
                weight: 2
            }
        }).addTo(overlayLayers["Plates"]);
    })
    .catch(error => console.error('Error fetching tectonic plates data:', error));
