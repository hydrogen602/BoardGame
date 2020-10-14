'''
{"type": "pass"} -> pass
{
    "type": "move",
    "locationX": <int>,
    "locationY": <int>
}                       -> place stone

returns

{
    'board': Array<Array<string>>
    'message': <str>,                   <- optional
    'color': 'white' | 'black',         <- optional
    'turn': <str: player name>          <- optional
}
'''

from typing import Dict, List, Optional, cast
import json
from gameServerBackend.requestProcessor.game import AbstractGame # type: ignore
from gameServerBackend.requestProcessor.game import interactions # type: ignore
from gameServerBackend.requestProcessor.dataTypes import Player # type: ignore

class TurnRequestParser:
    '''
    Get information out of json and raise an Assertion if anything is wrong
    '''

    MOVE_TYPE_MOVE = 'move'
    MOVE_TYPE_PASS = 'pass'

    def __init__(self, obj: Dict[str, object]) -> None:
        assert isinstance(obj, dict)
        assert all(isinstance(s, str) for s in obj.keys())

        assert 'type' in obj
        tmp = obj['type']
        assert isinstance(tmp, str)
        self.moveType: str = tmp
        assert self.moveType == self.MOVE_TYPE_MOVE or self.moveType == self.MOVE_TYPE_PASS

        self.locationX: int
        self.locationY: int

        if self.moveType == 'move':
            assert 'locationX' in obj
            assert 'locationY' in obj
            tmpX = obj['locationX']
            tmpY = obj['locationY']
            assert type(tmpX) == int
            assert type(tmpY) == int
            self.locationX = cast(int, tmpX) # idk why this is necessary
            self.locationY = cast(int, tmpY)

        else:
            self.locationX = -1
            self.locationY = -1


class GoGame(AbstractGame):

    def __init__(self) -> None:
        super().__init__()
        self.__white: Optional[Player] = None
        self.__black: Optional[Player] = None

        self.__curTurn: Optional[Player] = None

        self.__gridSize: int = 19
        self.__board: List[List[str]] = [['' for _ in range(self.__gridSize)] for _ in range(self.__gridSize)]

    def joinPlayer(self, playerData: Player, otherRequestData: Optional[str] = None) -> interactions.Response:
        if self.hasGameStarted:
            return interactions.ResponseFailure(playerData, "Game already started")

        if self.__black is None:
            self.__black = playerData
            return self.__makeSuccessfulResponse(playerData, "Joined as black", {'color': 'black'})

        elif self.__white is None:
            self.__white = playerData
            self.startGame()
            return self.__makeSuccessfulResponse(playerData, f"Joined as white. {self.__black.getPlayerName()} is your opponent", state={'color': 'white'}, msgToOther=f"{playerData.getPlayerName()} joined as white")

        else:
            return interactions.ResponseFailure(playerData, "No space left in this game")

    def leavePlayer(self, playerData: Player) -> interactions.ResponseSuccess:
        pass

    def handleRequest(self, playerData: Player, request: str) -> interactions.Response:
        if not self.hasGameStarted:
            return interactions.ResponseFailure(playerData, "Game hasn't started yet")
        

        try:
            obj = json.loads(request)

            if playerData != self.__curTurn:
                return interactions.ResponseFailure(playerData, "Not your turn")

            turn = TurnRequestParser(obj)

            if turn.moveType == TurnRequestParser.MOVE_TYPE_MOVE:
                x = turn.locationX
                y = turn.locationY
                if x < 0 or x >= self.__gridSize:
                    return interactions.ResponseFailure(playerData, 'Move out of bounds')
                if y < 0 or y >= self.__gridSize:
                    return interactions.ResponseFailure(playerData, 'Move out of bounds')

                return self.__move(x, y, playerData=playerData)
            else:
                self.__nextTurn()
                return self.__makeSuccessfulResponse(playerData, msgToOther="Opponent passed")

        except json.JSONDecodeError:
            return interactions.ResponseFailure(playerData, "Got invalid json")
        except AssertionError:
            return interactions.ResponseFailure(playerData, "Got invalid data in json")

    def startGame(self) -> interactions.Response:
        self.__curTurn = self.__black
        super().startGame()
    
    def __makeSuccessfulResponse(self, src: Player, msg: Optional[str] = None, state: Optional[Dict[str, object]] = None, msgToAll: Optional[str] = None, msgToOther: Optional[str] = None) -> interactions.ResponseSuccess:
        '''
        Assemble a successful response. The result of __getStateAsJson is send every time, but if extra data should be send, use state
        '''
        if msgToAll:
            state['message'] = msgToAll
        
        if state is None:
            state = self.__getStateAsJson()
        else:
            state = {
                **state,
                **self.__getStateAsJson()
            }

        
        other: Player = self.__black if src == self.__white else self.__white
        if self.hasGameStarted:
            assert other is not None
            
        return interactions.ResponseSuccess(
            json.dumps({'message': msg}) if msg else None,
            src,
            ([self.__black, self.__white], json.dumps(state)),
            {other: json.dumps({'message': msgToOther})} if msgToOther is not None and other is not None else None
        )

    
    def __getStateAsJson(self) -> Dict[str, object]:
        '''
        Get the state of the game
        '''
        return {
            'board': self.__board,
            'turn': self.__curTurn.getPlayerName() if self.__curTurn else None
        }
    
    def __nextTurn(self):
        if self.__curTurn == self.__black:
            self.__curTurn = self.__white
        else:
            self.__curTurn = self.__black
    
    def __move(self, x: int, y: int, playerData: Player):
        color = ''
        if playerData == self.__black:
            color = 'black'
        elif playerData == self.__white:
            color = 'white'
        else:
            print(f'Warning: Got unknown player: {playerData.getPlayerName()}')
            return interactions.ResponseFailure(playerData, "Player unknown")

        if self.__board[x][y] == '':
            self.__board[x][y] = color[0]

            self.__nextTurn()
            return self.__makeSuccessfulResponse(playerData)
        else:
            return interactions.ResponseFailure(playerData, 'Space occupied')