#!/bin/bash

function usage {
    echo 
    echo "Usage:  build.sh COMMAND"
    echo
    echo "Commands:"
    echo -e "  local                   Build for local testing"
    echo -e "  run                     Build & run for local testing"
    echo -e "  image                   Build docker image for local testing"
    echo -e "  image deploy            Build docker image for deployment"
    echo -e "  run-image               Build & run docker image for local testing"
    echo -e "  save-image outfile      save docker image"
    echo -e "  load-image infile       load docker image"
    exit 1
}

function build {
    echo "Nothing to do for build"
}

function image {
    if [ -z $1 ]; then
        echo "missing filename"
        exit 1
    fi

    build

    echo "Using $1 as config.json"
    cp "$1" dist/config.json

    if [ -n $(docker images -q $tagName) ]; then
        echo "Found image with tag $tagName, removing"
        docker image rm -f $tagName
    fi
    docker image build --tag $tagName .
}

# CONFIG
tagName=go-game-server
port=5000
# END OF CONFIG

if [ $# -eq 0 ]; then
    usage
else
    if [ $1 == "local" ]; then
        build
    elif [ $1 == "run" ]; then
        build
        echo "Starting server"
        cd dist && node server.js
        cd ..
    elif [ $1 == "image" ]; then
        if [ $2 == "deploy" ]; then
            image dockerProdConfig.json
        else
            image dockerConfig.json
        fi
    elif [ $1 == "run-image" ]; then
        image dockerConfig.json

	    docker container run -d -p $port:$port -v DataVolume1:/data1 $tagName
    
    elif [ $1 == "save-image" ]; then
        if [ -z $2 ]; then
            echo "missing filename"
            usage
        fi

        docker image save $tagName > $2
    elif [ $1 == "load-image" ]; then
        if [ -z $2 ]; then
            echo "missing filename"
            usage
        fi

        docker image load < $2
    else
        echo "unrecognized command: $1"
        usage
    fi
fi