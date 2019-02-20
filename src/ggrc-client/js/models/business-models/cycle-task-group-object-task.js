/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Cacheable from '../cacheable';
import CycleTaskGroup from './cycle-task-group';
import Workflow from './workflow';
import {REFRESH_SUB_TREE} from '../../events/eventTypes';
import {getPageType} from '../../plugins/utils/current-page-utils';
import {getClosestWeekday} from '../../plugins/utils/date-utils';
import timeboxed from '../mixins/timeboxed';
import isOverdue from '../mixins/is-overdue';
import accessControlList from '../mixins/access-control-list';
import caUpdate from '../mixins/ca-update';
import cycleTaskNotifications from '../mixins/cycle-task-notifications';
import Stub from '../stub';
import {reify} from '../../plugins/utils/reify-utils';

function populateFromWorkflow(form, workflow) {
  if (!workflow || typeof workflow === 'string') {
    // We need to invalidate the form, so we remove workflow and dependencies
    // if it's not set
    form.removeAttr('workflow');
    form.removeAttr('context');
    form.removeAttr('cycle');
    form.removeAttr('cycle_task_group');
    return;
  }

  workflow = Workflow.findInCacheById(workflow.id);

  if (typeof workflow.cycles === undefined || !workflow.cycles) {
    $(document.body).trigger(
      'ajax:flash',
      {warning: 'No cycles in the workflow!'}
    );
    return;
  }

  workflow.refresh_all('cycles').then(function (cycleList) {
    let activeCycleList = _.filter(cycleList, {is_current: true});
    let activeCycle;

    if (!activeCycleList.length) {
      $(document.body).trigger(
        'ajax:flash',
        {warning: 'No active cycles in the workflow!'}
      );
      return;
    }
    activeCycleList = _.orderBy(
      activeCycleList, ['start_date'], ['desc']);
    activeCycle = activeCycleList[0];
    form.attr('workflow', {id: workflow.id, type: 'Workflow'});
    form.attr('context', {id: workflow.context.id, type: 'Context'});
    form.attr('cycle', {id: activeCycle.id, type: 'Cycle'});

    // reset cycle task group after workflow updating
    form.removeAttr('cycle_task_group');
  });
}

export default Cacheable.extend({
  root_object: 'cycle_task_group_object_task',
  root_collection: 'cycle_task_group_object_tasks',
  mixins: [
    timeboxed,
    isOverdue,
    accessControlList,
    caUpdate,
    cycleTaskNotifications,
  ],
  category: 'workflow',
  findAll: 'GET /api/cycle_task_group_object_tasks',
  findOne: 'GET /api/cycle_task_group_object_tasks/{id}',
  create: 'POST /api/cycle_task_group_object_tasks',
  update: 'PUT /api/cycle_task_group_object_tasks/{id}',
  destroy: 'DELETE /api/cycle_task_group_object_tasks/{id}',
  title_singular: 'Cycle Task',
  title_plural: 'Cycle Tasks',
  name_singular: 'Task',
  name_plural: 'Tasks',
  attributes: {
    cycle_task_group: Stub,
    task_group_task: Stub,
    modified_by: Stub,
    context: Stub,
    cycle: Stub,
  },
  tree_view_options: {
    add_item_view: 'cycle_task_group_object_tasks/tree_add_item',
    attr_list: [
      {
        attr_title: 'Task Title',
        attr_name: 'title',
        attr_sort_field: 'task title',
      },
      {
        attr_title: 'Cycle Title',
        attr_name: 'workflow',
        attr_sort_field: 'cycle title',
      },
      {
        attr_title: 'Task State',
        attr_name: 'status',
        attr_sort_field: 'task state',
      },
      {
        attr_title: 'Task Start Date',
        attr_name: 'start_date',
        attr_sort_field: 'task start date',
      },
      {
        attr_title: 'Task Due Date',
        attr_name: 'end_date',
        attr_sort_field: 'task due date',
      },
      {
        attr_title: 'Task Last Updated Date',
        attr_name: 'updated_at',
        attr_sort_field: 'task last updated date',
      },
      {
        attr_title: 'Task Last Updated By',
        attr_name: 'modified_by',
        attr_sort_field: 'task last updated by',
      },
      {
        attr_title: 'Task Last Deprecated Date',
        attr_name: 'last_deprecated_date',
        attr_sort_field: 'task last deprecated date',
      },
      {
        attr_title: 'Task Description',
        attr_name: 'description',
        disable_sorting: true,
      },
      {
        attr_title: 'Needs Verification',
        attr_name: 'is_verification_needed',
        attr_sort_field: 'needs verification',
      },
    ],
    display_attr_names: ['title',
      'status',
      'Task Assignees',
      'start_date',
      'end_date',
      'is_verification_needed',
    ],
    mandatory_attr_name: ['title'],
  },
  sub_tree_view_options: {
    default_filter: ['Control'],
  },
  init: function () {
    this._super(...arguments);

    this.bind('created', (ev, instance) => {
      if (
        instance instanceof this &&
        getPageType() === 'Workflow'
      ) {
        const ctgId = instance.attr('cycle_task_group.id');
        const ctg = CycleTaskGroup.findInCacheById(ctgId);

        if (!ctg) {
          return;
        }

        ctg.dispatch(REFRESH_SUB_TREE);

        // All set's status is dependant on newly created Cycle Task,
        // thus needs to refresh all after new CT was created.
        // Example: Cycle, Cycle Task Group and Cycle Task are
        // in FINISHED state, create new CT: Cycle, CTG should
        // change status to In Progress.
        instance.refresh_all_force('cycle_task_group', 'cycle', 'workflow');
      }
    });

    this.bind('updated', (ev, instance) => {
      // update related objects, if current page is Workflow
      if (
        instance instanceof this &&
        getPageType() === 'Workflow'
      ) {
        instance.refresh_all_force('cycle_task_group', 'cycle', 'workflow');
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
    workflow: {
      value: null,
      validate: {
        required: true,
      },
    },
    cycle: {
      value: null,
      validate: {
        required: true,
      },
    },
    cycle_task_group: {
      value: null,
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
    access_control_list: {
      value: [],
      validate: {
        validateAssignee: 'CycleTaskGroupObjectTask',
      },
    },
  },
  _workflow: function () {
    return this.refresh_all('cycle', 'workflow').then(function (workflow) {
      return workflow;
    });
  },
  set_properties_from_workflow: function (workflow) {
    // The form sometimes returns plaintext instead of object,
    // return in that case
    // If workflow is empty form should be invalidated
    if (typeof workflow === 'string' && workflow !== '') {
      return;
    }
    populateFromWorkflow(this, workflow);
  },
  form_preload: function (newObjectForm, objectParams) {
    let form = this;
    let cycle;
    let startDate;
    let endDate;

    if (newObjectForm) {
      // prepopulate dates with default ones
      startDate = getClosestWeekday(new Date());
      endDate = getClosestWeekday(moment().add({month: 3}).toDate());

      this.attr('start_date', startDate);
      this.attr('end_date', endDate);

      // if we are creating a task from the workflow page, the preset
      // workflow should be that one
      if (objectParams && objectParams.workflow !== undefined) {
        populateFromWorkflow(form, objectParams.workflow);
        return;
      }
    } else {
      cycle = reify(form.cycle);
      if (!_.isUndefined(cycle.workflow)) {
        form.attr('workflow', reify(cycle.workflow));
      }
    }
  },
  object: function () {
    return this.refresh_all(
      'task_group_object', 'object'
    ).then(function (object) {
      return object;
    });
  },

  /**
   * Determine whether the Task's response options can be edited, taking
   * the Task and Task's Cycle status into account.
   *
   * @return {Boolean} - true if editing response options is allowed,
   *   false otherwise
   */
  responseOptionsEditable: function () {
    const cycle = reify(this.attr('cycle'));
    const status = this.attr('status');

    return cycle.attr('is_current') &&
      !_.includes(['Finished', 'Verified'], status);
  },
});
