const dashboard = document.getElementById("dashboard");

async function fetchData(endpoint) {
    const response = await fetch(`https://swapi.info/api/${endpoint}`);
    const data = await response.json();
    return data; // En swapi.info ya es un array
}

function createCard(title, infoList) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h2>${title}</h2>` + infoList.map(info => `<p>${info}</p>`).join("");
    return card;
}

async function loadData(type) {
    dashboard.innerHTML = "<div class='loader'>Cargando " + type + "...</div>";
    const data = await fetchData(type);
    dashboard.innerHTML = "";

    if (type === "starships") {
        data.slice(0, 5).forEach(ship => {
            const card = createCard("🚀 " + ship.name, [
                `Modelo: ${ship.model}`,
                `Clase: ${ship.starship_class}`,
                `Pasajeros: ${ship.passengers}`,
                `Velocidad Máx: ${ship.max_atmosphering_speed}`
            ]);
            dashboard.appendChild(card);
        });
    } else if (type === "planets") {
        data.slice(0, 5).forEach(planet => {
            const card = createCard("🌍 " + planet.name, [
                `Clima: ${planet.climate}`,
                `Terreno: ${planet.terrain}`,
                `Población: ${planet.population}`
            ]);
            dashboard.appendChild(card);
        });
    } else if (type === "people") {
        data.slice(0, 5).forEach(person => {
            const card = createCard("🧑 " + person.name, [
                `Género: ${person.gender}`,
                `Altura: ${person.height}`,
                `Color de cabello: ${person.hair_color}`
            ]);
            dashboard.appendChild(card);
        });
    }
}

function loadAll() {
    dashboard.innerHTML = "<div class='loader'>Cargando todos los datos...</div>";
    Promise.all(["starships", "planets", "people"].map(fetchData)).then(([ships, planets, people]) => {
        dashboard.innerHTML = "";

        ships.slice(0, 3).forEach(ship => {
            const card = createCard("🚀 " + ship.name, [
                `Modelo: ${ship.model}`,
                `Clase: ${ship.starship_class}`,
                `Pasajeros: ${ship.passengers}`
            ]);
            dashboard.appendChild(card);
        });

        planets.slice(0, 3).forEach(planet => {
            const card = createCard("🌍 " + planet.name, [
                `Clima: ${planet.climate}`,
                `Terreno: ${planet.terrain}`,
                `Población: ${planet.population}`
            ]);
            dashboard.appendChild(card);
        });

        people.slice(0, 3).forEach(person => {
            const card = createCard("🧑 " + person.name, [
                `Género: ${person.gender}`,
                `Altura: ${person.height}`,
                `Color de cabello: ${person.hair_color}`
            ]);
            dashboard.appendChild(card);
        });
    });
}

async function getAllStarships() {
    const res = await fetch("https://swapi.info/api/starships");
    const data = await res.json();
    return data; // array directamente
}

async function findPilots() {
    const select = document.getElementById("shipSelect");
    const shipUrl = select.value;
    const resultDiv = document.getElementById("pilotResults");

    if (!shipUrl) {
        resultDiv.innerHTML = "🚫 Por favor, selecciona una nave.";
        return;
    }

    resultDiv.innerHTML = "🔍 Buscando...";

    const ship = await fetch(shipUrl).then(res => res.json());

    if (ship.pilots.length === 0) {
        resultDiv.innerHTML = `❗ La nave "${ship.name}" no tiene pilotos registrados.`;
        return;
    }

    const pilotData = await Promise.all(
        ship.pilots.map(url => fetch(url).then(res => res.json()))
    );

    resultDiv.innerHTML = `<strong>Pilotos de ${ship.name}:</strong><ul>` +
        pilotData.map(p => `<li>${p.name}</li>`).join("") + "</ul>";
}

async function countSpeciesByFilm() {
    const select = document.getElementById("filmSelect");
    const value = select.value;
    const summaryDiv = document.getElementById("speciesSummary");
    summaryDiv.innerHTML = "Procesando...";

    const film = await fetch(value).then(res => res.json());

    const speciesCount = {};
    const peopleData = await Promise.all(
        film.characters.map(url => fetch(url).then(res => res.json()))
    );

    for (let person of peopleData) {
        if (person.species.length === 0) {
            speciesCount["Human"] = (speciesCount["Human"] || 0) + 1;
        } else {
            const species = await fetch(person.species[0]).then(res => res.json());
            speciesCount[species.name] = (speciesCount[species.name] || 0) + 1;
        }
    }

    // Crear las cards para cada especie
    summaryDiv.innerHTML = `<h3>Censo de especies en ${film.title}:</h3><div class="species-cards-container">` +
        Object.entries(speciesCount).map(([species, count]) => `
            <div class="species-card">
                <h4>${species}</h4>
                <p><strong>${count}</strong> individuos</p>
            </div>
        `).join("") +
        `</div>`;
}


async function loadFilmOptions() {
    const filmSelect = document.getElementById("filmSelect");
    const films = await fetchData("films");
    films.forEach(f => {
        const option = document.createElement("option");
        option.value = f.url;
        option.textContent = f.title;
        filmSelect.appendChild(option);
    });
}

async function showMostPopulatedPlanet() {
    const planets = await fetchData("planets");
    const known = planets.filter(p => !isNaN(parseInt(p.population)));
    const most = known.reduce((a, b) => parseInt(a.population) > parseInt(b.population) ? a : b);

    document.getElementById("mostPopulated").innerHTML =
        `<p><strong>${most.name}</strong> con una población de <strong>${most.population}</strong> habitantes.</p>`;
}

async function loadStarshipOptions() {
    const select = document.getElementById("shipSelect");
    const ships = await getAllStarships();

    ships.forEach(ship => {
        const option = document.createElement("option");
        option.value = ship.url;
        option.textContent = ship.name;
        select.appendChild(option);
    });
}
async function loadSpeciesTotalsChart() {
    // Obtener todas las películas
    const films = await fetchData("films");

    // Para cada película, recolectar las especies únicas
    const speciesCountByFilm = {};

    for (const film of films) {
        const speciesSet = new Set();

        // Traemos datos de cada personaje
        const charactersData = await Promise.all(
            film.characters.map(url => fetch(url).then(res => res.json()))
        );

        for (const char of charactersData) {
            if (char.species.length === 0) {
                // Humanos los contamos como "Human"
                speciesSet.add("Human");
            } else {
                // Agregar cada especie (por ahora sólo la primera especie)
                for (const speciesUrl of char.species) {
                    const speciesData = await fetch(speciesUrl).then(res => res.json());
                    speciesSet.add(speciesData.name);
                }
            }
        }

        speciesCountByFilm[film.title] = speciesSet.size;
    }

    // Preparar datos para Chart.js
    const labels = Object.keys(speciesCountByFilm);
    const data = Object.values(speciesCountByFilm);

    const ctx = document.getElementById('speciesChart').getContext('2d');

    // Crear gráfico tipo barra
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Total de especies únicas',
                data,
                backgroundColor: 'rgba(255, 213, 0, 0.7)', // amarillo estilo Star Wars
                borderColor: 'rgba(255, 213, 0, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0,
                    ticks: {
                        color: '#FFD500', // color texto eje y
                    },
                    grid: {
                        color: '#444' // color de la grilla
                    }
                },
                x: {
                    ticks: {
                        color: '#FFD500', // color texto eje x
                    },
                    grid: {
                        color: '#444'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFD500' // color leyenda
                    }
                }
            }
        }
    });
}


// 🚀 Carga inicial
loadAll();
loadFilmOptions();
showMostPopulatedPlanet();
loadStarshipOptions();
loadSpeciesTotalsChart();  