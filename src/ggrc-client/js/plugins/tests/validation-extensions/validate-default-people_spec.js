/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import CanList from 'can-list/can-list';
import CanModel from 'can-model/src/can-model';
import CanMap from 'can-map/can-map';

describe('validateDefaultPeople extensions.', () => {
  describe('validateDefaultAssignees extension', () => {
    let TestModel;

    beforeAll(() => {
      TestModel = CanModel.extend({}, {
        define: {
          default_people: {
            value: new CanMap([]),
            validate: {
              validateDefaultAssignees: true,
            },
          },
        },
      });
    });

    it('shoud return TRUE, assignees is NOT empty list', () => {
      const model = new TestModel();
      model.attr('default_people', new CanMap({
        assignees: new CanList([1, 2]),
      }));
      expect(model.validate()).toBeTruthy();
      expect(model.errors.default_people).toBeUndefined();
    });

    it('shoud return TRUE, assignees is NOT empty string', () => {
      const model = new TestModel();
      model.attr('default_people', new CanMap({
        assignees: 'Auditor',
      }));
      expect(model.validate()).toBeTruthy();
      expect(model.errors.default_people).toBeUndefined();
    });

    it('shoud return FALSE, assignees is EMPTY string', () => {
      const model = new TestModel();
      model.attr('default_people', new CanMap({
        assignees: '',
      }));
      expect(model.validate()).toBeFalsy();
      expect(model.errors.default_people[0].assignees)
        .toEqual('cannot be blank');
    });

    it('shoud return FALSE, assignees is EMPTY list', () => {
      const model = new TestModel();
      model.attr('default_people', new CanMap({
        assignees: new CanList([]),
      }));
      expect(model.validate()).toBeFalsy();
      expect(model.errors.default_people[0].assignees)
        .toEqual('cannot be blank');
    });
  });
});
