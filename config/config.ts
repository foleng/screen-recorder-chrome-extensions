import { defineConfig } from '@umijs/max';

export default defineConfig({
  plugins: [require.resolve('umi-plugin-extensions')],
  mpa: {
    template: 'src/template/index.html',
  },
  extensions: {
    name: 'Umi Chrome Extension Template',
    description: '基于 Umi 的 Chrome 插件开发脚手架',
    optionsUI: {
      page: '@/pages/options',
      openInTab: true,
    },
    background: { service_worker: '@/background/index' },
    popupUI: {
      title: '点击我吧',
      type: 'browserAction',
    },
    contentScripts: [
      { matches: ['<all_urls>'], entries: ['@/contentScripts/all'], runAt: 'document_start' },
    ],
    host_permissions: ['<all_urls>'],
    permissions: [
      'desktopCapture',
      'downloads',
      'activeTab',
      'tabs',
      'identity',
      'storage',
      'unlimitedStorage',
      'tabs',
      'tabCapture',
      'scripting',
    ],

    icons: {
      16: 'logo/16.png',
      32: 'logo/32.png',
      48: 'logo/48.png',
      128: 'logo/128.png',
    },
  },
});
