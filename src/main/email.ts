import {createTransport} from "nodemailer";
import {mailHost, mailUser, mailPass} from "./config.json";
import { type Entry, parse, validate } from "./parse.js";
import WebContents = Electron.WebContents;

export const mailer = createTransport({
  host: mailHost,
  port: 465,
  secure: true,
  auth: {
    user: mailUser,
    pass: mailPass
  },
});

export async function send(to: string, subject: string, message: string) {
  await mailer.sendMail({
    from: `Школa №54 <${mailUser}>`, to,
    subject: subject,
    html: message
  });
}

let emails: Array<Entry & {status: number}> = [];

export async function sendEmail(searchEmail: string, app: WebContents) {
  let entry = emails.filter(({status, email}) => status === 0 && email === searchEmail)[0];
  if (!entry) return;
  let {firstName, lastName, name3, email} = entry;
  await send(email, "test", `${firstName} ${lastName} ${name3}`);
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
  emails = await Promise.all(emails.filter(({status}) => status === 0).map(async ({firstName, lastName, name3, email}): Promise<Entry & {status: number}> => {
    await send(email, "test", `${firstName} ${lastName} ${name3}`);
    app.send("status", [email, 1]);
    return {
      firstName, lastName, name3, email,
      status: 1
    };
  }));
}

export function setEmails(file: string, app: WebContents) {
  emails = validate(parse(file)).map(({valid, ...entry}) => ({status: valid ? 0 : -1, ...entry}));
  app.send("set", emails);
}