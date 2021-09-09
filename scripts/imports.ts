import { task, types } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
const dotenv = require('dotenv');
const fs = require('fs');
const envConfig = dotenv.parse(fs.readFileSync(".env"));
for (const k in envConfig) {
    process.env[k] = envConfig[k]
}

export { task, types, fs, dotenv };
export * from "../typechain";
