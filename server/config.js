"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const node_path_1 = require("node:path");
const root = (0, node_path_1.resolve)(import.meta.dirname, "..");
const dataDir = (0, node_path_1.resolve)(root, (_a = process.env.DATA_DIR) !== null && _a !== void 0 ? _a : "data");
exports.config = {
    port: Number((_b = process.env.API_PORT) !== null && _b !== void 0 ? _b : 8787),
    host: (_c = process.env.API_HOST) !== null && _c !== void 0 ? _c : "127.0.0.1",
    // `pnpm start` passes --production (works on Windows too, unlike NODE_ENV=…).
    isProduction: process.env.NODE_ENV === "production" || process.argv.includes("--production"),
    dataDir,
    uploadsDir: (0, node_path_1.resolve)(dataDir, "uploads"),
    // Built website served by this server in production (`pnpm build` output).
    distDir: (0, node_path_1.resolve)(root, (_d = process.env.DIST_DIR) !== null && _d !== void 0 ? _d : "dist"),
    sessionDays: 7,
    maxUploadBytes: 5 * 1024 * 1024,
    maxContentBytes: 2 * 1024 * 1024,
};
