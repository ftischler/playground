export type Pokemon = {
  height: number;
  id: number;
  name: string;
  sprites: Sprites;
  types: Type[];
  weight: number;
};

export const pokemonSpeciesGen1 = [
  'fire',
  'water',
  'grass',
  'flying',
  'poison',
  'bug',
  'normal',
  'electric',
  'ground',
  'fairy',
  'fighting',
  'psychic',
  'rock',
  'steel',
  'ice',
  'ghost',
  'dragon',
] as const;

export type PokemonSpeciesGen1 = (typeof pokemonSpeciesGen1)[number];

export type Species = {
  name: string;
  url: string;
};

export type Sprites = {
  front_default: string;
};

export type Type = {
  slot: number;
  type: Species;
};

export const mapToPokemon = (pokemon: Pokemon): Pokemon => ({
  id: pokemon.id,
  name: pokemon.name,
  weight: pokemon.weight,
  height: pokemon.height,
  sprites: {
    front_default: pokemon.sprites.front_default,
  },
  types: pokemon.types,
});
