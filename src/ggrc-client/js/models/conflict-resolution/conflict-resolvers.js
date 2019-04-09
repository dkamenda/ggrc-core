/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

export function buildChangeDescriptor(
  previousValue,
  currentValue,
  remoteValue) {
  // The object attribute was changed on the server
  let isChangedOnServer = !_.isEqual(previousValue, remoteValue);
  // The object attribute was changed on the client
  let isChangedLocally = !_.isEqual(previousValue, currentValue);
  // The change on the server was not the same as the change on the client
  let isDifferent = !_.isEqual(currentValue, remoteValue);

  let hasConflict = (isChangedOnServer && isChangedLocally && isDifferent);

  return {
    hasConflict,
    isChangedLocally,
  };
}

export function simpleFieldResolver(
  baseAttrs = {},
  attrs = {},
  remoteAttrs = {},
  container,
  key,
  rootKey) {
  let previousValue = _.get(baseAttrs, key);
  let currentValue = _.get(attrs, key);
  let remoteValue = _.get(remoteAttrs, key);

  let {hasConflict, isChangedLocally} = buildChangeDescriptor(
    previousValue,
    currentValue,
    remoteValue);

  if (isChangedLocally) {
    let path = rootKey || key;
    let currentRoot = _.get(attrs, path);
    container.attr(path, currentRoot);
  }

  return hasConflict;
}


export function customAttributeResolver(
  previousValue = [],
  currentValue = [],
  remoteValue = [],
  container = []) {
  let currentValuesById = _.keyBy(currentValue, 'custom_attribute_id');
  let remoteValuesById = _.keyBy(remoteValue, 'custom_attribute_id');
  let containerValuesById = _.keyBy(container, 'custom_attribute_id');

  let conflict = false;
  previousValue.forEach((previousValueItem) => {
    let definitionId = previousValueItem.custom_attribute_id;
    let currentValueItem = currentValuesById[definitionId];
    let remoteValueItem = remoteValuesById[definitionId];
    let containerValueItem = containerValuesById[definitionId];

    let hasValueConflict = simpleFieldResolver(
      previousValueItem,
      currentValueItem,
      remoteValueItem,
      containerValueItem,
      'attribute_value');

    let hasObjectConflict = simpleFieldResolver(
      previousValueItem,
      currentValueItem,
      remoteValueItem,
      containerValueItem,
      'attribute_object.id',
      'attribute_object');

    conflict = conflict || hasValueConflict || hasObjectConflict;
  });

  return conflict;
}

