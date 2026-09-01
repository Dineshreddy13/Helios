import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootDirs = [
    "models",
    "config",
    "database",
    "utils",
    "sockets",
    "jobs",
    "modules",
    "validators",
    "middleware",
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;

    // Regex to match imports: import ... from "../../something" or import "../../something"
    const regex = /(from\s+["']|import\s+["'])((?:\.\.\/)+)([^"']+)["']/g;

    content = content.replace(regex, (match, prefix, dots, rest) => {
        const firstFolder = rest.split("/")[0];
        
        // If the imported folder is one of our root dirs, we can use the alias
        // BUT we have to be sure it's actually reaching the root dir, not a subfolder named "utils"
        // Let's resolve the actual absolute path of the import
        const dirOfFile = path.dirname(filePath);
        const importedAbsPath = path.resolve(dirOfFile, dots + rest);
        
        // Does this absolute path live directly under server/<firstFolder>?
        const expectedRootPath = path.join(__dirname, firstFolder);
        
        if (rootDirs.includes(firstFolder) && importedAbsPath.startsWith(expectedRootPath)) {
            modified = true;
            return `${prefix}#${rest}"`;
        }
        
        return match;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, "utf-8");
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === "node_modules" || file === ".git" || file === "alias.js") continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith(".js")) {
            processFile(fullPath);
        }
    }
}

walkDir(__dirname);
console.log("Done!");
