build/client/kimlikdao.js: client/kimlikdao.js client/kimlikdao.ext.js \
    api/types.js \
    lib/api/edevletApi.js \
    lib/crypto/sha3.js lib/crypto/secp256k1.js lib/crypto/modular.js \
    lib/did/types.js lib/did/infoSection.js \
    lib/ethereum/ERC721Unlockable.js lib/ethereum/jsonrpc.js lib/ethereum/provider.js \
    lib/ethereum/TCKT.js lib/ethereum/evm.js lib/ethereum/unlockables.js \
    lib/ipfs.js \
    lib/util/çevir.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -o $@
