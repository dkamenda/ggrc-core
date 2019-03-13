/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import '../redirects/proposable-control/proposable-control';
import '../redirects/role-attr-names-provider/role-attr-names-provider';
import template from './editable-people-group-header.stache';

export default can.Component.extend({
  tag: 'editable-people-group-header',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    define: {
      peopleCount: {
        get: function () {
          return this.attr('people.length');
        },
      },
      showEditToolbar: {
        get() {
          return (
            this.attr('canEdit') &&
            !this.attr('editableMode')
          );
        },
      },
    },
    singleUserRole: false,
    editableMode: false,
    isLoading: false,
    canEdit: true,
    required: false,
    redirectionEnabled: false,
    people: [],
    title: '',
    openEditMode: function () {
      this.dispatch('editPeopleGroup');
    },
  }),
});
