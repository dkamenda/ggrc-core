/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import '../person/person-data';
import template from './templates/people-group-modal.stache';

export default can.Component.extend({
  tag: 'people-group-modal',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    define: {
      selectedCount: {
        get: function () {
          return `${this
            .attr('people.length')} ${this.attr('title')} Selected`;
        },
      },
    },
    modalState: {
      open: true,
    },
    isLoading: false,
    emptyListMessage: '',
    title: '',
    people: [],
    cancel() {
      this.attr('modalState.open', false);
      this.dispatch('cancel');
    },
    save() {
      this.attr('modalState.open', false);
      this.dispatch('save');
    },
  }),
});
