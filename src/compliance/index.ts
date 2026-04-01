import type { MCPTest } from "../core/types.js";
import { lifecycleTests } from "./lifecycle.js";
import { toolsTests } from "./tools.js";

export const complianceTests: MCPTest[] = [...lifecycleTests, ...toolsTests];
