/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

/**
 * Check validation of attribute's property
 * in case when attribute is object
 * For example: errors: { issue_tracker: {title: 'wrong title' }}
 * @param {*} instance - object of Cacheable
 * @param {*} attrName - attribute name ('issue_tracker')
 * @param {*} propertyName - property name ('title')
 * @return {string} - error messsage
 */
const isValidAttrProperty = (instance, attrName, propertyName) => {
  const errors = instance.attr('errors');
  const fieldErrors = errors && errors[attrName];

  if (!fieldErrors) {
    return;
  }

  const propertyErrors = _.filter(fieldErrors, (fieldError) =>
    _.isObject(fieldError) && fieldError[propertyName]);

  if (!propertyErrors.length) {
    return;
  }

  return _.map(propertyErrors, (propertyError) => {
    return propertyError[propertyName];
  }).join('; ');
};

export {
  isValidAttrProperty,
};
