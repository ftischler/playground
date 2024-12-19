export type PokemonList = {
  count: number;
  next: string;
  previous: null;
  results: PokemonListResult[];
};

export type PokemonListResult = {
  name: string;
  url: string;
};
