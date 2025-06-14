const dashboard = document.getElementById("dashboard");

async function fetchData(endpoint) {
    const response = await fetch(`proxy.php?endpoint=${endpoint}`);
    const data = await response.json();
    return data.results;
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
    let ships = [];
    let url = 'https://swapi.dev/api/starships/';
    while (url) {
        const res = await fetch(url);
        const data = await res.json();
        ships = ships.concat(data.results);
        url = data.next;
    }
    return ships;
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

  // Obtén la nave directamente con la URL
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
            speciesCount["human"] = (speciesCount["human"] || 0) + 1;
        } else {
            const species = await fetch(person.species[0]).then(res => res.json());
            speciesCount[species.name] = (speciesCount[species.name] || 0) + 1;
        }
    }

    summaryDiv.innerHTML = `<strong>Censo de especies en ${film.title}:</strong><ul>` +
        Object.entries(speciesCount).map(([sp, cnt]) => `<li>${sp}: ${cnt}</li>`).join("") + "</ul>";
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
    option.value = ship.url;  // Usa la URL como valor único
    option.textContent = ship.name;
    select.appendChild(option);
  });
}

// Carga inicial
loadAll();
loadFilmOptions();
showMostPopulatedPlanet();
// Al final de tu script o dentro de una función de inicialización
loadStarshipOptions();

