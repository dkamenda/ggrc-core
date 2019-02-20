/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import {getPageInstance} from '../../plugins/utils/current-page-utils';
import Cacheable from '../cacheable';

export default Cacheable.extend({
  root_object: 'comment',
  root_collection: 'comments',
  findOne: 'GET /api/comments/{id}',
  findAll: 'GET /api/comments',
  update: 'PUT /api/comments/{id}',
  destroy: 'DELETE /api/comments/{id}',
  create: 'POST /api/comments',
  init: function () {
    if (this._super) {
      this._super(...arguments);
    }
  },
}, {
  define: {
    description: {
      value: '',
      validate: {
        required: true,
      },
    },
  },
  form_preload: function () {
    let pageInstance = getPageInstance();
    this.attr('comment', pageInstance);
  },
  /**
   * Return the "name" of the comment as represented to end users.
   *
   * If the "value" of the comment (i.e. its description) does not exist,
   * an empty string is returned.
   *
   * @return {String} - an end user-friendly "name" of the comment
   */
  display_name: function () {
    return this.description || '';
  },
});

