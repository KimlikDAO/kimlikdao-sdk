build/client/index.js: client/index.js client/index.d.js \
    api/*.d.js \
    lib/crosschain/*.js \
    lib/crypto/sha3.js lib/crypto/secp256k1.js lib/crypto/modular.js \
    lib/crypto/wesolowski.js lib/crypto/primes.js \
    lib/did/*.js \
    lib/ethereum/*.d.js lib/ethereum/KPassLite.js \
    lib/ethereum/evm.js \
    lib/node/*.d.js lib/node/ipfs.js \
    lib/util/çevir.js
	mkdir -p $(dir $@)
	echo "globalThis['exports'] = {'KimlikDAO':KimlikDAO};" | cat $< - > $@.tmp
	bun google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                            --jscomp_warning=strictCheckTypes \
                            --jscomp_error=unusedLocalVariables \
                            --emit_use_strict \
                            --module_resolution NODE \
                            --assume_function_wrapper \
                            --dependency_mode PRUNE \
                            --entry_point $@.tmp \
                            --js $@.tmp $(filter-out $<,$^) \
                            --js_output_file $@
	bun uglifyjs $@ -m -o $@
	sed -i.bak 's/globalThis.exports=/export/g' $@

.PHONY: client
client: build/client/index.js
