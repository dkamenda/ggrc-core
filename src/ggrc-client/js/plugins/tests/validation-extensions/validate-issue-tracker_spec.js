/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import CanModel from 'can-model/src/can-model';
import CanMap from 'can-map/can-map';

describe('validateIssueTracker extension', () => {
  let TestModel;

  beforeAll(() => {
    TestModel = CanModel.extend({}, {
      define: {
        issue_tracker: {
          value: {},
          validate: {
            validateIssueTracker: true,
          },
        },
      },
    });
  });

  it('should return TRUE. issue tracker is disabled', () => {
    const model = new TestModel();
    model.attr('issue_tracker', new CanMap({
      enabled: false,
    }));
    expect(model.validate()).toBeTruthy();
    expect(model.errors.issue_tracker).toBeUndefined();
  });

  it('should return TRUE. issue tracker is empty object', () => {
    const model = new TestModel();
    model.attr('issue_tracker', {});
    expect(model.validate()).toBeTruthy();
    expect(model.errors.issue_tracker).toBeUndefined();
  });

  it('should return TRUE. issue tracker has component id', () => {
    const model = new TestModel();
    model.attr('issue_tracker', new CanMap({
      enabled: true,
      component_id: 12345,
    }));
    expect(model.validate()).toBeTruthy();
    expect(model.errors.issue_tracker).toBeUndefined();
  });

  it('should return FALSE. issue tracker does not have component id', () => {
    const model = new TestModel();
    model.attr('issue_tracker', new CanMap({
      enabled: true,
    }));
    expect(model.validate()).toBeFalsy();
    expect(model.errors.issue_tracker[0].component_id)
      .toEqual('cannot be blank');
  });
});
