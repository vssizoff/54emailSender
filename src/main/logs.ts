import {read, write} from "./config.js";

export type LogType = {
    email: string,
    sender: string,
    subject: string,
    message: string,
    datetime: string
}

export function addLog(data: LogType) {
    const logs = JSON.parse(read("logs.json") ?? "[]") as Array<LogType>;
    logs.push(data);
    write("logs.json", JSON.stringify(logs));
}

export function getLogs() {
    return JSON.parse(read("logs.json") ?? "[]") as Array<LogType>;
}