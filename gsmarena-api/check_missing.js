const fs = require('fs');
const csv = require('csv-parser');

async function checkMissing() {
    const JSON_FILE = 'data.json';
    const CSV_FILE = 'tab_cleaned.csv';

    console.log(`Loading ${JSON_FILE}...`);
    const phoneData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
    const jsonModels = new Set(phoneData
        .filter(p => p && p.phone_brand && p.phone_model)
        .map(p => `${p.phone_brand.toLowerCase()} ${p.phone_model.toLowerCase()}`));

    console.log(`Checking ${CSV_FILE}...`);
    const csvModels = new Set();
    const missing = [];

    await new Promise((resolve) => {
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => {
                const brand = (row.marques || "").trim().toLowerCase();
                const model = (row.modele_exact || "").trim().toLowerCase();
                const fullName = `${brand} ${model}`;

                if (!csvModels.has(fullName)) {
                    csvModels.add(fullName);

                    // Simple check
                    let found = false;
                    if (jsonModels.has(fullName)) found = true;
                    else {
                        // More flexible search
                        for (const jsonName of jsonModels) {
                            if (jsonName.includes(model) && (jsonName.includes(brand) || brand === "google pixel" && jsonName.includes("google"))) {
                                found = true;
                                break;
                            }
                        }
                    }

                    if (!found) {
                        missing.push({ brand: row.marques, model: row.modele_exact });
                    }
                }
            })
            .on('end', resolve);
    });

    console.log(`\nFound ${csvModels.size} unique models in CSV.`);
    console.log(`Missing from JSON: ${missing.length}`);

    if (missing.length > 0) {
        console.log("\nSample missing models:");
        missing.slice(0, 20).forEach(m => console.log(`- ${m.brand} ${m.model}`));

        fs.writeFileSync('missing_models.json', JSON.stringify(missing, null, 2));
        console.log("\nSaved missing models to missing_models.json");
    }
}

checkMissing();
