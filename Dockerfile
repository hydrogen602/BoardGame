FROM python:3.7.9-buster

WORKDIR /app

RUN python3 -m pip install gameServerBackend twisted autobahn pyOpenSSL service_identity

COPY go_game/* go_game/
COPY main.py .
COPY dist/config.json config.json

EXPOSE 5000

CMD [ "python3", "main.py" ]