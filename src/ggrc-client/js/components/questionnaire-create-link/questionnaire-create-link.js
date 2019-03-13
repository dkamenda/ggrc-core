/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './questionnaire-create-link.stache';
import {
  getCreateObjectUrl,
} from '../../plugins/utils/ggrcq-utils';

export default can.Component.extend({
  tag: 'questionnaire-create-link',
  template: can.stache(template),
  viewModel: can.Map.extend({
    define: {
      externalUrl: {
        get() {
          return getCreateObjectUrl(this.attr('model'));
        },
      },
    },
    model: null,
    cssClasses: '',
  }),
});
