/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './collapsible-panel-header.stache';

/**
 * Collapsible Panel component to add collapsing behavior
 */
export default can.Component.extend({
  tag: 'collapsible-panel-header',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    titleIcon: null,
    expanded: null,
    toggle: function () {
      this.attr('expanded', !this.attr('expanded'));
    },
  }),
});
