/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import Permission from '../../permission';
import template from './attach-button.stache';
import {
  getGDriveItemId,
  findGDriveItemById,
} from '../../plugins/utils/gdrive-picker-utils';
import pubSub from '../../pub-sub';

export default can.Component.extend({
  tag: 'attach-button',
  template: can.stache(template),
  confirmationCallback: '',
  leakScope: true,
  viewModel: can.Map.extend({
    define: {
      hasPermissions: {
        get: function (prevValue, setValue) {
          let instance = this.attr('instance');
          if (Permission.is_allowed_for('update', instance) &&
            !instance.attr('archived')) {
            this.checkFolder().always(function () {
              setValue(true);
            });
          } else {
            setValue(false);
          }
        },
      },
      folderId: {
        type: String,
        get() {
          return getGDriveItemId(this.attr('error.message'));
        },
      },
    },
    canAttach: false,
    isFolderAttached: false,
    error: {},
    instance: null,
    isAttachActionDisabled: false,
    onBeforeCreate: function (event) {
      pubSub.dispatch({
        type: 'relatedItemBeforeSave',
        itemType: 'files',
        items: event.items,
      });
    },
    created: function (event) {
      pubSub.dispatch({
        ...event,
        type: 'relatedItemSaved',
        itemType: 'files',
      });
    },
    checkFolder: function () {
      let self = this;

      return this.findFolder().then(function (folder) {
        /*
          during processing of the request to GDrive instance can be updated
          and folder can become null. In this case isFolderAttached value
          should not be updated after request finishing.
        */
        if (folder && self.attr('instance.folder')) {
          self.attr('isFolderAttached', true);
        } else {
          self.attr('isFolderAttached', false);
        }
        self.attr('canAttach', true);
      }, function (err) {
        self.attr('error', err);
        self.attr('canAttach', false);
      });
    },
    findFolder: function () {
      let folderId = this.attr('instance.folder');

      if (!folderId) {
        return $.Deferred().resolve();
      }

      return findGDriveItemById(folderId);
    },
  }),
});
