import path from "node:path";
import {homedir} from "node:os";
import * as fs from "node:fs";

const configDir = path.join(process.platform === 'win32' ? (process.env.APPDATA ?? homedir()) : path.join(homedir(), ".config"), '.54emailSender');

export function read(file: string): string | null {
  file = path.join(configDir, file);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, {encoding: "utf8"});
}

export function get<T>(file: string): T | null {
  file = path.join(configDir, file);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, {encoding: "utf8"}));
  } catch {
    return null;
  }
}

function makeParentDir(file: string) {
  let fileArray = file.replaceAll("\\", "/").split("/");
  let dir = (file.startsWith("/") ? "/" : "") + path.join(...fileArray.slice(0, fileArray.length - 1));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function write(file: string, data: string) {
  file = path.join(configDir, file);
  makeParentDir(file);
  fs.writeFileSync(file, data);
}

export function set(file: string, data: object | number | string | null) {
  write(file, data === null ? "" : JSON.stringify(data));
}

export function remove(file: string) {
  fs.rmSync(file);
}