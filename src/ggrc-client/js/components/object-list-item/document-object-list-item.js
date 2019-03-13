/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './document-object-list-item.stache';
import '../spinner/spinner';

/**
 * Simple component to show Document-like Objects
 */
export default can.Component.extend({
  tag: 'document-object-list-item',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    instance: {},
    define: {
      showIcon: {
        type: 'boolean',
        value: false,
      },
      iconCls: {
        get: function () {
          return this.attr('showIcon') ?
            'fa-' + this.attr('itemData.title').toLowerCase() :
            '';
        },
      },
      itemData: {
        get: function () {
          return this.attr('instance');
        },
      },
      itemTitle: {
        get: function () {
          return this.attr('itemData.title') || this.attr('itemData.link');
        },
      },
      itemCreationDate: {
        get: function () {
          return this.attr('itemData.created_at');
        },
      },
    },
  }),
});
