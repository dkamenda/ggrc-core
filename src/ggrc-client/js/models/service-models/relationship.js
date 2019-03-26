/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Cacheable from '../cacheable';
import Stub from '../stub';
import {trigger} from 'can-event';

export default Cacheable.extend({
  root_object: 'relationship',
  root_collection: 'relationships',
  attributes: {
    context: Stub,
    modified_by: Stub,
    source: Stub,
    destination: Stub,
  },
  defaults: {
    source: null,
    destination: null,
  },
  findRelationship: async function (source, destination) {
    // defaultType is a Relationship mapping and since we no longer have
    // related_source/related_destinations on the FE we need to make
    // 2 or 3 requests to find the correct relationship object to delete.
    // 1. Try fetching a relationship where this.source is the source
    //    and this.destination is the destination.
    // 2. If 1. did not give a result, we try the opposite, where
    //    this.source is the destination and this.destination is
    //    the source.
    // 3. We then have to do a refresh to get the ETAG before we can do
    //    the DELETE.
    // This code can be simplified once we add a /relationships/unmap API
    let relationship = await this._findRelationship(source, destination);
    if (!relationship.length) {
      relationship = await this._findRelationship(destination, source);
    }
    if (!relationship.length) {
      return null;
    }
    return relationship[0].refresh();
  },
  _findRelationship: async function (source, destination) {
    return this.findAll({
      source_id: source.attr('id'),
      source_type: source.attr('type'),
      destination_id: destination.attr('id'),
      destination_type: destination.attr('type')});
  },
  findAll: 'GET /api/relationships',
  create: 'POST /api/relationships',
  update: 'PUT /api/relationships/{id}',
  destroy: 'DELETE /api/relationships/{id}',
}, {
  unmap: function (cascade) {
    return $.ajax({
      type: 'DELETE',
      url: '/api/relationships/' + this.attr('id') +
        '?cascade=' + cascade,
    })
      .done(function () {
        trigger.call(this.constructor, 'destroyed', this);
      }.bind(this));
  },
});
