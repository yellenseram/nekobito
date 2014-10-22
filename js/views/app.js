// js/views/app.js

var app = app || {};

app.AppView = Backbone.View.extend({

  el: 'body',

  initialize: function() {
    // get records from localStorage
    app.drafts.fetch();

    // Cache the DOMs

    // Sidebar
    this.$sidebar = $("#sidebar");
    this.$draftsList = $("#draftsList");

    // Editor
    this.$editor = $("#editor");
    this.$title = $("#title");
    this.$body = $("#body");
    this.$notice = $("#notice");

    // Preview
    this.$previewTitle = $("#preview-title");
    this.$previewBody = $("#preview-body");

    // Watch the collection
    this.listenTo(app.drafts, "add", this.prependDraft);
    this.listenTo(app.drafts, "all", this.refreshDraftId);

    // Set the views
    this.prependAllDrafts();
    this.preview();

  },

  events: {
    // Whole 
    "keydown": "reactToKey",
    // Sidebar
    "click .menuBar": "toggleList",
    "click .draft-item": "openDraft",
    // Editor
    "focus #editor": "hideSidebar",
    "keyup #editor": "preview",
    "click #saveBtn": "saveDraft",
    "click #deleteBtn": "destroyDraft",
    "click #addBtn": "openBlank"
  },

  reactToKey: function(e) {
    if(e.ctrlKey) {
      if(e.keyCode === 83) {
        this.saveDraft();
      } else if(e.keyCode === 76) {
        this.toggleList();
      } else if(e.keyCode === 68) {
        this.destroyDraft();
      } else if(e.keyCode === 78) {
        this.openBlank();
      }
    }
  },

  attachVimLikeKey: function() {
    app.draftIndex = 0;
    var draftItems = this.$draftsList.children();
    var $current = $(draftItems[app.draftIndex]);
    this.$el.on("keypress", function(e) {
      if(e.keyCode === 106) {
        if(app.draftIndex < draftItems.length -1) {
          $current.removeClass("selected");
          app.draftIndex++;
          $current = $(draftItems[app.draftIndex])
            .addClass("selected");
        }
      } else if(e.keyCode === 107) {
        if(app.draftIndex !== 0) {
          $current.removeClass("selected");
          app.draftIndex--;
          $current = $(draftItems[app.draftIndex])
            .addClass("selected");
        }
      } else if(e.keyCode === 111) {
        $current
          .click()
          .removeClass("selected");
      }
    });
  },

  detachVimLikeKey: function() {
    this.$el.unbind("keypress");
  },

  refreshDraftId: function() {
    if(app.drafts.length != 0) {
      app.draftId = app.drafts.last().id;
    }
  },

  // Sidebar
  hideSidebar: function() {
    this.$sidebar.fadeOut(50);
    this.detachVimLikeKey();
  },

  showSidebar: function() {
    this.$sidebar.fadeIn(50);
    this.$title.blur();
    var $draftItem = $(this.$draftsList.children()[0]);
    $draftItem.addClass("selected");
    app.selectedId = $draftItem.attr("data-id");
    this.attachVimLikeKey();
  },

  prependDraft: function(draft) {
    var view = new app.DraftView({ model: draft });
    this.$draftsList.prepend(view.render().el);
  },

  prependAllDrafts: function() {
    app.drafts.each(this.prependDraft, this);
  },

  // Destroy
  destroyDraft: function() {
    if(app.draftId) {
      if(confirm("Are you sure?")) {
        app.drafts.get(app.draftId).destroy();
        this.openBlank();
      }
    } else {
      alert("Not selected.");
    }
  },

  // Open
  openBlank: function() {
    this.hideSidebar();
    this.setDraft("");
    this.preview();
    this.$title.focus();
    app.draftId = "";
  },

  openDraft: function(e) {
    this.hideSidebar();
    app.draftId = ($(e.target).attr("data-id"));
  },

  // Navigation
  toggleList: function() {
    if(this.$sidebar.css("display") === "block") {
      // When close this
      this.hideSidebar();
    } else {
      // When open this
      this.showSidebar();
    }
  },

  // Preview
  preview: function() {
    this.$previewTitle.html(this.$title.val());
    this.$previewBody.html(marked(this.$body.val()));
  },

  // Get Attributes
  attrsOnEditor: function() {
    return {
      title: this.$title.val().trim(),
      body: this.$body.val()
    };
  },

  // Save
  saveDraft: function() {
    if (!app.draftId) {
      var draft = new app.Draft(this.attrsOnEditor());
      if(draft.isValid()) {
        app.drafts.create(draft);
      }
    } else {
      app.drafts.get(app.draftId).save(this.attrsOnEditor());
    }
    this.notice();
  },

  notice: function() {
    this.$notice.fadeIn("fast", function() {
      $(this).fadeOut("slow");
    });
  },

  // Editor
  setDraft: function(draft) {
    if(!draft) {
      this.$title.val("");
      this.$body.val("");
    } else {
      this.$title.val(draft.get('title'));
      this.$body.val(draft.get('body'));
    }
  }

});
