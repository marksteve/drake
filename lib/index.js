(function() {
  var Backbone, Collections, Config, JSON, Models, NProgress, Passwordgen, Templates, Views, el, k, reactive, sjcl, store, uid, _, _i, _len, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  require("jquery");

  JSON = require("json");

  _ = require("underscore");

  Backbone = require("backbone");

  NProgress = require("nprogress");

  sjcl = require("sjcl");

  uid = require("uid");

  reactive = require("reactive");

  k = require("k");

  Passwordgen = require("passwordgen");

  store = require("store");

  Config = {
    clientId: "671657367079.apps.googleusercontent.com"
  };

  reactive.subscribe(function(obj, prop, fn) {
    return obj.on("change:" + prop, fn);
  });

  reactive.set(function(obj, prop) {
    return obj.set(prop);
  });

  reactive.get(function(obj, prop) {
    return obj.get(prop);
  });

  reactive.bind("data-text", function(el, name) {
    var obj;
    obj = this.obj;
    el.innerText = obj.get(name);
    return el.onblur = function() {
      return obj.set(name, el.innerText);
    };
  });

  reactive.bind("data-value", function(el, name) {
    var obj;
    obj = this.obj;
    el.value = obj.get(name);
    return el.onchange = function() {
      return obj.set(name, el.value);
    };
  });

  reactive.bind("data-checked", function(el, name) {
    var obj;
    obj = this.obj;
    el.checked = Boolean(obj.get(name));
    return el.onchange = function() {
      return obj.set(name, el.checked);
    };
  });

  Templates = {
    entry: document.querySelector(".entry")
  };

  _ref = _(Templates).values();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    el = _ref[_i];
    el.remove();
  }

  Models = {};

  Collections = {};

  Views = {};

  Models.Entry = (function(_super) {
    __extends(Entry, _super);

    function Entry() {
      return Entry.__super__.constructor.apply(this, arguments);
    }

    return Entry;

  })(Backbone.Model);

  Collections.Entries = (function(_super) {
    __extends(Entries, _super);

    function Entries() {
      return Entries.__super__.constructor.apply(this, arguments);
    }

    Entries.prototype.model = Models.Entry;

    return Entries;

  })(Backbone.Collection);

  Models.GenPassSettings = (function(_super) {
    __extends(GenPassSettings, _super);

    function GenPassSettings() {
      return GenPassSettings.__super__.constructor.apply(this, arguments);
    }

    GenPassSettings.prototype.defaults = {
      type: "chars",
      length: 30,
      numbers: true,
      letters: true,
      symbols: false
    };

    return GenPassSettings;

  })(Backbone.Model);

  Models.Chest = (function(_super) {
    __extends(Chest, _super);

    function Chest() {
      this.update = __bind(this.update, this);
      this.open = __bind(this.open, this);
      return Chest.__super__.constructor.apply(this, arguments);
    }

    Chest.prototype.open = function(password) {
      var entries;
      this.set("password", password);
      try {
        entries = sjcl.decrypt(password, this.get("ciphertext"));
      } catch (_error) {
        return false;
      }
      this.entries.reset(JSON.parse(entries));
      return true;
    };

    Chest.prototype.update = function() {
      var data;
      data = JSON.stringify(this.entries.toJSON());
      return this.set("ciphertext", sjcl.encrypt(this.get("password"), data));
    };

    return Chest;

  })(Backbone.Model);

  Views.Entry = (function(_super) {
    __extends(Entry, _super);

    function Entry() {
      this["delete"] = __bind(this["delete"], this);
      this.trash = __bind(this.trash, this);
      this.hidePasword = __bind(this.hidePasword, this);
      this.showPassword = __bind(this.showPassword, this);
      return Entry.__super__.constructor.apply(this, arguments);
    }

    Entry.prototype.events = {
      "focus .password": "showPassword",
      "blur .password": "hidePasword",
      "click a.trash": "trash",
      "click a.delete": "delete"
    };

    Entry.prototype.showPassword = function() {
      return this.$(".password").attr("type", "text");
    };

    Entry.prototype.hidePasword = function() {
      return this.$(".password").attr("type", "password");
    };

    Entry.prototype.trash = function(e) {
      e.preventDefault();
      this.model.set("trashed", true);
      return this.remove();
    };

    Entry.prototype["delete"] = function(e) {
      e.preventDefault();
      if (confirm("Are you sure you want to permanently delete this entry?")) {
        this.model.collection.remove(this.model);
        return this.remove();
      }
    };

    return Entry;

  })(Backbone.View);

  Views.GenPass = (function(_super) {
    __extends(GenPass, _super);

    function GenPass() {
      this.toggleSettings = __bind(this.toggleSettings, this);
      this.output = __bind(this.output, this);
      this.generate = __bind(this.generate, this);
      this.initialize = __bind(this.initialize, this);
      return GenPass.__super__.constructor.apply(this, arguments);
    }

    GenPass.prototype.el = ".genpass";

    GenPass.prototype.events = {
      "click button": "output",
      "click .toggle-settings": "toggleSettings"
    };

    GenPass.prototype.initialize = function() {
      this.gen = new Passwordgen();
      return reactive(this.el, this.model);
    };

    GenPass.prototype.generate = function() {
      var res, type;
      type = this.model.get("type");
      return res = this.gen[type](this.model.get("length"), {
        numbers: this.model.get("numbers"),
        letters: this.model.get("letters"),
        symbols: this.model.get("symbols")
      });
    };

    GenPass.prototype.output = function() {
      return this.$(".output").text(this.generate());
    };

    GenPass.prototype.toggleSettings = function(e) {
      e.preventDefault();
      e.stopPropagation();
      return this.$(".settings").toggle();
    };

    return GenPass;

  })(Backbone.View);

  Views.Section = (function(_super) {
    __extends(Section, _super);

    function Section() {
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      return Section.__super__.constructor.apply(this, arguments);
    }

    Section.prototype.show = function() {
      this.$el.show();
      return this;
    };

    Section.prototype.hide = function() {
      this.$el.hide();
      return this;
    };

    return Section;

  })(Backbone.View);

  Views.Auth = (function(_super) {
    __extends(Auth, _super);

    function Auth() {
      this.auth = __bind(this.auth, this);
      this.events = __bind(this.events, this);
      return Auth.__super__.constructor.apply(this, arguments);
    }

    Auth.prototype.el = ".auth.section";

    Auth.prototype.events = function() {
      return {
        "click button": "auth"
      };
    };

    Auth.prototype.auth = function() {
      return this.trigger("auth");
    };

    return Auth;

  })(Views.Section);

  Views.Load = (function(_super) {
    __extends(Load, _super);

    function Load() {
      this.pickLastOpened = __bind(this.pickLastOpened, this);
      this.pickerCb = __bind(this.pickerCb, this);
      this.showPick = __bind(this.showPick, this);
      this.buildPicker = __bind(this.buildPicker, this);
      this.newChest = __bind(this.newChest, this);
      this.showNew = __bind(this.showNew, this);
      this.show = __bind(this.show, this);
      this.initialize = __bind(this.initialize, this);
      return Load.__super__.constructor.apply(this, arguments);
    }

    Load.prototype.el = ".load.section";

    Load.prototype.events = {
      "click .new": "showNew",
      "click .pick": "showPick",
      "click .last-opened": "pickLastOpened"
    };

    Load.prototype.initialize = function() {
      this._new = new Views.New();
      this.listenTo(this._new, "ok", this.newChest);
      return this.listenTo(this._new, "cancel", this.show);
    };

    Load.prototype.show = function() {
      var $lastOpened, lastOpened;
      Load.__super__.show.call(this);
      $lastOpened = this.$(".last-opened");
      lastOpened = store.get("lastOpened");
      if (lastOpened) {
        return $lastOpened.show().find("span").text(lastOpened.title);
      } else {
        return $lastOpened.hide();
      }
    };

    Load.prototype.showNew = function() {
      this.hide();
      return this._new.show();
    };

    Load.prototype.newChest = function(name, password) {
      return this.trigger("new", name, password);
    };

    Load.prototype.buildPicker = function() {
      return this.picker = new google.picker.PickerBuilder().addView(google.picker.ViewId.DOCS).setCallback(this.pickerCb).build();
    };

    Load.prototype.showPick = function() {
      return this.picker.setVisible(true);
    };

    Load.prototype.pickerCb = function(data) {
      var fileId;
      switch (data[google.picker.Response.ACTION]) {
        case google.picker.Action.PICKED:
          fileId = data[google.picker.Response.DOCUMENTS][0].id;
          return this.trigger("pick", fileId);
      }
    };

    Load.prototype.pickLastOpened = function() {
      return this.trigger("pick", store.get("lastOpened").id);
    };

    return Load;

  })(Views.Section);

  Views.New = (function(_super) {
    __extends(New, _super);

    function New() {
      this.cancel = __bind(this.cancel, this);
      this.ok = __bind(this.ok, this);
      this.show = __bind(this.show, this);
      this.initialize = __bind(this.initialize, this);
      return New.__super__.constructor.apply(this, arguments);
    }

    New.prototype.el = ".new.section";

    New.prototype.events = {
      "click .ok": "ok",
      "click .cancel": "cancel"
    };

    New.prototype.initialize = function() {
      var $cancel, $ok, _k;
      $ok = this.$(".ok");
      $cancel = this.$(".cancel");
      _k = k(this.el);
      _k.ignore = function() {
        return false;
      };
      _k("enter", function() {
        return $ok.trigger("click");
      });
      return _k("escape", function() {
        return $cancel.trigger("click");
      });
    };

    New.prototype.show = function() {
      New.__super__.show.call(this);
      this.$(".name").focus();
      return this;
    };

    New.prototype.ok = function() {
      var name, password;
      name = this.$(".name").val().trim();
      password = this.$(".password").val().trim();
      if (!(name && password)) {
        return;
      }
      this.hide();
      return this.trigger("ok", name, password);
    };

    New.prototype.cancel = function() {
      this.hide();
      return this.trigger("cancel");
    };

    return New;

  })(Views.Section);

  Views.Open = (function(_super) {
    __extends(Open, _super);

    function Open() {
      this.open = __bind(this.open, this);
      this.show = __bind(this.show, this);
      this.initialize = __bind(this.initialize, this);
      return Open.__super__.constructor.apply(this, arguments);
    }

    Open.prototype.el = ".open.section";

    Open.prototype.events = {
      "click button": "open"
    };

    Open.prototype.initialize = function() {
      var $button, _k;
      $button = this.$("button");
      _k = k(this.el);
      _k.ignore = function() {
        return false;
      };
      return _k("enter", function() {
        return $button.trigger("click");
      });
    };

    Open.prototype.show = function(title) {
      Open.__super__.show.call(this);
      this.$("h2").text(title);
      this.$(".password").focus();
      return this;
    };

    Open.prototype.open = function() {
      var password;
      password = this.$(".password").val();
      return this.trigger("open", password);
    };

    return Open;

  })(Views.Section);

  Views.Entries = (function(_super) {
    __extends(Entries, _super);

    function Entries() {
      this.newEntry = __bind(this.newEntry, this);
      this.filterEntries = __bind(this.filterEntries, this);
      this.renderEntries = __bind(this.renderEntries, this);
      this.renderEntry = __bind(this.renderEntry, this);
      this.initialize = __bind(this.initialize, this);
      return Entries.__super__.constructor.apply(this, arguments);
    }

    Entries.prototype.el = ".entries";

    Entries.prototype.events = {
      "keyup .filter input": "filterEntries",
      "blur .filter input": "filterEntries",
      "change .filter input": "filterEntries",
      "click .new-entry": "newEntry"
    };

    Entries.prototype.initialize = function() {
      this.genPass = new Views.GenPass({
        model: new Models.GenPassSettings()
      });
      this.listenTo(this.collection, "add", this.renderEntry);
      this.listenTo(this.collection, "remove", this.removeEntry);
      return this.listenTo(this.collection, "reset", this.renderEntries);
    };

    Entries.prototype.renderEntry = function(entry) {
      var filter;
      if (this.filterProp !== "trashed" && entry.get("trashed")) {
        return;
      }
      if (this.filterProp && entry.has(this.filterProp)) {
        if (this.filterProp === "trashed") {
          if (!entry.get("trashed")) {
            return;
          }
        } else {
          filter = new RegExp(this.filter.source.substring(this.filterProp.length + 1), "i");
          if (!filter.test(entry.get(this.filterProp))) {
            return;
          }
        }
      } else {
        if (this.filter && !this.filter.test(entry.get("title"))) {
          return;
        }
      }
      return this.$("> ul").append(new Views.Entry({
        model: entry,
        el: reactive(Templates.entry.cloneNode(true), entry).el
      }).$el);
    };

    Entries.prototype.renderEntries = function(entries) {
      this.$("> ul").empty();
      return entries.each(this.renderEntry);
    };

    Entries.prototype.filterEntries = function() {
      var filterVal;
      filterVal = this.$(".filter input").val().trim();
      if (filterVal.lastIndexOf(":") > 0) {
        this.filterProp = filterVal.split(":")[0];
      } else {
        this.filterProp = null;
      }
      this.filter = new RegExp(filterVal, "i");
      return this.renderEntries(this.collection);
    };

    Entries.prototype.newEntry = function() {
      var entry, id;
      while (true) {
        id = uid(20);
        if (!this.collection.get(id)) {
          break;
        }
      }
      entry = new Models.Entry({
        id: id,
        title: "New Entry",
        username: "",
        password: this.genPass.generate(),
        url: "http://"
      });
      return this.collection.add(entry);
    };

    return Entries;

  })(Views.Section);

  Views.App = (function(_super) {
    __extends(App, _super);

    function App() {
      this.updateChestMetadata = __bind(this.updateChestMetadata, this);
      this.sync = __bind(this.sync, this);
      this.setNeedSync = __bind(this.setNeedSync, this);
      this.toggleSync = __bind(this.toggleSync, this);
      this.openChest = __bind(this.openChest, this);
      this.setChestContent = __bind(this.setChestContent, this);
      this.downloadChest = __bind(this.downloadChest, this);
      this.setChestMetadata = __bind(this.setChestMetadata, this);
      this.pickChest = __bind(this.pickChest, this);
      this.newChest = __bind(this.newChest, this);
      this.getChestReq = __bind(this.getChestReq, this);
      this.showLoggedIn = __bind(this.showLoggedIn, this);
      this.checkAuth = __bind(this.checkAuth, this);
      this.auth = __bind(this.auth, this);
      this.loadDone = __bind(this.loadDone, this);
      this.loadPicker = __bind(this.loadPicker, this);
      this.loadDrive = __bind(this.loadDrive, this);
      this.load = __bind(this.load, this);
      this.toggleFilterHelp = __bind(this.toggleFilterHelp, this);
      this.error = __bind(this.error, this);
      this.setupPlugins = __bind(this.setupPlugins, this);
      this.setupListeners = __bind(this.setupListeners, this);
      this.initialize = __bind(this.initialize, this);
      return App.__super__.constructor.apply(this, arguments);
    }

    App.prototype.el = ".app";

    App.prototype.events = {
      "click .filter .help": "toggleFilterHelp",
      "click .filter-help": "toggleFilterHelp",
      "click .sync": "sync"
    };

    App.prototype.initialize = function() {
      this.chest = new Models.Chest({
        status: "synced"
      });
      this.chest.entries = new Collections.Entries();
      this.views = {
        auth: new Views.Auth(),
        load: new Views.Load(),
        open: new Views.Open(),
        entries: new Views.Entries({
          collection: this.chest.entries
        })
      };
      this.setupListeners();
      return this.setupPlugins();
    };

    App.prototype.setupListeners = function() {
      this.listenTo(this.chest, "change:status", this.toggleSync);
      this.listenTo(this.chest.entries, "add", this.setNeedSync);
      this.listenTo(this.chest.entries, "remove", this.setNeedSync);
      this.listenTo(this.chest.entries, "change", this.setNeedSync);
      this.listenTo(this.views.auth, "auth", _.partial(this.auth, false));
      this.listenTo(this.views.load, "new", this.newChest);
      this.listenTo(this.views.load, "pick", this.pickChest);
      this.listenTo(this.views.open, "open", this.openChest);
      return this;
    };

    App.prototype.setupPlugins = function() {
      NProgress.configure({
        showSpinner: false
      });
      $(document).ajaxStart(function() {
        return NProgress.start();
      }).ajaxStop(function() {
        return NProgress.done();
      });
      return this;
    };

    App.prototype.error = function(message) {
      var $error;
      $error = this.$(".error");
      if (this.errTimeout) {
        clearTimeout(this.errTimeout);
      }
      if (message != null) {
        $error.show().find("span").text(message);
        return this.errTimeout = setTimeout(function() {
          return $error.hide();
        }, 3000);
      } else {
        return $error.hide();
      }
    };

    App.prototype.toggleFilterHelp = function(e) {
      e.preventDefault();
      return $(".filter-help").toggle();
    };

    App.prototype.load = function() {
      NProgress.start();
      return gapi.load("auth,client", this.loadDrive);
    };

    App.prototype.loadDrive = function() {
      return gapi.client.load("drive", "v2", this.loadPicker);
    };

    App.prototype.loadPicker = function(cb) {
      return google.load("picker", "1", {
        callback: this.loadDone
      });
    };

    App.prototype.loadDone = function() {
      NProgress.done();
      this.views.load.buildPicker();
      return this.auth(true);
    };

    App.prototype.auth = function(immediate) {
      var config;
      config = {
        client_id: Config.clientId,
        scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/drive"],
        display: "popup"
      };
      if (immediate) {
        config.immediate = immediate;
      } else {
        config.prompt = "select_account";
      }
      return gapi.auth.authorize(config, this.checkAuth);
    };

    App.prototype.checkAuth = function(token) {
      var req;
      if (token && !token.error) {
        req = gapi.client.request({
          path: "/oauth2/v1/userinfo",
          method: "GET"
        });
        req.execute(this.showLoggedIn);
        this.views.auth.hide();
        return this.views.load.show();
      } else {
        return this.views.auth.show();
      }
    };

    App.prototype.showLoggedIn = function(user) {
      return this.$(".logged-in").show().find(".email").text(user.email);
    };

    App.prototype.multipartBody = function(boundary, metadata, contentType, data) {
      return "--" + boundary + "\nContent-Type: application/json\n\n" + (JSON.stringify(metadata)) + "\n--" + boundary + "\nContent-Type: " + contentType + "\nContent-Transfer-Encoding: base64\n\n" + (btoa(data)) + "\n--" + boundary + "--";
    };

    App.prototype.getChestReq = function(method) {
      var boundary, contentType, metadata, path;
      path = "/upload/drive/v2/files";
      if (method === "PUT") {
        path += "/" + (this.chest.get("id"));
      }
      boundary = uid();
      contentType = "application/json";
      metadata = {
        title: this.chest.get("title"),
        mimeType: contentType
      };
      return gapi.client.request({
        path: path,
        method: method,
        params: {
          uploadType: "multipart"
        },
        headers: {
          "Content-Type": "multipart/mixed; boundary=" + boundary
        },
        body: this.multipartBody(boundary, metadata, contentType, this.chest.get("ciphertext"))
      });
    };

    App.prototype.newChest = function(name, password) {
      var req;
      NProgress.start();
      this.chest.entries.reset([
        {
          id: uid(20),
          title: "Example",
          url: "http://example.com",
          username: "username",
          password: "password"
        }
      ], {
        silent: true
      });
      this.chest.set({
        title: "" + name + ".chest",
        password: password
      }).update();
      req = this.getChestReq("POST");
      return req.execute(this.setChestMetadata);
    };

    App.prototype.pickChest = function(fileId) {
      var req;
      NProgress.start();
      req = gapi.client.drive.files.get({
        fileId: fileId
      });
      return req.execute(this.setChestMetadata);
    };

    App.prototype.setChestMetadata = function(metadata) {
      this.chest.set(metadata);
      return this.downloadChest();
    };

    App.prototype.downloadChest = function() {
      return $.ajax({
        url: this.chest.get("downloadUrl"),
        type: "get",
        headers: {
          "Authorization": "Bearer " + (gapi.auth.getToken().access_token)
        }
      }).done(this.setChestContent).fail(function() {
        return this.error("Failed to download chest");
      });
    };

    App.prototype.setChestContent = function(resp) {
      NProgress.done();
      this.chest.set("ciphertext", JSON.stringify(resp));
      this.views.load.hide();
      return this.views.open.show(this.chest.get("title"));
    };

    App.prototype.openChest = function(password) {
      if (this.chest.open(password)) {
        this.views.open.hide();
        this.views.entries.show();
        return store.set("lastOpened", {
          id: this.chest.get("id"),
          title: this.chest.get("title")
        });
      } else {
        return this.error("Failed to open chest");
      }
    };

    App.prototype.toggleSync = function() {
      var status;
      status = this.chest.get("status");
      return this.$(".sync").prop("disabled", status !== "needSync").find("span").text((function() {
        switch (status) {
          case "needSync":
            return "Sync";
          case "syncing":
            return "Syncing";
          case "synced":
            return "Synced";
        }
      })());
    };

    App.prototype.setNeedSync = function() {
      return this.chest.set("status", "needSync");
    };

    App.prototype.sync = function() {
      var req;
      NProgress.start();
      this.chest.set("status", "syncing").update();
      req = this.getChestReq("PUT");
      return req.execute(this.updateChestMetadata);
    };

    App.prototype.updateChestMetadata = function(metadata) {
      NProgress.done();
      this.chest.set(metadata);
      return this.chest.set("status", "synced");
    };

    return App;

  })(Backbone.View);

  module.exports = new Views.App();

}).call(this);
