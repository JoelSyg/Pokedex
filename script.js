let PokemonAPI_URL = "https://pokeapi.co/api/v2/";



async function renderPokedex(path = "pokemon/") {
    let container = document.getElementById('container');
    container.innerHTML = "";

    for (let i = 1; i < 153; i++) {
        
        let pokemon = await fetch(PokemonAPI_URL + path + [i]);
        let pokemonJson = await pokemon.json();

        container.innerHTML += `
        <div class="pokemonBox ">${pokemonJson["forms"][0]["name"]}
            <img class="pokemonImg" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${i}.png">
        </div>`;
        console.log(pokemonJson
        )

    }
}


