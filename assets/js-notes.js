var notes = {
  // (A) INIT APP
  init : async () => {
    // (A1) REQUIREMENTS CHECK - INDEXED DB
    if (!IDB) {
      alert("Your browser does not support indexed database.");
      return;
    }

    // (A2) REQUIREMENTS CHECK - STORAGE CACHE
    if (!"caches" in window) {
      alert("Your browser does not support cache storage.");
      return;
    }

    // (A3) REGISTER SERVICE WORKER
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("CB-worker.js");
    }

    // (A4) DATABASE + INTERFACE
    if (await notesDB.init()) {
      notes.toggle("A");
      notes.list();
    }
  },

  // (B) TOGGLE PAGE
  toggle : p => document.getElementById("pg"+p).classList.toggle("show"),

  // (C) LIST NOTES
  list : async () => {
    // (C1) GET & "RESET" HTML LIST
    let nList = document.getElementById("nList");
    nList.innerHTML = "";

    // (C2) GET & DRAW ENTRIES
    for (let n of await notesDB.tx("getAll", "notes")) {
      let d = document.createElement("div");
      d.className = "note";
      d.style.color = n.tc;
      d.style.backgroundColor = n.bc;
      d.innerHTML = `<h1 class="title">${n.title}</h1>
      <div class="txt">${n.txt}</div>`;
      d.onclick = () => notes.show(n.id);
      nList.appendChild(d);
    }
  },
  
  // (D) SHOW ADD/EDIT NOTE FORM
  nid : null, // current note id
  show : async (id) => {
    // (D1) EDIT NOTE
    if (id) {
      notes.nid = +id;
      let note = await notesDB.tx("get", "notes", notes.nid);
      document.querySelector("#nTitle").value = note.title;
      document.querySelector("#nText").value = note.txt;
      document.querySelector("#ntColor").value = note.tc;
      document.querySelector("#nbColor").value = note.bc;
      document.querySelector("#nDel").style.display = "block";
    }

    // (D2) ADD NOTE
    else {
      notes.nid = null;
      document.querySelector("#pgB form").reset();
      document.querySelector("#nDel").style.display = "none";
    }

    // (D3) OPEN NOTE FORM
    notes.toggle("B");
  },

  // (E) SAVE NOTE
  save : () => {
    // (E1) DATA TO SAVE
    let data = {
      title : document.getElementById("nTitle").value,
      txt : document.getElementById("nText").value,
      tc : document.getElementById("ntColor").value,
      bc : document.getElementById("nbColor").value
    };

    // (E2) SAVE ENTRY
    if (notes.nid) {
      data.id = notes.nid;
      notesDB.tx("put", "notes", data);
    } else { notesDB.tx("add", "notes", data); }

    // (E3) DONE!
    notes.nid = null;
    notes.toggle("B");
    notes.list();
    return false;
  },

  // (F) DELETE NOTE
  //  id : delete this note id
  del : async () => { if (confirm("Delete note?")) {
    await notesDB.tx("del", "notes", notes.nid);
    notes.nid = null;
    notes.toggle("B");
    notes.list();
  }}
};
window.addEventListener("DOMContentLoaded", notes.init);