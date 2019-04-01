/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './loading-status.stache';

export default can.Component.extend({
  tag: 'loading-status',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    define: {
      showSpinner: {
        type: 'boolean',
        value: false,
      },
      alwaysShowText: {
        type: 'boolean',
        value: false,
      },
      isLoading: {
        type: 'boolean',
        value: false,
      },
    },
    loadingText: '',
  }),
});
