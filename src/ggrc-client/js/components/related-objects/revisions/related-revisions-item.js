/*
 Copyright (C) 2019 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import '../../diff/instance-fields-diff';
import '../../diff/instance-acl-diff';
import '../../diff/instance-gca-diff';
import '../../diff/instance-mapping-fields-diff';
import '../../diff/instance-list-fields-diff';
import '../../revision-history/restored-revision-comparer-config';
import {getPersonInfo} from '../../../plugins/utils/user-utils';
import template from './templates/related-revisions-item.stache';

export default can.Component.extend({
  tag: 'related-revisions-item',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    define: {
      revision: {
        set(newValue, setValue) {
          if (!newValue) {
            return;
          }

          getPersonInfo(newValue.modified_by).then((person) => {
            this.attr('modifiedBy', person);
          });

          setValue(newValue);
        },
      },
      isCreated: {
        get() {
          return this.attr('revision.action') === 'created';
        },
      },
    },
    instance: {},
    modifiedBy: {},
    lastRevision: {},
  }),
});
