/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './add-object-button.stache';

export default can.Component.extend({
  tag: 'add-object-button',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    instance: null,
    linkclass: '@',
    content: '@',
    text: '@',
    singular: '@',
    plural: '@',
  }),
});
