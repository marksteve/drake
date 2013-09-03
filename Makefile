build:
	coffee -c -o . src/
	sass -C src/index.scss index.css
	component install
	component build -v

serve: build
	@command -v serve > /dev/null 2>&1 || { echo "serve not found: npm install -g serve"; exit 1; }
	serve

.PHONY: build
