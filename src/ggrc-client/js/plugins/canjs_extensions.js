/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

const originalControlSetup = can.Control.setup;
const originListReplace = can.List.prototype.replace;
const defaultValidator = can.validate.validator();
const originalOnce = defaultValidator.once;

// Set "attributes" field
if (!can.Model.attributes) {
  can.Model.attributes = {};
}

// Returns a function which will be halted unless `this.element` exists
// - useful for callbacks which depend on the controller's presence in the DOM
can.Control.prototype._ifNotRemoved = function (fn) {
  let isPresent = this.element;
  return function () {
    return isPresent ? fn.apply(this, arguments) : null;
  };
};

can.camelCaseToUnderscore = function (string) {
  if (!_.isString(string)) {
    throw new TypeError('Invalid type, string required.');
  }
  return _.snakeCase(string);
};

// Insert current Control instance into element's data
can.Control.setup = function () {
  let originalInit = this.prototype.init;
  let init = function (el) {
    let $el = $(el);
    if ($el.length) {
      if (!$el.data('controls') || !$el.data('controls').length) {
        $el.data('controls', [this]);
      } else {
        $el.data('controls').push(this);
      }
    }

    originalInit.apply(this, arguments);
  };
  this.prototype.init = init;
  originalControlSetup.apply(this, arguments);
};

can.List.prototype.replace = function (items) {
  if (!items.then || !_.isFunction(items.then)) {
    originListReplace.call(this, items);
    return;
  }

  items.then((data) => {
    originListReplace.call(this, data);
  });
};

// Override "once" method to avoid exception connect to "length" name
defaultValidator.once = function (value, options, name) {
  if (name === 'length') {
    return;
  }

  return originalOnce.apply(this, arguments);
};

can.List.prototype.sort = function (predicate) {
  const array = _.map(this, (item) => item);
  this.replace(array.sort(predicate));
  return this;
};
