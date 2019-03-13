/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import * as businessModels from '../../models/business-models';
import template from './business-object-list-item.stache';

/**
 * Mapped objects item view component
 */
export default can.Component.extend({
  tag: 'business-object-list-item',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    instance: {},
    define: {
      type: {
        type: String,
      },
      isSnapshot: {
        get() {
          return this.attr('instance.type') === 'Snapshot';
        },
      },
      iconCls: {
        get() {
          const objectType = !this.attr('isSnapshot') ?
            this.attr('instance.type') :
            this.attr('instance.child_type');
          const model = businessModels[objectType];
          return `fa-${model.table_singular}`;
        },
      },
      itemData: {
        get() {
          return !this.attr('isSnapshot') ?
            this.attr('instance') :
            this.attr('instance.revision.content');
        },
      },
      itemTitle: {
        get() {
          return this.attr('itemData.title') ||
            this.attr('itemData.description_inline') ||
            this.attr('itemData.name') ||
            this.attr('itemData.email') ||
            '<span class="empty-message">None</span>';
        },
      },
    },
  }),
});
