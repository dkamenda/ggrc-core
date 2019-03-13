/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './templates/tree-visible-column-checkbox.stache';

export default can.Component.extend({
  tag: 'tree-visible-column-checkbox',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    column: {},
    onChange(attr) {
      attr.attr('selected', !attr.attr('selected'));
    },
  }),
});
