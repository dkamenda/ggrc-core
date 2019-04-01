/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './spinner.stache';

export default can.Component.extend({
  tag: 'spinner',
  template: can.stache(template),
  leakScope: true,
  scope: can.Map.extend({
    extraCssClass: '',
    size: '',
    toggle: null,
  }),
});
