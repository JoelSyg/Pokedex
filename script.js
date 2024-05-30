const PokemonAPI_URL = "https://pokeapi.co/api/v2/";
let offset = 0;
const limit = 30;
let isLoading = false;

async function renderPokedex(offset, limit, path = "pokemon/") {
  let container = document.getElementById("container");

  for (let i = offset + 1; i <= offset + limit && i < 152; i++) {
    let pokemon = await fetch(PokemonAPI_URL + path + i);
    let pokemonJson = await pokemon.json();

    console.log(pokemonJson);

    container.innerHTML += `
        <div class="pokemonCardBox">
            <div class="pokemonImgBox type-${pokemonJson["types"][0].type.name}-bright">
                <img class="pokemonImg" src="${pokemonJson["sprites"]["other"]["official-artwork"]["front_default"]}">
            </div>
            <div class="pokemonPreInfo">
                <div>
                    <b># ${pokemonJson.id}</b>
                </div>
                <div class="pokemonTypeInfo type-${pokemonJson["types"][0].type.name}">
                    ${pokemonJson["types"][0].type.name}
                </div>
            </div>
            <h2>
                ${pokemonJson["forms"][0]["name"]}
            </h2>
        </div>`;
  }

  isLoading = false; // Set loading state to false after fetching
}

// Scroll event listener to load more Pokémon when reaching the bottom
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading) {
    isLoading = true;
    offset += limit;
    renderPokedex(offset, limit);
  }
});

async function searchPokemon() {
  let search = document.getElementById("searchInput").value;
  let renderedPokemon = 0;

  if (search.length > 2) {
    search = search.toLowerCase();
    let container = document.getElementById("container");
    container.innerHTML = "";

    for (let i = 1; i < 152; i++) {
      let pokemon = await fetch(PokemonAPI_URL + "pokemon/" + [i]);
      let pokemonJson = await pokemon.json();
      let name = pokemonJson["forms"][0]["name"];
      if (name.includes(search) && renderedPokemon < 12) {
        // renderedPokemon um maximal 12 zu rendern
        renderedPokemon++;
        container.innerHTML += `
              <div class="pokemonCardBox">
                  <div class="pokemonImgBox type-${pokemonJson["types"][0].type.name}-bright">
                      <img class="pokemonImg" src="${pokemonJson["sprites"]["other"]["official-artwork"]["front_default"]}">
                  </div>
                  <div class="pokemonPreInfo">
                      <div>
                          <b># ${pokemonJson.id}</b>
                      </div>
                      <div class="pokemonTypeInfo type-${pokemonJson["types"][0].type.name}">
                          ${pokemonJson["types"][0].type.name}
                      </div>
                  </div>
                  <h2>
                      ${pokemonJson["forms"][0]["name"]} 
                  </h2>
              </div>`;
      }
    }
  }
}
