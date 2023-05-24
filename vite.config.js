import path from 'path';

const dirname = path.dirname(new URL(import.meta.url).pathname);

export default {
  root: path.resolve(dirname, 'src'),
  base: process.env.NODE_ENV === 'production' ? '/webgl-school-task001/' : '/',
  build: {
    outDir: path.resolve(dirname, 'dist'),
  },
};