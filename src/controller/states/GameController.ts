import 'p2';
import 'pixi';
import 'phaser';

import { States } from './States';

import Network from '../network';

declare var Victor;
declare var gameId;

/**
 * Kontroler gry
 * @export
 * @class GameController
 * @extends {Phaser.State}
 */
export class GameController extends Phaser.State {

    /**
     * Grafika do rysowania kontrolera
     * @private
     * @type {Phaser.Graphics}
     * @memberof GameController
     */
    private graphics: Phaser.Graphics;

    /**
     * Zdarzenia z touch device
     * @private
     * @type {TouchList}
     * @memberof GameController
     */
    private tpCache: TouchList;

    /**
     * Identyfikator zdarzenia dla lewej części kontrolera
     * @private
     * @type {number}
     * @memberof GameController
     */
    private leftTouchID: number;

    /**
     * Wektor pozycji początkowej kontolera
     * @private
     * @memberof GameController
     */
    private leftTouchStartPos = new Victor(0, 0);

    /**
     * Wektor aktualnej pozycji kontolera
     * @private
     * @memberof GameController
     */
    private leftTouchPos = new Victor(0, 0);


    /**
     * Wektor pozycji gracza
     * @private
     * @memberof GameController
     */
    private leftVector = new Victor(0, 0);

    /**
     * Identyfikator zdarzenia dla prawej części kontrolera
     * @private
     * @type {number}
     * @memberof GameController
     */
    private rightTouchID: number;

    private scoreText: Phaser.Text;

    preload() {
        Network.onUpdateScore((score) => {
            this.scoreText.setText('Score: ' + score);
        });

        document.getElementById('controller').addEventListener('touchstart', this.onTouchStart.bind(this));
        document.getElementById('controller').addEventListener('touchmove', this.onTouchMove.bind(this));
        document.getElementById('controller').addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    create() {
        this.graphics = this.game.add.graphics(0 ,0);
        this.scoreText = this.game.add.text(
            this.game.world.centerX,
            10, 'Score: ...',
            { font: '15px Kenvector Future', fill: '#ffffff', align: 'center' });
        this.scoreText.anchor.setTo(0.5, 0);
    }

    update() {
        this.graphics.clear();
        if (this.tpCache) {
            for (let i = 0; i < this.tpCache.length; i++) {
                const touch = this.tpCache[i];
                if (touch.identifier == this.leftTouchID) {
                    this.graphics.lineStyle(6, 0x66ffff);
                    this.graphics.drawCircle(this.leftTouchStartPos.x, this.leftTouchStartPos.y, 80);
                    this.graphics.lineStyle(2, 0x66ffff);
                    this.graphics.drawCircle(this.leftTouchStartPos.x, this.leftTouchStartPos.y, 100);
                    this.graphics.lineStyle(2, 0x66ffff);
                    this.graphics.drawCircle(this.leftTouchPos.x, this.leftTouchPos.y, 80);
                } else if (touch.identifier == this.rightTouchID) {
                    this.graphics.lineStyle(2, 0xff0000);
                    this.graphics.drawCircle(touch.clientX, touch.clientY, 80);
                }
                // else {
                //     this.graphics.lineStyle(2, 0xff0000);
                //     this.graphics.drawCircle(touch.clientX, touch.clientY, 80);
                // }
            }
        }

        Network.updatePlayerXY(gameId, { x: this.leftVector.x, y: this.leftVector.y });
    }

    shutdown() {
        document.getElementById('controller').removeEventListener('touchstart', this.onTouchStart.bind(this));
        document.getElementById('controller').removeEventListener('touchmove', this.onTouchMove.bind(this));
        document.getElementById('controller').removeEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onTouchStart(e: TouchEvent) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.clientX < this.game.world.centerX) {
                this.leftTouchID = touch.identifier;
                this.leftTouchStartPos = new Victor(touch.clientX, touch.clientY);
                this.leftTouchPos.copy(this.leftTouchStartPos);
                this.leftVector = new Victor(0, 0);
            } 
            else {
                this.rightTouchID = touch.identifier;
                Network.updatePlayerZ(gameId, true);
            }
        }
        this.tpCache = e.touches;
    }

    onTouchMove(e: TouchEvent) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier == this.leftTouchID) {
                this.leftTouchPos = new Victor(touch.clientX, touch.clientY);
                if (Math.abs(this.leftTouchStartPos.distance(this.leftTouchPos)) > 90) {
                    this.leftTouchPos.subtract(this.leftTouchStartPos);
                    this.leftTouchPos.normalize();
                    this.leftTouchPos.multiply(new Victor(90, 90));
                    this.leftTouchPos.add(this.leftTouchStartPos);
                } 
                this.leftVector.copy(this.leftTouchPos);
                this.leftVector.subtract(this.leftTouchStartPos);
            }
        }
    }

    onTouchEnd(e: TouchEvent) {
        this.tpCache = e.touches;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier == this.leftTouchID) {
                this.leftTouchID = -1;
            } else if (touch.identifier == this.rightTouchID) {
                this.rightTouchID = -1;
                Network.updatePlayerZ(gameId, false);
            }
        }
    }
}