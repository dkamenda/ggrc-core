/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './inner-nav-collapse.stache';

export default can.Component.extend({
  tag: 'inner-nav-collapse',
  leakScope: false,
  template: can.stache(template),
  viewModel: can.Map.extend({
    title: null,
    expanded: true,
    toggle() {
      let expanded = this.attr('expanded');
      this.attr('expanded', !expanded);
    },
  }),
});
