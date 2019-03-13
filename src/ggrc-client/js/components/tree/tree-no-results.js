/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './templates/tree-no-results.stache';

export default can.Component.extend({
  tag: 'tree-no-results',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    define: {
      text: {
        value: 'No results, please check your filter criteria',
        set: function (value) {
          return value || 'No results...';
        },
      },
      show: {
        set: function (value) {
          return value || false;
        },
      },
    },
  }),
});
