/**
 * Создает новый элемент на основе предоставленного шаблона.
 *
 * @param {string} template - HTML-шаблон, используемый для создания нового элемента.
 * @return {Node} Первый дочерний элемент, созданный элементом.
 */
export const createElement = (template) => {
  const newElement = document.createElement(`div`);
  newElement.innerHTML = template;
  return newElement.firstChild;
};

/**
 * Добавляет класс элементу.
 *
 * @param {Element} el - Элемент, к которому нужно добавить класс.
 * @param {string} className - Имя класса, который нужно добавить.
 */
export const addClass = (el, className) => {
  el.classList.add(className);
};

/**
 * Удаляет указанный класс из списка классов элемента.
 *
 * @param {HTMLElement} el - Элемент, из которого нужно удалить класс.
 * @param {string} className - Имя класса, который нужно удалить.
 */
export const removeClass = (el, className) => {
  el.classList.remove(className);
};

export const hasClass = (el, className) => el.classList.contains(className);

/**
 * Переключает заданное имя класса на элементе.
 *
 * @param {HTMLElement} el - Элемент, на котором нужно переключить класс.
 * @param {string} className - Имя класса, которое нужно переключить.
 */
export const toggleClass = (el, className) => {
  el.classList.toggle(className);
};

/**
 * Удаляет элемент из DOM.
 *
 * @param {Element} el - Элемент, который нужно удалить.
 */
export const removeElement = (el) => {
  el.parentElement.removeChild(el);
};

/**
 * Сериализует данные формы в строку запроса.
 *
 * @param {FormData} formData - Данные формы для сериализации.
 * @return {string} Сериализованная строка запроса.
 */
export const serialize = (formData) =>
  [...formData].reduce((acc, [key, value]) => {
    if (acc.length > 0) {
      // eslint-disable-next-line no-param-reassign
      acc += '&';
    }
    // eslint-disable-next-line no-param-reassign
    acc += encodeURI(`${key}=${value}`);

    return acc;
  }, '');

/**
 * Проверяет видимость целевых элементов во вьюпорте с использованием API Intersection Observer.
 *
 * @param {Object} params - Объект со следующими свойствами:
 *   - targetEls: {Array} Массив целевых элементов для наблюдения.
 *   - cb: {Function} Функция обратного вызова, которая будет выполнена при пересечении элемента с вьюпортом.
 *   - options: {Object} Дополнительные параметры для Intersection Observer.
 *   - className: {string} Имя класса, которое будет применено к целевому элементу при его пересечении с вьюпортом.
 *   - unobserve: {boolean} Булево значение, указывающее, нужно ли прекратить наблюдение за целевым элементом после его пересечения с вьюпортом. По умолчанию true.
 *
 * @return {undefined}
 */
export const checkVisible = ({
  targetEls,
  cb,
  options,
  className,
  unobserve = true,
}) => {
  if (
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  ) {
    const IO = new IntersectionObserver(
      // eslint-disable-next-line
      function (entries, IO) {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // eslint-disable-next-line
            return;
            // eslint-disable-next-line
          } else {
            cb(entry.target, className);

            if (unobserve) IO.unobserve(entry.target);
          }
        });
      },
      options
    );

    targetEls.forEach((elem) => IO.observe(elem));
  }
};

/**
 * Переключает активный класс элемента на основе предоставленного индекса.
 *
 * @param {HTMLElement} parentEl - Родительский элемент, содержащий элементы, на которых нужно переключить активный класс.
 * @param {number} activeIndex - Индекс элемента, который нужно установить активным.
 * @param {string} classEl - Селектор элементов, на которых нужно переключить активный класс. По умолчанию ''.
 * @param {string} className - Имя класса, которое будет добавлено к активному элементу. По умолчанию 'active'.
 */
export const switchActiveClass = (
  parentEl,
  activeIndex,
  classEl = '',
  className = 'active'
) => {
  const currentActiveEl = parentEl.querySelector(`.${className}`);

  if (currentActiveEl) {
    removeClass(currentActiveEl, className);
    currentActiveEl.setAttribute('aria-selected', false);
  }

  if (classEl) {
    addClass(parentEl.querySelectorAll(classEl)[activeIndex], className);
    parentEl
      .querySelectorAll(classEl)
      [activeIndex].setAttribute('aria-selected', true);
  } else {
    addClass(parentEl.children[activeIndex], className);
    parentEl.children[activeIndex].setAttribute('aria-selected', true);
  }
};

/**
 * Замедляет выполнение функции.
 *
 * @param {number} delay - Задержка в миллисекундах перед выполнением функции.
 * @param {function} fn - Функция, которую нужно замедлить.
 * @return {function} - Замедленная функция.
 */
export const throttle = (delay, fn) => {
  let last;
  let deferTimer;
  return (...args) => {
    const context = this;
    const now = +new Date();
    if (last && now < last + delay) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fn.apply(context, args);
      }, delay);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
};

/**
 * Проверяет, скрыт ли элемент.
 *
 * @param {Object} elem - Элемент, который нужно проверить.
 * @returns {boolean} - Возвращает true, если элемент скрыт, иначе false.
 */
export const isHidden = (elem) => {
  const styles = window.getComputedStyle(elem);
  return styles.display === 'none' || styles.visibility === 'hidden';
};

/**
 * Переключает видимость панели и обновляет состояние аккордеона.
 *
 * @param {HTMLElement} item - Элемент панели.
 * @param {Event} evt - Событие, вызванное пользователем.
 * @param {HTMLElement} el - Необязательно. Элемент панели.
 */
export const togglePanel = (item, evt, el) => {
  evt.preventDefault();
  item.classList.toggle('active');
  const panel = el || item.nextElementSibling;
  panel.classList.toggle('active');
  const parentAccordion = item.closest('.accordion__panel');
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
    if (parentAccordion && window.getComputedStyle(parentAccordion).maxHeight) {
      const oldHeight = parseInt(
        window.getComputedStyle(parentAccordion).maxHeight,
        10
      );
      parentAccordion.style.maxHeight = oldHeight;
    }
  } else {
    if (parentAccordion && window.getComputedStyle(parentAccordion).maxHeight) {
      const oldHeight = parseInt(
        window.getComputedStyle(parentAccordion).maxHeight,
        10
      );

      parentAccordion.style.maxHeight = `${panel.scrollHeight + oldHeight}px`;
    }
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  }
};

/**
 * Создает и возвращает новую функцию, которая откладывает вызов входной функции
 * @param {function} func - Входная функция, которую нужно отложить.
 * @param {number} [timeout=300] - Количество миллисекунд для задержки.
 * @return {function} Отложенная функция.
 */
export function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

/**
 * Управление количеством товара.
 *
 * Разметка:
 * .quantity
 *   .quantity__button.quantity__button_plus._icon-plus
 *   .quantity__input
 *     input(autocomplete='off', type='number', name='form[]', value='1')
 *   .quantity__button.quantity__button_minus._icon-minus
 */
export const changingQuantity = () => {
  document.addEventListener('click', (e) => {
    const targetElement = e.target;
    if (!targetElement.closest('.quantity__button')) return;
    let value = parseInt(
      targetElement.closest('.quantity').querySelector('input').value,
      10
    );
    if (targetElement.classList.contains('quantity__button_plus')) {
      // eslint-disable-next-line no-plusplus
      value++;
    } else {
      // eslint-disable-next-line no-plusplus
      --value;
      if (value < 1) value = 1;
    }
    targetElement.closest('.quantity').querySelector('input').value = value;
  });
};
