build/client/index.js: client/index.js client/index.d.js \
    api/types.d.js \
    lib/crypto/sha3.js lib/crypto/secp256k1.js lib/crypto/modular.js \
    lib/did/*.d.js lib/did/section.js \
    lib/ethereum/*.d.js lib/ethereum/TCKT.js \
    lib/ethereum/evm.js lib/ethereum/unlockable.js \
    lib/node/ipfs.d.js lib/node/ipfs.js lib/node/error.d.js \
    lib/node/nvi.d.js \
    lib/util/çevir.js
	mkdir -p $(dir $@)
	echo "globalThis['KimlikDAO'] = KimlikDAO;" | cat $< - > $@.tmp
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_warning=strictCheckTypes \
                             --jscomp_error=unusedLocalVariables \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $@.tmp \
                             --js $@.tmp $(filter-out $<,$^) \
                             --js_output_file $@
	yarn uglifyjs $@ -m -o $@
