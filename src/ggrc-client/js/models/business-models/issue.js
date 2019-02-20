/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Cacheable from '../cacheable';
import caUpdate from '../mixins/ca-update';
import timeboxed from '../mixins/timeboxed';
import accessControlList from '../mixins/access-control-list';
import baseNotifications from '../mixins/base-notifications';
import issueTracker from '../mixins/issue-tracker';
import Stub from '../stub';

export default Cacheable.extend({
  root_object: 'issue',
  root_collection: 'issues',
  category: 'governance',
  findOne: 'GET /api/issues/{id}',
  findAll: 'GET /api/issues',
  update: 'PUT /api/issues/{id}',
  destroy: 'DELETE /api/issues/{id}',
  create: 'POST /api/issues',
  mixins: [
    caUpdate,
    timeboxed,
    accessControlList,
    baseNotifications,
    issueTracker,
  ],
  is_custom_attributable: true,
  isRoleable: true,
  attributes: {
    context: Stub,
  },
  tree_view_options: {
    attr_list: Cacheable.attr_list.concat([
      {attr_title: 'Reference URL', attr_name: 'reference_url'},
      {attr_title: 'Effective Date', attr_name: 'start_date'},
      {attr_title: 'Last Deprecated Date', attr_name: 'end_date'},
      {attr_title: 'Due Date', attr_name: 'due_date'},
      {
        attr_title: 'State',
        attr_name: 'status',
        order: 40,
      }, {
        attr_title: 'Ticket Tracker',
        attr_name: 'issue_url',
        deny: !GGRC.ISSUE_TRACKER_ENABLED,
      },
      {
        attr_title: 'Description',
        attr_name: 'description',
        disable_sorting: true,
      }, {
        attr_title: 'Notes',
        attr_name: 'notes',
        disable_sorting: true,
      }, {
        attr_title: 'Remediation Plan',
        attr_name: 'test_plan',
        disable_sorting: true,
      }]),
    display_attr_names: ['title', 'Admin', 'status', 'updated_at'],
  },
  sub_tree_view_options: {
    default_filter: ['Control', 'Control_version'],
  },
  defaults: {
    status: 'Draft',
  },
  statuses: ['Draft', 'Deprecated', 'Active', 'Fixed', 'Fixed and Verified'],
  buildIssueTrackerConfig(instance) {
    return {
      hotlist_id: '1498476',
      component_id: '398781',
      issue_severity: 'S2',
      issue_priority: 'P2',
      issue_type: 'PROCESS',
      title: instance.title || '',
      enabled: instance.isNew(),
    };
  },
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
      },
    },
    issue_tracker: {
      value: {},
      validate: {
        validateIssueTracker: true,
        validateIssueTrackerTitle: true,
        validateIssueTrackerIssueId: true,
      },
    },
  },
});
