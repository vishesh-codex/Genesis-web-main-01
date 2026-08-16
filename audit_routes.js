const fs = require('fs');
const path = require('path');

// 1. Walk directory to collect all files
function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'public') {
        results = results.concat(walk(fullPath));
      }
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

// Normalize path separators to forward slash
function norm(p) {
  return p.replace(/\\/g, '/');
}

const allFiles = walk('.');

// 2. Discover App Router routes
const appRoutes = new Set();
const apiRoutes = new Set();

allFiles.forEach(f => {
  const file = norm(f);
  if (file.startsWith('app/')) {
    // page.tsx, page.jsx, page.js
    const matchPage = file.match(/^app\/(.+)\/page\.(tsx|jsx|js)$/);
    if (matchPage) {
      let route = '/' + matchPage[1];
      // remove group routes e.g. (auth)
      route = route.replace(/\/\([^)]+\)/g, '');
      appRoutes.add(route);
    } else if (file === 'app/page.tsx' || file === 'app/page.jsx' || file === 'app/page.js') {
      appRoutes.add('/');
    }

    // route.ts / route.js in app
    const matchRoute = file.match(/^app\/(.+)\/route\.(ts|js)$/);
    if (matchRoute) {
      let route = '/api/' + matchRoute[1];
      apiRoutes.add(route);
    }
  } else if (file.startsWith('pages/api/')) {
    const matchApi = file.match(/^pages\/api\/(.+)\.(js|ts)$/);
    if (matchApi) {
      let route = '/api/' + matchApi[1];
      if (route.endsWith('/index')) {
        route = route.slice(0, -6);
      }
      apiRoutes.add(route);
    }
  } else if (file.startsWith('pages/')) {
    const matchPages = file.match(/^pages\/(.+)\.(tsx|jsx|js|ts)$/);
    if (matchPages) {
      let route = '/' + matchPages[1];
      if (route.endsWith('/index')) route = route.slice(0, -6);
      appRoutes.add(route);
    }
  }
});

console.log("=== DEFINED APP ROUTES ===");
console.log(Array.from(appRoutes).sort());
console.log("\n=== DEFINED API ROUTES ===");
console.log(Array.from(apiRoutes).sort());

// 3. Scan all source files for referenced links and API calls
const hrefRegex = /href\s*=\s*(?:["']([^"']+)["']|\{\s*["']([^"']+)["']\s*\}|\{`([^`]+)`\})/g;
const routerPushRegex = /router\.(?:push|replace)\s*\(\s*(?:["']([^"']+)["']|`([^`]+)`)/g;
const fetchRegex = /(?:fetch|axios\.(?:get|post|put|delete|patch))\s*\(\s*(?:["']([^"']+)["']|`([^`]+)`)/g;

const foundLinks = [];

allFiles.forEach(f => {
  const file = norm(f);
  if (!file.endsWith('.tsx') && !file.endsWith('.ts') && !file.endsWith('.jsx') && !file.endsWith('.js')) return;
  if (file.includes('audit_routes.js') || file.includes('ast_fix.js') || file.includes('fix_') || file.includes('find_')) return;

  const content = fs.readFileSync(file, 'utf8');

  let match;
  hrefRegex.lastIndex = 0;
  while ((match = hrefRegex.exec(content)) !== null) {
    const target = match[1] || match[2] || match[3];
    if (target) {
      foundLinks.push({ file, target, type: 'href' });
    }
  }

  routerPushRegex.lastIndex = 0;
  while ((match = routerPushRegex.exec(content)) !== null) {
    const target = match[1] || match[2];
    if (target) {
      foundLinks.push({ file, target, type: 'router' });
    }
  }

  fetchRegex.lastIndex = 0;
  while ((match = fetchRegex.exec(content)) !== null) {
    const target = match[1] || match[2];
    if (target && target.startsWith('/api')) {
      foundLinks.push({ file, target, type: 'api' });
    }
  }
});

console.log(`\nFound ${foundLinks.length} internal links & API calls.`);

// Function to match route against dynamic patterns
function isRouteValid(target, definedRoutes) {
  // Strip query parameters or hashes
  const cleanTarget = target.split('?')[0].split('#')[0];
  if (!cleanTarget.startsWith('/')) return true; // external or anchor link or javascript:

  // Check direct match
  if (definedRoutes.has(cleanTarget)) return true;

  // Check dynamic route matching (e.g. /blogs/my-post vs /blogs/[slug])
  const targetSegments = cleanTarget.split('/').filter(Boolean);

  for (const defRoute of definedRoutes) {
    const defSegments = defRoute.split('/').filter(Boolean);
    if (defSegments.length !== targetSegments.length) continue;

    let match = true;
    for (let i = 0; i < defSegments.length; i++) {
      const def = defSegments[i];
      const tgt = targetSegments[i];
      if (def.startsWith('[') && def.endsWith(']')) {
        continue; // matches dynamic segment
      }
      if (def !== tgt) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }

  return false;
}

const allDefinedRoutes = new Set([...appRoutes, ...apiRoutes]);

const brokenLinks = [];
foundLinks.forEach(link => {
  const target = link.target;
  // Ignore external links, mailto, tel, hashes, javascript:
  if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mailto:') || target.startsWith('tel:') || target.startsWith('#') || target.startsWith('javascript:')) {
    return;
  }
  // Handle template literals like `/blogs/${blog.slug}` by converting `${...}` to `placeholder`
  const normalizedTarget = target.replace(/\$\{[^}]+\}/g, 'placeholder');

  if (!isRouteValid(normalizedTarget, allDefinedRoutes)) {
    brokenLinks.push({ ...link, normalizedTarget });
  }
});

console.log("\n=== BROKEN / UNRESOLVED LINKS ===");
if (brokenLinks.length === 0) {
  console.log("SUCCESS: 0 broken links found!");
} else {
  console.log(`Found ${brokenLinks.length} potential issues:`);
  brokenLinks.forEach(l => {
    console.log(`- ${l.file}: ${l.target} (type: ${l.type})`);
  });
}
