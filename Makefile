build/index.js: src/index.js lib/tckt/TCKTBilgileri.js \
                lib/api/edevletApi.js
	mkdir -p build
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --env BROWSER \
                             --assume_function_wrapper \
                             --js $^ \
                             --checks_only
	yarn uglifyjs $< -m -o $@

.PHONY: clean
clean:
	rm -rf build

