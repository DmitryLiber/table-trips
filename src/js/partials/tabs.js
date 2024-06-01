import { switchActiveClass } from './utils';

const BTN_CLASS_NAME = 'tabs__btn';
const CONTENT_CLASS_NAME = `tabs__content`;
const PANEL_CLASS_NAME = 'tabs__panel';

class Tabs {
  static #setAttrIfNotExists(el, attr, value) {
    if (!el.hasAttribute(attr)) {
      el.setAttribute(attr, value);
    }
  }

  constructor(tabs, i) {
    this.tabs = tabs;
    this.index = i;
    this.tabsBtns = this.tabs.querySelectorAll(`.${BTN_CLASS_NAME}`);
    this.tabsContent = this.tabs.querySelector(`.${CONTENT_CLASS_NAME}`);
    this.tabsPanels = this.tabs.querySelectorAll(`.${PANEL_CLASS_NAME}`);
    this.switсhTab = this.switсhTab.bind(this);
    this.init();
  }

  setInitalAttrs() {
    Tabs.#setAttrIfNotExists(this.tabsBtns[0].parentElement, 'role', 'tablist');

    this.tabsBtns.forEach((btn, i) => {
      Tabs.#setAttrIfNotExists(btn, 'role', 'tab');
      btn.setAttribute('aria-selected', btn.classList.contains('active'));
      btn.setAttribute('id', `tab-${this.index}-${i}`);
    });

    this.tabsPanels.forEach((panel, i) => {
      Tabs.#setAttrIfNotExists(panel, 'role', 'tabpanel');
      panel.setAttribute('id', `panel-${this.index}-${i}`);
      panel.setAttribute(
        'aria-labelledby',
        this.tabsBtns[i].getAttribute('id')
      );
    });

    this.tabsBtns.forEach((btn, i) => {
      btn.setAttribute('aria-controls', this.tabsPanels[i].getAttribute('id'));
    });
  }

  switсhTab(evt) {
    if (evt.target.tagName !== 'BUTTON') return;
    const i = Array.from(this.tabsBtns).indexOf(evt.target);

    switchActiveClass(this.tabs, i, `.${BTN_CLASS_NAME}`);
    this.switchBlocks(i);
  }

  switchBlocks(i) {
    switchActiveClass(this.tabsContent, i);
    this.tabsPanels[i].classList.add('active');
  }

  addListeners() {
    this.tabs.addEventListener('click', this.switсhTab);
  }

  init() {
    this.setInitalAttrs();
    this.addListeners();
  }
}

export default (selector = '.tabs') => {
  const tabs = document.querySelectorAll(selector);
  if (tabs[0]) {
    tabs.forEach((item, i) => new Tabs(item, i));
  }
};
