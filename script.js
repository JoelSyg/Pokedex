const PokemonAPI_URL = "https://pokeapi.co/api/v2/";
let offset = 0;
const limit = 36;
let pokedexIsLoading = false;
let searchIsLoading = false;

const ctx = document.getElementById("modalContent");
// let pokemonNames = [];

// async function addPokemonNamesToArray(path = "pokemon/") {
//   for (let i = 1 ; i < 1026; i++) {
//     let pokemon = await fetch(PokemonAPI_URL + path + i);
//     let pokemonJson = await pokemon.json();
//     pokemonNames.push(pokemonJson["forms"][0]["name"])
//   }
// }

// Für den background bei geöffnetem Pokemon
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

function pokemonHtml(pokemonJson) {
  const type1 = pokemonJson["types"][0].type.name;
  const type2 = pokemonJson["types"][1] ? pokemonJson["types"][1].type.name : null;

  return `
    <div id="pokemon${pokemonJson.id}" class="pokemonCardBox" onclick="openPokemonModal(${pokemonJson.id})">
      <div class="pokemonImgBox type-${type1}-bright">
        <img class="pokemonImg" src="${pokemonJson["sprites"]["other"]["official-artwork"]["front_default"]}">
      </div>
      <div class="pokemonPreInfo">
        <div>
          <b># ${pokemonJson.id}</b>
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
    </div>`;
}

async function renderOpenedPokemon(pokemonId) {
  let modalContent = document.getElementById("modalContent");
  let pokemon = await fetch(PokemonAPI_URL + "pokemon/" + [pokemonId]);
  let pokemonJson = await pokemon.json();
  modalContent.innerHTML = openedPokemonHtml(pokemonJson);

  const type1 = pokemonJson.types[0].type.name;
  const backgroundColor = typeColors[type1];
  modalContent.style.backgroundColor = backgroundColor;
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
      <div class="openedPokemonImgDiv">
      <img id="lastImage" onclick="lastImage(${pokemonJson.id})" src="./img/arrow_left.png" alt="">
      <img class="openedPokemonImg" src="${pokemonJson["sprites"]["other"]["official-artwork"]["front_default"]}">
      <img id="nextImage" onclick="nextImage(${pokemonJson.id})" src="./img/arrow_right.png" alt="">
      </div>
  </div>
  <div class="openedPokemonInfoDiv">
  </div>
  `;
}

async function renderPokedex(offset, limit, path = "pokemon/") {
  let mainContainer = document.getElementById("mainContainer");

  for (let i = offset + 1; i <= offset + limit && i < 1026; i++) {
    let pokemon = await fetch(PokemonAPI_URL + path + i);
    let pokemonJson = await pokemon.json();

    // console.log(pokemonJson);

    mainContainer.innerHTML += pokemonHtml(pokemonJson);
  }

  pokedexIsLoading = false; // Set loading state to false after fetching
}

// Scroll event listener to load more Pokémon when reaching the bottom
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !pokedexIsLoading && !searchIsLoading) {
    pokedexIsLoading = true;
    offset += limit;
    renderPokedex(offset, limit);
  }
});

async function searchPokemon() {
  let search = document.getElementById("searchInput").value;
  let renderedPokemon = 0;

  if (search.length > 2 && !searchIsLoading) {
    startLoadingAnimation();
    searchIsLoading = true;
    search = search.toLowerCase();
    let mainContainer = document.getElementById("mainContainer");
    mainContainer.innerHTML = "";

    for (let i = 1; i < 1026; i++) {
      let pokemon = await fetch(PokemonAPI_URL + "pokemon/" + [i]);
      let pokemonJson = await pokemon.json();
      let name = pokemonJson["forms"][0]["name"];
      if (name.includes(search)) {
        // renderedPokemon um maximal 12 zu rendern
        renderedPokemon++;
        mainContainer.innerHTML += pokemonHtml(pokemonJson);
      }
      if (renderedPokemon == 12) {
        break;
      }
    }
    stopLoadingAnimation();
    searchIsLoading = false;
    if (mainContainer.innerHTML == "") {
      mainContainer.innerHTML = `No Pokémon with the letters "${search}" was found.`;
    }
  }
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
  pokemonId = pokemonId - 1;
  openPokemonModal(pokemonId);
}

function nextImage(pokemonId) {
  pokemonId = pokemonId + 1;
  openPokemonModal(pokemonId);
}
