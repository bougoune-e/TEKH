const gsmarena = require('./index');

async function test() {
  const brands = await gsmarena.catalog.getBrands();
  console.log(brands.slice(0, 5));
}

test();

