/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import Cacheable from '../cacheable';
import tracker from '../../tracker';
import caUpdate from '../mixins/ca-update';
import Stub from '../stub';
import {loadPersonProfile} from '../../plugins/utils/user-utils';

export default Cacheable.extend({
  root_object: 'person',
  root_collection: 'people',
  category: 'entities',
  findAll: 'GET /api/people',
  findOne: 'GET /api/people/{id}',
  create: 'POST /api/people',
  update: 'PUT /api/people/{id}',
  destroy: 'DELETE /api/people/{id}',
  is_custom_attributable: true,
  attributes: {
    context: Stub,
    modified_by: Stub,
    language: Stub,
    user_roles: Stub.List,
    name: 'trimmed',
    email: 'trimmedLower',
  },
  mixins: [caUpdate],
  defaults: {
    name: '',
    email: '',
    contact: null,
    owners: null,
  },
  convert: {
    trimmed: function (val) {
      return (val && val.trim) ? val.trim() : val;
    },
    trimmedLower: function (val) {
      return ((val && val.trim) ? val.trim() : val).toLowerCase();
    },
  },
  serialize: {
    trimmed: function (val) {
      return (val && val.trim) ? val.trim() : val;
    },
    trimmedLower: function (val) {
      return ((val && val.trim) ? val.trim() : val).toLowerCase();
    },
  },
  tree_view_options: {
    attr_list: [{
      attr_title: 'Name',
      attr_name: 'title',
    }, {
      attr_title: 'Email',
      attr_name: 'email',
    }, {
      attr_title: 'Authorizations',
      attr_name: 'authorizations',
    }, {
      attr_title: 'Last Updated Date',
      attr_name: 'updated_at',
    }],
    display_attr_names: ['title', 'email', 'authorizations', 'updated_at'],
  },
  list_view_options: {
    find_params: {__sort: 'name,email'},
  },
  sub_tree_view_options: {
    default_filter: ['Program', 'Control', 'Risk', 'Assessment'],
  },
  init: function () {
    this._super(...arguments);
  },
}, {
  define: {
    email: {
      value: '',
      validate: {
        required: true,
        format: {
          pattern:
            /^[-!#$%&*+\\./0-9=?A-Z^_`{|}~]+@([-0-9A-Z]+\.)+([0-9A-Z]){2,4}$/i,
        },
      },
    },
    name: {
      value: '',
      validate: {
        required: true,
      },
    },
  },
  display_name: function () {
    return this.email;
  },
  autocomplete_label: function () {
    return this.name ?
      this.name + '<span class="url-link">' + this.email + '</span>' :
      this.email;
  },
  getWidgetCountForMyWorkPage: function () {
    let url = `/api/people/${this.attr('id')}/my_work_count`;
    const stopFn = tracker.start(
      tracker.FOCUS_AREAS.COUNTS,
      tracker.USER_JOURNEY_KEYS.API,
      tracker.USER_ACTIONS.API.COUNTS_MY_WORK);

    return $.get(url)
      .then((counts) => {
        stopFn();
        return counts;
      }, stopFn.bind(null, true));
  },
  getWidgetCountForAllObjectPage: function () {
    let url = `/api/people/${this.attr('id')}/all_objects_count`;
    const stopFn = tracker.start(
      tracker.FOCUS_AREAS.COUNTS,
      tracker.USER_JOURNEY_KEYS.API,
      tracker.USER_ACTIONS.API.COUNTS_ALL_OBJECTS);

    return $.get(url)
      .then((counts) => {
        stopFn();
        return counts;
      }, stopFn.bind(null, true));
  },
  getTasksCount: function () {
    let url = `/api/people/${this.attr('id')}/task_count`;
    const stopFn = tracker.start(
      tracker.FOCUS_AREAS.COUNTS,
      tracker.USER_JOURNEY_KEYS.API,
      tracker.USER_ACTIONS.API.TASKS_COUNT);

    return $.get(url)
      .then((counts) => {
        stopFn();
        return counts;
      })
      .fail(() => {
        stopFn(true);
        console.warn(`Request on '${url}' failed!`);
      });
  },
  form_preload(newObjectForm) {
    if (newObjectForm) {
      return $.Deferred().resolve();
    }

    return loadPersonProfile(this);
  },
});
