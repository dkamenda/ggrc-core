/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import '../../assessment/info-pane/confirm-edit-action';
import template from './templates/info-pane-issue-tracker-fields.stache';

export default can.Component.extend({
  tag: 'info-pane-issue-tracker-fields',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    instance: {},
  }),
});
