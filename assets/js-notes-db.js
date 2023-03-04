// (A) INDEXED DB
const IDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var notesDB = {
  // (B) INITIALIZE DATABASE
  db : null,
  init : () => new Promise((resolve, reject) => {
    // (B1) OPEN NOTES DATABASE
    notesDB.db = IDB.open("JSNotes", 1);

    // (B2) CREATE NOTES DATABASE
    notesDB.db.onupgradeneeded = e => {
      // (B2-1) NOTES DATABASE
      notesDB.db = e.target.result;

      // (B2-2) IDB UPGRADE ERROR
      notesDB.db.onerror = e => {
        alert("Indexed DB upgrade error - " + evt.message);
        console.error(e);
        reject(e.target.error);
      };

      // (B2-3) EVENTS STORE
      if (e.oldVersion < 1) {
        let store = notesDB.db.createObjectStore("notes", {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };

    // (B3) IDB OPEN OK
    notesDB.db.onsuccess = e => {
      notesDB.db = e.target.result;
      resolve(true);
    };

    // (B4) IDB OPEN ERROR
    notesDB.db.onerror = e => {
      alert("Indexed DB init error - " + e.message);
      console.error(e)
      reject(e.target.error);
    };
  }),

  // (C) TRANSACTION "MULTI-TOOL"
  tx : (action, store, data, idx) => new Promise((resolve, reject) => {
    // (C1) GET OBJECT STORE
    let req, tx = notesDB.db.transaction(store, "readwrite").objectStore(store);
 
    // (C2) PROCESS ACTION
    switch (action) {
      // (C2-1) NADA
      default: reject("Invalid database action"); break;
 
      // (C2-2) ADD
      case "add":
        req = tx.add(data);
        req.onsuccess = e => resolve(true);
        break;

      // (C2-3) PUT
      case "put":
        req = tx.put(data);
        req.onsuccess = e => resolve(true);
        break;
 
      // (C2-4) DELETE
      case "del":
        req = tx.delete(data);
        req.onsuccess = e => resolve(true);
        break;
 
      // (C2-5) GET
      case "get":
        req = tx.get(data);
        req.onsuccess = e => resolve(e.target.result);
        break;
 
      // (C2-6) GET ALL
      case "getAll":
        req = tx.getAll(data);
        req.onsuccess = e => resolve(e.target.result);
        break;
 
      // (C2-7) CURSOR
      case "cursor":
        if (idx) { resolve(tx.index(idx).openCursor(data)); }
        else { resolve(tx.openCursor(data)); }
        break;
    }
    req.onerror = e => reject(e.target.error);
  })
};