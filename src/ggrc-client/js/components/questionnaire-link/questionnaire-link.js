/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {
  getCommentFormUrl,
  getInfoUrl,
  getReviewUrl,
  getChangeLogUrl,
  getProposalsUrl,
  isChangeableExternally,
} from '../../plugins/utils/ggrcq-utils';
import template from './questionnaire-link.stache';

export default can.Component.extend({
  tag: 'questionnaire-link',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    define: {
      url: {
        type: String,
        get: function () {
          const instance = this.attr('instance');
          const linkType = this.attr('linkType');

          switch (linkType) {
            case 'comment':
              return getCommentFormUrl(instance);
            case 'review':
              return getReviewUrl(instance);
            case 'proposals':
              return getProposalsUrl(instance);
            case 'change-log':
              return getChangeLogUrl(instance);
            default:
              return getInfoUrl(instance);
          }
        },
      },
      isChangeableExternally: {
        type: Boolean,
        get: function () {
          const instance = this.attr('instance');

          return isChangeableExternally(instance);
        },
      },
      linkClass: {
        get() {
          const cssClasses = this.attr('cssClasses');

          switch (this.attr('viewType')) {
            case 'button':
              return 'questionnaire-link_type_button btn btn-white btn-small ' +
                cssClasses;
            case 'tab':
              return 'questionnaire-link_type_tab ' + cssClasses;
            default:
              return cssClasses;
          }
        },
      },
    },
    cssClasses: '',
    instance: null,
    iconPosition: 'left',
    linkType: 'info',
    showIcon: false,
    viewType: 'link',
  }),
});
