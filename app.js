const state = {
    currentUser: { id: 1, nom: "Usuari Demo" },
    selectedParkingId: 1,
    assignedSpotId: null,
    parkings: [
        { id: 1, nom: "Pàrquing Centre Ciutat", ubicació: "Av. Diagonal, 45" },
        { id: 2, nom: "Pàrquing Estació Central", ubicació: "Pl. Catalunya, 1" },
        { id: 3, nom: "Pàrquing Nord Campus", ubicació: "Carrer de Jordi Girona, 2" }
    ],
    spaces: [],
    incidents: []
};

function inicialitzarPlaces() {
    state.parkings.forEach(parking => {
        for (let i = 1; i <= 15; i++) {
            const defaultOcupat = Math.random() < 0.4;
            state.spaces.push({
                id: `${parking.id}-${i}`,
                parkingId: parking.id,
                number: i,
                status: defaultOcupat ? 'ocupada' : 'lliure',
                assignedUserId: defaultOcupat ? Math.floor(Math.random() * 100) + 2 : null
            });
        }
    });
}

function getPlacesParking(parkingId) {
    return state.spaces.filter(space => space.parkingId === parkingId);
}

function getOcupacioParking(pId) {
    const places = getPlacesParking(pId);
    const ocupades = places.filter(s => s.status === 'ocupada').length;
    const lliures = places.length - ocupades;
    const percentatge = Math.round((ocupades / places.length) * 100);
    
    return { total: places.length, ocupades, lliures, percentatge };
}

function assignarPlaca(usuariId) {
    const placesParguandActual = getPlacesParking(state.selectedParkingId);
    const placaLliure = placesParguandActual.find(s => s.status === 'lliure' && s.assignedUserId === null);

    if (!placaLliure) {
        alert("Ho sentim, no hi ha places lliures ni disponibles en aquest pàrquing.");
        return null;
    }

    placaLliure.assignedUserId = usuariId;
    state.assignedSpotId = placaLliure.id;
    
    actualitzarInterficie();
    return placaLliure;
}

function ocuparPlaca(placaId) {
    const placa = state.spaces.find(s => s.id === placaId);
    if (placa) {
        placa.status = 'ocupada';
        actualitzarInterficie();
    }
}

function alliberarPlaca(placaId) {
    const placa = state.spaces.find(s => s.id === placaId);
    if (placa) {
        placa.status = 'lliure';
        placa.assignedUserId = null;
        if (state.assignedSpotId === placaId) {
            state.assignedSpotId = null;
        }
        actualitzarInterficie();
    }
}

function registrarIncidencia(usuariId, placaIncorrecta) {
    const nomParking = state.parkings.find(p => p.id === state.selectedParkingId).nom;
    const timestamp = new Date().toLocaleTimeString();
    
    const novaIncidencia = {
        id: Date.now(),
        text: `L'usuari (ID: ${usuariId}) ha ocupat indegudament la plaça ${placaIncorrecta.number} del ${nomParking}.`,
        time: timestamp
    };

    state.incidents.unshift(novaIncidencia);
    actualitzarInterficie();
}

function actualitzarInterficie() {
    renderUserBadge();
    renderParkingList();
    renderStats();
    renderSpacesGrid();
    renderIncidents();
    controlBotons();
}

function renderUserBadge() {
    document.getElementById('username-display').innerText = state.currentUser.nom;
    const badge = document.getElementById('user-spot-display');
    
    if (state.assignedSpotId) {
        const spot = state.spaces.find(s => s.id === state.assignedSpotId);
        badge.innerText = `Plaça Reservada: #${spot.number} (${spot.status.toUpperCase()})`;
        badge.style.backgroundColor = "var(--primary)";
    } else {
        badge.innerText = "Cap plaça assignada";
        badge.style.backgroundColor = "var(--warning)";
    }
}

function renderParkingList() {
    const listContainer = document.getElementById('parking-list');
    listContainer.innerHTML = '';

    state.parkings.forEach(p => {
        const card = document.createElement('div');
        card.className = `parking-card ${p.id === state.selectedParkingId ? 'active' : ''}`;
        card.innerHTML = `
            <strong>${p.nom}</strong>
            <p style="font-size: 0.85rem; color: #666; margin-top: 5px;">${p.ubicació}</p>
        `;
        card.onclick = () => {
            state.selectedParkingId = p.id;
            actualitzarInterficie();
        };
        listContainer.appendChild(card);
    });
}

function renderStats() {
    const stats = getOcupacioParking(state.selectedParkingId);
    
    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-lliures').innerText = stats.lliures;
    document.getElementById('stat-ocupades').innerText = stats.ocupades;
    
    const progress = document.getElementById('stat-progress');
    progress.style.width = `${stats.percentatge}%`;
    progress.innerText = `${stats.percentatge}%`;
}

function renderSpacesGrid() {
    const gridContainer = document.getElementById('spaces-grid');
    gridContainer.innerHTML = '';
    
    const currentParking = state.parkings.find(p => p.id === state.selectedParkingId);
    document.getElementById('current-parking-title').innerText = currentParking.nom;

    const places = getPlacesParking(state.selectedParkingId);

    places.forEach(space => {
        const spotEl = document.createElement('div');
        
        let statusClass = space.status === 'ocupada' ? 'occupied' : 'free';
        let assignedClass = space.id === state.assignedSpotId ? 'assigned-to-me' : '';
        
        spotEl.className = `spot ${statusClass} ${assignedClass}`;
        
        let userTag = '';
        if (space.assignedUserId === state.currentUser.id) {
            userTag = '<span class="spot-user">Tu</span>';
        } else if (space.assignedUserId) {
            userTag = `<span class="spot-user">ID: ${space.assignedUserId}</span>`;
        }

        spotEl.innerHTML = `
            <span>P${space.number}</span>
            ${userTag}
        `;
        
        gridContainer.appendChild(spotEl);
    });
}

function renderIncidents() {
    const logContainer = document.getElementById('incidents-log');
    
    if (state.incidents.length === 0) {
        logContainer.innerHTML = '<p class="no-incidents">No hi ha incidències actuals al sistema.</p>';
        return;
    }

    logContainer.innerHTML = '';
    state.incidents.forEach(inc => {
        const item = document.createElement('div');
        item.className = 'incident-item';
        item.innerHTML = `
            <span>${inc.text}</span>
            <span class="incident-time">${inc.time}</span>
        `;
        logContainer.appendChild(item);
    });
}

function controlBotons() {
    const btnAssignar = document.getElementById('btn-assignar');
    const btnOcupar = document.getElementById('btn-ocupar');
    const btnAlliberar = document.getElementById('btn-alliberar');
    
    if (!state.assignedSpotId) {
        btnAssignar.disabled = false;
        btnOcupar.disabled = true;
        btnAlliberar.disabled = true;
    } else {
        const spot = state.spaces.find(s => s.id === state.assignedSpotId);
        btnAssignar.disabled = true;
        
        if (spot.status === 'lliure') {
            btnOcupar.disabled = false;
            btnAlliberar.disabled = false;
        } else {
            btnOcupar.disabled = true;
            btnAlliberar.disabled = false;
        }
    }
}

document.getElementById('btn-assignar').addEventListener('click', () => {
    assignarPlaca(state.currentUser.id);
});

document.getElementById('btn-ocupar').addEventListener('click', () => {
    if (state.assignedSpotId) {
        ocuparPlaca(state.assignedSpotId);
    }
});

document.getElementById('btn-alliberar').addEventListener('click', () => {
    if (state.assignedSpotId) {
        alliberarPlaca(state.assignedSpotId);
    }
});

document.getElementById('btn-incidencia').addEventListener('click', () => {
    const places = getPlacesParking(state.selectedParkingId);
    const placesDisponiblesPerMalAparcar = places.filter(s => s.id !== state.assignedSpotId);
    
    if (placesDisponiblesPerMalAparcar.length === 0) return;
    
    const placaMalAparcada = placesDisponiblesPerMalAparcar[Math.floor(Math.random() * placesDisponiblesPerMalAparcar.length)];
    
    if (state.assignedSpotId) {
        const antigaPlaça = state.spaces.find(s => s.id === state.assignedSpotId);
        antigaPlaça.assignedUserId = null;
        antigaPlaça.status = 'lliure';
        state.assignedSpotId = null;
    }

    placaMalAparcada.status = 'ocupada';
    registrarIncidencia(state.currentUser.id, placaMalAparcada);
});

document.addEventListener("DOMContentLoaded", () => {
    inicialitzarPlaces();
    actualitzarInterficie();
});