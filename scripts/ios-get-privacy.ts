import * as fs from 'fs';
import * as path from 'path';
import plist from 'plist';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PrivacyEntry {
  NSPrivacyAccessedAPIType: string;
  NSPrivacyAccessedAPITypeReasons: string[];
}

interface PrivacyManifest {
  NSPrivacyAccessedAPITypes?: PrivacyEntry[];
}

// Points to the root of your project
const projectRoot = path.resolve(__dirname, '..');
const nodeModulesPath = path.join(projectRoot, 'node_modules');
const appJsonPath = path.join(projectRoot, 'app.json');

const aggregatedTypes: Record<string, Set<string>> = {};

function scanDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    try {
      const stat = fs.lstatSync(fullPath);
      if (stat.isSymbolicLink()) continue;

      if (stat.isDirectory()) {
        // Avoid deep recursion into nested node_modules
        if (file === 'node_modules' && dir !== projectRoot) continue;
        scanDirectory(fullPath);
      } else if (file === 'PrivacyInfo.xcprivacy') {
        parsePrivacyFile(fullPath);
      }
    } catch (e) {
      // Handle permission errors or broken symlinks silently
    }
  }
}

function parsePrivacyFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = plist.parse(content) as PrivacyManifest;

    if (data.NSPrivacyAccessedAPITypes) {
      data.NSPrivacyAccessedAPITypes.forEach((entry) => {
        const type = entry.NSPrivacyAccessedAPIType;
        if (!aggregatedTypes[type]) {
          aggregatedTypes[type] = new Set();
        }
        entry.NSPrivacyAccessedAPITypeReasons.forEach((reason) => {
          aggregatedTypes[type].add(reason);
        });
      });
    }
  } catch (err) {
    console.error(`❌ Error parsing ${filePath}:`, err);
  }
}

console.log('🔍 Scanning node_modules for Privacy Manifests...');
scanDirectory(nodeModulesPath);

const finalManifest = Object.keys(aggregatedTypes).map((type) => ({
  NSPrivacyAccessedAPIType: type,
  NSPrivacyAccessedAPITypeReasons: Array.from(aggregatedTypes[type]),
}));

if (finalManifest.length === 0) {
  console.log('⚠️ No privacy manifests found in node_modules.');
} else {
  console.log(`✅ Found ${finalManifest.length} privacy categories.`);
  
  // Update app.json automatically
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    if (!appJson.expo.ios) appJson.expo.ios = {};
    if (!appJson.expo.ios.privacyManifests) appJson.expo.ios.privacyManifests = {};
    
    appJson.expo.ios.privacyManifests.NSPrivacyAccessedAPITypes = finalManifest;
    
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    console.log('🚀 Successfully updated app.json with new privacy manifests.');
  } else {
    console.log('\n--- Manually add this to your app.json ---');
    console.log(JSON.stringify({ NSPrivacyAccessedAPITypes: finalManifest }, null, 2));
  }
}