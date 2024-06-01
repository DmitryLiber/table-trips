import Swiper, { A11y } from 'swiper';
import { speed } from './const';

export default (el, options) => {
  let mergedOptions;
  const defaultOptions = {
    modules: [A11y],
    slidesPerView: 'auto',
    watchSlidesProgress: true,
    speed,
    a11y: true,
  };

  if (options && typeof options === 'object') {
    mergedOptions = { ...defaultOptions, ...options };
    if (options.modules) {
      mergedOptions.modules = [
        ...new Set([...defaultOptions.modules, ...options.modules]),
      ];
    }
  }

  return new Swiper(el, mergedOptions || defaultOptions);
};
