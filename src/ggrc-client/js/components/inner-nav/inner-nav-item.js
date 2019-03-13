/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */
import template from './inner-nav-item.stache';

export default can.Component.extend({
  tag: 'inner-nav-item',
  leakScope: false,
  template: can.stache(template),
  viewModel: can.Map.extend({
    define: {
      displayTab: {
        get() {
          let widget = this.attr('widget');

          return widget.attr('count') ||
              widget.attr('uncountable') ||
              widget.attr('forceShow') ||
              this.attr('showAllTabs') ||
              widget.attr('inForceShowList');
        },
      },
      showCloseButton: {
        get() {
          return !this.attr('widget.count')
            && !this.attr('widget.uncountable')
            && !this.attr('showAllTabs')
            && !this.attr('widget.inForceShowList');
        },
      },
      isActive: {
        get() {
          return this.attr('widget') === this.attr('activeWidget');
        },
      },
    },
    widget: null,
    showTitle: true,
    activeWidget: null,
    showAllTabs: false,
    closeTab() {
      this.dispatch({
        type: 'close',
        widget: this.attr('widget'),
      });

      // prevent click propagation
      return false;
    },
  }),
});
