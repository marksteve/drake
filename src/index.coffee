require "jquery"
JSON = require "json"
_ = require "underscore"
Backbone = require "backbone"
NProgress = require "nprogress"
sjcl = require "sjcl"
uid = require "uid"
reactive = require "reactive"


reactive.subscribe (obj, prop, fn) -> obj.on("change:#{prop}", fn)
reactive.set (obj, prop) -> obj.set(prop)
reactive.get (obj, prop) -> obj.get(prop)


Config =
  clientId: "671657367079.apps.googleusercontent.com"

Templates =
    entry: document.querySelector(".entry")

for el in _(Templates).values()
  el.remove()


class SafeEntry extends Backbone.Model


class SafeEntries extends Backbone.Collection

  model: SafeEntry


class Safe extends Backbone.Model

  open: (password) =>
    try
      entries = sjcl.decrypt(password, @get("ciphertext"))
    catch
      return false
    @set("entries", new SafeEntries(JSON.parse(entries)))
    return true


class SafeEntryView extends Backbone.View

  events:
    "focus .password": "showPassword"
    "blur .password": "hidePasword"

  showPassword: =>
    @$(".password").attr("type", "text")
    @

  hidePasword: =>
    @$(".password").attr("type", "password")
    @


class App extends Backbone.View

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
    "click .genpass": "genPass"

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

  initialize: =>
    @safe = new Safe()
    @safe.on("change:entries", @renderEntries)
    @setupPlugins()
    @

  setupPlugins: =>
    NProgress.configure(showSpinner: false)
    $(document)
      .ajaxStart ->
        NProgress.start()
      .ajaxStop ->
        NProgress.done()
    @

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

  showAuth: =>
    @$(".auth.section").show()
    @

  hideAuth: =>
    @$(".auth.section").hide()
    @

  showLoad: =>
    @$(".load.section").show()

  hideLoad: =>
    @$(".load.section").hide()

  showNew: =>
    @$(".new.section").show()

  hideNew: =>
    @$(".new.section").hide()

  newSafe: (name, password) =>
    safe = [
      id: uid(20)
      title: "Example"
      url: "http://example.com"
      username: "username"
      password: "password"
    ]
    boundary = uid()
    contentType = "application/json"
    metadata =
      title: "#{name}.safe"
      mimeType: contentType
    data = sjcl.encrypt(password, JSON.stringify(safe))
    req = gapi.client.request
      path: "/upload/drive/v2/files"
      method: "POST"
      params:
        uploadType: "multipart"
      headers:
        "Content-Type": "multipart/mixed; boundary=#{boundary}"
      body:
        @multipartBody(boundary, metadata, contentType, data)
    req.execute @setSafeMetadata

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
    req.execute @setSafeMetadata
    @

  setSafeMetadata: (metadata) =>
    @safe.set(metadata)
    @downloadSafe()
    @

  downloadSafe: =>
    console.log "Downloading #{@safe.get("downloadUrl")}..."
    $.ajax
      url: @safe.get("downloadUrl")
      type: "get"
      headers:
        "Authorization": "Bearer #{gapi.auth.getToken().access_token}"
    .done(@setSafeContent)
    .fail ->
      console.error "Failed to download safe"
    @

  setSafeContent: (resp) =>
    @safe.set("ciphertext", JSON.stringify(resp))
    @hideLoad()
    @showOpen()
    @

  showOpen: =>
    @$(".open.section").show()
    @

  hideOpen: =>
    @$(".open.section").hide()
    @

  open: =>
    password = @$(".open input[type=password]").val()
    if @safe.open(password)
      @hideOpen()
      @showEntries()
    @

  showEntries: =>
    @$(".entries").show()

  renderEntries: =>
    $entries = @$(".entries ul")
    @safe.get("entries").each (entry) ->
      $entries.append(new SafeEntryView(
        model: entry
        el: reactive(Templates.entry, entry).el
      ).el)

  genPass: =>
    @$(".genpass-output").text(uid(40))
    @


module.exports = new App()
