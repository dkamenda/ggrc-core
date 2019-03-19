/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import validatejs from 'validate.js/validate';

import {getRole} from './utils/acl-utils';
import {
  getDate,
} from './utils/date-utils';

const CannotBeBlankMessage = 'cannot be blank';

const validateDefaultPeople = (people, attrName) => {
  if (!people || (_.isArray(people) && !people.length)) {
    return {
      [`${attrName}`]: CannotBeBlankMessage,
    };
  }
};

validatejs.validators.validateAssignee = (value, roleType, key, attributes) => {
  const assigneeRole = getRole(roleType, 'Task Assignees');
  const hasAssignee = assigneeRole && _.some(attributes.access_control_list, {
    ac_role_id: assigneeRole.id,
  });

  if (!hasAssignee) {
    return 'No valid contact selected for assignee';
  }
};

validatejs.validators.validateIssueTracker = (value) => {
  if (value.enabled && !value.component_id) {
    return {
      component_id: CannotBeBlankMessage,
    };
  }
};

validatejs.validators.validateAssessmentIssueTracker = (value,
  options, key, attributes) => {
  if (attributes.can_use_issue_tracker &&
      value.enabled &&
      !value.component_id) {
    return {
      component_id: CannotBeBlankMessage,
    };
  }
};

validatejs.validators.validateIssueTrackerTitle = (value,
  options, key, attributes) => {
  if (attributes.can_use_issue_tracker &&
      value.enabled &&
      !value.title || (value.title && !value.title.trim())) {
    return {
      title: CannotBeBlankMessage,
    };
  }
};

validatejs.validators.validateUniqueTitle = (value,
  options, key, attributes) => {
  if (key === 'title') {
    return attributes._transient_title;
  } else if (key === '_transient_title') {
    return value; // the title error is the error
  }
};

/*
 * Validate a comma-separated list of possible values defined by the
 * custom attribute definition.
 *
 * This validation is only applicable to multi-choice CA types such as
 * Dropdown, and does not do anything for other CA types.
 *
 * There must be at most one empty value defined (whitespace trimmed),
 * and the values must be unique.
 */
validatejs.validators.validateMultiChoiceOptions = (value,
  options, key, attributes) => {
  let choices;
  let nonBlanks;
  let uniques;

  if (key !== 'multi_choice_options') {
    return; // nothing  to validate here
  }

  if (attributes.attribute_type !== 'Dropdown') {
    return; // all ok, the value of multi_choice_options not needed
  }

  choices = _.splitTrim(value, ',');

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
};

validatejs.validators.validateStartEndDates = (value,
  options, key, attributes) => {
  let startDate = getDate(attributes.start_date);
  let endDate = getDate(attributes.end_date);

  let datesAreValid = startDate && endDate &&
    startDate <= endDate;

  if (!datesAreValid) {
    return 'Start and/or end date is invalid';
  }
};

validatejs.validators.validateDefaultAssignees = (value) => {
  return validateDefaultPeople(value.assignees, 'assignees');
};

validatejs.validators.validateDefaultVerifiers = (value) => {
  return validateDefaultPeople(value.verifiers, 'verifiers');
};

validatejs.validators.validateIssueTrackerIssueId = (value,
  options, key, attributes) => {
  if (!['Fixed', 'Fixed and Verified', 'Deprecated']
    .includes(attributes.status)) {
    return;
  }

  if (value.enabled && !value.issue_id) {
    return {
      issue_id: CannotBeBlankMessage,
    };
  }
};

validatejs.validators.validateGCA = (value, options, key, attributes) => {
  const isCustomAttributable = options.constructor.is_custom_attributable;
  if (isCustomAttributable && !options.attr('_gca_valid')) {
    return 'Missing required global custom attribute(s)';
  }
};
