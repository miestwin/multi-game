import 'p2';
import 'pixi';
import 'phaser';
import state from './state';
import Network from './network';
import Main from './controllers/Main';
import ThemePicker from './controllers/ColorPicker';
import GameError from './controllers/GameError';

document.addEventListener('DOMContentLoaded', function () {
    startApp();
});

function startApp(): void {
    const controllerConfig = {
        width: window.innerWidth,
        height: window.innerHeight,
        renderer: Phaser.AUTO,
        parent: document.getElementById('controller'),
        resolution: 1
    };
    console.log(state.id);
    const controller = new App(controllerConfig);
}

class App extends Phaser.Game {
    constructor (config) {
        super(config);
        Network.connect();
        this.state.add('Main', Main);
        this.state.add('Error', GameError);
        this.state.add('ThemePicker', ThemePicker);
        this.state.start('Main');
    }
}

