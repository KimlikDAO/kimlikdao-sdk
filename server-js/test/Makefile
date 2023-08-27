build/server-js/test/TCKT.compiled-test.js: server-js/test/TCKT.compiled-test.js \
    server-js/TCKT.js \
    lib/api/jsonrpc.d.js lib/api/jsonrpc.js \
    lib/crypto/sha3.js lib/crypto/secp256k1.js lib/crypto/modular.js \
    lib/ethereum/eth.d.js lib/ethereum/transaction.d.js lib/ethereum/evm.js \
    lib/testing/assert.js lib/testing/nodejs.d.js \
    lib/util/çevir.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_error=unusedLocalVariables \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -o $@
	node $@

.PHONY: server-js/test
server-js/test: build/server-js/test/TCKT.compiled-test.js
