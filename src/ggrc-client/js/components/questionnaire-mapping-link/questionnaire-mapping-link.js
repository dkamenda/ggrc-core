/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import template from './questionnaire-mapping-link.stache';
import {
  getMappingUrl,
  getUnmappingUrl,
} from '../../plugins/utils/ggrcq-utils';

export default can.Component.extend({
  tag: 'questionnaire-mapping-link',
  template: can.stache(template),
  leakScope: false,
  viewModel: can.Map.extend({
    define: {
      externalUrl: {
        get() {
          let instance = this.attr('instance');
          let destination = this.attr('destinationModel');

          switch (this.attr('type')) {
            case 'map': {
              return getMappingUrl(instance, destination);
            }
            case 'unmap': {
              return getUnmappingUrl(instance, destination);
            }
          }
        },
      },
    },
    instance: null,
    destinationModel: null,
    cssClasses: '',
    type: 'map',
  }),
});
