import { generateNamespace } from '@gql2ts/from-schema';
import * as fs from 'fs';
import * as path from 'path';

import { genSchema } from '../utils/genSchema';

// Generate the GQL namespace associated with GraphQL Schema Interfaces
// Add 'export default GQL;' to end of schema.d.ts document so namespace can be accessible
const typescriptTypes = generateNamespace('GQL', genSchema()) + '\nexport default GQL;\n';
fs.writeFile(path.join(__dirname, '../@types/schema.d.ts'), typescriptTypes, (err) => console.error(err));
