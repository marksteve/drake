require "jquery"
JSON = require "json"
_ = require "underscore"
Backbone = require "backbone"
NProgress = require "nprogress"
sjcl = require "sjcl"


Config =
  clientId: "671657367079.apps.googleusercontent.com"


class Safe extends Backbone.Model

  jsonContent: =>
    JSON.parse(@get("content"))

  decrypt: (password) =>
    sjcl.decrypt(password, @jsonContent())


class App extends Backbone.View

  el: ".app"

  events:
    "click .auth button": =>
      @auth false, @checkAuth
    "click .pick button": "pick"
    "click .open button": "open"

  initialize: =>
    @safe = new Safe()
    @setupPlugins()
    @load()

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
      @showPick()
    else
      @showAuth()

  showAuth: =>
    @$(".auth").show()
    @

  hideAuth: =>
    @$(".auth").hide()
    @

  pick: (e) =>
    @picker.setVisible(true)
    @

  showPick: =>
    @$(".pick").show()

  hidePick: =>
    @$(".pick").hide()

  pickerCb: (data) =>
    switch data[google.picker.Response.ACTION]
      when google.picker.Action.PICKED
        fileId = data[google.picker.Response.DOCUMENTS][0].id
        @loadSafe(fileId)
    @

  loadSafe: (fileId) =>
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
    @safe.set('content', resp)
    @hidePick()
    @showOpen()
    @

  showOpen: =>
    @$(".open").show()
    @

  open: =>
    password = @$(".open input[type=password]").val()
    console.log @safe.decrypt(password)


app = new App()
