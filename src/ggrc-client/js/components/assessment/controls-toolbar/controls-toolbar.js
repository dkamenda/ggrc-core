/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import '../../custom-attributes/custom-attributes-actions';
import '../../object-state-toolbar/object-state-toolbar';
import template from './controls-toolbar.stache';

export default can.Component.extend({
  tag: 'assessment-controls-toolbar',
  template: can.stache(template),
  leakScope: true,
  viewModel: can.Map.extend({
    instance: null,
    verifiers: [],
    isInfoPaneSaving: false,
    isUndoButtonVisible: false,
    currentState: '',
    onStateChange: function (event) {
      this.dispatch({
        type: 'onStateChange',
        state: event.state,
        undo: event.undo,
      });
    },
  }),
});
