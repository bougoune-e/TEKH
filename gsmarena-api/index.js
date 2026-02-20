
const catalog = require('./src/services/catalog');
const deals = require('./src/services/deals');
const glossary = require('./src/services/glossary');
const search = require('./src/services/search');
const top = require('./src/services/top');
const memoryParser = require('./src/services/memoryParser');

module.exports = {
    catalog,
    deals,
    glossary,
    search,
    top,
    memoryParser,
};
