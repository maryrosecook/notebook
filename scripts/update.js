const pages = require("./pages");
const path = require("path");
const execSyncShellWithOutput = require("./exec-sync-shell-with-output");

console.log("Generating content for:");
console.log(pages.entryPaths().map(p => path.basename(p)).join("\n"));

execSyncShellWithOutput("chmod -R 755 content");

pages.removeSpacesFromFilenames(pages.entryPaths());
pages.generateIndexPages(pages.entryPaths());

execSyncShellWithOutput("rsync -au content/ do:/var/www/notebook.maryrosecook.com/");
