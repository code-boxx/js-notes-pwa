var notes = {
  // (A) INIT APP
  iDB : null, iTX : null, iName : "MyNotes", // idb object & transaction
  init : () => {
    // (A1) HTML + FLAGS STUFF
    let pass = true,
        page = document.getElementById("cb-main"),
        err = (msg) => {
          let row = document.createElement("div");
          row.className = "error";
          row.innerHTML = msg;
          page.appendChild(row);
        };

    // (A2) REQUIREMENT - INDEXED DB
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    if (!window.indexedDB) {
      err("Your browser does not support indexed database.");
      pass = false;
    }

    // (A3) REQUIREMENT - SERVICE WORKER
    if (!"serviceWorker" in navigator) {
      err("Your browser does not support service workers.");
      pass = false;
    }

    // (A4) REQUIREMENT - CACHE STORAGE
    if (!caches) {
      err("Your browser does not support cache storage.");
      pass = false;
    }

    // (A5) SERVICE WORKER
    if (pass) {
      navigator.serviceWorker.register("js-notes-sw.js")
      .then((reg) => { notes.start(); })
      .catch((err) => {
        err("Service worker init error - " + evt.message);
        console.error(err);
      });
    }

    // (A6) INDEXED DATABASE
    if (pass) {
      // (A6-1) OPEN "MYNOTES" DATABASE
      let req = window.indexedDB.open(notes.iName, 1);

      // (A6-2) ON DATABASE ERROR
      req.onerror = (evt) => {
        err("Indexed DB init error - " + evt.message);
        console.error(evt);
      };

      // (A6-3) UPGRADE NEEDED
      req.onupgradeneeded = (evt) => {
        // INIT UPGRADE
        notes.iDB = evt.target.result;
        notes.iDB.onerror = (evt) => {
          notes.err("Indexed DB upgrade error - " + evt.message);
          console.error(evt);
        };

        // VERSION 1
        if (evt.oldVersion < 1) {
          let store = notes.iDB.createObjectStore(notes.iName, {
            keyPath: "id",
            autoIncrement: true
          });
        }
      };

      // (A6-4) OPEN DATABASE OK - REGISTER IDB OBJECTS
      req.onsuccess = (evt) => {
        notes.iDB = evt.target.result;
        notes.iTX = () => {
          return notes.iDB
          .transaction(notes.iName, "readwrite")
          .objectStore(notes.iName);
        };
        notes.start()
      };
    }
  },

  // (B) START APP
  ready : 0, // number of ready components
  start : () => {
    notes.ready++;
    if (notes.ready==2) { cb.load(); }
  },

  // (C) LIST NOTES
  list : () => {
    // (C1) LIST INIT
    let nList = document.getElementById("notes-list"),
        nTemplate = document.getElementById("note-template").content;

    // (C2) DRAW LIST
    nList.innerHTML = "";
    notes.iTX().getAll().onsuccess = (evt) => { for (let n of evt.target.result) {
      let row = nTemplate.cloneNode(true);
      row.querySelector(".note-title").textContent = n.title;
      row.querySelector(".note-text").textContent = n.text;
      row.querySelector(".note-time").textContent = n.time;
      row.querySelector(".note-edit").onclick = () => { notes.show(n.id); };
      row.querySelector(".note-del").onclick = () => { notes.del(n.id); };
      nList.appendChild(row);
    }};
  },

  // (D) SHOW ADD/EDIT NOTE FORM
  nid : null, // current note id
  show : (id) => {
    notes.nid = id!==undefined ? +id : null;
    window.location.hash = "form";
  },

  // (E) FOR EDIT NOTE - LOAD THE GIVEN NOTE ID
  load : () => {
    // (E1) GET HEADER HTML ELEMENTS
    let htitle = document.getElementById("note-form-title"),
        hdel = document.getElementById("note-form-del");

    // (E2) SET TITLE + DELETE
    htitle.innerHTML = notes.nid==null ? "Add Note" : "Edit Note" ;
    if (notes.nid == null) { hdel.classList.add("ninja"); }
    else {
      hdel.onclick = () => { notes.del(notes.nid); };
      hdel.classList.remove("ninja");
    }

    // (E3) EDIT NOTE
    if (notes.nid != null) {
      let req = notes.iTX().get(notes.nid);
      req.onsuccess = () => {
        let n = req.result;
        document.getElementById("note-title").value = n.title;
        document.getElementById("note-text").value = n.text;
      };
    }
  },

  // (F) SAVE NOTE
  save : () => {
    // (F1) DATA TO SAVE
    let data = {
      title : document.getElementById("note-title").value,
      text : document.getElementById("note-text").value,
      time : new Intl.DateTimeFormat("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric",
        hour12: true
      }).format(new Date())
    };

    // (F2) SAVE ENTRY
    if (notes.nid) {
      data.id = notes.nid;
      notes.iTX().put(data);
    } else { notes.iTX().add(data); }

    // (F3) DONE!
    cb.info("Note saved");
    notes.nid = null;
    window.location.hash = "home";
    return false;
  },

  // (G) DELETE NOTE
  //  id : delete this note id
  del : (id) => { if (confirm("Delete note?")) {
    // (G1) DELETE NOTE
    notes.iTX().delete(id);

    // (G2) RELOAD
    cb.info("Note deleted");
    let hash = window.location.hash;
    if (hash=="" || hash=="#home") { notes.list(); }
    else { window.location.hash = "home"; }
  }}
};

window.addEventListener("DOMContentLoaded", notes.init);
