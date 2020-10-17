from secrets import token_urlsafe
from typing import Dict, Optional, Set
from game_server_backend.requestProcessor.dataTypes import GameManager
from game_server_backend.requestProcessor.game import AbstractGame
from secrets import token_urlsafe
import sqlite3
import atexit
import time

class GameSQLite(GameManager):

    def __init__(self, dbFileName: str, prefix: str) -> None:
        super().__init__()
        self.__conn: sqlite3.Connection = sqlite3.connect(dbFileName)
        atexit.register(self.__cleanup)

        self.__cur: sqlite3.Cursor = self.__conn.cursor()

        self.__prefix: str = prefix

        self.__cur.execute('DROP TABLE IF EXISTS games')
        self.__cur.execute('''
        CREATE TABLE games (
            gameID TEXT NOT NULL PRIMARY KEY,
            claimed INTEGER NOT NULL,
            last_event INTEGER NOT NULL
        )
        ''')
        self.__conn.commit()
        self.__data: Dict[str, AbstractGame] = {}

    def __cleanup(self):
        self.__cur.execute('DROP TABLE IF EXISTS games')
        self.__cur.commit()
        self.__conn.close()
    
    @staticmethod
    def __time() -> int:
        return int(time.time())

    def addGame(self, id: str, game: AbstractGame):
        if id in self.__data:
            raise ValueError(f'GameID already exists: {id}')
        self.__cur.execute('''
        INSERT INTO games (gameID, claimed, last_event) VALUES (?, ?, ?)
        ''', (id, False, self.__time()))
        self.__conn.commit()
        self.__data[id] = game

    def updateTime(self, id: str):
        if id not in self.__data:
            raise ValueError(f'GameID does not exist: {id}')
        self.__cur.execute('''
        UPDATE games SET last_event = ? WHERE gameID = ?
        ''', (self.__time(), id))

    def addGameGenToken(self, game: AbstractGame):
        gameID = self.__prefix + token_urlsafe(16)
        while gameID in self.__data:
            gameID = self.__prefix + token_urlsafe(16)

        self.addGame(gameID, game)

    def removeGame(self, id: str) -> AbstractGame:
        if id not in self.__data:
            raise ValueError(f'GameID not found: {id}')
        self.__cur.execute('''
        DELETE FROM games WHERE gameID=?
        ''', (id,))
        g: AbstractGame = self.__data.pop(id)
        return g

    def getAllGameIDs(self) -> Set[str]:
        return set(self.__data.keys())

    def getGame(self, id: str) -> Optional[AbstractGame]:
        return self.__data.get(id)
