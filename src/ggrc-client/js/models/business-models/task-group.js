/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import Cacheable from '../cacheable';
import contactable from '../mixins/contactable';
import Stub from '../stub';

export default Cacheable.extend({
  root_object: 'task_group',
  root_collection: 'task_groups',
  category: 'workflow',
  findAll: 'GET /api/task_groups',
  findOne: 'GET /api/task_groups/{id}',
  create: 'POST /api/task_groups',
  update: 'PUT /api/task_groups/{id}',
  destroy: 'DELETE /api/task_groups/{id}',
  mixins: [contactable],
  attributes: {
    workflow: Stub,
    task_group_tasks: Stub.List,
    tasks: Stub.List,
    task_group_objects: Stub.List,
    objects: Stub.List,
    modified_by: Stub,
    context: Stub,
    end_date: 'date',
  },

  tree_view_options: {
    add_item_view: 'task_groups/tree_add_item',
    mapper_attr_list: [
      {attr_title: 'Summary', attr_name: 'title'},
      {attr_title: 'Assignee', attr_name: 'assignee',
        attr_sort_field: 'contact'},
      {attr_title: 'Description', attr_name: 'description'},
    ],
    disable_columns_configuration: true,
  },

  init: function () {
    let that = this;
    if (this._super) {
      this._super(...arguments);
    }

    this.bind('updated', function (ev, instance) {
      if (instance instanceof that) {
        instance.refresh_all_force('workflow', 'context');
      }
    });
    this.bind('destroyed', function (ev, inst) {
      if (inst instanceof that) {
        inst.refresh_all_force('workflow', 'context');
      }
    });
  },
}, {
  define: {
    title: {
      value: '',
      validate: {
        required: true,
      },
    },
    contact: {
      value: {},
      validate: {
        required: true,
      },
    },
    workflow: {
      value: {},
      validate: {
        required: true,
      },
    },
  },
});
