/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './event-item.stache';

export default can.Component.extend({
  tag: 'event-item',
  template: can.stache(template),
  viewModel: can.Map.extend({
    define: {
      hasHiddenRevisions: {
        get() {
          return this.attr('event.revisions_count') > 100;
        },
      },
      hiddenRevisionsCount: {
        get() {
          return this.attr('event.revisions_count') - 100;
        },
      },
    },
    event: null,
  }),
});
