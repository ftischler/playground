import {
  patchState,
  signalMethod,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { computed, inject, linkedSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokemonList } from '../models/pokemon-list';
import { mapToPokemon, Pokemon } from '../models/pokemon';
import { forkJoin, map } from 'rxjs';

export const PokemonStore = signalStore(
  {
    providedIn: 'root',
  },
  withState({
    _searchQuery: 'pikachu',
  }),
  withProps(() => ({
    _httpClient: inject(HttpClient),
  })),
  withProps(({ _httpClient, ...store }) => ({
    _pokemonNamesResource: rxResource({
      loader: () =>
        _httpClient.get<PokemonList>(
          'https://pokeapi.co/api/v2/pokemon?limit=10'
        ),
    }),
    _searchResultResource: rxResource({
      request: store._searchQuery,
      loader: ({ request: name }) =>
        _httpClient
          .get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${name}`)
          .pipe(map((res) => mapToPokemon(res))),
    }),
    searchQuery: linkedSignal(() => store._searchQuery()),
  })),
  withComputed((store) => ({
    pokemonNames: computed(() => store._pokemonNamesResource.value()?.results),
  })),
  withProps(({ _httpClient, ...store }) => ({
    searchResult: store._searchResultResource.value,
    searchLoading: store._searchResultResource.isLoading,
    _cardsResources: rxResource({
      request: () => store.pokemonNames()?.map((p) => p.name) ?? [],
      loader: ({ request: names }) =>
        forkJoin(
          names.map((name) =>
            _httpClient
              .get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${name}`)
              .pipe(map((res) => mapToPokemon(res)))
          )
        ),
    }),
  })),
  withProps((store) => ({
    cards: store._cardsResources.value,
    cardsLoading: store._cardsResources.isLoading,
  })),
  withMethods((store) => ({
    loadPokemonNames: () => store._pokemonNamesResource.reload(),
    search: signalMethod<string>((searchQuery: string) =>
      patchState(store, { _searchQuery: searchQuery.trim().toLowerCase() })
    ),
  })),
  withHooks((store) => ({
    onInit: () => {
      store.loadPokemonNames();
      store.search(store.searchQuery);
    },
  }))
);
