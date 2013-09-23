require "jquery"
JSON = require "json"
_ = require "underscore"
Backbone = require "backbone"
NProgress = require "nprogress"
sjcl = require "sjcl"
uid = require "uid"
reactive = require "reactive"
k = require "k"
Passwordgen = require "passwordgen"
store = require "store"


# Config

Config =
  clientId: "671657367079.apps.googleusercontent.com"


# Reactive templates setup

reactive.subscribe (obj, prop, fn) -> obj.on("change:#{prop}", fn)
reactive.set (obj, prop) -> obj.set(prop)
reactive.get (obj, prop) -> obj.get(prop)
reactive.bind "data-text", (el, name) ->
  obj = @obj
  el.innerText = obj.get(name)
  el.onblur = -> obj.set(name, el.innerText)
reactive.bind "data-value", (el, name) ->
  obj = @obj
  el.value = obj.get(name)
  el.onchange = -> obj.set(name, el.value)
reactive.bind "data-checked", (el, name) ->
  obj = @obj
  el.checked = Boolean(obj.get(name))
  el.onchange = -> obj.set(name, el.checked)

Templates =
    entry: document.querySelector(".entry")

for el in _(Templates).values()
  el.remove()


# App

Models = {}
Collections = {}
Views = {}

class Models.Entry extends Backbone.Model

class Collections.Entries extends Backbone.Collection

  model: Models.Entry

class Models.GenPassSettings extends Backbone.Model

  defaults:
    type: "chars"
    length: 30
    numbers: true
    letters: true
    symbols: false

class Models.Chest extends Backbone.Model

  open: (password) =>
    @set("password", password)
    try
      entries = sjcl.decrypt(password, @get("ciphertext"))
    catch
      return false
    @entries.reset(JSON.parse(entries))
    return true

  update: =>
    data = JSON.stringify(@entries.toJSON())
    @set("ciphertext", sjcl.encrypt(@get("password"), data))

class Views.Entry extends Backbone.View

  events:
    "focus .password": "showPassword"
    "blur .password": "hidePasword"
    "click a.trash": "trash"
    "click a.delete": "delete"

  showPassword: =>
    @$(".password").attr("type", "text")

  hidePasword: =>
    @$(".password").attr("type", "password")

  trash: (e) =>
    e.preventDefault()
    @model.set("trashed", true)
    @remove()

  delete: (e) =>
    e.preventDefault()
    if confirm("Are you sure you want to permanently delete this entry?")
      @model.collection.remove(@model)
      @remove()

class Views.GenPass extends Backbone.View

  el: ".genpass"

  events:
    "click button": "output"
    "click .toggle-settings": "toggleSettings"

  initialize: =>
    @gen = new Passwordgen()
    reactive(@el, @model)

  generate: =>
    type = @model.get("type")
    res = @gen[type](
      @model.get("length"),
      numbers: @model.get("numbers")
      letters: @model.get("letters")
      symbols: @model.get("symbols")
    )

  output: =>
    @$(".output").text(@generate())

  toggleSettings: (e) =>
    e.preventDefault()
    e.stopPropagation()
    @$(".settings").toggle()

class Views.Section extends Backbone.View

  show: =>
    @$el.show()
    @

  hide: =>
    @$el.hide()
    @

class Views.Auth extends Views.Section

  el: ".auth.section"

  events: =>
    "click button": "auth"

  auth: =>
    @trigger("auth")


class Views.Load extends Views.Section

  el: ".load.section"

  events:
    "click .new": "showNew"
    "click .pick": "showPick"
    "click .last-opened": "pickLastOpened"

  initialize: =>
    @_new = new Views.New()
    @listenTo(@_new, "ok", @newChest)
    @listenTo(@_new, "cancel", @show)

  show: =>
    super()
    $lastOpened = @$(".last-opened")
    lastOpened = store.get("lastOpened")
    if lastOpened
      $lastOpened.show().find("span").text(lastOpened.title)
    else
      $lastOpened.hide()

  showNew: =>
    @hide()
    @_new.show()

  newChest: (name, password) =>
    @trigger("new", name, password)

  buildPicker: =>
    @picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS)
      .setCallback(@pickerCb)
      .build()

  showPick: =>
    @picker.setVisible(true)

  pickerCb: (data) =>
    switch data[google.picker.Response.ACTION]
      when google.picker.Action.PICKED
        fileId = data[google.picker.Response.DOCUMENTS][0].id
        @trigger("pick", fileId)

  pickLastOpened: =>
    @trigger("pick", store.get("lastOpened").id)

class Views.New extends Views.Section

  el: ".new.section"

  events:
    "click .ok": "ok"
    "click .cancel": "cancel"

  initialize: =>
    $ok = @$(".ok")
    $cancel = @$(".cancel")
    _k = k(@el)
    _k.ignore = -> false
    _k("enter", -> $ok.trigger("click"))
    _k("escape", -> $cancel.trigger("click"))

  show: =>
    super()
    @$(".name").focus()
    @

  ok: =>
    name = @$(".name").val().trim()
    password = @$(".password").val().trim()
    unless (name and password)
      return
    @hide()
    @trigger("ok", name, password)

  cancel: =>
    @hide()
    @trigger("cancel")

class Views.Open extends Views.Section

  el: ".open.section"

  events:
    "click button": "open"

  initialize: =>
    $button = @$("button")
    _k = k(@el)
    _k.ignore = -> false
    _k("enter", -> $button.trigger("click"))

  show: (title) =>
    super()
    @$("h2").text(title)
    @$(".password").focus()
    @

  open: =>
    password = @$(".password").val()
    @trigger("open", password)


class Views.Entries extends Views.Section

  el: ".entries"

  events:
    "keyup .filter input": "filterEntries"
    "blur .filter input": "filterEntries"
    "change .filter input": "filterEntries"
    "click .new-entry": "newEntry"

  initialize: =>
    @genPass = new Views.GenPass(model: new Models.GenPassSettings())
    @listenTo(@collection, "add", @renderEntry)
    @listenTo(@collection, "remove", @removeEntry)
    @listenTo(@collection, "reset", @renderEntries)

  renderEntry: (entry) =>
    if @filterProp != "trashed" and entry.get("trashed")
      return
    if @filterProp and entry.has(@filterProp)
      if @filterProp == "trashed"
        if not entry.get("trashed")
          return
      else
        filter = new RegExp(
          @filter.source.substring(@filterProp.length + 1),
          "i")
        if not filter.test(entry.get(@filterProp))
          return
    else
      if @filter and not @filter.test(entry.get("title"))
        return
    @$("> ul").append(new Views.Entry(
      model: entry
      el: reactive(Templates.entry.cloneNode(true), entry).el
    ).$el)

  renderEntries: (entries) =>
    @$("> ul").empty()
    entries.each(@renderEntry)

  filterEntries: =>
    filterVal = @$(".filter input").val().trim()
    if filterVal.lastIndexOf(":") > 0
      @filterProp = filterVal.split(":")[0]
    else
      @filterProp = null
    @filter = new RegExp(filterVal, "i")
    @renderEntries(@collection)

  newEntry: =>
    while true
      id = uid(20)
      unless @collection.get(id)
        break
    entry = new Models.Entry
      id: id
      title: "New Entry"
      username: ""
      password: @genPass.generate()
      url: "http://"
    @collection.add(entry)

class Views.App extends Backbone.View

  el: ".app"

  events:
    "click .filter .help": "toggleFilterHelp"
    "click .filter-help": "toggleFilterHelp"
    "click .sync": "sync"

  initialize: =>
    @chest = new Models.Chest(status: "synced")
    @chest.entries = new Collections.Entries()
    @views =
      auth: new Views.Auth()
      load: new Views.Load()
      open: new Views.Open()
      entries: new Views.Entries(collection: @chest.entries)
    @setupListeners()
    @setupPlugins()

  setupListeners: =>
    @listenTo(@chest, "change:status", @toggleSync)
    @listenTo(@chest.entries, "add", @setNeedSync)
    @listenTo(@chest.entries, "remove", @setNeedSync)
    @listenTo(@chest.entries, "change", @setNeedSync)
    @listenTo(@views.auth, "auth", _.partial(@auth, false))
    @listenTo(@views.load, "new", @newChest)
    @listenTo(@views.load, "pick", @pickChest)
    @listenTo(@views.open, "open", @openChest)
    @

  setupPlugins: =>
    NProgress.configure(showSpinner: false)
    $(document)
      .ajaxStart ->
        NProgress.start()
      .ajaxStop ->
        NProgress.done()
    @

  error: (message) =>
    $error = @$(".error")
    if @errTimeout
      clearTimeout(@errTimeout)
    if message?
      $error.show().find("span").text(message)
      @errTimeout = setTimeout ->
        $error.hide()
      , 3000
    else
      $error.hide()

  toggleFilterHelp: (e) =>
    e.preventDefault()
    $(".filter-help").toggle()

  load: =>
    NProgress.start()
    gapi.load "auth,client", @loadDrive

  loadDrive: =>
    gapi.client.load "drive", "v2", @loadPicker

  loadPicker: (cb) =>
    google.load "picker", "1", callback: @loadDone

  loadDone: =>
    NProgress.done()
    @views.load.buildPicker()
    @auth(true)

  auth: (immediate) =>
    config =
      client_id: Config.clientId
      scope: [
        "https://www.googleapis.com/auth/userinfo.email"
        "https://www.googleapis.com/auth/drive"
      ]
      display: "popup"
    if immediate
      config.immediate = immediate
    else
      config.prompt = "select_account"
    gapi.auth.authorize(config, @checkAuth)

  checkAuth: (token) =>
    if token and not token.error
      req = gapi.client.request
        path: "/oauth2/v1/userinfo"
        method: "GET"
      req.execute(@showLoggedIn)
      @views.auth.hide()
      @views.load.show()
    else
      @views.auth.show()

  showLoggedIn: (user) =>
    @$(".logged-in")
      .show()
      .find(".email")
        .text(user.email)

  multipartBody: (boundary, metadata, contentType, data) ->
    """
    --#{boundary}
    Content-Type: application/json

    #{JSON.stringify(metadata)}
    --#{boundary}
    Content-Type: #{contentType}
    Content-Transfer-Encoding: base64

    #{btoa(data)}
    --#{boundary}--
    """

  getChestReq: (method) =>
    path = "/upload/drive/v2/files"
    if method == "PUT"
      path += "/#{@chest.get("id")}"
    boundary = uid()
    contentType = "application/json"
    metadata =
      title: @chest.get("title")
      mimeType: contentType
    gapi.client.request
      path: path
      method: method
      params:
        uploadType: "multipart"
      headers:
        "Content-Type": "multipart/mixed; boundary=#{boundary}"
      body:
        @multipartBody(
          boundary,
          metadata,
          contentType,
          @chest.get("ciphertext"))

  newChest: (name, password) =>
    NProgress.start()
    @chest.entries.reset([
      id: uid(20)
      title: "Example"
      url: "http://example.com"
      username: "username"
      password: "password"
    ], silent: true)
    @chest
      .set
        title: "#{name}.chest"
        password: password
      .update()
    req = @getChestReq("POST")
    req.execute(@setChestMetadata)

  pickChest: (fileId) =>
    NProgress.start()
    req = gapi.client.drive.files.get(fileId: fileId)
    req.execute(@setChestMetadata)

  setChestMetadata: (metadata) =>
    @chest.set(metadata)
    @downloadChest()

  downloadChest: =>
    # TODO: Just use gapi for this
    $.ajax
      url: @chest.get("downloadUrl")
      type: "get"
      headers:
        "Authorization": "Bearer #{gapi.auth.getToken().access_token}"
    .done(@setChestContent)
    .fail ->
      @error("Failed to download chest")

  setChestContent: (resp) =>
    NProgress.done()
    @chest.set("ciphertext", JSON.stringify(resp))
    @views.load.hide()
    @views.open.show(@chest.get("title"))

  openChest: (password) =>
    if @chest.open(password)
      @views.open.hide()
      @views.entries.show()
      store.set "lastOpened",
        id: @chest.get("id")
        title: @chest.get("title")
    else
      @error("Failed to open chest")

  toggleSync: =>
    status = @chest.get("status")
    @$(".sync")
      .prop("disabled", status != "needSync")
      .find("span")
        .text(
          switch status
            when "needSync" then "Sync"
            when "syncing" then "Syncing"
            when "synced" then "Synced"
        )

  setNeedSync: =>
    @chest.set("status", "needSync")

  sync: =>
    NProgress.start()
    @chest
      .set("status", "syncing")
      .update()
    req = @getChestReq("PUT")
    req.execute(@updateChestMetadata)

  updateChestMetadata: (metadata) =>
    NProgress.done()
    @chest.set(metadata)
    @chest.set("status", "synced")


# Export

module.exports = new Views.App()
