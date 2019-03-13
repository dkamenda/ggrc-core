/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import template from './templates/tree-field.stache';
import {getTruncatedList} from '../../plugins/ggrc_utils';

export default can.Component.extend({
  tag: 'tree-field',
  template: can.stache(template),
  viewModel: can.Map.extend({
    define: {
      tooltipContent: {
        get() {
          let source = this.attr('source');
          return getTruncatedList(source);
        },
      },
    },
    showTooltip: true,
    source: [],
  }),
});
