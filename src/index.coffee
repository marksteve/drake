$ = require "jquery"
Backbone = require "backbone"
AES = require "Gibberish-AES"


App = Backbone.View.extend

  el: ".app"

  events:
    "click .pick button": "pick"

  initialize: ->
    @picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS)
      .setCallback(@pickerCb)
      .build()

  pick: (e) ->
    @picker.setVisible(true)

  pickerCb: (data) ->
    switch data[google.picker.Response.ACTION]
      when google.picker.Action.PICKED
        doc = data[google.picker.Response.DOCUMENTS][0]
        console.log doc

  enc: (data, password) ->
    AES.enc(JSON.stringify(data), password)


window.start = ->
  app = new App()


google.load("picker", "1", callback: "start")
