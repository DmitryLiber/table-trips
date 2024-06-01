const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

// Заголовки по дефолту
const headers = new Headers();
headers.append('X-Requested-With', 'XMLHttpRequest');

// Экземпляр парсера для парсинга строки  в DOM
const parser = new DOMParser();

// Проверка статуса ответа
const checkStatus = (response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
};

// Метод проверки статуса ответас, по дефолту json
const extractIn = (response, format = 'json') => {
  const formats = {
    json: () => response.json(),
    text: () => response.text(),
    formData: () => response.formData(),
    blob: () => response.blob(),
  };

  if (format in formats) {
    return formats[format]();
  }

  return console.error('there is no such format'); //eslint-disable-line
};

// Шаблон для модалки с ответом, либо на основе тега template (приоритет) в html, либо на основе шаблонных строк здесь
// В ответе должен быть ключ title или text, допускаются оба, обязателен любой из них
const getStatusTemplate = (response) => {
  const template = document.querySelector('#status-template');
  if (template) {
    const clone = template.content.cloneNode(true);
    const title = clone.querySelector('.modal__title');
    const text = clone.querySelector('.modal__text');
    if (title) {
      if (response.title) {
        //  или заменить на ключи, которые идут в ответе с бэка
        title.textContent = response.title;
      } else {
        title.remove();
      }
    }
    if (text) {
      if (response.text) {
        //  или заменить на ключи, которые идут в ответе с бэка;
        text.textContent = response.text;
      } else {
        text.remove();
      }
    }
    const modal = clone.querySelector('.modal');
    modal.classList.add('is-open');
    clone.querySelectorAll('.close, .btn').forEach((item) => {
      item.addEventListener('click', () => {
        item.closest('.modal').remove();
      });
    });

    return clone;
  }

  const templateString = `
  <div class="modal active">
    <div class="modal__content">
    ${
      response && response.title
        ? `<h2 class="modal__title">${response.title}</h2>`
        : ``
    }
    ${
      response && response.text
        ? `<p class="modal__text">${response.text}</p>`
        : ``
    }
    </div>
  </div>
  `;

  return parser.parseFromString(templateString, 'text/html');
};

// Показ модалки с ответом, по деолфту выводится в callback запроса
const showStatus = (status) => {
  const template = getStatusTemplate(status);
  const activeModal = document.querySelector('.modal.is-open');
  if (activeModal) {
    const closeBtn = activeModal.querySelector('.modal__close');
    const event = new Event('click');
    closeBtn.dispatchEvent(event);
  }
  document.body.appendChild(template);
};

// Код запроса
const request = async (
  { url, body = null, method = Method.GET },
  format,
  cb = showStatus
) => {
  try {
    const response = await fetch(url, {
      method,
      body,
      headers,
    });

    // Если редирект (например при авторизации)
    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    // Проверяем статус ответа
    const status = await checkStatus(response);
    // Парсим в нужном формате
    const data = await extractIn(status, format);

    /* Примеры добавления логики в рамках конкретного проекта:

    Вывод ошибок в форму, а не в модал - например, в авторизации:

    1. Бэк отдает в ответе status: 'error' и name формы авторизации,
    2. Находим в DOM по name форму и выводим в див form__error ошибки вместо модала
    3. return в конце не даст выполниться следующему коду (наприер выводу модала)

    if (data.status === 'error') {
      if (data.form_name) {
        const form = document.querySelector(`[name=${data.form_name}]`);
        const errorParent = form.querySelector('.form__error');
        errorParent.innerHTML = data.text.join(',');
        return;
      }
    }

    Сброс значений в полях формы, после успешного ответа:

    if (data.status === 'ok') {
      if (data.form_name) {
        const form = document.querySelector(`[name=${data.form_name}]`);
        form.reset();
      }
    }
    */

    // Передача данных в коллбек, если он передан
    if (cb) {
      return cb(data); // eslint-disable-line
    }
    return data; // eslint-disable-line
  } catch (err) {
    showStatus(err);
    return console.error(err); // eslint-disable-line
  }
};

export default {
  // Get запрос
  load({ url, format, cb }) {
    return request({ url }, format, cb);
  },

  // POST запрос
  upload({ url, body, boolean, format, cb }) {
    if (!boolean) {
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
    }
    return request(
      {
        url,
        method: Method.POST,
        body,
        headers,
      },
      format,
      cb
    );
  },
};
