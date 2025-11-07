import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span>NorChain Documentation</span>,
  project: {
    link: 'https://github.com/nor-chain/norchain-monorepo',
  },
  chat: {
    link: 'https://discord.gg/norchain',
  },
  docsRepositoryBase: 'https://github.com/nor-chain/norchain-monorepo/tree/main/apps/docs',
  footer: {
    text: 'NorChain Ecosystem Documentation',
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
  },
  search: {
    placeholder: 'Search documentation...',
  },
  editLink: {
    text: 'Edit this page on GitHub →',
  },
  primaryHue: 200,
  primarySaturation: 100,
};

export default config;

