import { addClass, removeClass } from '../../js/partials/utils';
import api from '../../js/partials/api';
import { maskPhone } from '../../js/partials/mask';
import validateForms, { removeAllErrors } from '../../js/partials/validation';

const parser = new DOMParser();
let lastTrigger;

const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
const changeBodyOffset = (isOpened = false) =>
  document.body.style.setProperty(
    '--scrollbar-width',
    isOpened ? `${scrollbarWidth}px` : 0
  );

const onCloseModal = () => {
  const activeModal = document.querySelector('.modal.is-open');
  changeBodyOffset();
  removeClass(document.body, 'modal-open');
  removeClass(activeModal, 'is-open');
  activeModal
    .querySelector('.close')
    .removeEventListener('click', onCloseModal);

  if (activeModal.querySelector('form')) {
    activeModal.querySelector('form').reset();
  }

  if (
    activeModal.querySelector('.js-validation') &&
    activeModal.querySelector('.js-validation [class*="error"')
  ) {
    removeAllErrors('.modal .js-validation', validateForms().settings);
  }

  if (lastTrigger) {
    lastTrigger.setAttribute('aria-expanded', 'false');
  }

  // eslint-disable-next-line no-use-before-define
  document.removeEventListener('keydown', onEscPress);
};

function onEscPress(evt) {
  if (evt.code === 'Escape') {
    onCloseModal();
  }
}

const onOpenModal = (modal) => {
  addClass(modal, 'is-open');
  modal.querySelector('.close').addEventListener('click', onCloseModal);
  document.addEventListener('keydown', onEscPress);
};

const onLoadModal = (string, evt) => {
  let modal;

  const doc = parser.parseFromString(string, 'text/html');

  modal = evt.target.closest('.modal');
  if (modal) {
    const content = doc.querySelector('.modal__content');
    const oldContent = modal.querySelector('.modal__content');
    modal.replaceChild(content, oldContent);
  } else {
    modal = doc.querySelector('.modal');

    document.body.appendChild(modal);
  }
  maskPhone('input[type="tel"]');
  onOpenModal(modal);
};

const onGetModal = async (evt) => {
  evt.preventDefault();
  const url = evt.target.href;
  const format = 'text';
  const cb = (data) => onLoadModal(data, evt);
  return api.load({ url, format, cb });
};

document.addEventListener('click', (evt) => {
  if (!evt.target.classList.contains('js-ajax-modal')) return;

  evt.preventDefault();

  evt.target.setAttribute('aria-expanded', 'true');
  lastTrigger = evt.target;

  const existModals = document.querySelectorAll('.modal');
  if (existModals[0]) {
    const targetModal = Array.from(existModals).find(
      (modal) => modal.id === evt.target.dataset.id
    );

    if (targetModal) {
      onOpenModal(targetModal);
      addClass(targetModal, 'is-open');
    } else {
      onGetModal(evt);
    }
  } else {
    onGetModal(evt);
  }

  addClass(document.body, 'modal-open');
  changeBodyOffset(true);
});
