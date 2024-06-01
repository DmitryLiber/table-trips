/* eslint-disable no-await-in-loop */
import { readFile, writeFile } from 'node:fs/promises';
import { renameSync, existsSync } from 'fs';
import { exec } from 'child_process';
import gulp from 'gulp';
import clean from 'gulp-clean';
import cpy from 'cpy';
import htmlBemValidator from 'gulp-html-bem-validator';
import { htmlValidator } from 'gulp-w3c-html-validator';
import imagemin from 'gulp-imagemin';
import imageminWebp from 'imagemin-webp';
import newer from 'gulp-newer';
import rename from 'gulp-rename';
import beautifyHtml from 'gulp-html-beautify';
import glob from 'glob';

const FIND_STRINGS = {
  'src="/': 'src="./',
  "src='/": "src='./",
  'src=/': 'src=./',
  'href="/': 'href="./',
  "href='/": "href='./",
  'href=/': 'href=./',
  'url("/': 'url("../',
  "url('/": "url('../",
  'url(/': 'url(../',
  'url(&quot;/': 'url(&quot;../',
};

const FIND_STRINGS_JS = {
  'yn="modulepreload",Sn=function(t){return"/"+t}':
    'yn="modulepreload",Sn=function(t){return BASE_URL + t}',
};

const rootStaticFolders = ['img', 'upload'];

const copyFolders = {
  'src/fonts/*{woff,woff2}': 'fonts/',
  'src/responses/*': 'responses/',
  'src/favicon/*': '',
};

/* common build */

const renameStaticFolders = async (direction = '') => {
  rootStaticFolders.forEach((folder) => {
    const changePath = [`src/${folder}`, `src/${folder}-temp`];

    if (direction === '') {
      if (!existsSync(changePath[1])) {
        changePath.reverse();
      } else {
        return;
      }
    }

    if (direction === 'reverse') {
      if (existsSync(changePath[1])) {
        changePath.reverse();
      } else {
        return;
      }
    }

    renameSync(changePath[0], changePath[1]);
  });
};

const renameStaticFoldersReverse = async (cb) => {
  renameStaticFolders('reverse');
  cb();
};

/* before build */

const cleanPublic = () =>
  gulp.src('public', { read: false, allowEmpty: true }).pipe(clean());

const copyFiles = async (cb) => {
  Object.entries(copyFolders).forEach(([key, value]) => {
    const dest = `public/${value}`;
    cpy(key, dest);
  });
  cb();
};

const watcherFilesInit = async (cb) => {
  gulp.watch('src/{img,upload}/*', { events: 'all' }, () =>
    // eslint-disable-next-line no-console
    exec('npm run img', () => console.log('Картинки обновлены'))
  );
  cb();
};

const generateImages = async (cb) => {
  const quality = 85;

  rootStaticFolders.forEach((folder) => {
    gulp
      .src(`src/${folder}/*.{svg,SVG}`)
      .pipe(newer({ dest: `public/${folder}` }))
      .pipe(gulp.dest(`public/${folder}`));

    gulp
      .src(`src/${folder}/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}`)
      .pipe(newer({ dest: `public/${folder}`, ext: '.webp' }))
      .pipe(imagemin([imageminWebp({ quality })]))
      .pipe(rename({ extname: '.webp' }))
      .pipe(gulp.dest(`public/${folder}`));
  });

  cb();
};

export const preDev = gulp.parallel(gulp.series(copyFiles, generateImages));

export const watcherFiles = gulp.series(watcherFilesInit);

export const preBuild = gulp.series(
  renameStaticFoldersReverse,
  cleanPublic,
  generateImages,
  copyFiles
);

export const renameStaticFoldersBuild = gulp.series(renameStaticFolders);
export const renameStaticFoldersDev = gulp.series(renameStaticFoldersReverse);

export const img = gulp.series(generateImages);

/* after build */

const replacePath = async () => {
  const escapeRegExp = (string) =>
    string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  try {
    glob('build/**/*.{html,css}', {}, async (error, files) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const file of files) {
        let fileContent = await readFile(file, 'utf8');

        Object.entries(FIND_STRINGS).forEach(([key, value]) => {
          fileContent = fileContent.replace(
            new RegExp(escapeRegExp(key), 'g'),
            value
          );
        });

        await writeFile(file, fileContent, 'utf8');
      }
    });

    glob('build/**/*.js', {}, async (error, files) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const file of files) {
        let fileContent = await readFile(file, 'utf8');

        Object.entries(FIND_STRINGS_JS).forEach(([key, value]) => {
          fileContent = fileContent.replace(
            new RegExp(escapeRegExp(key), 'g'),
            value
          );
        });

        await writeFile(file, fileContent, 'utf8');
      }
    });

    // eslint-disable-next-line no-console
    console.log('\x1b[32m%s\x1b[0m', 'BUILD END!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Ошибка при чтении директории`);
  }
};

const htmlBeautifyInit = async (cb) => {
  const options = {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: 1,
    indent_with_tabs: true,
    inline: [],
  };
  gulp
    .src('./build/*.html')
    .pipe(beautifyHtml(options))
    .pipe(gulp.dest('./build/'));

  setTimeout(async () => {
    const result = await replacePath();
    if (result) {
      cb();
    }
  }, 1000);
};

export const afterBuild = gulp.parallel(
  htmlBeautifyInit,
  renameStaticFoldersReverse
);

/* TEST */
const validateBEM = () =>
  gulp.src([`build/*.html`, `!build/modal-*.html`, `!build/responses-*.html`]).pipe(htmlBemValidator());
const validateHTML = () =>
  gulp
    .src([`build/*.html`, `!build/modal-*.html`, `!build/responses-*.html`])
    .pipe(
      htmlValidator.analyzer({
        ignoreMessages: /^Section lacks heading. Consider using “h2”-“h6”/,
      })
    )
    .pipe(htmlValidator.reporter());

export const test = gulp.series(validateBEM, validateHTML);
