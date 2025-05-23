import { createTransport, type Transporter } from "nodemailer";
import { type Entry, parse, validate } from "./parse.js";
import WebContents = Electron.WebContents;
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import type { EmailConfig } from "./emailConfig.js";
import { useTemplate } from "./templates.js";

let mailUser: string = "";
export let mailer: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> | null;

export function setup({mailHost, mailUser: mailUser_, mailPass, mailPort, mailSecure}: Partial<EmailConfig> = {}) {
  if (!mailHost || !mailUser_ || !mailPass || mailPort === undefined || mailSecure === undefined) return;
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
}

export async function send(to: string, sender: string, subject: string, message: string) {
  if (!mailer) return false;
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

let emails: Array<Entry & {status: number}> = [];

export async function sendEmail(searchEmail: string, app: WebContents) {
  let entry = emails.filter(({status, email}) => status === 0 && email === searchEmail)[0];
  if (!entry) return;
  let {firstName, lastName, name3, email} = entry;
  let template = useTemplate({firstName, lastName, name3, email, mailUser});
  if (!template) return;
  let {data, subject, sender} = template;
  let success = await send(email, sender, subject, data);
  if (!success) return;
  app.send("status", [email, 1]);
  emails.map(elem => {
    if (elem.email === searchEmail) return {
      firstName, lastName, name3, email,
      status: 1
    }
    return elem;
  });
}

export async function sendEmails(app: WebContents) {
  // emails = await Promise.all(emails.filter(({status}) => status === 0).map(async ({firstName, lastName, name3, email}): Promise<Entry & {status: number}> => {
  //   if (!(await send(email, "test", useTemplate({firstName, lastName, name3, email, mailUser}) ?? ""))) return {
  //     firstName, lastName, name3, email,
  //     status: 0
  //   };
  //   app.send("status", [email, 1]);
  //   return {
  //     firstName, lastName, name3, email,
  //     status: 1
  //   };
  // }));
  for (const {email, status} of emails) {
    if (status !== 0) continue;
    await sendEmail(email, app);
  }
}

export function setEmails(file: string, app: WebContents) {
  emails = validate(parse(file)).map(({ valid, ...entry }) => ({ status: valid ? 0 : -1, ...entry }));
  app.send("set", emails);
}

export function rm(searchEmail: string, app: WebContents) {
  emails = emails.filter(({email}) => email !== searchEmail);
  app.send("rm", searchEmail);
}

export function rmAll(app: WebContents) {
  emails = [];
  app.send("set", []);
}