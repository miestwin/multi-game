import 'p2';
import 'pixi';
import 'phaser';
import { randomNumberInRange } from '../../utils';
import { generatePointStars } from '../../engine';
import { States } from './States';

import Network from '../network';

import { Player, Asteroid, Shard } from '../../models';

declare var Victor;

/**
 * Start rozgrywki
 * @export
 * @class Boot
 * @extends {Phaser.State}
 */
export class StartGame extends Phaser.State {

    private tiles: Phaser.TileSprite[] = [];
    private shards: Phaser.Group;
    private filter: Phaser.Filter;

    preload() {
        Network.onGetAllPlayers((players) => {
            Object.keys(players).forEach((playerId, index, playersId) => {
                const count = playersId.length;
                const step = this.game.world.centerY / count;
                const offset = step / 2;
                const y = step * (index + 1) + (offset * (count - 1));
                (<any>this.game.state).players[playerId] = 
                    new Player(this.game, 50, y, { id: players[playerId].id, socketId: players[playerId].socketID, avatar: players[playerId].character });
                // (<any>this.game.state).players[playerId].angle += 90;
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
        const filter = new Phaser.Filter(this.game, null, this.game.cache.getShader('glow'));
        this.game.world.setBounds(0, 0, this.game.width, this.game.height);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        for (let i = 1; i <= 2; i++) {
            const texture = generatePointStars(this.game, i * 0.00001, i);
            const tile = this.game.add.tileSprite(0, 0, 50000, this.game.height, texture);
            if (i === 1) {
                tile.filters = [filter];
            }
            tile.autoScroll(-100 * i, 0);
            this.tiles.push(tile);
        }

        //this.filter = new Phaser.Filter(this.game, null, this.game.cache.getShader('bacteria'));
        //this.filter.addToWorld(0, 0, this.game.width, this.game.height);

        this.shards = this.game.add.group();
        this.shards.enableBody = true;
        this.shards.physicsBodyType = Phaser.Physics.ARCADE;
        for (let i = 0; i < 1000; i++) {
            const shard = new Shard(this.game, randomNumberInRange(250, 50000), randomNumberInRange(30, this.game.world.height - 30));
            this.shards.add(shard);
        }
        this.shards.addAll('body.velocity.x', -800, true, false);
    }

    update() {  
        Object.keys((<any>this.game.state).players).forEach(playerId => {
            (<any>this.game.state).players[playerId].update();
            this.game.physics.arcade.overlap((<any>this.game.state).players[playerId], this.shards, this.shardsCollisionHandler, null, this);
        });
        // this.filter.update();
    }

    shardsCollisionHandler(player: Player, shard: Shard) {
        shard.kill();
        player.score += 1;
    }

    shutdown() {
        Network.removeListener(Network.ALL_PLAYERS);
        Network.removeListener(Network.UPDATE_PLAYER_XY);
        Network.removeListener(Network.PLAYER_DISCONNECTED);
    }
}
