include server-js/test/Makefile

build/server-js/index.js: server-js/index.js server-js/validator.js \
    server-js/TCKT.js server-js/TCKTSigners.js \
    api/*.d.js api/error.js api/validationReport.js \
    lib/api/jsonrpc.d.js lib/api/jsonrpc.js \
    lib/crypto/sha3.js lib/crypto/secp256k1.js lib/crypto/modular.js \
    lib/did/*.d.js lib/did/section.js \
    lib/ethereum/*.d.js \
    lib/ethereum/evm.js \
    lib/node/error.d.js lib/node/ipfs.d.js lib/node/ipfs.js \
    lib/node/nvi.d.js \
    lib/util/çevir.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_warning=strictCheckTypes \
                             --jscomp_error=unusedLocalVariables \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -o $@

.PHONY: server-js
server-js: build/server-js/index.js
