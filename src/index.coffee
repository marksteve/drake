require "jquery"
_ = require "underscore"
Backbone = require "backbone"
NProgress = require "nprogress"


Config =
  clientId: "671657367079.apps.googleusercontent.com"


Doc = Backbone.Model.extend

  initialize: ->


App = Backbone.View.extend

  el: ".app"

  events:
    "click .auth button": (e) ->
      @auth false, ->
        @hideAuth()
        @showPick()
    "click .pick button": "pick"

  initialize: ->
    $(document)
      .ajaxStart ->
        NProgress.start()
      .ajaxStop ->
        NProgress.done()
    @load()

  load: ->
    NProgress.start()
    gapi.load "auth,client", _.bind ->
      gapi.client.load "drive", "v2", _.bind ->
        @loadPicker ->
          NProgress.done()
          @auth true, _.bind (token) ->
            if token and not token.error
              @hideAuth()
              @showPick()
            else
              @showAuth()
          , @
      , @
    , @
    @

  loadPicker: (cb) ->
    google.load "picker", "1",
      callback: _.bind ->
        @picker = new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.DOCS)
          .setCallback(_.bind(@pickerCb, @))
          .build()
        _.bind(cb, @)()
      , @
    @

  auth: (immediate, cb) ->
    gapi.auth.authorize
      client_id: Config.clientId
      scope: "https://www.googleapis.com/auth/drive"
      immediate: immediate
    , _.bind(cb, @)
    @

  showAuth: ->
    @$(".auth").show()
    @

  hideAuth: ->
    @$(".auth").hide()
    @

  pick: (e) ->
    @picker.setVisible(true)
    @

  showPick: ->
    @$(".pick").show()

  pickerCb: (data) ->
    switch data[google.picker.Response.ACTION]
      when google.picker.Action.PICKED
        fileId = data[google.picker.Response.DOCUMENTS][0].id
        @loadDoc fileId, ->
          @showOpen()
    @

  loadDoc: (fileId, cb) ->
    req = gapi.client.drive.files.get(fileId: fileId)
    req.execute _.bind (doc) ->
      $.ajax
        url: doc.downloadUrl
        type: 'get'
      .done (resp) ->
        console.log resp
        _.bind(cb, @)()
      .fail ->
        console.error "Failed to load doc"
    , @
    @

  showOpen: ->
    @$(".open").show()
    @


app = new App()
