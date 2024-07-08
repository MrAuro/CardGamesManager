// Moves the homepage dist folder to /docs/override and pre/appends neccessary mkdocs snippets

import fs from "fs";
import path from "path";

const __dirname = path.join(".", "homepage");

const distPath = path.join(__dirname, "/dist/homepage");
const docsPath = path.join(__dirname, "../docs/overrides");

if (!fs.existsSync(docsPath)) {
  throw new Error("docs path does not exist", docsPath);
}

if (!fs.existsSync(distPath)) {
  throw new Error("dist path does not exist", distPath);
}

const indexHtmlPath = path.join(distPath, "index.html");
const homeHtmlPath = path.join(docsPath, "home.html");

const prependText = `
{#- This file was automatically generated - do not edit -#} {% extends "main.html" %} {% block tabs
%} {{ super() }}
<style>
  .md-header {
    position: initial;
  }
  .md-main__inner {
    margin: 0;
  }
  .md-content {
    display: none;
  }
  @media screen and (min-width: 60em) {
    .md-sidebar--secondary {
      display: none;
    }
  }
  @media screen and (min-width: 76.25em) {
    .md-sidebar--primary {
      display: none;
    }
  }
</style>`;

const appendText = `
{% endblock %} {% block content %}{% endblock %} {% block footer %}{% endblock %}
`;

fs.readFile(indexHtmlPath, "utf8", (err, data) => {
  if (err) {
    throw err;
  }

  const updatedData = prependText + data + appendText;

  fs.writeFile(homeHtmlPath, updatedData, (err) => {
    if (err) {
      throw err;
    }

    console.log("✅ home.html written successfully");
  });
});

// Copy app.css and index.js to docs/overrides
const appCssPath = path.join(distPath, "app.css");
const appJsPath = path.join(distPath, "index.js");

const appCssDestPath = path.join(docsPath, "app.css");
const appJsDestPath = path.join(docsPath, "index.js");

fs.copyFile(appCssPath, appCssDestPath, (err) => {
  if (err) {
    throw err;
  }

  console.log("✅ app.css copied successfully!");
});

fs.copyFile(appJsPath, appJsDestPath, (err) => {
  if (err) {
    throw err;
  }

  console.log("✅ index.js copied successfully!");
});
