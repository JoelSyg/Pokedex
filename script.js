let PokemonAPI_URL = "https://pokeapi.co/api/v2/";



async function renderPokedex(path = "pokemon/") {
    let container = document.getElementById('container');
    container.innerHTML = "";

    for (let i = 1; i < 152; i++) {
        
        let pokemon = await fetch(PokemonAPI_URL + path + [i]);
        let pokemonJson = await pokemon.json();

        console.log(pokemonJson
        )

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


