/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

export default can.Component.extend({
  tag: 'sort',
  leakScope: true,
  viewModel: can.Map.extend({
    sortedItems: [],
    items: [],
    sort() {
      const items = this.attr('items');
      const sortedItems = items.sort(items);
      this.attr('sortedItems', sortedItems);
    },
  }),
  events: {
    '{viewModel.items} change'() {
      this.viewModel.sort();
    },
    inserted() {
      this.viewModel.sort();
    },
  },
});
