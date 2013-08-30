$ = require "jquery"
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
    @

  load: (cb) ->
    gapi.load "auth",
      _.bind ->
        @loadPicker ->
          @auth true, _.bind (token) ->
            if token and not token.error
              @hideAuth()
              @showPick()
            else
              @showAuth()
          , @
          _.bind(cb, @)()
      , @
    @

  loadPicker: (cb) ->
    google.load "picker", "1",
      callback: _.bind ->
        @picker = new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.DOCS)
          .setCallback(@pickerCb)
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

  hideAuth: ->
    @$(".auth").hide()

  showPick: ->
    @$(".pick").show()

  pickerCb: (data) ->
    switch data[google.picker.Response.ACTION]
      when google.picker.Action.PICKED
        doc = data[google.picker.Response.DOCUMENTS][0]
        console.log doc
    @

  pick: (e) ->
    @picker.setVisible(true)
    @


app = new App()
app.load ->
  NProgress.done()
NProgress.start()
