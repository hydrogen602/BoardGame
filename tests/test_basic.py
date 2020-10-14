from gameServerBackend.requestProcessor.dataTypes import Player
import pytest
import os
import sys
import json

sys.path.append(os.path.abspath(os.curdir))

from go_game import GoGame
from gameServerBackend.requestProcessor import interactions

def test_1():
    g = GoGame()

    p1 = Player('player B')
    p2 = Player('player W')

    assert not g.hasGameStarted

    resp = g.joinPlayer(p1)
    assert isinstance(resp, interactions.ResponseSuccess)
    assert resp.isValid

    assert resp.dataToSome is None
    assert json.loads(resp.dataToSender) == {'message': 'Joined as black'}
    (b, w), msgToAll = resp.dataToAll
    assert b == p1
    assert w is None
    assert json.loads(msgToAll) == {
        'board': [['' for _ in range(19)] for _ in range(19)],
        'color': 'black', 
        'turn': None
        }

    assert not g.hasGameStarted
    assert isinstance(resp, interactions.ResponseSuccess)
    assert resp.isValid

    resp = g.joinPlayer(p2)
    assert isinstance(resp, interactions.ResponseSuccess)
    assert resp.isValid

    assert resp.dataToSome == {p1: '{"message": "player W joined as white"}'}
    assert json.loads(resp.dataToSender) == {'message': 'Joined as white. player B is your opponent'}
    (b, w), msgToAll = resp.dataToAll
    assert b == p1
    assert w == p2
    assert g.hasGameStarted
    assert json.loads(msgToAll) == {
        'board': [['' for _ in range(19)] for _ in range(19)],
        'color': 'white',
        'turn': 'player B'
    }

    assert g.hasGameStarted

    assert g._GoGame__curTurn is p1

    x = g.handleRequest(p2, "")
    assert isinstance(x, interactions.ResponseFailure)
    assert not x.isValid

    x = g.handleRequest(p1, json.dumps({'type': 'pass'}))
    assert isinstance(x, interactions.ResponseSuccess)
    assert x.isValid

    assert g._GoGame__curTurn is p2

    x = g.handleRequest(p2, json.dumps({
        'type': 'move',
        'locationX': 1,
        'locationY': 3 
    }))
    assert isinstance(x, interactions.ResponseSuccess)
    assert x.isValid

    assert g._GoGame__curTurn is p1
