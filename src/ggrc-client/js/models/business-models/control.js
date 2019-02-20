/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Cacheable from '../cacheable';
import uniqueTitle from '../mixins/unique-title';
import caUpdate from '../mixins/ca-update';
import timeboxed from '../mixins/timeboxed';
import accessControlList from '../mixins/access-control-list';
import proposable from '../mixins/proposable';
import assertionsCategories from '../mixins/assertions-categories';
import relatedAssessmentsLoader from '../mixins/related-assessments-loader';
import changeableExternally from '../mixins/changeable-externally';
import Stub from '../stub';

export default Cacheable.extend({
  root_object: 'control',
  root_collection: 'controls',
  category: 'governance',
  findAll: 'GET /api/controls',
  findOne: 'GET /api/controls/{id}',
  create: 'POST /api/controls',
  update: 'PUT /api/controls/{id}',
  destroy: 'DELETE /api/controls/{id}',
  mixins: [
    uniqueTitle,
    caUpdate,
    timeboxed,
    accessControlList,
    proposable,
    assertionsCategories,
    relatedAssessmentsLoader,
    changeableExternally,
  ],
  is_custom_attributable: true,
  isRoleable: true,
  attributes: {
    context: Stub,
    modified_by: Stub,
  },
  defaults: {
    selected: false,
    title: '',
    slug: '',
    description: '',
    url: '',
    status: 'Draft',
    send_by_default: true,
    recipients: 'Admin,Control Operators,Control Owners,Other Contacts',
  },
  tree_view_options: {
    attr_list: Cacheable.attr_list.concat([
      {
        attr_title: 'Last Assessment Date',
        attr_name: 'last_assessment_date',
        order: 45, // between State and Primary Contact
      },
      {attr_title: 'Reference URL', attr_name: 'reference_url'},
      {attr_title: 'Effective Date', attr_name: 'start_date'},
      {attr_title: 'Last Deprecated Date', attr_name: 'end_date'},
      {
        attr_title: 'State',
        attr_name: 'status',
        order: 40,
      }, {
        attr_title: 'Kind/Nature',
        attr_name: 'kind',
        attr_sort_field: 'kind',
      },
      {attr_title: 'Fraud Related ', attr_name: 'fraud_related'},
      {attr_title: 'Significance', attr_name: 'significance'},
      {
        attr_title: 'Type/Means',
        attr_name: 'means',
        attr_sort_field: 'means',
      },
      {
        attr_title: 'Frequency',
        attr_name: 'verify_frequency',
      },
      {attr_title: 'Assertions', attr_name: 'assertions'},
      {attr_title: 'Categories', attr_name: 'categories'},
      {
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
        attr_title: 'Review Status',
        attr_name: 'external_review_status',
        attr_sort_field: 'review_status_display_name',
        order: 80,
      }]),
    display_attr_names: ['title', 'status', 'last_assessment_date',
      'updated_at'],
    show_related_assessments: true,
  },
  sub_tree_view_options: {
    default_filter: ['Objective'],
  },
  statuses: ['Draft', 'Deprecated', 'Active'],
  fraudRelatedOptions:
    [{title: 'No', value: false}, {title: 'Yes', value: true}],
  keyControlOptions:
    [{title: 'Non-Key', value: false}, {title: 'Key', value: true}],
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
    assertions: {
      value: [],
      validate: {
        required: true,
      },
    },
  },
  init: function () {
    this._super(...arguments);
    this.bind('refreshInstance', this.refresh.bind(this));
  },
});
