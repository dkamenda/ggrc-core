/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import '../redirects/proposable-control/proposable-control';
import template from './base-inline-control-title.stache';

export default can.Component.extend({
  tag: 'base-inline-control-title',
  template: can.stache(template),
  leakScope: false,
  viewModel: can.Map.extend({
    define: {
      isEditIconAllowed: {
        get: function () {
          return !this.attr('editMode') &&
            !this.attr('isLoading') &&
            !this.attr('isEditIconDenied');
        },
      },
      redirectionAttrName: {
        get() {
          return this.attr('title').trim().toLowerCase().replace(/[\s]+/g, '_');
        },
      },
    },
    instance: null,
    title: '',
    isLoading: false,
    editMode: false,
    isEditIconDenied: false,
    redirectionEnabled: false,
  }),
  events: {
    '.inline-edit-icon click': function () {
      this.viewModel.dispatch('setEditModeInline');
    },
  },
});
