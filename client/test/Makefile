build/client/test/kimlikdao.compiled-test.js: client/test/kimlikdao.compiled-test.js \
    client/kimlikdao.ext.js \
    lib/api/edevletApi.js \
    lib/ethereum/jsonrpc.js lib/ethereum/provider.js \
    lib/tckt/ERC721Unlockable.js lib/tckt/TCKTBilgileri.js \
    lib/testing/assert.js \
    build/client/kimlikdao.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $(filter-out build/client/kimlikdao.js, $^) \
                             --js_output_file $@
	echo "const kimlikdao={};" > build/client/test/prelude.js
	yarn uglifyjs lib/testing/nodeHeader.js build/client/test/prelude.js \
                  build/client/kimlikdao.js $@ -m -o $@
	node $@

.PHONY: client/test
client/test: build/client/test/kimlikdao.compiled-test.js
