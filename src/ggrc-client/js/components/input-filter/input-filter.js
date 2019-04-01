/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './templates/input-filter.stache';

export default can.Component.extend({
  tag: 'input-filter',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    value: '',
    excludeSymbols: '',
    placeholder: '',
    name: '',
    tabindex: 0,
    autofocus: false,
    exclude(value, symbols) {
      const regex = new RegExp(`[${symbols}]`, 'gi');

      return value.replace(regex, '');
    },
    cleanUpInput(el) {
      const excludeSymbols = this.attr('excludeSymbols');
      const originalValue = el.val();
      const result = this.exclude(originalValue, excludeSymbols);

      el.val(result);
    },
  }),
  events: {
    '.input-filter input'(el) {
      this.viewModel.cleanUpInput(el);
    },
  },
});
