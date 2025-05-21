const fs = require('fs');
const path = require('path');

const postmanFile = './postman-collection.json'; // change if your file has a different name
const outputDir = './karate-features';

function sanitizeName(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
}

function buildKarateFeature(item, index) {
  const name = item.name || `request-${index}`;
  const method = item.request.method.toLowerCase();
  const url = item.request.url?.raw || item.request.url?.host?.join('.') || '';
  const headers = item.request.header || [];
  const body = item.request.body?.raw || null;

  let feature = `Feature: ${name}\n\n`;
  feature += `Scenario: ${name}\n`;
  feature += `  Given url '${url}'\n`;

  if (headers.length > 0) {
    feature += `  And headers ${JSON.stringify(
      Object.fromEntries(headers.map(h => [h.key, h.value]))
    )}\n`;
  }

  if (body && ['post', 'put', 'patch'].includes(method)) {
    try {
      const jsonBody = JSON.parse(body);
      feature += `  And request ${JSON.stringify(jsonBody, null, 2)}\n`;
    } catch (e) {
      feature += `  And request '''\n${body}\n  '''\n`;
    }
  }

  feature += `  When method ${method}\n`;
  feature += `  Then status 200\n`;

  return feature;
}

function convertPostmanToKarate() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const postmanData = JSON.parse(fs.readFileSync(postmanFile, 'utf-8'));
  const items = postmanData.item;

  items.forEach((item, idx) => {
    const filename = `${sanitizeName(item.name)}.feature`;
    const content = buildKarateFeature(item, idx);
    fs.writeFileSync(path.join(outputDir, filename), content);
    console.log(`✅ Created: ${filename}`);
  });

  console.log(`\n🎉 Done! Karate features saved to '${outputDir}'`);
}

convertPostmanToKarate();

