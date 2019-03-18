/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Component from './template-field';
import {getComponentVM} from '../../../../js_specs/spec_helpers';

describe('template-field component', function () {
  let viewModel;
  let pads = new can.Map({
    COMMENT: 0,
    ATTACHMENT: 1,
  });

  beforeEach(function () {
    viewModel = getComponentVM(Component);
  });

  describe('denormalizeMandatory() method', function () {
    it('returns correct denormalized field', function () {
      let field = new can.Map({
        multi_choice_options: 'foo,bar,baz,bam',
        multi_choice_mandatory: '0,1,2,3',
      });
      let result = viewModel.denormalizeMandatory(field, pads);

      expect(result.length).toEqual(4);
      expect(result[0].attachment).toEqual(false);
      expect(result[0].comment).toEqual(false);
      expect(result[1].attachment).toEqual(false);
      expect(result[1].comment).toEqual(true);
      expect(result[2].attachment).toEqual(true);
      expect(result[2].comment).toEqual(false);
      expect(result[3].attachment).toEqual(true);
      expect(result[3].comment).toEqual(true);
    });

    it('returns false for attachment and comment for missing mandatory',
      function () {
        let field = new can.Map({
          multi_choice_options: 'one,two,three,four,five',
          multi_choice_mandatory: '0,1,2',
        });
        let result = viewModel.denormalizeMandatory(field, pads);

        expect(result.length).toEqual(5);
        expect(result[0].attachment).toEqual(false);
        expect(result[0].comment).toEqual(false);
        expect(result[1].attachment).toEqual(false);
        expect(result[1].comment).toEqual(true);
        expect(result[2].attachment).toEqual(true);
        expect(result[2].comment).toEqual(false);

        expect(result[3].attachment).toEqual(false);
        expect(result[3].comment).toEqual(false);
        expect(result[4].attachment).toEqual(false);
        expect(result[4].comment).toEqual(false);
      });

    it('returns values only for defined options', function () {
      let field = new can.Map({
        multi_choice_options: 'one,two,three',
        multi_choice_mandatory: '0,1,2,2,0',
      });
      let result = viewModel.denormalizeMandatory(field, pads);

      expect(result.length).toEqual(3);
      expect(result[0].attachment).toEqual(false);
      expect(result[0].comment).toEqual(false);
      expect(result[1].attachment).toEqual(false);
      expect(result[1].comment).toEqual(true);
      expect(result[2].attachment).toEqual(true);
      expect(result[2].comment).toEqual(false);
    });
  });

  describe('normalizeMandatory() method', function () {
    it('returns correct normalized attrs', function () {
      let attrs = new can.List([
        {attachment: false, comment: false},
        {attachment: true, comment: false},
        {attachment: false, comment: true},
        {attachment: true, comment: true},
      ]);
      let result = viewModel.normalizeMandatory(attrs, pads);

      expect(result).toEqual('0,2,1,3');
    });
  });

  describe('emitting events', function () {
    describe('on-remove event', function () {
      let $root; // the component's root DOM element
      let onRemoveCallback;

      beforeEach(function () {
        let $body = $('body');
        let docFragment;
        let htmlSnippet;
        let renderer;
        let templateContext;

        onRemoveCallback = jasmine.createSpy('onRemoveCallback');

        htmlSnippet = [
          '<template-field',
          '  {field}="{fieldDefinition}"',
          '  {types}="{types}"',
          '  on:remove="fieldRemoved()">',
          '</template-field>',
        ].join('');

        templateContext = new can.Map({
          types: new can.List([
            {
              type: 'Text',
              name: 'Text',
              text: 'Enter description',
            },
          ]),
          fieldDefinition: {
            attribute_type: 'Text',
          },
          fieldRemoved: onRemoveCallback,
        });

        renderer = can.stache(htmlSnippet);
        docFragment = renderer(templateContext);
        $body.append(docFragment);

        $root = $body.find('template-field');
      });

      afterEach(function () {
        $root.remove();
      });

      it('invokes the provided handler when element is removed', function () {
        let $btnDelete = $root.find('.fa-trash').closest('a');
        $btnDelete.click();
        expect(onRemoveCallback).toHaveBeenCalled();
      });
    });
  });
});
