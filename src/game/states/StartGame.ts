import 'p2';
import 'pixi';
import 'phaser';
import { randomNumberInRange } from '../../utils';
import { generatePointStars } from '../../engine';
import { States } from './States';

import Network from '../network';

import { Player, Meteor, Shard, ElectricField } from '../../models';

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
    private meteors: Phaser.Group;
    private electricFields: Phaser.Group;
    private filter: Phaser.Filter;
    private collidedField = {};

    preload() {
        Network.onGetAllPlayers((players) => {
            Object.keys(players).forEach((playerId, index, playersId) => {
                const count = playersId.length;
                const step = this.game.world.centerY / count;
                const offset = step / 2;
                const y = step * (index + 1) + (offset * (count - 1));
                (<any>this.game.state).players[playerId] = 
                    new Player(this.game, 50, y, { id: players[playerId].id, socketId: players[playerId].socketID, avatar: players[playerId].character });
                this.collidedField[playerId] = null;
            });
        });

        Network.onPlayedUpdateXY((playerId, update) => {
           const player = (<any>this.game.state).players[playerId];
           player.vector = new Victor(update.x, update.y).rotateDeg(player.angle);
        });

        Network.onPlayerUpdateZ((playerId, update) => {
            const player = (<any>this.game.state).players[playerId];
            player.zPos = update;
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

        this.electricFields = this.game.add.group();
        this.electricFields.enableBody = true;
        this.electricFields.physicsBodyType = Phaser.Physics.ARCADE;
        for (let i = 0; i < 40; i++) {
            const x1 = this.game.world.width * (i + 2);
            const x2 = this.game.world.width * (i + 3) < 45000? this.game.world.width * (i + 3) : 45000;
            const x = randomNumberInRange(x1, x2);
            const y = randomNumberInRange(50, this.game.world.height - 50);
            const field = new ElectricField(this.game, x, y);
            this.electricFields.add(field);
        }
        this.electricFields.addAll('body.velocity.x', -600, true, false);

        this.meteors = this.game.add.group();
        this.meteors.enableBody = true;
        this.meteors.physicsBodyType = Phaser.Physics.ARCADE;
        for (let i = 0; i < 100; i++) {
            const x1 = this.game.world.width * (i + 3);
            const x2 = this.game.world.width * (i + 3.3);
            const x = randomNumberInRange(x1, x2);
            const y = randomNumberInRange(50, this.game.world.height - 50);
            const meteor = new Meteor(this.game, x, y);
            this.meteors.add(meteor);
        }
        this.meteors.addAll('body.velocity.x', -1000, true, false);

        this.shards = this.game.add.group();
        this.shards.enableBody = true;
        this.shards.physicsBodyType = Phaser.Physics.ARCADE;
        for (let i = 0; i < 1000; i++) {
            const x = randomNumberInRange(250, 50000);
            const y = randomNumberInRange(30, this.game.world.height - 30);
            const shard = new Shard(this.game, x, y);
            this.shards.add(shard);
        }
        this.shards.addAll('body.velocity.x', -800, true, false);
        
        //this.filter = new Phaser.Filter(this.game, null, this.game.cache.getShader('bacteria'));
        //this.filter.addToWorld(0, 0, this.game.width, this.game.height);
    }

    update() {  
        Object.keys((<any>this.game.state).players).forEach(playerId => {
            (<any>this.game.state).players[playerId].update();
            this.game.physics.arcade.overlap(
                (<any>this.game.state).players[playerId],
                this.shards, this.shard_player_CollisionHandler, null, this);

            this.game.physics.arcade.overlap(
                (<any>this.game.state).players[playerId],
                this.electricFields, this.electricField_player_CollisionHandler, null, this);
        });

        this.game.physics.arcade.overlap(this.meteors, this.electricFields, this.meteor_field_CollisionHandler, null, this);

        // this.filter.update();
    }

    shard_player_CollisionHandler(player: Player, shard: Shard) {
        if (player.scale.x == Player.DEFAULT_SCALE) { 
            shard.kill();
            player.score += 1;
            Network.updatePlayerScore(player.id, player.socket, player.score);
        } else if (player.scale.x == Player.MAX_SCALE) {

        }
    }

    electricField_player_CollisionHandler(player: Player, field: Phaser.Sprite) {
        if (this.collidedField[player.id] == field) {
            return false;
        }
        this.collidedField[player.id] = field;
        if (player.scale.x < Player.MAX_SCALE && player.angle == 0) {
            player.angle = 180;
            player.vector = player.vector.divide(new Victor(11, 11));
        } else if (player.scale.x < Player.MAX_SCALE && player.angle != 0) {
            player.angle = 0;
            player.vector = player.vector.divide(new Victor(11, 11));
        }
    }

    meteor_field_CollisionHandler(meteor: Meteor, field: ElectricField) {
        meteor.body.velocity.y = randomNumberInRange(-1000, 1000);
    }

    shutdown() {
        Network.removeListener(Network.ALL_PLAYERS);
        Network.removeListener(Network.UPDATE_PLAYER_XY);
        Network.removeListener(Network.UPDATE_PLAYER_Z);
        Network.removeListener(Network.PLAYER_DISCONNECTED);
    }
}
