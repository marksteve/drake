$ = require "jquery"
Backbone = require "backbone"
AES = require "Gibberish-AES"


App = Backbone.View.extend

  el: ".app"

  events:
    "submit .open form": "open"

  initialize: ->
    @safe = AES.enc(JSON.stringify([name: "value"]), "password")

  open: (e) ->
    e.preventDefault()
    console.log(AES.dec(@safe, @$(".open input[type=password]").val()))


app = new App()
