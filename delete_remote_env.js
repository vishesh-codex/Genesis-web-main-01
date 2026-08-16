const https = require('https');

const TOKEN = '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';
const OWNER = 'vishesh-codex';
const REPO = 'Genesis-web-main-01';

function deleteFileFromGithub(path, sha) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: 'Remove sensitive .env file from public repository',
      sha: sha,
      branch: 'main'
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${path}`,
      method: 'DELETE',
      headers: {
        'User-Agent': 'NodeJS-Uploader',
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(postData);
    req.end();
  });
}

function getFileSha(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${path}`,
      method: 'GET',
      headers: {
        'User-Agent': 'NodeJS-Uploader',
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.sha || null);
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.end();
  });
}

async function run() {
  console.log('Checking for .env file on GitHub...');
  const sha = await getFileSha('.env');
  if (sha) {
    console.log(`.env file found on GitHub (SHA: ${sha}). Deleting now...`);
    const res = await deleteFileFromGithub('.env', sha);
    if (res.status === 200 || res.status === 204) {
      console.log('SUCCESS: .env file DELETED from GitHub repository!');
    } else {
      console.log('Delete result:', res);
    }
  } else {
    console.log('CONFIRMED: .env file is NOT on GitHub repository!');
  }
}

run();
