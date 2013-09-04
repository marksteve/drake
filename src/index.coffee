require "jquery"
JSON = require "json"
_ = require "underscore"
Backbone = require "backbone"
NProgress = require "nprogress"
sjcl = require "sjcl"
uid = require "uid"


Config =
  clientId: "671657367079.apps.googleusercontent.com"


class SafeEntry extends Backbone.Model


class SafeEntries extends Backbone.Collection

  model: SafeEntry


class Safe extends Backbone.Model

  decrypt: (password) =>
    try
      entries = sjcl.decrypt(password, @get("ciphertext"))
    catch
      return false
    @set("entries", new SafeEntries(JSON.parse(entries)))
    true


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
    @setupPlugins()
    @load()
    @

  setupPlugins: =>
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
    if @safe.decrypt(password)
      console.log @safe.get("entries")


app = new App()
