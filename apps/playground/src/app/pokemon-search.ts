import { Component, inject, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokemonStore } from './+state/pokemon.store';
import { JsonPipe } from '@angular/common';

@Component({
  template: `<form>
    <input type="text" [(ngModel)]="query" name="query" />
    @if (loading()) {
    <p>Loading...</p>
    } @if (searchResults(); as results) {
    <pre>
      {{ results | json }}
    </pre
    >
    } @for (card of cards(); track card.name) {
    <pre>{{ card | json }}</pre>
    }
  </form>`,
  imports: [FormsModule, JsonPipe],
})
export default class PokemonSearch {
  pokemonStore = inject(PokemonStore);
  query = this.pokemonStore.searchQuery;
  loading = this.pokemonStore.searchLoading;

  searchResults = this.pokemonStore.searchResult;
  cards = this.pokemonStore.cards;
}
