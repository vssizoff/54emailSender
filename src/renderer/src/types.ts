export type Entry = {
  firstName: string,
  lastName: string,
  name3: string,
  email: string,
  status: number
  uuid: string
};

export type EmailConfigType = {
  mailHost: string,
  mailUser: string,
  mailPass: string,
  mailPort: number,
  mailSecure: boolean,
  sendsPerHour: number
};

export type LogType = {
  email: string,
  sender: string,
  subject: string,
  message: string,
  datetime: string
}