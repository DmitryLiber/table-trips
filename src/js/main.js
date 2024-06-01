import './partials/imports';
import { addClass, removeClass } from './partials/utils';

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.js-input-date')) {
    const inputDate = document.querySelectorAll('.js-input-date');

    inputDate.forEach((input) => {
      const currentInput = input;
      const parent = input.parentNode;
      const clear = parent.querySelector('.field__clear');

      input.addEventListener('focus', () => {
        currentInput.type = 'date';
      });

      input.addEventListener('input', () => {
        if (input.value !== '') {
          addClass(parent, 'field--clear');
        } else {
          removeClass(parent, 'field--clear');
        }
      });

      input.addEventListener('blur', () => {
        if (input.value !== '') return;
        currentInput.type = 'text';
      });

      clear.addEventListener('click', () => {
        removeClass(parent, 'field--clear');
        currentInput.value = '';
        currentInput.type = 'text';
      });
    });
  }

  if (document.querySelector('.js-reset-filter')) {
    document.querySelector('.js-reset-filter').addEventListener('click', () => {
      const clearButtons = document.querySelectorAll('.js-field-clear');
      clearButtons.forEach((button) => button.click());
    });
  }
});
