build/client/kimlikdao.js: client/kimlikdao.js client/kimlikdao.ext.js \
                           lib/api/edevletApi.js \
                           lib/ethereum/ERC721Unlockable.js lib/ethereum/jsonrpc.js lib/ethereum/provider.js \
                           lib/ethereum/TCKT.js lib/ethereum/evm.js \
                           lib/crypto/sha3.js \
                           lib/did/types.js lib/did/infoSection.js \
                           lib/util/çevir.js \
                           lib/ipfs.js
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
