import fs from "node:fs";
import path from "node:path";
import { validateCatalog } from "../src/lib/validate";

const filePath = path.join(process.cwd(), "data", "products.json");
const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
const errors = validateCatalog(parsed);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const count = Array.isArray(parsed) ? parsed.length : 0;
console.log(`Validated ${count} products in data/products.json.`);
