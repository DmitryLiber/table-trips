import fs from 'fs';
import { mkdirp } from 'mkdirp';

let blockName = process.argv[2];

const kebabToCamel = (s) => s.replace(/(-\w)/g, (m) => m[1].toUpperCase());

const uniqueArray = (arr) => {
  const obj = {};

  for (let i = 0; i < arr.length; i += 1) {
    const str = arr[i];
    obj[str] = true;
  }

  return Object.keys(obj);
};

const extensions = uniqueArray(process.argv.slice(3) || []);

const create = async () => {
  if (blockName) {
    const dirPath = `src/components/${blockName}/`;
    const createFolder = async () => {
      const folder = await mkdirp(dirPath);
      return folder === 'undefined' ? folder : dirPath;
    };
    if (await createFolder()) {
      console.log(` Папка создана: ${dirPath}`);
      if (extensions.includes('all')) {
        extensions.push('scss', 'pug', 'json', 'js');

        extensions.splice(
          extensions.findIndex((ext) => ext === 'all'),
          1
        );
      }
      extensions.forEach((extension) => {
        let fileContent = '';
        const filePath = `${dirPath + blockName}.${extension}`;
        if (extension === 'scss') {
          fileContent = `.${blockName} {\n\n}`;
          if (!fs.existsSync(filePath)) {
            fs.appendFileSync(
              `./src/scss/main.scss`,
              `\n@import '../components/${blockName}/${blockName}';`
            );
          }
        }
        if (extension === 'pug') {
          if (!fs.existsSync(filePath)) {
            fs.appendFileSync(
              `./src/pug/mixins.pug`,
              `\ninclude ../components/${blockName}/${blockName}.pug`
            );
          }
          fileContent = `
mixin ${blockName}(mods)
  - const allMods = mods && mods.split(',').map((mod) => \`${blockName}--\${mod.trim()}\`).join(' ')
  section.${blockName}(class=allMods)&attributes(attributes)
    .container
      h2.block-title.${blockName}__title
      .${blockName}`;
        }
        if (extension === 'json') {
          blockName = kebabToCamel(blockName);
          fileContent = `{\n  "${blockName}": []\n}`;
        }
        if (extension === 'js') {
          if (!fs.existsSync(filePath)) {
            fs.appendFileSync(
              `./src/js/partials/imports.js`,
              `\nimport '../../components/${blockName}/${blockName}';`
            );
          }
        }
        if (fs.existsSync(filePath)) {
          console.log(`Файл НЕ создан: ${filePath} уже существует`); // eslint-disable-line
        } else {
          fs.writeFile(filePath, fileContent, (error) => {
            if (error) {
              return console.log(`Файл НЕ создан: ${error}`); // eslint-disable-line
            }
            return console.log(`Файл создан: ${filePath}`); // eslint-disable-line
          });
        }
      });
    }
  } else {
    console.log('Отмена: не указан блок'); // eslint-disable-line
  }
};

if (extensions.length === 0) {
  console.log('Не указан формат');
} else {
  create();
}
