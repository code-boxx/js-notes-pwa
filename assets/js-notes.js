var jn = {
  // (A) GLOBAL SUPPORT FUNCTION - GENERATE HTML ERROR MESSAGE
  err : (msg) => {
    let row = document.createElement("div");
    row.innerHTML = msg;
    row.className = "err";
    document.body.prepend(row);
  },

  // (B) GLOBAL SUPPORT FUNCTION - BOTTOM NOTIFICATION
  notiE : null, // NOTIFICATION HTML REFERENCE
  notiTimer : null, // NOTIFICATION TIMER

  // (B1) SHOW NOTIFICATION
  notiShow : (msg) => {
    clearTimeout(jn.notiTimer);
    jn.notiE.innerHTML = msg;
    jn.notiE.classList.add("show");
    jn.notiTimer = setTimeout(jn.notiHide, 3000);
  },

  // (B2) HIDE NOTIFICATION
  notiHide : () => {
    jn.notiE.classList.remove("show");
  },

  // (C) INIT PART 1 - REQUIREMENTS CHECK
  iniA : () => {
    // (C1) REQUIREMENTS INIT
    let pass = true;

    // (C2) REQUIREMENT - INDEXED DB
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    if (!window.indexedDB) {
      jn.err("Your browser does not support indexed database.");
      pass = false;
    }

    // (C3) REQUIREMENT - SERVICE WORKER
    if (!"serviceWorker" in navigator) {
      jn.err("Your browser does not support service workers.");
      pass = false;
    }

    // (C4) REQUIREMENT - CACHE STORAGE
    if (!caches) {
      jn.err("Your browser does not support cache storage.");
      pass = false;
    }

    // (C5) NO GO
    if (!pass) { return; }

    // (C6) OK - INIT WORKER & IDB
    jn.iniB();
  },

  // (D) INIT PART 2 - SERVICE WORKER & IDB
  iDB : null, iTX : null, // IDB OBJECT & TRANSACTION
  iniB : () => {
    // (D1) SERVICE WORKER
    navigator.serviceWorker.register("js-notes-sw.js")
    .then((reg) => { jn.iniC(); })
    .catch((err) => {
      jn.err("Service worker init error - " + evt.message);
      console.error(err);
    });

    // (D2) INDEXED DATABASE
    // (D2-1) OPEN "MYNOTES" DATABASE
    let req = window.indexedDB.open("MyNotes", 1);

    // (D2-2) ON DATABASE ERROR
    req.onerror = (evt) => {
      jn.err("Indexed DB init error - " + evt.message);
      console.error(evt);
    };

    // (D2-3) UPGRADE NEEDED
    req.onupgradeneeded = (evt) => {
      // INIT UPGRADE
      jn.iDB = evt.target.result;
      jn.iDB.onerror = (evt) => {
        jn.err("Indexed DB upgrade error - " + evt.message);
        console.error(evt);
      };

      // VERSION 1
      if (evt.oldVersion < 1) {
        let store = jn.iDB.createObjectStore("MyNotes", {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };

    // (D2-4) OPEN DATABASE OK - REGISTER IDB OBJECTS
    req.onsuccess = (evt) => {
      jn.iDB = evt.target.result;
      jn.iTX = () => {
        return jn.iDB
        .transaction("MyNotes", "readwrite")
        .objectStore("MyNotes");
      };
      jn.iniC();
    };
  },

  // (E) INIT PART 3 - HTML INTERFACE
  // * PROCEED ONLY IF SERVICE WORKER + IDB OK
  ready : 0, // NUMBER OF READY COMPONENTS
  iniC : () => { jn.ready++; if (jn.ready==2) {
    jn.notiE = document.getElementById("nNotify");
    jn.notiE.onclick = jn.notiHide;
    document.getElementById("nAdd").onclick = () => { jn.show(); };
    document.getElementById("nBack").onclick = () => { jn.toggle("L"); };
    document.getElementById("nDel").onclick = () => { jn.del(null, null); };
    document.getElementById("nForm").onsubmit = jn.save;
    jn.list();
  }},

  // (F) TOGGLE BETWEEN "L"IST & "E"DIT FORM
  mode : "L", // CURRENT "MODE"
  toggle : (mode) => {
    for (let e of document.getElementsByClassName("page"+(mode=="L"?"E":"L"))) {
      e.classList.add("ninja");
    }
    for (let e of document.getElementsByClassName("page"+mode)) {
      e.classList.remove("ninja");
    }
    if (mode=="E") {
      document.getElementById("nHeadE").innerHTML = jn.nid ? "Edit Note" : "Add Note";
      if (!jn.nid) { document.getElementById("nDel").classList.add("ninja"); }
    } else { jn.nid = null; }
    jn.mode = mode;
  },

  // (G) SHOW ADD/EDIT NOTE FORM
  nid : null, // CURRENT NOTE ID
  show : (id) => {
    // (G1) SET SELECTED ID - NULL OR UNDEFINED FOR ADD NEW
    jn.nid = id;

    // (G2) IF EDIT - GET NOTE ENTRY
    if (id) {
      let req = jn.iTX().get(id);
      req.onsuccess = () => {
        let n = req.result;
        document.getElementById("nTitle").value = n.title;
        document.getElementById("nText").value = n.text;
        jn.toggle("E");
      };
    }

    // (G3) NEW ENTRY
    else {
      document.getElementById("nTitle").value = "";
      document.getElementById("nText").value = "";
      jn.toggle("E");
    }
  },

  // (H) LIST NOTES
  list : () => {
    // (H1) LIST INIT
    let nList = document.getElementById("nList"),
    row, rleft, rtitle, rtxt, rtime, redit, rdel;

    // (H2) DRAW LIST
    nList.innerHTML = "";
    jn.iTX().getAll().onsuccess = (evt) => { for (let n of evt.target.result) {
      row = document.createElement("div");
      rleft = document.createElement("div");
      rtitle = document.createElement("div");
      rtxt = document.createElement("div");
      rtime = document.createElement("div");
      redit = document.createElement("button");
      rdel = document.createElement("button");

      row.className = "note";
      rleft.className = "nLeft";
      rtitle.className = "nTitle";
      rtxt.className = "nText";
      rtime.className = "nTime";
      redit.className = "nEdit";
      rdel.className = "nDel";

      rtitle.innerHTML = n.title;
      rtxt.innerHTML = n.text;
      rtime.innerHTML = n.time;
      redit.innerHTML = "<span class='mi'>edit</span>";
      rdel.innerHTML = "<span class='mi'>delete</span>";

      redit.onclick = () => { jn.show(n.id); };
      rdel.onclick = () => { jn.del(null, n.id); };

      row.appendChild(rleft);
      row.appendChild(redit);
      row.appendChild(rdel);
      rleft.appendChild(rtitle);
      rleft.appendChild(rtxt);
      rleft.appendChild(rtime);
      nList.appendChild(row);
    }};
  },

  // (I) SAVE NOTE
  save : () => {
    // (I1) GET TITLE & TEXT
    let title = document.getElementById("nTitle"),
        txt = document.getElementById("nText");

    // (I2) DATA TO SAVE
    let data = {
      title : title.value,
      text : txt.value,
      time : new Intl.DateTimeFormat("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric",
        hour12: true
      }).format(new Date())
    };

    // (I3) EDIT ENTRY
    if (jn.nid) {
      data.id = jn.nid;
      jn.iTX().put(data);
    }

    // (I4) NEW ENTRY
    else { jn.iTX().add(data); }

    // (I5) DONE!
    title.value = "";
    txt.value = "";
    jn.toggle("L");
    jn.list();
    jn.notiShow("Note saved");
    return false;
  },

  // (J) DELETE NOTE
  del : (go, id) => {
    // (J1) PROCEED DELETE
    if (go) {
      jn.iTX().delete(id);
      jn.list();
      jn.toggle("L");
      jn.notiShow("Note deleted");
    }

    // (J2) ASK FOR CONFIRMATION
    else { if (confirm("Delete Note?")) {
      if (id===null) { id = jn.nid; }
      jn.del(1, id);
    }}
  }
};
window.addEventListener("load", jn.iniA);
