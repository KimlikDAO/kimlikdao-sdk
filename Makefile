include client/Makefile
include server-js/Makefile

.PHONY: test
test: server-js/test

.PHONY: clean
clean:
	rm -rf build
