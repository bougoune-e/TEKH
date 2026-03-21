#!/usr/bin/env node
/**
 * Test minimal eBay OAuth + médiane (sans DB).
 * npm run prt:test-ebay
 */
import { loadRepoEnv } from "./load-env.mjs";
import { fetchPrtForModel } from "../../tekh_backend/backend/lib/ebay.mjs";

loadRepoEnv();

const q = process.argv[2] || "Samsung Galaxy A54 128GB";

fetchPrtForModel(q)
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
  })
  .catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  });
