/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import CanModel from 'can-model/src/can-model';
import CanMap from 'can-map/can-map';

describe('validateAssessmentIssueTracker extension', () => {
  let TestModel;

  beforeAll(() => {
    TestModel = CanModel.extend({}, {
      define: {
        issue_tracker: {
          value: {},
          validate: {
            validateAssessmentIssueTracker: true,
          },
        },
        can_use_issue_tracker: {
          value: true,
        },
      },
    });
  });

  it('should return FALSE. issue tracker does not have component id', () => {
    const model = new TestModel();
    model.attr('issue_tracker', new CanMap({
      enabled: true,
    }));
    model.attr('can_use_issue_tracker', true);
    expect(model.validate()).toBeFalsy();
    expect(model.errors.issue_tracker[0].component_id)
      .toEqual('cannot be blank');
  });

  it('should return TRUE. issue tracker has component id', () => {
    const model = new TestModel();
    model.attr('issue_tracker', new CanMap({
      enabled: true,
      component_id: 1,
    }));
    model.attr('can_use_issue_tracker', true);
    expect(model.validate()).toBeTruthy();
    expect(model.errors.issue_tracker).toBeUndefined();
  });

  it('should return TRUE. can_use_issue_tracker - true, enabled - false',
    () => {
      const model = new TestModel();
      model.attr('issue_tracker', new CanMap({
        enabled: false,
      }));
      model.attr('can_use_issue_tracker', true);
      expect(model.validate()).toBeTruthy();
      expect(model.errors.issue_tracker).toBeUndefined();
    }
  );

  it('should return TRUE. can_use_issue_tracker - false, enabled - false',
    () => {
      const model = new TestModel();
      model.attr('issue_tracker', new CanMap({
        enabled: false,
      }));
      model.attr('can_use_issue_tracker', false);
      expect(model.validate()).toBeTruthy();
      expect(model.errors.issue_tracker).toBeUndefined();
    }
  );
});
