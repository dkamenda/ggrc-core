/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import Comment from '../../models/service-models/comment';

export default can.Component.extend({
  tag: 'comment-add-button',
  template: can.stache(
    `<button type="button" class="btn btn-small btn-gray"
       on:el:click="createComment()">
       <content></content>
     </button>`
  ),
  leakScope: true,
  viewModel: {
    define: {
      disabled: {
        get: function () {
          return this.attr('isSaving') ||
            !this.attr('value').length ||
            this.attr('isDisabled');
        },
      },
      value: {
        type: 'string',
        value: '',
        set: function (newValue) {
          return newValue || '';
        },
      },
    },
    isDisabled: false,
    isSaving: false,
    createComment: function () {
      let comment;
      let description = this.attr('value');

      if (this.attr('disabled')) {
        return;
      }

      comment = new Comment({
        description: description,
        modified_by: {type: 'Person', id: GGRC.current_user.id},
      });
      // Erase RichText Field after Comment Creation
      this.attr('value', '');

      this.dispatch({
        type: 'commentCreated',
        comment: comment,
      });
    },
  },
});
