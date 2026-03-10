import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const openapiPath = path.join(__dirname, 'openapi.yml');
export const swaggerSpec = yaml.load(fs.readFileSync(openapiPath, 'utf8')) as object;
