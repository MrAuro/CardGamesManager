import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "CardGamesManager",
  tagline: "Empower your card game experience",
  favicon: "img/favicon.ico",
  url: "https://cardgamesmanager.mrauro.dev",
  baseUrl: "/",
  organizationName: "mrauro",
  projectName: "cardgamesmanager",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/mrauro/cardgamesmanager/tree/main/packages/docs/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "CardGamesManager",
      logo: {
        alt: "Logo",
        src: "img/logo.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Tutorial",
        },
        {
          position: "right",
          type: "html",
          value: `<a href="https://github.com/mrauro/cardgamesmanager" target="_blank" style="content: \'\'; width: 24px; height: 24px; background-image: url(\'img/github-mark-white.svg\'); background-repeat: no-repeat;  background-size: 24px 24px; display: flex">`,
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Tutorial",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/docusaurus",
            },
            {
              label: "Discord",
              href: "https://discordapp.com/invite/ZHqpuszdaM",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/mrauro/cardgamesmanager",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MrAuro • Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
