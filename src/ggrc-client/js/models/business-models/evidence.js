/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Cacheable from '../cacheable';
import {getRole} from '../../plugins/utils/acl-utils';
import accessControlList from '../mixins/access-control-list';
import caUpdate from '../mixins/ca-update';
import Stub from '../stub';

const getAccessControlList = () => {
  let adminRole = getRole('Evidence', 'Admin');

  return adminRole ? [{
    ac_role_id: adminRole.id,
    person: {type: 'Person', id: GGRC.current_user.id},
  }] : [];
};

export default Cacheable.extend({
  root_object: 'evidence',
  root_collection: 'evidence',
  title_singular: 'Evidence',
  title_plural: 'Evidence',
  category: 'governance',
  findAll: 'GET /api/evidence',
  findOne: 'GET /api/evidence/{id}',
  create: 'POST /api/evidence',
  update: 'PUT /api/evidence/{id}',
  destroy: 'DELETE /api/evidence/{id}',
  mixins: [
    accessControlList,
    caUpdate,
  ],
  attributes: {
    context: Stub,
  },
  isRoleable: true,
  statuses: [
    'Active',
    'Deprecated',
  ],
  kinds: [
    {title: 'File', value: 'FILE'},
    {title: 'URL', value: 'URL'},
  ],
  defaults: {
    access_control_list: getAccessControlList(),
    kind: 'FILE',
    status: 'Active',
  },
  tree_view_options: {
    display_attr_names: [
      'title',
      'status',
      'updated_at',
    ],
    attr_list: [
      {attr_title: 'Title', attr_name: 'title'},
      {attr_title: 'Code', attr_name: 'slug'},
      {attr_title: 'State', attr_name: 'status'},
      {attr_title: 'Type', attr_name: 'kind'},
      {attr_title: 'Last Updated By', attr_name: 'modified_by'},
      {attr_title: 'Last Updated Date', attr_name: 'updated_at'},
      {attr_title: 'Last Deprecated Date', attr_name: 'last_deprecated_date'},
      {attr_title: 'Archived', attr_name: 'archived'},
      {
        attr_title: 'Description',
        attr_name: 'description',
        disable_sorting: true,
      }],
  },
  init() {
    this._super(...arguments);
  },
}, {
  define: {
    title: {
      value: '',
      validate: {
        required: true,
      },
    },
  },
  kindTitle() {
    let value = this.attr('kind');
    let title = _.find(this.class.kinds, {value}).title;
    return title;
  },
});
