import path from "node:path";
import {homedir} from "node:os";
import * as fs from "node:fs";

const configDir = path.join(process.platform === 'win32' ? (process.env.APPDATA ?? homedir()) : path.join(homedir(), ".config"), '.54emailSender');

export function get<T>(file: string): T | null {
  file = path.join(configDir, file);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, {encoding: "utf8"}));
}

function makeParentDir(file: string) {
  let fileArray = file.replaceAll("\\", "/").split("/");
  let dir = (file.startsWith("/") ? "/" : "") + path.join(...fileArray.slice(0, fileArray.length - 1));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function set(file: string, data: object | number | string | null) {
  if (data === null) return;
  file = path.join(configDir, file);
  makeParentDir(file);
  fs.writeFileSync(file, JSON.stringify(data));
}