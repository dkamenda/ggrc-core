/*
 Copyright (C) 2019 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

export default can.Component.extend({
  tag: 'snapshot-comparer-config',
  leakScope: true,
  viewModel: can.Map.extend({
    define: {
      rightRevision: {
        get() {
          return _.last(this.attr('rightRevisions'));
        },
      },
    },
    instance: {},
    leftRevisionId: '@',
    rightRevisions: [],
    modalTitle: 'Compare with the latest version',
    modalConfirm: 'Update',
    buttonView: `${GGRC.templates_path}/modals/prompt_buttons.stache`,
  }),
});
