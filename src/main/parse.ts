import * as XLSX from "xlsx";

export type Entry = {
  firstName: string,
  lastName: string,
  name3: string,
  email: string
};

export function parse(file: string): Array<Entry> {
  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  let firstNames = new Map<number, string>, lastNames = new Map<number, string>, names3 = new Map<number, string>, emails = new Map<number, string>;
  Object.keys(sheet).filter(cell => !cell.startsWith("!")).forEach(key => {
    let row = Number(key[1]);
    switch (key[0]) {
      case "A":
        firstNames.set(row, sheet[key].v);
        break;
      case "B":
        lastNames.set(row, sheet[key].v);
        break;
      case "C":
        names3.set(row, sheet[key].v);
        break;
      case "D":
        emails.set(row, sheet[key].v);
        break;
    }
  });
  let max = Math.max(...Array.from(firstNames.keys()), ...Array.from(lastNames.keys()), ...Array.from(names3.keys()), ...Array.from(emails.keys()));
  let ret: Array<Entry> = [];
  for (let i = 1; i <= max; i++) {
    if (!firstNames.has(i) || !lastNames.has(i) || !names3.has(i) || !emails.has(i)) continue;
    ret.push({firstName: firstNames.get(i) ?? "", lastName: lastNames.get(i) ?? "", name3: names3.get(i) ?? "", email: emails.get(i) ?? ""});
  }
  return ret;
}

export function validate(array: Array<Entry>): Array<Entry & {valid: boolean}> {
  return array.map(entry => ({
    ...entry,
    valid: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(entry.email)
  }))
}