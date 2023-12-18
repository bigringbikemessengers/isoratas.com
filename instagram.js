import { readFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { format as formatPath } from 'path';

import posthtml from 'posthtml';
import expressions from 'posthtml-expressions';

import Instagram from 'instagram-basic-display';
import download from 'image-downloader';
import Sharp from 'sharp'

// https://developers.facebook.com/docs/instagram-basic-display-api/getting-started
const TOKEN = process.env.INSTAGRAM_TOKEN;
const IMAGE_DIR = process.env.INSTAGRAM_IMAGE_DIR || './images/instagram/'

const instagram = new Instagram({});

if (!existsSync(IMAGE_DIR)) mkdirSync(IMAGE_DIR);

const userMedia = await instagram.retrieveUserMedia(TOKEN, 100);
const feed = await Promise.all(
  userMedia
    .data
    .filter(({ media_type }) => media_type === 'IMAGE')
    .filter(({ permalink }) => permalink)
    .filter(({ media_url }) => media_url)
    .slice(0,12)
    .map(async function(post) {
      const { filename } = await download.image({url: post.media_url, dest: IMAGE_DIR})
      const image = Sharp(filename);
      const jpegOptions = { quality: 100, progressive: true };
      const path = suffix => formatPath({
        dir: IMAGE_DIR, name: [post.id, suffix].join('_'), ext: '.jpg'
      });
      await image.resize(600).jpeg(jpegOptions).toFile(path('l'));
      await image.resize(400).jpeg(jpegOptions).toFile(path('m'));
      await image.resize(200).jpeg(jpegOptions).toFile(path('s'));
      return {
        ...post,
        media_path: filename,
        media_path_small: path('s'),
        media_path_medium: path('m'),
        media_path_large: path('l'),
      }
    })
)

const template = readFileSync('instagram_feed.template.html')

await posthtml(expressions({ locals: { feed } }))
  .process(template)
  .then(result => console.log(result.html))

if (feed.length > 0) {
  copyFileSync(feed[0].media_path_large, './og.jpg');
}
