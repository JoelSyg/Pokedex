const PokemonAPI_URL = "https://pokeapi.co/api/v2/";
let offset = 0;
const limit = 42;
let pokedexIsLoading = false;
let statsData;
let descriptionData = "";
let currentSearchId = 0;

const typeColors = {
  normal: "#c4c3a3",
  fire: "#f38c58",
  water: "#87a4ff",
  electric: "#fce25b",
  grass: "#9ed07e",
  ice: "#b5e1ec",
  fighting: "#e24c45",
  poison: "#c05ab5",
  ground: "#f0d479",
  flying: "#b8a5f9",
  psychic: "#ff83b1",
  bug: "#b6c325",
  rock: "#c4b748",
  ghost: "#8f85b8",
  dragon: "#9577ff",
  dark: "#8c7b67",
  steel: "#bfc0d5",
  fairy: "#e49fcb",
};

async function renderPokedex(offset, limit, path = "pokemon/") {
  let mainContainer = document.getElementById("mainContainer");

  for (let i = offset + 1; i <= offset + limit && i < 1026; i++) {
    let pokemon = await fetch(PokemonAPI_URL + path + i);
    let pokemonJson = await pokemon.json();

    mainContainer.innerHTML += pokemonHtml(pokemonJson);
  }

  pokedexIsLoading = false;
}

function pokemonHtml(pokemonJson) {
  const type1 = pokemonJson["types"][0].type.name;
  const type2 = pokemonJson["types"][1] ? pokemonJson["types"][1].type.name : null;

  return `
    <div id="pokemon${pokemonJson.id}" class="pokemonCardBox type-${type1}-bright" onclick="openPokemonModal(${pokemonJson.id})">
      <div class="pokemonImgBox">
        <img class="pokemonImg" src="${pokemonJson["sprites"]["other"]["official-artwork"]["front_default"]}">
      </div>
      <div class="pokemonCardBottom">
      <div class="pokemonPreInfo">
        <div class="pokemonCardId">
          <b>#${pokemonJson.id}</b>
        </div>
        <div class="pokemonTypes">
          <div class="pokemonTypeInfo type-${type1}">
            ${type1}
          </div>
          ${
            type2
              ? `
          <div class="pokemonTypeInfo type-${type2}">
            ${type2}
          </div>`
              : ""
          }
        </div>
      </div>
      <h2>
        ${capitalizeFirstLetter(pokemonJson["forms"][0]["name"])}
      </h2>
      </div>
    </div>`;
}

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !pokedexIsLoading) {
    pokedexIsLoading = true;
    offset += limit;
    renderPokedex(offset, limit);
  }
});

async function searchPokemon() {
  const search = document.getElementById("searchInput").value;
  if (search.length > 2) {
    currentSearchId++;
    const searchId = currentSearchId;
    startLoadingAnimation();
    searchPokemonAsync(search, searchId);
  }
}

async function searchPokemonAsync(search, searchId) {
  search = search.toLowerCase();
  const mainContainer = document.getElementById("mainContainer");
  mainContainer.innerHTML = "";
  let renderedPokemon = 0;

  try {
    for (let i = 1; i < 1026; i++) {
      if (searchId !== currentSearchId) {
        throw new Error("Search aborted");
      }

      let pokemon = await fetch(PokemonAPI_URL + "pokemon/" + i);
      let pokemonJson = await pokemon.json();
      let name = pokemonJson["forms"][0]["name"];
      if (name.includes(search)) {
        renderedPokemon++;
        mainContainer.innerHTML += pokemonHtml(pokemonJson);
      }
      if (renderedPokemon == 10) {
        break;
      }
    }

    if (searchId !== currentSearchId) {
      throw new Error("Search aborted");
    }

    stopLoadingAnimation();

    if (mainContainer.innerHTML == "") {
      mainContainer.innerHTML = noPokemonFound(search, mainContainer);
    }
  } catch (error) {
    if (error.message !== "Search aborted") {
      console.error("Search failed", error);
    }
  }
}

function noPokemonFound(search) {
  return `<span class="noPokemonFoundText">Sorry, but no Pokémon with the letters "${search}" was found.</span>`;
}

function enableSearchButton() {
  let button = document.getElementById("searchButton");
  let search = document.getElementById("searchInput").value;
  if (search.length < 3) {
    button.disabled = true;
  }
  if (search.length > 2) {
    button.disabled = false;
  }
}

async function renderOpenedPokemon(pokemonId) {
  const modalContent = document.getElementById("modalContent");

  const pokemonResponse = await fetch(PokemonAPI_URL + "pokemon/" + pokemonId);
  const pokemonJson = await pokemonResponse.json();

  const speciesResponse = await fetch(PokemonAPI_URL + "pokemon-species/" + pokemonId);
  const speciesJson = await speciesResponse.json();

  const description = extractDescription(speciesJson);
  modalContent.innerHTML = openedPokemonHtml(pokemonJson);
  const type1 = pokemonJson.types[0].type.name;
  const backgroundColor = typeColors[type1];
  modalContent.style.backgroundColor = backgroundColor;
  renderOpenedPokemonImg(pokemonJson);
  renderOpenedPokemonInfoDiv();
  statsData = pokemonJson.stats;
  renderStatsChart(statsData);

  descriptionData = description; 
}

function extractDescription(speciesJson) {
  return speciesJson.flavor_text_entries.find((entry) => entry.language.name === "en")
    ? speciesJson.flavor_text_entries.find((entry) => entry.language.name === "en").flavor_text.replace(/[\n\f]/g, " ")
    : "No description available.";
}

function openedPokemonHtml(pokemonJson) {
  const type1 = pokemonJson["types"][0].type.name;
  const type2 = pokemonJson["types"][1] ? pokemonJson["types"][1].type.name : null;

  return `
  <div class="openedPokemonDiv">
      <h2>
        ${capitalizeFirstLetter(pokemonJson["forms"][0]["name"])}
      </h2>
      <div class="pokemonTypes">
          <div class="pokemonTypeInfo type-${type1}">
            ${type1}
          </div>
          ${
            type2
              ? `
          <div class="pokemonTypeInfo type-${type2}">
            ${type2}
          </div>`
              : ""
          }
        </div>
      <div id="openedPokemonImgDiv">
      </div>
  </div>
  <div id="openedPokemonInfoDiv">
  </div>`;
}

function renderOpenedPokemonImg(pokemonJson) {
  let ImgDiv = document.getElementById("openedPokemonImgDiv");
  const arrowLeftImage = "./img/arrow_left.png";
  const arrowRightImage = "./img/arrow_right.png";
  const arrowImage = window.innerWidth <= 430 ? "./img/arrow_dark_left.png" : arrowLeftImage;
  const nextArrowImage = window.innerWidth <= 430 ? "./img/arrow_dark_right.png" : arrowRightImage;
  let innerHTML = `<img class="openedPokemonImg" src="${pokemonJson["sprites"]["other"]["official-artwork"]["front_default"]}">`;

  if (pokemonJson.id > 1) {
    innerHTML += `<img id="lastImage" onclick="lastImage(${pokemonJson.id})" src="${arrowImage}" alt="">`;
  }

  if (pokemonJson.id < 1025) {
    innerHTML += `<img id="nextImage" onclick="nextImage(${pokemonJson.id})" src="${nextArrowImage}" alt="">`;
  }

  ImgDiv.innerHTML = innerHTML;
}

function renderOpenedPokemonInfoDiv() {
  let infoDiv = document.getElementById("openedPokemonInfoDiv");
  infoDiv.innerHTML = `
    <div class="infoHeadlines">
      <span id="stats" onclick="showInfo('stats')" class="active">Stats</span>
      <span id="description" onclick="showInfo('description')">Description</span>
    </div>
    <div id="infoContent">
    </div>
  `;
}

function showInfo(section) {
  let allSections = document.querySelectorAll("#openedPokemonInfoDiv span");
  allSections.forEach((span) => {
    span.classList.remove("active");
  });
  document.getElementById(section).classList.add("active");
  let infoContent = document.getElementById("infoContent");
  infoContent.innerHTML = ""; 

  if (section === "stats") {
    renderStatsChart(statsData); 
  } else if (section === "description") {
    renderDescription();
  }
}

function createCanvasElement() {
  const container = document.getElementById("infoContent");
  const canvas = document.createElement("canvas");
  canvas.id = "statsChart";
  if (canvas && container && typeof container.appendChild === "function") {
    container.appendChild(canvas);
    return canvas.getContext("2d");
  }
  return null;
}

function renderChart(ctx, statsData) {
  if (!ctx) {
    return;
  }
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["HP", "Attack", "Defense", "Sp. Attack", "Sp. Defense", "Speed"],
      datasets: [
        {
          label: "Stats",
          data: statsData.map((stat) => stat.base_stat),
          backgroundColor: [
            "rgba(255, 69, 58, 0.6)", 
            "rgba(255, 193, 7, 0.6)", 
            "rgba(0, 204, 83, 0.6)", 
            "rgba(66, 133, 244, 0.6)", 
            "rgba(255, 152, 0, 0.6)", 
            "rgba(153, 102, 204, 0.6)",
          ],
          borderColor: [
            "rgba(255, 69, 58, 1)",
            "rgba(255, 193, 7, 1)",
            "rgba(0, 204, 83, 1)",
            "rgba(66, 133, 244, 1)",
            "rgba(255, 152, 0, 1)",
            "rgba(153, 102, 204, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function renderStatsChart(statsData) {
  const ctx = createCanvasElement();
  renderChart(ctx, statsData);
}

function renderDescription() {
  let container = document.getElementById("infoContent");
  container.innerHTML = descriptionData; 
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function startLoadingAnimation() {
  let loading = document.getElementById("loadingAnimationDiv");
  loading.innerHTML = `<div class="pokeballLoading">
  </div>`;
}

function stopLoadingAnimation() {
  let loading = document.getElementById("loadingAnimationDiv");
  loading.innerHTML = "";
}

function openPokemonModal(pokemonId) {
  document.getElementById("pokemonModal").classList.remove("dnone");
  renderOpenedPokemon(pokemonId);
}

function closePokemonModal() {
  document.getElementById("pokemonModal").classList.add("dnone");
}

function lastImage(pokemonId) {
  pokemonId--;
  openPokemonModal(pokemonId);
}

function nextImage(pokemonId) {
  pokemonId++;
  openPokemonModal(pokemonId);
}

window.addEventListener("scroll", () => {
  const scrollButton = document.getElementById("scrollUpButton");
  if (window.scrollY > 600) {
    scrollButton.style.display = "block"; 
  } else {
    scrollButton.style.display = "none"; 
  }
});

function scrollUp() {
  window.scrollTo({
    top: 0, 
    behavior: "smooth",
  });
}

function redirectToHomePage() {
  window.location.href = "index.html"; 
}
