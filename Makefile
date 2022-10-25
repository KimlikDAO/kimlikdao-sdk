build/index.js: src/index.js lib/TCKTBilgileri.js
	mkdir -p build
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --env BROWSER \
                             --assume_function_wrapper \
                             --js $^ \
                             --checks_only
	yarn uglifyjs $< -m -o $@
