import 'p2';
import 'pixi';
import 'phaser';

import { States } from './States';

import Network from '../network';

import { Player } from '../../models';

declare var Victor;

/**
 * Start rozgrywki
 * @export
 * @class Boot
 * @extends {Phaser.State}
 */
export class StartGame extends Phaser.State {

    preload() {
        Network.onGetAllPlayers((players) => {
            Object.keys(players).forEach((playerId, index, playersId) => {
                const count = playersId.length;
                const step = this.game.world.centerY / count;
                const offset = step / 2;
                const y = step * (index + 1) + (offset * (count - 1));
                (<any>this.game.state).players[playerId] = 
                    new Player(this.game, 50, y, { id: players[playerId].id, socketId: players[playerId].socketID, avatar: players[playerId].character });
                (<any>this.game.state).players[playerId].angle += 90;
            });
        });

        Network.onPlayedUpdateXY((playerId, update) => {
           const player = (<any>this.game.state).players[playerId];
           player.vector = new Victor(update.x, update.y);
        });

        Network.onPlayerDisconnected((player) => {
            // remove player
            (<any>this.game.state).players = Object.keys((<any>this.game.state).players).reduce((players, nextId) => {
                if ((<any>this.game.state).players[nextId].id == player.id) {
                    (<any>this.game.state).players[nextId].destroy();
                    return players;
                }
                players[nextId] = (<any>this.game.state).players[nextId];
                return players;
            }, {});
        });

        Network.getAllPlayers();
    }

    create() {
        this.game.world.setBounds(0, 0, 50000, this.game.height);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    }

    update() {  
        Object.keys((<any>this.game.state).players).forEach(playerId => (<any>this.game.state).players[playerId].update());
    }

    shutdown() {
        Network.removeListener(Network.ALL_PLAYERS);
        Network.removeListener(Network.UPDATE_PLAYER_XY);
        Network.removeListener(Network.PLAYER_DISCONNECTED);
    }
}