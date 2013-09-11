CSS = build/build.min.css
JS = build/build.min.js

all: $(CSS) $(JS)

$(CSS): build
	cssc build/build.css > $@

$(JS): build
	uglifyjs build/build.js > $@

build: lib/index.css lib/index.js components
	component build -v
	@touch build

components: component.json
	component install

lib/%.css: src/%.scss
	sass -C $< $@

lib/%.js: src/%.coffee
	coffee -cp $< > $@

serve: build
	serve

.PHONY: serve
