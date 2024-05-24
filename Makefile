NODE = docker run -it -w /home/node -v $$(pwd):/home/node --rm node:18

TS_SRC = $(shell find src/ -type f)
JS_BUILD = build/celtic.js

default: compile

init:
	$(NODE) npm install

compile: $(JS_BUILD)

$(JS_BUILD): $(TS_SRC) tsconfig.json
	$(NODE) ./node_modules/.bin/tsc -p tsconfig.json
