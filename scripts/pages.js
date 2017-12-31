const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const _ = require("lodash");

function generateIndexPages(entryPaths) {
  let indexPages_ = indexPages(indexPageEntries(entryPaths).length);
  let htmls = indexPageHtmls(indexPages_, entryPaths);

  _.zip(indexPages_, htmls)
    .map(nameHtml => writePageFile(nameHtml[0].filename, nameHtml[1]));
};

function indexPageHtmls(indexPages, entryPaths) {
  return indexPageEntries(orderedEntriesHtml(entryPaths))
    .map(html => indexPageHtml(indexPages, html));
};

function indexPageEntries(entries) {
  return _.chunk(entries, 50);
};

function indexPages(indexPageCount) {
  return [{ filename: "index.html", description: "home" }]
    .concat(
      _
        .range(1, indexPageCount)
        .map(i => {
          return { filename: `index${i}.html`, description: `${i}` };
        })
    );
};

function writePageFile(name, content) {
  fs.writeFileSync(path.join(entriesPath(), name),
                   content);
};

function indexPageHtml(indexPages, entriesHtml) {
  return [headerHtml()]
    .concat(entriesHtml)
    .concat(footerHtml(indexPages))
    .join("\n\n");
};

function orderedEntriesHtml(entryPaths) {
  return entryPaths
    .map(path => fs.readFileSync(path, "utf8"))
    .sort((html1, html2) => entryTime(html2) < entryTime(html1))
    .reverse();
};

function entryTime(html) {
  return new Date(cheerio.load(html)("meta[name='created']").attr("content"))
    .getTime();
};

function headerHtml() {
  return fs.readFileSync(headerPath(), "utf8");
};

function footerHtml(indexPages) {
  let footerHtml = fs.readFileSync(footerPath(), "utf8");
  let links = indexPages
      .map((indexPage, i) => {
        return `<a href="${indexPage.filename}">${indexPage.description}</a>`
      })
      .join(", ");
  return footerHtml.replace("{{content}}", links);
};

function includesPath() {
  return path
    .join(__dirname, "..", "includes");
};

function headerPath() {
  return path.join(includesPath(), "header.html");
};

function footerPath() {
  return path.join(includesPath(), "footer.html");
};

function removeSpacesFromFilenames(entryPaths) {
  entryPaths
    .forEach(filepath => {
      fs.renameSync(filepath,
                    removeSpacesFromBasename(filepath));
    });
};

function entryPaths() {
  return fs.readdirSync(entriesPath())
    .map(name => path.join(entriesPath(), name))
    .filter(path => fs.statSync(path).isFile())
    .filter(path => !path.match(/\/\.DS_Store$/))
    .filter(path => !path.match(/\/\index\d*\.html$/));
};

function entriesPath() {
  return path.join(__dirname, "../content");
};

function removeSpacesFromBasename(filepath) {
  return path.join(path.dirname(filepath),
                   removeSpaces(path.basename(filepath)));
};

function removeSpaces(name) {
  return name.replace(/ /g, "");
};

module.exports = {
  removeSpacesFromFilenames,
  entryPaths,
  generateIndexPages
};
