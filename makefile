snake.js: ./src/*.ts
	tsc
	tsc --module amd --outFile ./snake.js ./src/*.ts

all: snake.js

clean:
	rm snake.js
	rm -rf ./js