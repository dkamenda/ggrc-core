/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

export default can.Component.extend({
  tag: 'action-toolbar-control',
  template: can.stache(
    `<div class="action-toolbar__controls-item">
       <content></content>
     </div>`
  ),
  leakScope: true,
  viewModel: can.Map.extend({}),
});

