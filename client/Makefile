
build/client/kimlikdao.js: client/kimlikdao.js client/kimlikdao.ext.js \
                           lib/ethereum/provider.js \
                           lib/tckt/TCKTBilgileri.js lib/api/edevletApi.js
	mkdir -p build
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $(filter %.js,$^) \
                             --js_output_file $@
	yarn uglifyjs $< -m -o $@
