/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import {
  getPageType,
} from '../../plugins/utils/current-page-utils';
import tracker from '../../tracker';
import {trigger} from 'can-event';

export default can.Map.extend({
  define: {
    expanded: {
      type: Boolean,
      value: false,
    },
  },
  instance: null,
  limitDepthTree: 0,
  itemSelector: '',
  $el: null,
  onExpand: function (event) {
    let isExpanded = this.attr('expanded');

    if (event && isExpanded !== event.state) {
      if (isExpanded !== event.state) {
        this.attr('expanded', event.state);
      }
    } else {
      this.attr('expanded', !isExpanded);
    }
  },
  onClick: function ($element, event) {
    if ($(event.target).is('.link')) {
      event.stopPropagation();
      return;
    }

    let instance = this.attr('instance');

    switch (instance.attr('type')) {
      case 'Cycle':
      case 'CycleTaskGroup':
        if (getPageType() === 'Workflow') {
          this.attr('expanded', !this.attr('expanded'));
          return;
        }
        break;
    }

    this.select($element);
  },
  collapseAndHighlightItem: function () {
    const animationDuration = 2000;
    let el = this.attr('$el');
    this.attr('expanded', false);

    el.addClass('tree-item-refresh-animation')
      .delay(animationDuration)
      .queue((next) => {
        el.removeClass('tree-item-refresh-animation');
        next();
      });
  },
  select: function ($element) {
    let instance = this.attr('instance');
    let itemSelector = this.attr('itemSelector');

    if (instance.type === 'Assessment') {
      tracker.start(instance.type,
        tracker.USER_JOURNEY_KEYS.INFO_PANE,
        tracker.USER_ACTIONS.INFO_PANE.OPEN_INFO_PANE);
    }

    $element = $element.closest(itemSelector);
    trigger.call($element[0], 'selectTreeItem', [$element, instance]);
  },
});
