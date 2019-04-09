/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {
  simpleFieldResolver,
  customAttributeResolver,
} from './conflict-resolvers';
import {notifierXHR} from '../../plugins/utils/notifiers-utils';

export function tryResolveConflictValues(baseAttrs, attrs, remoteAttrs, obj) {
  let hasConflict = false;

  Object.keys(baseAttrs).forEach((key) => {
    let unableToResolve = false;

    switch (key) {
      // We skip the updated_at key because we know it has changed
      case 'updated_at':
        break;
      // We have a special way for customAttributes because it is nested field
      case 'custom_attribute_values':
        unableToResolve = customAttributeResolver(
          baseAttrs[key],
          attrs[key],
          remoteAttrs[key],
          obj.attr(key));
        break;
      default:
        unableToResolve = simpleFieldResolver(
          baseAttrs,
          attrs,
          remoteAttrs,
          obj,
          key);
    }

    hasConflict = hasConflict || unableToResolve;
  });

  return hasConflict;
}

export default function resolveConflict(xhr, obj) {
  let attrs = _.merge({}, obj.attr());
  let baseAttrs = _.merge({}, obj._backupStore()) || {};

  return obj.refresh().then(function (obj) {
    let stillHasConflict = false;
    let remoteAttrs = _.merge({}, obj.attr());

    if (_.isEqual(remoteAttrs, attrs)) {
      // current state is same as server state -- do nothing.
      return obj;
    } else if (_.isEqual(remoteAttrs, baseAttrs)) {
      // base state matches server state -- no incorrect expectations -- save.
      return obj.attr(attrs).save();
    }
    // check what properties changed -- we can merge if the same prop wasn't changed on both
    stillHasConflict =
      tryResolveConflictValues(baseAttrs, attrs, remoteAttrs, obj);
    if (stillHasConflict) {
      notifierXHR('warning', {status: 409});
      xhr.remoteObject = remoteAttrs;
      return new $.Deferred().reject(xhr, 409, 'CONFLICT');
    }

    return obj.save();
  });
}
