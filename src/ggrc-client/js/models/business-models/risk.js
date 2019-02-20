/*
 * Copyright (C) 2019 Google Inc.
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import Cacheable from '../cacheable';
import uniqueTitle from '../mixins/unique-title';
import caUpdate from '../mixins/ca-update';
import accessControlList from '../mixins/access-control-list';
import baseNotifications from '../mixins/base-notifications';
import proposable from '../mixins/proposable';
import Stub from '../stub';

export default Cacheable.extend({
  root_object: 'risk',
  root_collection: 'risks',
  category: 'risk',
  findAll: 'GET /api/risks',
  findOne: 'GET /api/risks/{id}',
  create: 'POST /api/risks',
  update: 'PUT /api/risks/{id}',
  destroy: 'DELETE /api/risks/{id}',
  mixins: [
    uniqueTitle,
    caUpdate,
    accessControlList,
    baseNotifications,
    proposable,
  ],
  is_custom_attributable: true,
  isRoleable: true,
  attributes: {
    context: Stub,
    modified_by: Stub,
  },
  tree_view_options: {
    attr_list: Cacheable.attr_list.concat([
      {attr_title: 'Reference URL', attr_name: 'reference_url', order: 85},
      {attr_title: 'Last Deprecated Date', attr_name: 'end_date', order: 110},
      {
        attr_title: 'State',
        attr_name: 'status',
        order: 40,
      }, {
        attr_title: 'Description',
        attr_name: 'description',
        disable_sorting: true,
        order: 90,
      }, {
        attr_title: 'Risk Type',
        attr_name: 'risk_type',
        disable_sorting: true,
        order: 95,
      }, {
        attr_title: 'Threat Source',
        attr_name: 'threat_source',
        disable_sorting: true,
        order: 96,
      }, {
        attr_title: 'Threat Event',
        attr_name: 'threat_event',
        disable_sorting: true,
        order: 97,
      }, {
        attr_title: 'Vulnerability',
        attr_name: 'vulnerability',
        disable_sorting: true,
        order: 98,
      }, {
        attr_title: 'Notes',
        attr_name: 'notes',
        disable_sorting: true,
        order: 100,
      }, {
        attr_title: 'Assessment Procedure',
        attr_name: 'test_plan',
        disable_sorting: true,
        order: 105,
      }, {
        attr_title: 'Review State',
        attr_name: 'review_status',
        order: 80,
      }]),
  },
  sub_tree_view_options: {
    default_filter: ['Control'],
  },
  defaults: {
    status: 'Draft',
  },
  statuses: ['Draft', 'Deprecated', 'Active'],
  init: function () {
    if (this._super) {
      this._super(...arguments);
    }
  },
}, {
  define: {
    title: {
      value: '',
      validate: {
        required: true,
        validateUniqueTitle: true,
      },
    },
    _transient_title: {
      value: '',
      validate: {
        validateUniqueTitle: true,
      },
    },
    description: {
      value: '',
      validate: {
        required: true,
      },
    },
    risk_type: {
      value: '',
      validate: {
        required: true,
      },
    },
  },
});
