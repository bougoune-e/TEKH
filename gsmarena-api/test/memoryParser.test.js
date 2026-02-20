const assert = require('assert');
const { parseMemorySpec } = require('../src/services/memoryParser');

const testCases = [
    {
        name: 'Single variant',
        input: '64GB 4GB RAM',
        expected: {
            variants: [{ storage_gb: 64, ram_gb: 4 }],
            ram_options: [4],
            storage_options: [64]
        }
    },
    {
        name: 'Two variants',
        input: '128GB 6GB RAM, 256GB 8GB RAM',
        expected: {
            variants: [
                { storage_gb: 128, ram_gb: 6 },
                { storage_gb: 256, ram_gb: 8 }
            ],
            ram_options: [6, 8],
            storage_options: [128, 256]
        }
    },
    {
        name: 'Three variants with duplicates',
        input: '128GB 8GB RAM, 256GB 12GB RAM, 512GB 12GB RAM',
        expected: {
            variants: [
                { storage_gb: 128, ram_gb: 8 },
                { storage_gb: 256, ram_gb: 12 },
                { storage_gb: 512, ram_gb: 12 }
            ],
            ram_options: [8, 12],
            storage_options: [128, 256, 512]
        }
    },
    {
        name: 'Mixed spacing',
        input: '64 GB 4 GB RAM , 128GB 8GB RAM',
        expected: {
            variants: [
                { storage_gb: 64, ram_gb: 4 },
                { storage_gb: 128, ram_gb: 8 }
            ],
            ram_options: [4, 8],
            storage_options: [64, 128]
        }
    },
    {
        name: 'Empty input',
        input: '',
        expected: {
            variants: [],
            ram_options: [],
            storage_options: []
        }
    },
    {
        name: 'Invalid input',
        input: 'Not a spec',
        expected: {
            variants: [],
            ram_options: [],
            storage_options: []
        }
    }
];

function runTests() {
    console.log('Running Memory Parser Tests...\n');
    let passed = 0;
    let failed = 0;

    for (const { name, input, expected } of testCases) {
        try {
            const actual = parseMemorySpec(input);
            assert.deepStrictEqual(actual, expected);
            console.log(`✅ PASSED: ${name}`);
            passed++;
        } catch (err) {
            console.log(`❌ FAILED: ${name}`);
            console.log(`   Input: "${input}"`);
            console.log(`   Expected: ${JSON.stringify(expected)}`);
            console.log(`   Actual:   ${JSON.stringify(parseMemorySpec(input))}`);
            failed++;
        }
    }

    console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runTests();
