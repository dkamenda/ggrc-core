/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {notifier} from '../../../plugins/utils/notifiers-utils';
import {sanitizer} from '../../../plugins/utils/url-utils';
import Context from '../../../models/service-models/context';
import Evidence from '../../../models/business-models/evidence';

export default can.Component.extend({
  tag: 'create-url',
  leakScope: true,
  viewModel: can.Map.extend({
    value: null,
    context: null,
    create: function () {
      const url = sanitizer(this.attr('value'));

      if (!url.isValid) {
        return;
      }

      let attrs = {
        link: url.value,
        title: url.value,
        context: this.attr('context') || new Context({id: null}),
        kind: 'URL',
      };

      let evidence = new Evidence(attrs);
      this.dispatch({type: 'setEditMode'});
      this.dispatch({type: 'beforeCreate', items: [evidence]});
      evidence.save()
        .fail(() => {
          notifier('error', 'Unable to create URL.');
        })
        .done((data) => {
          this.dispatch({type: 'created', item: data});
          this.clear();
        });
    },
    clear() {
      this.dispatch({type: 'setEditMode'});
      this.attr('value', null);
    },
  }),
});
