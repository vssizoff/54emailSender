import { createTransport, type Transporter } from "nodemailer";
import {type Entry, parse, type ParseOptions, validate} from "./parse.js";
import WebContents = Electron.WebContents;
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import type { EmailConfig } from "./emailConfig.js";
import { useTemplate } from "./templates.js";

let mailUser: string = "";
export let mailer: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> | null;
let sendTimeout: number = 4 * 60 * 1000;

export function setup({mailHost, mailUser: mailUser_, mailPass, mailPort, mailSecure, sendsPerHour}: Partial<EmailConfig> = {}) {
  if (!mailHost || !mailUser_ || !mailPass || mailPort === undefined || mailSecure === undefined || sendsPerHour == undefined) return;
  console.log(arguments);
  mailer = createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailSecure,
    auth: {
      user: mailUser_,
      pass: mailPass
    },
  });
  mailUser = mailUser_ ?? "";
  sendTimeout = 60 / sendsPerHour * 60 * 1000;
}

export async function send(to: string, sender: string, subject: string, message: string) {
  if (!mailer) {
    console.log("Mailer is undefined!");
    return false;
  }
  console.log("Sending:", {
    from: sender,
    to,
    subject: subject,
    html: message
  });
  try {
    await mailer.sendMail({
      from: sender,
      to,
      subject: subject,
      html: message
    });
    console.log("Success");
    return true;
  }
  catch (error) {
    console.log("Failed");
    console.error(error);
    return false;
  }
}

let emails: Array<Entry> = [];

export async function sendEmail(uuid: string, app: WebContents) {
  let entry = emails.filter(({status, uuid: id}) => status === 0 && id === uuid)[0];
  console.log(uuid);
  if (!entry) return;
  let {firstName, lastName, name3, email} = entry;
  let template = useTemplate({firstName, lastName, name3, email, mailUser});
  if (!template) return;
  let {data, subject, sender} = template;
  let success = await send(email, sender, subject, data);
  if (!success) {
    app.send("status", [uuid, -2]);
    emails.map(elem => {
      if (elem.uuid === uuid) return {
        firstName, lastName, name3, email,
        status: -2
      }
      return elem;
    });
    return;
  }
  app.send("status", [uuid, 1]);
  emails.map(elem => {
    if (elem.uuid === uuid) return {
      firstName, lastName, name3, email,
      status: 1
    }
    return elem;
  });
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(() => resolve(undefined), ms));
}

export async function sendEmails(app: WebContents) {
  for (const {uuid, status} of emails) {
    if (status !== 0) continue;
    app.send("status", [uuid, 2]);
  }
  emails.map(elem => ({...elem, status: 2}));
  for (const {uuid, status} of emails) {
    if (status !== 0) continue;
    await sendEmail(uuid, app);
    await sleep(sendTimeout);
  }
}

export function setEmails(file: string, options: ParseOptions, app: WebContents) {
  emails = validate(parse(file, options)).map(({ valid, ...entry }) => ({ uuid: crypto.randomUUID(), status: valid ? 0 : -1, ...entry }));
  app.send("set", emails);
}

export function rm(uuid: string, app: WebContents) {
  emails = emails.filter(({uuid: id}) => id !== uuid);
  app.send("rm", uuid);
}

export function rmAll(app: WebContents) {
  emails = [];
  app.send("set", []);
}