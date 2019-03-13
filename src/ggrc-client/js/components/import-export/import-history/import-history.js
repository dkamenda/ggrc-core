/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './import-history.stache';

export default can.Component.extend({
  tag: 'import-history',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    history: [],
    remove(id) {
      this.dispatch({
        type: 'removeItem',
        id,
      });
    },
    download(id, title) {
      this.dispatch({
        type: 'downloadCsv',
        id,
        title,
      });
    },
  }),
});
