/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import CanMap from 'can-map/can-map';
import CanList from 'can-list/can-list';
import CanModel from 'can-model/src/can-model';

import {isValidAttrProperty} from '../../utils/validation-utils';

describe('validation utils', () => {
  describe('isValidAttrProperty method', () => {
    let testModel;

    beforeAll(() => {
      testModel = new CanModel();
    });

    it('should return undefined. model is valid', () => {
      testModel.attr('errors', undefined);
      const result = isValidAttrProperty(testModel, 'issue_tracker', 'title');
      expect(result).toBeUndefined();
    });

    it('should return undefined. issue_tracker is valid', () => {
      const errors = new CanMap({});
      testModel.attr('errors', errors);
      const result = isValidAttrProperty(testModel, 'issue_tracker', 'title');
      expect(result).toBeUndefined();
    });

    it('should return undefined. issue_tracker does not have title error',
      () => {
        const errors = new CanMap({
          issue_tracker: new CanList([
            'cannot be blank',
            'missed componed id',
          ]),
        });

        testModel.attr('errors', errors);
        const result = isValidAttrProperty(testModel, 'issue_tracker', 'title');
        expect(result).toBeUndefined();
      }
    );

    it('should return errorMessage. issue_tracker has title error',
      () => {
        const errors = new CanMap({
          issue_tracker: new CanList([
            'something wrong',
            {title: 'cannot be blank'},
          ]),
        });

        testModel.attr('errors', errors);
        const result = isValidAttrProperty(testModel, 'issue_tracker', 'title');
        expect(result).toEqual('cannot be blank');
      }
    );

    it('should return errorMessage. issue_tracker has title errors',
      () => {
        const errors = new CanMap({
          issue_tracker: new CanList([
            'something wrong',
            {title: 'cannot be blank'},
            {title: 'max length is 100500'},
          ]),
        });

        testModel.attr('errors', errors);
        const result = isValidAttrProperty(testModel, 'issue_tracker', 'title');
        expect(result).toEqual('cannot be blank; max length is 100500');
      }
    );
  });
});
