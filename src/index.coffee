require "jquery"
JSON = require "json"
_ = require "underscore"
Backbone = require "backbone"
NProgress = require "nprogress"
sjcl = require "sjcl"
uid = require "uid"
reactive = require "reactive"
enter = require "on-enter"
escape = require "on-escape"


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

Templates =
    entry: document.querySelector(".entry")

for el in _(Templates).values()
  el.remove()


# App

Models = {}
Collections = {}
Views = {}

class Models.Safe extends Backbone.Model

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
    @

class Models.Entry extends Backbone.Model

class Collections.Entries extends Backbone.Collection

  model: Models.Entry

class Views.Entry extends Backbone.View

  events:
    "focus .password": "showPassword"
    "blur .password": "hidePasword"
    "click .trash": "trash"

  showPassword: =>
    @$(".password").attr("type", "text")
    @

  hidePasword: =>
    @$(".password").attr("type", "password")
    @

  trash: (e) =>
    e.preventDefault()
    @model.set("trashed", true)
    @remove()
    @

class Views.App extends Backbone.View

  el: ".app"

  events:
    "click .auth button": ->
      @auth false, @checkAuth
    "click .load button.new": ->
      @hideLoad()
      @showNew()
    "click .new button.ok": ->
      name = @$(".new .name").val().trim()
      password = @$(".new .password").val()
      unless (name and password)
        return
      @hideNew()
      @newSafe(name, password)
    "click .new button.cancel": ->
      @hideNew()
      @showLoad()
    "click .load button.pick": "pick"
    "click .open button": "open"
    "keyup .filter": "filterEntries"
    "blur .filter": "filterEntries"
    "change .filter": "filterEntries"
    "click .new-entry": "newEntry"
    "click .sync": "sync"
    "click .genpass": "genPass"

  initialize: =>
    @safe = new Models.Safe(status: "synced")
    @safe.on("change:status", @toggleSync)
    @safe.entries = new Collections.Entries()
    @safe.entries
      .on("add", @listenEntry)
      .on("add", @renderEntry)
      .on("reset", @listenEntries)
      .on("reset", @renderEntries)
    @setupPlugins()
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

  setupPlugins: =>
    NProgress.configure(showSpinner: false)
    $(document)
      .ajaxStart ->
        NProgress.start()
      .ajaxStop ->
        NProgress.done()
    @

  showAuth: =>
    @$(".auth.section").show()
    @

  hideAuth: =>
    @$(".auth.section").hide()
    @

  showLoad: =>
    @$(".load.section").show()
    @

  hideLoad: =>
    @$(".load.section").hide()
    @

  showNew: =>
    enter(_.bind ->
      @$(".new button.ok").trigger("click")
    , @)
    escape(_.bind ->
      @$(".new button.cancel").trigger("click")
    , @)
    @$(".new.section")
      .show()
      .find(".name")
        .focus()
    @

  hideNew: =>
    enter.unbind()
    escape.unbind()
    @$(".new.section").hide()
    @

  showOpen: =>
    enter(_.bind ->
      @$(".open button").trigger("click")
    , @)
    @$(".open.section")
      .show()
      .find(".password")
        .focus()
    @

  hideOpen: =>
    enter.unbind()
    @$(".open.section").hide()
    @

  showEntries: =>
    @$(".entries").show()

  load: =>
    NProgress.start()
    gapi.load "auth,client", @loadDrive
    @

  loadDrive: =>
    gapi.client.load "drive", "v2", @loadPicker
    @

  loadPicker: (cb) =>
    google.load "picker", "1", callback: @buildPicker
    @

  buildPicker: =>
    NProgress.done()
    @picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS)
      .setCallback(@pickerCb)
      .build()
    @auth true, @checkAuth
    @

  auth: (immediate, cb) =>
    gapi.auth.authorize
      client_id: Config.clientId
      scope: "https://www.googleapis.com/auth/drive"
      immediate: immediate
    , cb
    @

  checkAuth: (token) =>
    if token and not token.error
      @hideAuth()
      @showLoad()
    else
      @showAuth()
    @

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

  getSafeReq: (method) =>
    path = "/upload/drive/v2/files"
    if method == "PUT"
      path += "/#{@safe.get("id")}"
    boundary = uid()
    contentType = "application/json"
    metadata =
      title: @safe.get("title")
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
          @safe.get("ciphertext"))

  newSafe: (name, password) =>
    @safe.entries.reset([
      id: uid(20)
      title: "Example"
      url: "http://example.com"
      username: "username"
      password: "password"
    ], silent: true)
    @safe
      .set
        title: "#{name}.safe"
        password: password
      .update()
    req = @getSafeReq("POST")
    req.execute(@setSafeMetadata)
    @

  pick: =>
    @picker.setVisible(true)
    @

  pickerCb: (data) =>
    switch data[google.picker.Response.ACTION]
      when google.picker.Action.PICKED
        fileId = data[google.picker.Response.DOCUMENTS][0].id
        @getSafeMetadata(fileId)
    @

  getSafeMetadata: (fileId) =>
    req = gapi.client.drive.files.get(fileId: fileId)
    req.execute(@setSafeMetadata)
    @

  setSafeMetadata: (metadata) =>
    @safe.set(metadata)
    @downloadSafe()
    @

  downloadSafe: =>
    $.ajax
      url: @safe.get("downloadUrl")
      type: "get"
      headers:
        "Authorization": "Bearer #{gapi.auth.getToken().access_token}"
    .done(@setSafeContent)
    .fail ->
      @error("Failed to download safe")
    @

  setSafeContent: (resp) =>
    @safe.set("ciphertext", JSON.stringify(resp))
    @hideLoad()
    @showOpen()
    @

  open: =>
    @error()
    password = @$(".open .password").val()
    if @safe.open(password)
      @hideOpen()
      @showEntries()
    else
      @error("Failed to open safe")
    @

  listenEntry: (entry) =>
    safe = @safe
    entry.on("change", -> safe.set("status", "needSync"))
    @

  listenEntries: (entries) =>
    entries.each(@listenEntry)
    @

  renderEntry: (entry) =>
    unless entry.get("trashed")
      if @filter and not @filter.test(entry.get("title"))
        return
      @$(".entries > ul").append(new Views.Entry(
        model: entry
        el: reactive(Templates.entry.cloneNode(true), entry).el
      ).$el)
    @

  renderEntries: (entries) =>
    @$(".entries > ul").empty()
    entries.each(@renderEntry)
    @

  filterEntries: =>
    @filter = new RegExp(@$(".filter").val().trim(), "i")
    @renderEntries(@safe.entries)
    @

  newEntry: =>
    @safe.set("status", "needSync")
    entry = new Models.Entry
      id: uid(20)
      title: "New Entry"
      username: ""
      password: uid(40)
      url: "http://"
    @safe.entries.add(entry)
    @

  toggleSync: =>
    status = @safe.get("status")
    @$(".sync")
      .prop("disabled", status != "needSync")
      .find("span")
        .text(
          switch status
            when "needSync" then "Sync"
            when "syncing" then "Syncing"
            when "synced" then "Synced"
        )
    @

  sync: =>
    NProgress.start()
    @safe
      .set("status", "syncing")
      .update()
    req = @getSafeReq("PUT")
    req.execute(@updateSafeMetadata)
    @

  updateSafeMetadata: (metadata) =>
    NProgress.done()
    @safe.set(metadata)
    @safe.set("status", "synced")
    @

  genPass: =>
    @$(".genpass-output").text(uid(40))
    @


# Export

module.exports = new Views.App()
