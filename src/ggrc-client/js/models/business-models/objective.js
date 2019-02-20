/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Cacheable from '../cacheable';
import uniqueTitle from '../mixins/unique-title';
import caUpdate from '../mixins/ca-update';
import accessControlList from '../mixins/access-control-list';
import baseNotifications from '../mixins/base-notifications';
import relatedAssessmentsLoader from '../mixins/related-assessments-loader';
import Stub from '../stub';

export default Cacheable.extend({
  root_object: 'objective',
  root_collection: 'objectives',
  category: 'objectives',
  title_singular: 'Objective',
  title_plural: 'Objectives',
  findAll: 'GET /api/objectives',
  findOne: 'GET /api/objectives/{id}',
  create: 'POST /api/objectives',
  update: 'PUT /api/objectives/{id}',
  destroy: 'DELETE /api/objectives/{id}',
  mixins: [
    uniqueTitle,
    caUpdate,
    accessControlList,
    baseNotifications,
    relatedAssessmentsLoader,
  ],
  is_custom_attributable: true,
  isRoleable: true,
  attributes: {
    context: Stub,
    modified_by: Stub,
  },
  tree_view_options: {
    attr_list: Cacheable.attr_list.concat([
      {
        attr_title: 'Last Assessment Date',
        attr_name: 'last_assessment_date',
        order: 45, // between State and Primary Contact
      },
      {attr_title: 'Effective Date', attr_name: 'start_date'},
      {attr_title: 'Last Deprecated Date', attr_name: 'last_deprecated_date'},
      {attr_title: 'Reference URL', attr_name: 'reference_url'},
      {
        attr_title: 'State',
        attr_name: 'status',
        order: 40,
      }, {
        attr_title: 'Description',
        attr_name: 'description',
        disable_sorting: true,
      }, {
        attr_title: 'Notes',
        attr_name: 'notes',
        disable_sorting: true,
      }, {
        attr_title: 'Assessment Procedure',
        attr_name: 'test_plan',
        disable_sorting: true,
      }, {
        attr_title: 'Review State',
        attr_name: 'review_status',
        order: 80,
      }]),
    display_attr_names: ['title', 'status', 'last_assessment_date',
      'updated_at'],
    show_related_assessments: true,
  },
  sub_tree_view_options: {
    default_filter: ['Control'],
  },
  defaults: {
    status: 'Draft',
  },
  statuses: ['Draft', 'Deprecated', 'Active'],
  init: function () {
    this._super(...arguments);
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
  },
});
