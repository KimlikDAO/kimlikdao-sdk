include client/Makefile

.PHONY: test
test: client/test

.PHONY: clean
clean:
	rm -rf build
