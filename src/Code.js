function doGet(e) {
  const MAINTENANCE_MODE = false;
  const FAV_ICON =
    'https://raw.githubusercontent.com/cactusfashions/logo/refs/heads/main/cactus_fashions_logo.png';

  if (MAINTENANCE_MODE) {
    return HtmlService.createHtmlOutput(
      '<div style="text-align:center; margin-top:30vh; font-size:2em;">🚧 Under Maintenance 🚧</div>'
    )
      .setTitle('Under Maintenance')
      .setFaviconUrl(FAV_ICON)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  const form = e.parameter?.form || 'new-task';

  let TITLE = 'New Task';
  let path = 'new-task';

  const app = HtmlService.createTemplateFromFile(`frontend/${path}/index.html`);
  app.userType = form;
  app.title = TITLE;

  return app
    .evaluate()
    .setTitle(`${TITLE} | Cactus Fashions`)
    .setFaviconUrl(FAV_ICON)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(fileName) {
  return HtmlService.createHtmlOutputFromFile(fileName).getContent();
}
