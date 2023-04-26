default: start

start: build
	docker run --env-file .env -d slack_boltjs_app

build:
	docker build -t slack_boltjs_app -f Dockerfile.example .