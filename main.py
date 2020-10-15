from game_server_backend.requestProcessor import dataTypes, RequestProcessor
from game_server_backend.server import Server
import json
import go_game

if __name__ == "__main__":
    gameDB = dataTypes.BasicGameManager()
    playerDB = dataTypes.BasicPlayerManager()

    gameDB.addGame('go1', go_game.GoGame())

    rp = RequestProcessor(playerDB, gameDB)

    config = {'USE_SSL': False, 'verbose': True}
    try:
        with open('config.json') as f:
            config = json.load(f)
            print('Loaded config from file')
    except FileNotFoundError:
        print('Could not find config.json, using default')

    s = Server('localhost', 5000, requestProcessor=rp, config=config)

    s.run()