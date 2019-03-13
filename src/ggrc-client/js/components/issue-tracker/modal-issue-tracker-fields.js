/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import '../dropdown/dropdown';
import '../numberbox/numberbox';
import template from './templates/modal-issue-tracker-fields.stache';

export default can.Component.extend({
  tag: 'modal-issue-tracker-fields',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    instance: {},
    note: '',
    linkingNote: '',
    setIssueTitle: false,
    allowToChangeId: false,
    isTicketIdMandatory: false,
    setTicketIdMandatory() {
      let instance = this.attr('instance');

      if (instance.class.model_singular === 'Issue') {
        this.attr('isTicketIdMandatory',
          ['Fixed', 'Fixed and Verified', 'Deprecated']
            .includes(instance.attr('status')));
      }
    },
  }),
  events: {
    inserted() {
      this.viewModel.setTicketIdMandatory();
    },
    '{viewModel.instance} status'() {
      this.viewModel.setTicketIdMandatory();
    },
  },
});
