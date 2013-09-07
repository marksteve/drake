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
    @

class Models.Entry extends Backbone.Model

class Collections.Entries extends Backbone.Collection

  model: Models.Entry

class Views.Entry extends Backbone.View

  events:
    "focus .password": "showPassword"
    "blur .password": "hidePasword"
    "click a.trash": "trash"
    "click a.delete": "delete"

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

  delete: (e) =>
    e.preventDefault()
    if confirm("Are you sure you want to permanently delete this entry?")
      @model.trigger("remove")
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
      @newChest(name, password)
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
    @chest = new Models.Chest(status: "synced")
    @chest.on("change:status", @toggleSync)
    @chest.entries = new Collections.Entries()
    @chest.entries
      .on("add", @listenEntry)
      .on("add", @renderEntry)
      .on("remove", @removeEntry)
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
    gapi.auth.authorize(config, cb)
    @

  checkAuth: (token) =>
    if token and not token.error
      req = gapi.client.request
        path: "/oauth2/v1/userinfo"
        method: "GET"
      req.execute(@showLoggedIn)
      @hideAuth()
      @showLoad()
    else
      @showAuth()
    @

  showLoggedIn: (user) =>
    @$(".logged-in")
      .show()
      .find(".email")
        .text(user.email)
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
    @

  pick: =>
    @picker.setVisible(true)
    @

  pickerCb: (data) =>
    switch data[google.picker.Response.ACTION]
      when google.picker.Action.PICKED
        fileId = data[google.picker.Response.DOCUMENTS][0].id
        @getChestMetadata(fileId)
    @

  getChestMetadata: (fileId) =>
    NProgress.start()
    req = gapi.client.drive.files.get(fileId: fileId)
    req.execute(@setChestMetadata)
    @

  setChestMetadata: (metadata) =>
    @chest.set(metadata)
    @downloadChest()
    @

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
    @

  setChestContent: (resp) =>
    NProgress.done()
    @chest.set("ciphertext", JSON.stringify(resp))
    @hideLoad()
    @showOpen()
    @

  open: =>
    @error()
    password = @$(".open .password").val()
    if @chest.open(password)
      @hideOpen()
      @showEntries()
    else
      @error("Failed to open chest")
    @

  listenEntry: (entry) =>
    chest = @chest
    entry.on "change", ->
      chest.set("status", "needSync")
    entry.on "remove", ->
      chest.set("status", "needSync")
      chest.entries.remove(entry)
    @

  listenEntries: (entries) =>
    entries.each(@listenEntry)
    @

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
    filterVal = @$(".filter").val().trim()
    if filterVal.lastIndexOf(":") > 0
      @filterProp = filterVal.split(":")[0]
    else
      @filterProp = null
    @filter = new RegExp(filterVal, "i")
    @renderEntries(@chest.entries)
    @

  newEntry: =>
    @chest.set("status", "needSync")
    while true
      id = uid(20)
      unless @chest.entries.get(id)
        break
    entry = new Models.Entry
      id: id
      title: "New Entry"
      username: ""
      password: uid(40)
      url: "http://"
    @chest.entries.add(entry)
    @

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
    @

  sync: =>
    NProgress.start()
    @chest
      .set("status", "syncing")
      .update()
    req = @getChestReq("PUT")
    req.execute(@updateChestMetadata)
    @

  updateChestMetadata: (metadata) =>
    NProgress.done()
    @chest.set(metadata)
    @chest.set("status", "synced")
    @

  genPass: =>
    @$(".genpass-output").text(uid(40))
    @


# Export

module.exports = new Views.App()
