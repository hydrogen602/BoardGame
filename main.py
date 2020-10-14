from gameServerBackend.requestProcessor import dataTypes, RequestProcessor
from gameServerBackend.server import Server

import go_game

if __name__ == "__main__":
    gameDB = dataTypes.BasicGameManager()
    playerDB = dataTypes.BasicPlayerManager()

    gameDB.addGame('go1', go_game.GoGame())

    rp = RequestProcessor(playerDB, gameDB)

    s = Server('localhost', 5000, requestProcessor=rp, config={'USE_SSL': False, 'verbose': True})

    s.run()