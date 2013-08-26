build:
	coffee -c -o . src/
	sass -C src/index.scss index.css
	component install
	component build -v

.PHONY: build
