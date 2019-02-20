/*
 * Copyright (C) 2019 Google Inc.
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import Cacheable from '../cacheable';
import caUpdate from '../mixins/ca-update';
import timeboxed from '../mixins/timeboxed';
import baseNotifications from '../mixins/base-notifications';
import Stub from '../stub';
import Program from './program';

export default Cacheable.extend({
  root_object: 'risk_assessment',
  root_collection: 'risk_assessments',
  category: 'risk_assessment',
  mixins: [caUpdate, timeboxed, baseNotifications],
  findAll: 'GET /api/risk_assessments',
  findOne: 'GET /api/risk_assessments/{id}',
  create: 'POST /api/risk_assessments',
  update: 'PUT /api/risk_assessments/{id}',
  destroy: 'DELETE /api/risk_assessments/{id}',
  is_custom_attributable: true,
  attributes: {
    ra_manager: Stub,
    ra_counsel: Stub,
    context: Stub,
    program: Stub,
    modified_by: Stub,
  },
  tree_view_options: {
    attr_list: [
      {attr_title: 'Title', attr_name: 'title'},
      {attr_title: 'Code', attr_name: 'slug'},
      {attr_title: 'State', attr_name: 'status'},
      {attr_title: 'Start Date', attr_name: 'start_date'},
      {attr_title: 'Last Deprecated Date', attr_name: 'end_date'},
      {
        attr_title: 'Risk Manager',
        attr_name: 'ra_manager',
        attr_sort_field: 'ra_manager',
      },
      {
        attr_title: 'Risk Counsel',
        attr_name: 'ra_counsel',
        attr_sort_field: 'ra_counsel',
      },
    ],
    add_item_view: 'risk_assessments/tree_add_item',
  },
  sub_tree_view_options: {
    default_filter: ['Program'],
  },
  defaults: {
    status: 'Draft',
  },
  statuses: ['Draft', 'Deprecated', 'Active'],
  init: function () {
    this._super && this._super(...arguments);
  },
}, {
  define: {
    title: {
      value: '',
      validate: {
        required: true,
      },
    },
    start_date: {
      value: '',
      validate: {
        required: true,
      },
    },
    end_date: {
      value: '',
      validate: {
        required: true,
      },
    },
  },
  save: function () {
    // Make sure the context is always set to the parent program
    if (!this.context || !this.context.id) {
      this.attr('context', Program.findInCacheById(this.program.id).context);
    }
    return this._super(...arguments);
  },
});
