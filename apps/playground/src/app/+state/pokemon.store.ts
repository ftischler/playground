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
  withProps((store, httpClient = inject(HttpClient)) => ({
    _pokemonNamesResource: rxResource({
      loader: () =>
        httpClient.get<PokemonList>(
          'https://pokeapi.co/api/v2/pokemon?limit=10'
        ),
    }),
    _searchResultResource: rxResource({
      request: store._searchQuery,
      loader: ({ request: name }) =>
        httpClient
          .get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${name}`)
          .pipe(map((res) => mapToPokemon(res))),
    }),
    searchQuery: linkedSignal(() => store._searchQuery()),
    httpClient: inject(HttpClient),
  })),
  withComputed((store) => ({
    pokemonNames: computed(() => store._pokemonNamesResource.value()?.results),
  })),
  withProps((store, httpClient = inject(HttpClient)) => ({
    searchResult: store._searchResultResource.value,
    searchLoading: store._searchResultResource.isLoading,
    _cardsResources: rxResource({
      request: () => store.pokemonNames()?.map((p) => p.name) ?? [],
      loader: ({ request: names }) =>
        forkJoin(
          names.map((name) =>
            httpClient
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
