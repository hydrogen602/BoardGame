from game_server_backend.requestProcessor import dataTypes, RequestProcessor
from game_server_backend.server import Server
import json
import go_game

if __name__ == "__main__":
    # default config
    config = {
        'USE_SSL': False, 
        'verbose': True, 
        'ip': 'localhost', 
        'port': 5000,
        'databasePath': 'game.db'
    }

    try:
        with open('config.json') as f:
            config = json.load(f)
            print('Loaded config from file')
    except FileNotFoundError:
        print('Could not find config.json, using default')


    gameDB = go_game.GameSQLite(config.pop('databasePath'), prefix='go')
    
    playerDB = dataTypes.BasicPlayerManager()

    #gameDB.addGame('go1', go_game.GoGame())
    for _ in range(16):
        g = go_game.GoGame()
        gameDB.addGameGenToken(g)

    print('GameIDs:', gameDB.getAllGameIDs())

    rp = RequestProcessor(playerDB, gameDB)

    s = Server(None, None, requestProcessor=rp, config=config)

    s.run()