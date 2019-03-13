/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './info-pane-footer.stache';

/**
 * Specific Info Pane Footer Component
 */
export default can.Component.extend({
  tag: 'info-pane-footer',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    createdAt: '',
    modifiedAt: '',
    modifiedBy: {},
  }),
});
