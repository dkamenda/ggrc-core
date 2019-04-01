/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

export default can.Map.extend({
  define: {
    emptyListMessage: {
      get: function () {
        return this.attr('showEmptyMessage') ? 'None' : '';
      },
    },
  },
  showEmptyMessage: true,
  required: '',
  people: [],
  groupId: '',
  canUnmap: true,
  instance: {},
  isLoading: false,
  unmapablePerson: function () {
    let required;
    let peopleLength;

    if (!this.attr('canUnmap')) {
      return false;
    }

    required = this.attr('required');
    peopleLength = this.attr('people.length');

    if (required) {
      if (peopleLength > 1) {
        return true;
      }
      return false;
    }
    return true;
  },
  unmap: function (person) {
    this.dispatch({
      type: 'unmap',
      person: person,
      groupId: this.attr('groupId'),
    });
  },
});
