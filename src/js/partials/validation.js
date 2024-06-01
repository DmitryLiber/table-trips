import api from './api';

const defaults = {
  // Classes & IDs
  fieldSelector: '.form [class*="field"]',
  fieldModErrorClass: 'form__field--error',
  successClass: 'form__field--valid',
  errorClass: 'form__field-error',
  fieldPrefix: 'v-field__',
  errorPrefix: 'v-error__',

  // Patterns
  patterns: {
    email:
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
    url: /^(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/,
    number: /^(?:[-+]?[0-9]*[.,]?[0-9]+)$/,
    tel: /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/,
    date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/,
    time: /^(?:(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]))$/,
    month: /^(?:(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])))$/,
  },

  // Custom Validations
  customValidations: {
    isTagsMinChosen: (field) => {
      if (field.type !== 'checkbox') return;

      if (!field.parentElement.dataset.min) return;

      const group = [
        ...field.parentElement.querySelectorAll('input[type="checkbox"]'),
      ];
      const { length } = group.filter((input) => input.checked);
      const parent = group[0].parentElement;
      const caption = parent.parentElement.querySelector('.form__caption');

      if (length < parent.dataset.min) {
        caption.classList.add('form__caption--error');
      } else {
        caption.classList.remove('form__caption--error');
      }

      return length < parent.dataset.min; // eslint-disable-line
    },
  },

  // Messages
  messageAfterField: true,
  messageCustom: 'data-bouncer-message',
  messageTarget: 'data-bouncer-target',
  messages: {
    missingValue: {
      checkbox: 'Это поле обязательное',
      radio: 'Выберите значение',
      select: 'Выберите значение',
      'select-multiple': 'Выберите хотя\xa0бы одно значение',
      default: 'Поле обязательно к\xa0заполнению',
    },
    patternMismatch: {
      email: 'Неверный формат электронной почты',
      url: 'Введите полный url начиная с\xa0https://',
      number: 'Введите число',
      tel: 'Номер в\xa0формате +7 (XXX) XXX-XX-XX',
      date: 'Дата в\xa0формате ГГГГ-ММ-ДД',
      time: 'Укажите диапазон в\xa024 часовом формате',
      month: 'Используйте формат ГГГГ-ММ',
      default: 'Неверный формат',
    },
    outOfRange: {
      over: 'Пожалуйста выберите число больше чем {max}',
      under: 'Пожалуйста выберите число меньше чем {min}',
    },
    wrongLength: {
      over: 'Кол-во символов не\xa0должно превышать {maxLength}. Использовано символов - {length}',
      under:
        'Кол-во символов должно быть больше {minLength}. Использовано символов - {length}',
    },
    isTagsMinChosen: () => '',
    fallback: 'Что то введено не\xa0правильно',
  },

  // Form Submission
  disableSubmit: false,

  // Custom Events
  emitEvents: true,
};

//
// Methods
//

/**
 * Merge two or more objects together.
 * @param   {Object}   objects  The objects to merge together
 * @returns {Object}            Merged values of defaults and options
 */

const extend = (...args) => {
  const merged = {};
  args.forEach((obj) => {
    /* eslint-disable */
    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) return;
      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        merged[key] = extend(merged[key], obj[key]);
      } else {
        merged[key] = obj[key];
      }
    }
  });
  /* eslint-enable */
  return merged;
};

/**
 * Emit a custom event
 * @param  {String} type    The event type
 * @param  {Object} options The settings object
 * @param  {Node}   anchor  The anchor element
 * @param  {Node}   toggle  The toggle element
 */
const emitEvent = (elem, type, details) => {
  if (typeof window.CustomEvent !== 'function') return;
  const event = new CustomEvent(type, {
    bubbles: true,
    detail: details || {},
  });
  elem.dispatchEvent(event);
};

/**
 * Escape special characters for use with querySelector
 * @author Mathias Bynens
 * @link https://github.com/mathiasbynens/CSS.escape
 * @param {String} id The anchor ID to escape
 */
/* eslint-disable */
const escapeCharacters = (id) => {
  const string = String(id);
  const length = string.length;
  let index = -1;
  let codeUnit;
  let result = '';
  let firstCodeUnit = string.charCodeAt(0);
  while (++index < length) {
    codeUnit = string.charCodeAt(index);
    // Note: there’s no need to special-case astral symbols, surrogate
    // pairs, or lone surrogates.

    // If the character is NULL (U+0000), then throw an
    // `InvalidCharacterError` exception and terminate these steps.
    if (codeUnit === 0x0000) {
      throw new InvalidCharacterError(
        'Invalid character: the input contains U+0000.'
      );
    }

    if (
      // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
      // U+007F, […]
      (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
      codeUnit == 0x007f ||
      // If the character is the first character and is in the range [0-9]
      // (U+0030 to U+0039), […]
      (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      // If the character is the second character and is in the range [0-9]
      // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
      (index === 1 &&
        codeUnit >= 0x0030 &&
        codeUnit <= 0x0039 &&
        firstCodeUnit === 0x002d)
    ) {
      // http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
      result += `\\${codeUnit.toString(16)} `;
      continue;
    }

    // If the character is not handled by one of the above rules and is
    // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
    // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
    // U+005A), or [a-z] (U+0061 to U+007A), […]
    if (
      codeUnit >= 0x0080 ||
      codeUnit === 0x002d ||
      codeUnit === 0x005f ||
      (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
      (codeUnit >= 0x0061 && codeUnit <= 0x007a)
    ) {
      // the character itself
      result += string.charAt(index);
      continue;
    }

    // Otherwise, the escaped character.
    // http://dev.w3.org/csswg/cssom/#escape-a-character
    result += `\\${string.charAt(index)}`;
  }

  // Return sanitized hash
  return result;
};
/* eslint-enable */

/**
 * Add the `novalidate` attribute to all forms
 * @param {Boolean} remove  If true, remove the `novalidate` attribute
 */
const addNoValidate = (selector) => {
  document
    .querySelectorAll(selector)
    .forEach((form) => form.setAttribute('novalidate', true));
};

/**
 * Remove the `novalidate` attribute to all forms
 */
const removeNoValidate = (selector) => {
  document
    .querySelectorAll(selector)
    .forEach((form) => form.removeAttribute('novalidate'));
};

/**
 * Check if a required field is missing its value
 * @param  {Node} field The field to check
 * @return {Boolean}       It true, field is missing it's value
 */
const missingValue = (field) => {
  // If not required, bail
  if (!field.hasAttribute('required')) return false;

  // Handle checkboxes
  if (field.type === 'checkbox') {
    return !field.checked;
  }

  // Get the field value length
  let { length } = field.value;

  // Handle radio buttons
  if (field.type === 'radio') {
    length = [
      ...field.form.querySelectorAll(
        `[name="${escapeCharacters(field.name)}"]`
        // `[name="${field.name}"]`
      ),
    ].filter((btn) => btn.checked).length;
  }

  // Check for value
  return length < 1;
};

/**
 * Check if field value doesn't match a pattern.
 * @param  {Node}   field    The field to check
 * @param  {Object} settings The plugin settings
 * @see https://www.w3.org/TR/html51/sec-forms.html#the-pattern-attribute
 * @return {Boolean}         If true, there's a pattern mismatch
 */
const patternMismatch = (field, settings) => {
  // Check if there's a pattern to match
  let pattern = field.getAttribute('pattern');
  pattern = pattern
    ? new RegExp(`^(?:${pattern})$`)
    : settings.patterns[field.type];
  if (!pattern || !field.value || field.value.length < 1) return false;

  // Validate the pattern
  return field.value.match(pattern) ? false : true; // eslint-disable-line
};

/**
 * Check if field value is out-of-range
 * @param  {Node}    field    The field to check
 * @return {String}           Returns 'over', 'under', or false
 */
const outOfRange = (field) => {
  // Make sure field has value
  if (!field.value || field.value.length < 1) return false;

  // Check for range
  const max = field.getAttribute('max');
  const min = field.getAttribute('min');

  // Check validity
  const num = parseFloat(field.value);
  if (max && num > max) return 'over';
  if (min && num < min) return 'under';
  return false;
};

/**
 * Check if the field value is too long or too short
 * @param  {Node}   field    The field to check
 * @return {String}           Returns 'over', 'under', or false
 */
const wrongLength = (field) => {
  // Make sure field has value
  if (!field.value || field.value.length < 1) return false;

  // Check for min/max length
  const max = field.getAttribute('maxlength');
  const min = field.getAttribute('minlength');

  // Check validity
  const { length } = field.value;
  if (max && length > max) return 'over';
  if (min && length < min) return 'under';
  return false;
};

/**
 * Test for standard field validations
 * @param  {Node}   field    The field to test
 * @param  {Object} settings The plugin settings
 * @return {Object}          The tests and their results
 */
const runValidations = (field, settings) => ({
  missingValue: missingValue(field),
  patternMismatch: patternMismatch(field, settings),
  outOfRange: outOfRange(field),
  wrongLength: wrongLength(field),
});

/**
 * Run any provided custom validations
 * @param  {Node}   field       The field to test
 * @param  {Object} errors      The existing errors
 * @param  {Object} validations The custom validations to run
 * @param  {Object} settings    The plugin settings
 * @return {Object}             The tests and their results
 */
const customValidations = (field, errors, validations, settings) => {
  /* eslint-disable */
  for (let test in validations) {
    if (validations.hasOwnProperty(test)) {
      errors[test] = validations[test](field, settings);
    }
  }
  /* eslint-enable */
  return errors;
};

/**
 * Check if a field has any errors
 * @param  {Object}  errors The validation test results
 * @return {Boolean}        Returns true if there are errors
 */
const hasErrors = (errors) => {
  /* eslint-disable */
  for (let type in errors) {
    if (errors[type]) return true;
  }
  /* eslint-enable */
  return false;
};

/**
 * Check a field for errors
 * @param  {Node} field      The field to test
 * @param  {Object} settings The plugin settings
 * @return {Object}          The field validity and errors
 */
const getErrors = (field, settings) => {
  // Get standard validation errors
  let errors = runValidations(field, settings);

  // Check for custom validations
  errors = customValidations(
    field,
    errors,
    settings.customValidations,
    settings
  );

  return {
    valid: !hasErrors(errors),
    errors,
  };
};

/**
 * Get or create an ID for a field
 * @param  {Node}    field    The field
 * @param  {Object}  settings The plugin settings
 * @param  {Boolean} create   If true, create an ID if there isn't one
 * @return {String}           The field ID
 */
const getFieldID = (field, settings, create) => {
  let id = field.name ? field.name : field.id;
  if (id.match(/\[(\w+)\]/)) id = id.match(/\[(\w+)\]/)[1]; // eslint-disable-line

  if (!id && create) {
    id = settings.fieldPrefix + Math.floor(Math.random() * 999);
    field.id = id; // eslint-disable-line
  }
  if (field.type === 'checkbox') {
    id += `_${field.value || field.id}`;
  }
  return id;
};

/**
 * Special handling for radio buttons and checkboxes wrapped in labels.
 * @param  {Node} field The field with the error
 * @return {Node}       The field to show the error on
 */
const getErrorField = (field) => {
  // If the field is a radio button, get the last item in the radio group
  // @todo if location is before, get first item
  if (field.type === 'radio' && field.name) {
    const group = field.form.querySelectorAll(
      `[name="${escapeCharacters(field.name)}"]`
      // `[name="${field.name}"]`
    );
    field = group[group.length - 1]; // eslint-disable-line
  }

  // Get the associated label for radio button or checkbox
  if (field.type === 'radio' || field.type === 'checkbox') {
    const label =
      field.closest('label') || field.form.querySelector(`[for="${field.id}"]`);
    field = label || field; // eslint-disable-line
  }

  return field;
};

/**
 * Get the location for a field's error message
 * @param  {Node}   field    The field
 * @param  {Node}   target   The target for error message
 * @param  {Object} settings The plugin settings
 * @return {Node}            The error location
 */
const getErrorLocation = (field, target, settings) => {
  // Check for a custom error message
  const selector = field.getAttribute(settings.messageTarget);
  if (selector) {
    const location = field.form.querySelector(selector);
    if (location) {
      // @bugfix by @HaroldPutman
      // https://github.com/cferdinandi/bouncer/pull/28
      return (
        location.firstChild || location.appendChild(document.createTextNode(''))
      );
    }
  }

  // If the message should come after the field
  if (settings.messageAfterField) {
    // If there's no next sibling, create one
    if (!target.nextSibling) {
      target.parentNode.appendChild(document.createTextNode(''));
    }

    return target.nextSibling;
  }

  // If it should come before
  return target;
};

/**
 * Create a validation error message node
 * @param  {Node} field      The field
 * @param  {Object} settings The plugin settings
 * @return {Node}            The error message node
 */
const createError = (field, settings) => {
  // Create the error message
  const error = document.createElement('span');
  error.className = settings.errorClass;
  error.id = settings.errorPrefix + getFieldID(field, settings, true);

  // If the field is a radio button or checkbox, grab the last field label
  const fieldTarget = getErrorField(field);

  // Inject the error message into the DOM
  const location = getErrorLocation(field, fieldTarget, settings);
  location.parentNode.insertBefore(error, location);

  return error;
};

/**
 * Get the error message test
 * @param  {Node}            field    The field to get an error message for
 * @param  {Object}          errors   The errors on the field
 * @param  {Object}          settings The plugin settings
 * @return {String|Function}          The error message
 */
const getErrorMessage = (field, errors, settings) => {
  // Variables
  const { messages } = settings;

  // Missing value error
  if (errors.missingValue) {
    return messages.missingValue[field.type] || messages.missingValue.default;
  }

  // Numbers that are out of range
  if (errors.outOfRange) {
    return messages.outOfRange[errors.outOfRange]
      .replace('{max}', field.getAttribute('max'))
      .replace('{min}', field.getAttribute('min'))
      .replace('{length}', field.value.length);
  }

  // Values that are too long or short
  if (errors.wrongLength) {
    return messages.wrongLength[errors.wrongLength]
      .replace('{maxLength}', field.getAttribute('maxlength'))
      .replace('{minLength}', field.getAttribute('minlength'))
      .replace('{length}', field.value.length);
  }

  // Pattern mismatch error
  if (errors.patternMismatch) {
    const custom = field.getAttribute(settings.messageCustom);
    if (custom) return custom;
    return (
      messages.patternMismatch[field.type] || messages.patternMismatch.default
    );
  }

  // Custom validations
  /* eslint-disable */
  for (let test in settings.customValidations) {
    if (settings.customValidations.hasOwnProperty(test)) {
      if (errors[test] && messages[test]) return messages[test];
    }
  }
  /* eslint-enable */

  // Fallback error message
  return messages.fallback;
};

/**
 * Add error attributes to a field
 * @param  {Node}   field    The field with the error message
 * @param  {Node}   error    The error message
 * @param  {Object} settings The plugin settings
 */
const addErrorAttributes = (field, error, settings) => {
  field
    .closest(settings.fieldSelector)
    .classList.add(settings.fieldModErrorClass);
  field.setAttribute('aria-describedby', error.id);
  field.setAttribute('aria-invalid', true);
};

/**
 * Show error attributes on a field or radio/checkbox group
 * @param  {Node}   field    The field with the error message
 * @param  {Node}   error    The error message
 * @param  {Object} settings The plugin settings
 */
const showErrorAttributes = (field, error, settings) => {
  // If field is a radio button, add attributes to every button in the group
  if (field.type === 'radio' && field.name) {
    document
      .querySelectorAll(`[name="${field.name}"]`)
      .forEach((button) => addErrorAttributes(button, error, settings));
  }

  // Otherwise, add an error class and aria attribute to the field
  addErrorAttributes(field, error, settings);
};

/**
 * Show an error message in the DOM
 * @param  {Node} field      The field to show an error message for
 * @param  {Object}          errors   The errors on the field
 * @param  {Object}          settings The plugin settings
 */
const showError = (field, errors, settings) => {
  // Get/create an error message
  const error =
    field.form.querySelector(
      `#${settings.errorPrefix}${escapeCharacters(getFieldID(field, settings))}`
    ) || createError(field, settings);
  const msg = getErrorMessage(field, errors, settings);
  error.textContent = typeof msg === 'function' ? msg(field, settings) : msg;

  // Add error attributes
  showErrorAttributes(field, error, settings);

  // Emit custom event
  if (settings.emitEvents) {
    emitEvent(field, 'bouncerShowError', {
      errors,
    });
  }
};

/**
 * Remove error attributes from a field
 * @param  {Node}   field    The field with the error message
 * @param  {Node}   error    The error message
 * @param  {Object} settings The plugin settings
 */
const removeAttributes = (field, settings) => {
  field
    .closest(settings.fieldSelector)
    .classList.remove(settings.fieldModErrorClass);
  field.removeAttribute('aria-describedby');
  field.removeAttribute('aria-invalid');
};

/**
 * Remove error attributes from the field or radio group
 * @param  {Node}   field    The field with the error message
 * @param  {Node}   error    The error message
 * @param  {Object} settings The plugin settings
 */
const removeErrorAttributes = (field, settings) => {
  // If field is a radio button, remove attributes from every button in the group
  if (field.type === 'radio' && field.name) {
    document
      .querySelectorAll(`[name="${field.name}"]`)
      .forEach((button) => removeAttributes(button, settings));
    return;
  }

  // Otherwise, add an error class and aria attribute to the field
  removeAttributes(field, settings);
};

/**
 * Remove an error message from the DOM
 * @param  {Node} field      The field with the error message
 * @param  {Object} settings The plugin settings
 */
const removeError = (field, settings) => {
  // Get the error message for this field
  const error = field.form.querySelector(
    `#${settings.errorPrefix}${escapeCharacters(getFieldID(field, settings))}`
  );

  if (!error) return;
  // Remove the error
  error.parentNode.classList.remove(settings.errorClass);
  error.parentNode.removeChild(error);

  // Remove error and a11y from the field
  removeErrorAttributes(field, settings);

  // Emit custom event
  if (settings.emitEvents) {
    emitEvent(field, 'bouncerRemoveError');
  }
};

/**
 * Remove errors from all fields
 * @param  {String} selector The selector for the form
 * @param  {Object} settings The plugin settings
 */
const removeAllErrors = (selector, settings) => {
  document.querySelectorAll(selector).forEach((form) => {
    form
      .querySelectorAll('input, select, textarea')
      .forEach((field) => removeError(field, settings));
  });
};

/**
 * The plugin constructor
 * @param {String} selector The selector to use for forms to be validated
 * @param {Object} options  User settings [optional]
 */
const Validation = (selector, options) => {
  //
  // Variables
  //

  const publicAPIs = {};
  let settings;

  //
  // Methods
  //

  /**
   * Validate a field
   * @param  {Node} field     The field to validate
   * @param  {Object} options Validation options
   * @return {Object}         The validity state and errors
   */
  // eslint-disable-next-line
  publicAPIs.validate = function (field, options) {
    // Don't validate submits, buttons, file and reset inputs, and disabled and readonly fields
    if (
      field.disabled ||
      field.readOnly ||
      field.type === 'reset' ||
      field.type === 'submit' ||
      field.type === 'button'
    )
      return;

    // Local settings
    const localSettings = extend(settings, options || {});

    // Check for errors
    const isValid = getErrors(field, localSettings);

    // If valid, remove any error messages
    if (isValid.valid) {
      removeError(field, localSettings);
      if (field.required)
        field
          .closest(settings.fieldSelector)
          .classList.add(settings.successClass);
      return;
    }

    // Otherwise, show an error message
    if (
      field
        .closest(settings.fieldSelector)
        .classList.contains(settings.successClass)
    )
      field
        .closest(settings.fieldSelector)
        .classList.remove(settings.successClass);
    showError(field, isValid.errors, localSettings);

    return isValid; // eslint-disable-line
  };

  /**
   * Validate all fields in a form or section
   * @param  {Node} target The form or section to validate fields in
   * @return {Array}       An array of fields with errors
   */
  publicAPIs.validateAll = (target) =>
    Array.from(target.querySelectorAll('input, select, textarea')).filter(
      (field) => {
        const validate = publicAPIs.validate(field);
        return validate && !validate.valid;
      }
    );
  /**
   * Run a validation on field blur
   */
  const onFieldBlur = (event) => {
    // Only run if the field is in a form to be validated
    if (!event.target.form || !event.target.form.matches(selector)) return;

    // Validate the field
    publicAPIs.validate(event.target);
  };

  /**
   * Run a validation on a fields with errors when the value changes
   */
  const onFieldInput = (event) => {
    // Only run if the field is in a form to be validated
    if (!event.target.form || !event.target.form.matches(selector)) return;

    // Only run on fields with errors
    if (
      !event.target.closest(settings.fieldSelector) ||
      !event.target
        .closest(settings.fieldSelector)
        .classList.contains(settings.fieldModErrorClass)
    )
      return;

    // Validate the field
    publicAPIs.validate(event.target);
  };

  /**
   * Validate an entire form when it's submitted
   */
  const onFormSubmit = (event) => {
    // Only run on matching elements
    if (!event.target.matches(selector)) return;

    // Prevent form submission
    event.preventDefault();

    // Validate each field
    const errors = publicAPIs.validateAll(event.target);

    // If there are errors, focus on the first one
    if (errors.length > 0) {
      errors[0].focus();
      emitEvent(event.target, 'bouncerFormInvalid', { errors });
      return;
    }

    // Otherwise, submit if not disabled
    if (!settings.disableSubmit) {
      const formData = new FormData(event.target);
      const inputFiles = event.target.querySelectorAll('input[type=file]');
      const formHasFiles = Boolean(inputFiles[0]);
      let data;

      /*  Если в форме есть загружаемые файлы (например изображения) в api.upload передаётся переменная formData
          После нее добавляется параметр true, который убирает дефолтный content-type заголовок application/x-www-form-urlencoded из api.upload
          При этом у формы в разметке должен быть атрибут enctype="multipart/form-data"
          В противном случае данные сериализуются и отправляются с дефолтным типом x-www-form-urlencoded.
          Атрибута enctype в данном случае в разметке у формы быть не должно, т.к. x-www-form-urlencoded дефолтное значение)
      */
      if (formHasFiles) {
        if (
          [...inputFiles].some((input) =>
            input.parentElement.querySelector('.form__error')
          )
        )
          return;
      } else {
        data = new URLSearchParams(formData).toString;
      }

      const url = event.target.action;
      const body = formHasFiles ? formData : data;
      const boolean = formHasFiles;

      api.upload({
        url,
        body,
        boolean,
      });
    }

    // Emit custom event
    if (settings.emitEvents) {
      emitEvent(event.target, 'bouncerFormValid');
    }
  };

  /**
   * Destroy the current plugin instantiation
   */
  publicAPIs.destroy = () => {
    // Remove event listeners
    document.removeEventListener('blur', onFieldBlur, true);
    document.removeEventListener('change', onFieldBlur, true);
    document.removeEventListener('input', onFieldInput, false);
    document.removeEventListener('click', onFieldInput, false);
    document.removeEventListener('submit', onFormSubmit, false);

    // Remove all errors
    removeAllErrors(selector, settings);

    // Remove novalidate attribute
    removeNoValidate(selector);

    // Emit custom event
    if (settings.emitEvents) {
      emitEvent(document, 'bouncerDestroyed', {
        settings,
      });
    }

    // Reset settings
    settings = null;
  };

  publicAPIs.settings = extend(defaults, options || {});

  /**
   * Instantiate a new instance of the plugin
   */
  const init = () => {
    // Create settings
    settings = extend(defaults, options || {});

    // Add novalidate attribute
    addNoValidate(selector);

    // Event Listeners
    document.addEventListener('blur', onFieldBlur, true);
    document.addEventListener('change', onFieldBlur, true);
    document.addEventListener('input', onFieldInput, false);
    document.addEventListener('click', onFieldInput, false);
    document.addEventListener('submit', onFormSubmit, false);

    // Emit custom event
    if (settings.emitEvents) {
      emitEvent(document, 'bouncerInitialized', {
        settings,
      });
    }
  };

  //
  // Inits & Event Listeners
  //

  init();
  return publicAPIs;
};

//
// Return the constructor
//

export default Validation;
export { removeAllErrors };
