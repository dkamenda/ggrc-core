/*
 Copyright (C) 2019 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

export default can.Component.extend({
  tag: 'restored-revision-comparer-config',
  leakScope: true,
  viewModel: can.Map.extend({
    instance: {},
    rightRevision: {},
    leftRevisionId: '@',
    modalTitle: 'Restore Version: Compare to Current',
    buttonView: `${GGRC.templates_path}/modals/restore_revision.stache`,
    leftRevisionDescription: 'Current version:',
    rightRevisionDescription: 'Revision:',
  }),
});
