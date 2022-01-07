<!-- (A) HEADER -->
<header class="cb-head">
  <!-- (A1) TITLE -->
  <h1 class="cb-head-title" id="note-form-title"></h1>

  <!-- (A2) BUTTONS -->
  <div class="cb-head-btn">
    <a class="btn-ico mi" href="#home">reply</a>
    <button class="btn-ico mi" id="note-form-del">delete</button>
  </div>
</header>

<!-- (B) NOTES FORM -->
<form id="notes-form" class="cb-body cb-form" onsubmit="return notes.save()">
  <label for="note-title" class="form-field">Title</label>
  <input id="note-title" class="form-field" type="text" autocomplete="off" required/>
  <label for="note-text" class="form-field">Text</label>
  <textarea id="note-text" class="form-field" autocomplete="off" required></textarea>
  <input class="form-field btn-red" id="note-save" type="submit" value="Save"/>
</form>
