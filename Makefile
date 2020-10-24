
.PHONY: lint build-image save-image load-image run-image

tagName = go-game-server

lint:
	mypy go_game


.ONESHELL:
build-image: SHELL := bash
build-image:
	[ -z $$(docker images -q ${tagName}) ] || docker image rm -f ${tagName}
	docker image build --tag ${tagName} .

run-image: build-image
	docker container run -d -p 5000:5000 -v DataVolume1:/data1 ${tagName}

save-image: build
	docker image save ${tagName} > out.tar.gz

load-image:
	docker image load < out.tar.gz 