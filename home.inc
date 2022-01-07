<!-- (A) HEADER -->
<header class="cb-head">
  <!-- (A1) TITLE -->
  <h1 class="cb-head-title">My Notes</h1>

  <!-- (A2) BUTTONS -->
  <div class="cb-head-btn">
    <button class="btn-ico mi" onclick="notes.show()">add_box</button>
  </div>
</header>

<!-- (B) NOTES LIST -->
<div id="notes-list" class="cb-body"></div>

<!-- (C) NOTE ROW TEMPLATE -->
<template id="note-template"><div class="note-row">
  <div class="note-left">
    <div class="note-title"></div>
    <div class="note-text"></div>
    <div class="note-time"></div>
  </div>
  <button class="note-del btn-ico-grey mi">delete</button>
  <button class="note-edit btn-ico-grey mi">edit</button>
</div></template>
