/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './collapsible-panel-body.stache';

/**
 * Collapsible Panel component to add collapsing behavior
 */
export default can.Component.extend({
  tag: 'collapsible-panel-body',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    renderContent: function () {
      return this.attr('softMode') || this.attr('expanded');
    },
    softMode: false,
    expanded: null,
  }),
});
