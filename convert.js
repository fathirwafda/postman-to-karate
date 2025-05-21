const fs = require('fs');
const path = require('path');

const postmanFile = './postman-collection.json'; // change if your file has a different name
const outputDir = './karate-features';
const requestBodiesDir = path.join(outputDir, 'requestBodies');

function sanitizeName(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
}

function convertHeaderValue(val) {
  if (!val) return '""';
  val = val.trim();

  const varMatch = val.match(/^\{\{(.+?)\}\}$/);
  if (varMatch) {
    return varMatch[1];
  }

  if (val === '$randomUUID') return 'uuid()';
  if (val === '$ulid') return 'ulid()';

  return `"${val.replace(/"/g, '\\"')}"`;
}

function saveRequestBodyJson(name, jsonBody) {
  if (!fs.existsSync(requestBodiesDir)) {
    fs.mkdirSync(requestBodiesDir, { recursive: true });
  }
  const filename = `${sanitizeName(name)}-requestBody.json`;
  const filepath = path.join(requestBodiesDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(jsonBody, null, 2));
  return filename;
}

function buildKarateFeature(item, index) {
  const name = item.name || `request-${index}`;
  const method = item.request.method.toLowerCase();

  let url = '';
  if (typeof item.request.url === 'string') {
    url = item.request.url;
  } else if (item.request.url?.raw) {
    url = item.request.url.raw;
  } else if (item.request.url?.host && item.request.url?.path) {
    url = item.request.url.host.join('') + '/' + item.request.url.path.join('/');
  }

  const headers = item.request.header || [];
  const body = item.request.body?.raw || null;

  let feature = `Feature: ${name}\n\n`;
  feature += `Scenario: ${name}\n`;
  feature += `  Given url '${url}'\n`;

  if (headers.length > 0) {
    headers.forEach(h => {
      if (!h.key || !h.value) return;
      feature += `  And header ${h.key} = ${convertHeaderValue(h.value)}\n`;
    });
  }

  if (body && ['post', 'put', 'patch'].includes(method)) {
    try {
      const jsonBody = JSON.parse(body);
      // Save request body to external json file and reference it
      const filename = saveRequestBodyJson(name, jsonBody);
      feature += `  * def requestBody = read('classpath:requestBodies/${filename}')\n`;
      feature += `  And request requestBody\n`;
    } catch (e) {
      // If invalid JSON, fallback to inline multiline string
      feature += `  * def requestBody = \n    """\n${body}\n    """\n`;
      feature += `  And request requestBody\n`;
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
