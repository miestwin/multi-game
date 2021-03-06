import * as io from 'socket.io-client';

/**
 * Połączenie z serwerem
 * @export
 * @class Network
 */
export default class Network {
    private static socket;

    public static NEW_GAME = 'new-game';
    public static START_TIMER = 'start-timer';
    public static PLAYER_DISCONNECTED = 'player-disconnected';
    public static GAME_ASSIGNED_SUCCESSFUL = 'game-assigned-successful';
    public static UPDATE_PLAYERS_STATE = 'update-players-state';
    public static UPDATE_TIMER = 'update-timer';
    public static START_GAME = 'start-game';
    public static ALL_PLAYERS = 'all-players';
    public static UPDATE_PLAYER_XY = 'update-player-xy';
    public static UPDATE_PLAYER_Z = 'update-player-z';
    public static UPDATE_PLAYER_SCORE = 'update_player_score';
    public static PLAYER_FIRE = 'player_fire';
    public static NO_CONNECTED_PLAYERS = 'no_connected_players';
    public static END_GAME = 'end-game';
    public static PLAY_AGAIN = 'play-again';

    public static connect () {
        Network.socket = io();
        Network.initialize();
    }

    private static initialize () {
        Network.socket.on('disconnect', () => {
            document.location.reload();
        });
    }

    /**
     * Usunięcie podanego listenere
     * @static
     * @param {string} listener 
     * @memberof Network
     */
    public static removeListener(listener: string) {
        Network.socket.off(listener);
    }

    /**
     * Nadaje informację o nowej grze
     * @static
     * @param {any} id 
     * @memberof Network
     */
    public static newGame(id) {
        Network.socket.emit(Network.NEW_GAME, { id: id });
    }

    /**
     * Polecenie rozpoczęcia odliczania do rozpoczęcia gry 
     * @static
     * @memberof Network
     */
    public static startTimer() {
        Network.socket.emit(Network.START_TIMER);
    }

    /**
     * Pobierz wszystkich graczy
     * @static
     * @memberof Network
     */
    public static getAllPlayers() {
        Network.socket.emit(Network.ALL_PLAYERS);
    }

    /**
     * Aktualizacja wyniku gracza
     * @static
     * @param {any} playerId 
     * @param {any} socketId 
     * @param {any} score 
     * @memberof Network
     */
    public static updatePlayerScore(playerId, socketId, score, vibration) {
        Network.socket.emit(Network.UPDATE_PLAYER_SCORE, playerId, socketId, score, vibration);
    }

    public static gameEnd(gameId, playerId) {
        Network.socket.emit(Network.END_GAME, gameId, playerId);
    }

    /**
     * Nasłuchiwanie czy gracz się rozłączył
     * @static
     * @param {Function} fn Funkcja która zostanie wykonana
     * @memberof Network
     */
    public static onPlayerDisconnected(fn: Function) {
        Network.socket.on(Network.PLAYER_DISCONNECTED, fn);
    }

    /**
     * Nasłuchiwanie czy gra została utworzona pomyślnie
     * @static
     * @param {Function} fn Funkcja która zostanie wykonana
     * @memberof Network
     */
    public static onGameAssignedSuccessful(fn: Function) {
        Network.socket.on(Network.GAME_ASSIGNED_SUCCESSFUL, fn);
    }

    /**
     * Nasłuchiwanie zaktualizowania stanu graczy
     * @static
     * @param {Function} fn Funkcja która zostanie wykonana
     * @memberof Network
     */
    public static onUpdatePlayersState(fn: Function) {
        Network.socket.on(Network.UPDATE_PLAYERS_STATE, fn);
    }

    /**
     * Aktualizacja odliczania
     * @static
     * @param {Function} fn 
     * @memberof Network
     */
    public static onUpdateTimer(fn: Function) {
        Network.socket.on(Network.UPDATE_TIMER, fn);
    }

    /**
     * Rozpoczęcie gry
     * @static
     * @param {Function} fn 
     * @memberof Network
     */
    public static onStartGame(fn: Function) {
        Network.socket.on(Network.START_GAME, fn);
    }

    /**
     * Odebranie informacji o graczach
     * @static
     * @param {Function} fn 
     * @memberof Network
     */
    public static onGetAllPlayers(fn: Function) {
        Network.socket.on(Network.ALL_PLAYERS, fn);
    }

    /**
     * Aktualizacja pozycji gracza
     * @static
     * @param {Function} fn 
     * @memberof Network
     */
    public static onPlayedUpdateXY(fn: Function) {
        Network.socket.on(Network.UPDATE_PLAYER_XY, fn);
    }

    /**
     * Aktualizacja pozycji gracza
     * @static
     * @param {Function} fn 
     * @memberof Network
     */
    public static onPlayerUpdateZ(fn: Function) {
        Network.socket.on(Network.UPDATE_PLAYER_Z, fn);
    }

    /**
     * Oddanie strzału przez gracza
     * @static
     * @param {Function} fn 
     * @memberof Network
     */
    public static onPlayerFire(fn: Function) {
        Network.socket.on(Network.PLAYER_FIRE, fn);
    }

    /**
     * Wszyscy gracze rozłączyli się
     * @static
     * @param {Function} fn 
     * @memberof Network
     */
    public static onNoConnectedPlayers(fn: Function) {
        Network.socket.on(Network.NO_CONNECTED_PLAYERS, fn);
    }

    /**
     * Koniec gry
     * @static
     * @param {Function} fn 
     * @memberof Network
     */
    public static onEndGame(fn: Function) {
        Network.socket.on(Network.END_GAME, fn);
    }

    /**
     * Ponowne uruchomienie rozgrywki
     * @static
     * @param {Function} fn 
     * @memberof Network
     */
    public static onPlayAgain(fn: Function) {
        Network.socket.on(Network.PLAY_AGAIN, fn);
    }
}