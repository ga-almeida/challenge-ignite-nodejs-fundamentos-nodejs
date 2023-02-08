import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2));
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter(task => {
        return Object.entries(search).some(([key, value]) => {
          if (!value) return true;

          return task[key].includes(value);
        })
      })
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  update(table, id, data) {
    const index = this.#database[table].findIndex(task => task.id === id);

    if (index > -1) {
      const task = this.#database[table][index];
      this.#database[table][index] = { id, ...task, ...data };
      this.#persist();
    }
  }

  delete(table, id) {
    const index = this.#database[table].findIndex(task => task.id === id);

    if (index > -1) {
      this.#database[table].splice(index, 1);
      this.#persist();
    }
  }
}
