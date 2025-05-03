import { get, set } from "./config.js";
import WebContents = Electron.WebContents;
import { setup } from "./email.js";

export type EmailConfig = {
  mailHost: string,
  mailUser: string,
  mailPass: string,
  mailPort: number,
  mailSecure: boolean
};

let config = get<{emails: Array<EmailConfig>, selected: number}>("emails.json");
if (config && config.selected < config.emails.length) setup(config.emails[config.selected] ?? {});

export function getEmails() {
  return config;
}

export function addEmail(entry: EmailConfig, app: WebContents) {
  if (!config) {
    config = { emails: [], selected: 0 };
    setup(config.emails[config.selected]);
  }
  config.emails.push(entry);
  set("emails.json", config);
  app.send("emailConfig", config);
}

export function removeEmail(index: number, app: WebContents) {
  if (config === null) return;
  if (config?.selected === index) {
    config.selected = 0;
    setup(config.emails[config.selected]);
  }
  config.emails = config?.emails.filter((_, i) => index !== i) ?? [];
  set("emails.json", config);
  app.send("emailConfig", config);
}

export function editEmail(index: number, entry: EmailConfig, app: WebContents) {
  if (config === null) return;
  config.emails = config?.emails.map((current, i) => {
    if (index !== i) return current;
    setup(entry);
    console.log(entry);
    return entry;
  }) ?? [];
  set("emails.json", config);
  app.send("emailConfig", config);
}

export function selectEmail(index: number, app: WebContents) {
  if (config === null) return;
  config.selected = index;
  setup(config.emails[config.selected]);
  set("emails.json", config);
  app.send("emailsConfig.select", index);
}