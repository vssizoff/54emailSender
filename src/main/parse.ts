import * as XLSX from "xlsx";

export type ParseOptions = {
  nameColumn: string,
  surnameColumn: string,
  name3Column: string,
  emailColumn: string,
  canName3Empty: string,
  skip: number
};

export type Entry = {
  firstName: string,
  lastName: string,
  name3: string,
  email: string,
  columns: Record<string, any>,
  status: number,
  uuid: string
};

function parseKey(key: string): [string, number] {
  let i = 0;
  let column = "";
  for (; i < key.length && key[i] >= 'A' && key[i] <= 'Z'; i++) {
    column += key[i];
  }
  return [column, Number(key.substring(i))];
}

export function parse(file: string, options: ParseOptions): Array<Omit<Entry, "uuid" | "status">> {
  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  let firstNames = new Map<number, string>,
      lastNames = new Map<number, string>,
      names3 = new Map<number, string>,
      emails = new Map<number, string>,
      columns = new Map<number, Record<string, any>>;
  Object.keys(sheet).filter(cell => !cell.startsWith("!")).forEach(key => {
    let [column, row] = parseKey(key);
    if (row <= options.skip) return;
    columns.set(row, {...columns.get(row), [column]: sheet[key].v});
    console.log(sheet[key]);
    switch (column) {
      case options.nameColumn:
        firstNames.set(row, sheet[key].v);
        break;
      case options.surnameColumn:
        lastNames.set(row, sheet[key].v);
        break;
      case options.name3Column:
        names3.set(row, sheet[key].v);
        break;
      case options.emailColumn:
        emails.set(row, sheet[key].v);
        break;
    }
  });
  let max = Math.max(...Array.from(firstNames.keys()), ...Array.from(lastNames.keys()), ...Array.from(names3.keys()), ...Array.from(emails.keys()));
  let ret: Array<Omit<Entry, "uuid" | "status">> = [];
  for (let i = 1; i <= max; i++) {
    if (!firstNames.has(i) || !lastNames.has(i) || (!names3.has(i) && !options.canName3Empty) || !emails.has(i)) continue;
    ret.push({
      firstName: firstNames.get(i) ?? "",
      lastName: lastNames.get(i) ?? "",
      name3: names3.get(i) ?? "",
      email: emails.get(i) ?? "",
      columns: columns.get(i) ?? {},
    });
  }
  return ret;
}

export function validate(array: Array<Omit<Entry, "uuid" | "status">>): Array<Omit<Entry, "uuid" | "status"> & {valid: boolean}> {
  return array.map(entry => ({
    ...entry,
    valid: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(entry.email)
  }))
}