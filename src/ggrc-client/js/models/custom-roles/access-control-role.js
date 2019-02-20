/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Cacheable from '../cacheable';

/**
 * A model representing an AccessControl role deifnition.
 *
 * @class
 */
export default Cacheable.extend({
  root_object: 'access_control_role',
  root_collection: 'access_control_roles',
  category: 'access_control_roles',
  findAll: 'GET /api/access_control_roles',
  findOne: 'GET /api/access_control_roles/{id}',
  create: 'POST /api/access_control_roles',
  update: 'PUT /api/access_control_roles/{id}',
  destroy: 'DELETE /api/access_control_roles/{id}',
  attributes: {},
  defaults: {
    read: true,
    update: true,
    'delete': true,
  },
  init: function () {
    this._super(...arguments);
  },
}, {
  define: {
    name: {
      value: '',
      validate: {
        required: true,
      },
    },
  },
  init: function () {
    this._super(...arguments);
  },
});
