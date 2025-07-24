init:
	make down
	make init_var
	make build_docker
	make up
	make grant_perms

init_var:
	mkdir -p ./var/storage/postgres_data
	mkdir -p ./var/storage/redis_data

grant_perms:
	sudo chown -R $(USER):$(USER) .
	sudo chmod -R u+rwX .

build_docker: init_var
	docker compose build

up:
	docker compose up -d

restart:
	docker compose restart

restart_bot:
	docker compose restart automod-bot

down:
	docker compose down --remove-orphans

down_force:
	docker compose down -v --rmi=all --remove-orphans

console_backend:
	docker exec -it automod-backend sh

console_bot:
	docker exec -it automod-bot sh
