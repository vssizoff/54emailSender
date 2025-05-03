import { get, read, remove, set, write } from "./config.js";
import WebContents = Electron.WebContents;

let config = get<{templates: Array<{name: string, data: string}>, selected: number, count: number}>("emails.json");

export function getTemplate(index: number) {
  if (!config?.templates[index].data) return "";
  return read(config?.templates[index].data);
}

export function getTemplates() {
  return config;
}

export function addTemplate(name: string, data: string, app: WebContents) {
  if (!config) config = {templates: [], selected: 0, count: 0};
  write(`${config.count}.html`, data);
  config.templates.push({name, data: `${config.count}.html`});
  set("templates.json", config);
  app.send("templates", config);
}

export function removeTemplate(index: number, app: WebContents) {
  if (config === null) return;
  if (config?.selected === index) config.selected = 0;
  config.templates = config?.templates.filter(({data}, i) => {
    if (index !== i) return true;
    remove(data);
    return false;
  }) ?? [];
  set("templates.json", config);
  app.send("templates", config);
}

export function editTemplate(index: number, name: string, data: string, app: WebContents) {
  if (config === null) return;
  config.templates = config?.templates.map((current, i) => {
    if (index !== i) return current;
    write(current.data, data);
    return {name, data: current.data};
  }) ?? [];
  set("templates.json", config);
  app.send("templates", config);
}

export function selectTemplate(index: number, app: WebContents) {
  if (config === null) return;
  config.selected = index;
  set("templates.json", config);
  app.send("templates.select", index);
}