/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import '../../people-autocomplete/people-autocomplete-wrapper/people-autocomplete-wrapper';

import template from './people-mention.stache';
import {KEY_MAP} from '../../custom-autocomplete/autocomplete-input';

const MENTION_REGEX = /(^.*[\s]|^)[@+]([\S]*)$/s;

/**
 * Supporting component for rich-text to handle mentions of people
 */
export default can.Component.extend({
  tag: 'people-mention',
  template: can.stache(template),
  leakScope: false,
  viewModel: can.Map.extend({
    define: {
      editor: {
        set(editor) {
          if (editor) {
            editor.on('text-change', this.onChange.bind(this));

            editor.keyboard.addBinding({key: KEY_MAP.ESCAPE},
              this.onEscapeKey.bind(this));
            editor.keyboard.addBinding({key: KEY_MAP.ARROW_DOWN},
              this.onActionKey.bind(this, KEY_MAP.ARROW_DOWN));
            editor.keyboard.addBinding({key: KEY_MAP.ARROW_UP},
              this.onActionKey.bind(this, KEY_MAP.ARROW_UP));

            // This is hacky way to add key binding.
            // We need to do this because there is default handlers
            // which prevents event propagation in new handlers.
            editor.keyboard.bindings[KEY_MAP.ENTER].unshift({
              key: KEY_MAP.ENTER,
              handler: this.onActionKey.bind(this, KEY_MAP.ENTER),
            });
          }
          return editor;
        },
      },
    },
    // two way bound attribute to child components
    // to define if "results" is shown.
    showResults: false,
    mentionValue: null,
    mentionIndex: null,
    actionKey: null,
    clearMention() {
      this.attr('mentionValue', null);
      this.attr('mentionIndex', null);
    },
    onActionKey(keyCode) {
      if (this.attr('showResults')) {
        // trigger setter of 'actionKey'
        this.attr('actionKey', keyCode);
        // reset 'actionKey'
        this.attr('actionKey', null);
        // prevent default behavior
        return false;
      }
      return true;
    },
    onEscapeKey() {
      if (this.attr('showResults')) {
        this.clearMention();
        return false;
      }
      return true;
    },
    onChange() {
      const editor = this.attr('editor');
      const selection = editor.getSelection();
      if (!selection) {
        // on mention insert focus is lost
        return;
      }
      const selectionIndex = selection.index;
      const editorText = editor.getText();
      const textBeforeSelection = editorText.substring(0, selectionIndex);

      const groups = MENTION_REGEX.exec(textBeforeSelection);
      if (groups) {
        const textBeforeMention = groups[1];
        const mentionValue = groups[2];

        this.attr('mentionValue', mentionValue);
        this.attr('mentionIndex', textBeforeMention.length);
      } else {
        this.clearMention();
      }
    },
    personSelected({item}) {
      const editor = this.attr('editor');
      const mentionValueLength = this.attr('mentionValue').length + 1;
      const link = `mailto:${item.email}`;
      const retainLength = this.attr('mentionIndex');
      const retain = retainLength ? [{retain: retainLength}] : [];
      const mention = `+${item.email}`;
      const ops = [
        ...retain,
        {'delete': mentionValueLength},
        {insert: mention, attributes: {link}},
        {insert: ' '},
      ];

      editor.updateContents({ops});
      editor.setSelection(retainLength + mention.length + 1);
      this.clearMention();
    },
  }),
  events: {
    '{window} click'() {
      this.viewModel.clearMention();
    },
  },
});
