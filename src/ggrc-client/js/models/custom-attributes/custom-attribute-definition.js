/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Cacheable from '../cacheable';
import Stub from '../stub';

export default Cacheable.extend({
  root_object: 'custom_attribute_definition',
  root_collection: 'custom_attribute_definitions',
  category: 'custom_attribute_definitions',
  findAll: 'GET /api/custom_attribute_definitions',
  findOne: 'GET /api/custom_attribute_definitions/{id}',
  create: 'POST /api/custom_attribute_definitions',
  update: 'PUT /api/custom_attribute_definitions/{id}',
  destroy: 'DELETE /api/custom_attribute_definitions/{id}',
  attributes: {
    modified_by: Stub,
  },
  defaults: {
    title: '',
    attribute_type: 'Text',
  },
  attributeTypes: ['Text', 'Rich Text', 'Date', 'Checkbox', 'Dropdown',
    'Map:Person'],

  _customValidators: {
    /**
     * Validate a comma-separated list of possible values defined by the
     * custom attribute definition.
     *
     * This validation is only applicable to multi-choice CA types such as
     * Dropdown, and does not do anything for other CA types.
     *
     * There must be at most one empty value defined (whitespace trimmed),
     * and the values must be unique.
     *
     * @param {*} newVal - the new value of the property
     * @param {String} propName - the instance property to validate
     *
     * @return {String} - A validation error message, if any. An empty string
     *   is returned if the validation passes.
     */
    multiChoiceOptions: function (newVal, propName) {
      let choices;
      let nonBlanks;
      let uniques;

      if (propName !== 'multi_choice_options') {
        return ''; // nothing  to validate here
      }

      if (this.attribute_type !== 'Dropdown') {
        return ''; // all ok, the value of multi_choice_options not needed
      }

      choices = _.splitTrim(newVal, ',');

      if (!choices.length) {
        return 'At least one possible value required.';
      }

      nonBlanks = _.compact(choices);
      if (nonBlanks.length < choices.length) {
        return 'Blank values not allowed.';
      }

      uniques = _.uniq(nonBlanks);
      if (uniques.length < nonBlanks.length) {
        return 'Duplicate values found.';
      }

      return ''; // no errors
    },
  },

  init: function () {
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
    // Besides multi_choice_options we need toset the validation on the
    // attribute_type field as well, even though its validation always
    // succeeds. For some reson this is required for the modal UI buttons to
    // properly update themselves when choosing a different attribute type.
    multi_choice_options: {
      value: '',
      validate: {
        validateMultiChoiceOptions: true,
      },
    },
    attribute_type: {
      validate: {
        validateMultiChoiceOptions: true,
      },
    },
  },
  init: function () {
    this._super(...arguments);
  },
});
