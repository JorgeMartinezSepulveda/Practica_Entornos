Spacewar.preloadState = function(game) {

}

Spacewar.preloadState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PRELOAD** state");
		}
	},

	preload : function() {
		game.load.atlas('spacewar', 'assets/atlas/spacewar.png',
				'assets/atlas/spacewar.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		game.load.atlas('explosion', 'assets/atlas/explosion.png',
				'assets/atlas/explosion.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		
		this.load.spritesheet('Boton1', 'assets/images/Boto1.png',1148,371);
		this.load.spritesheet('Boton1_2', 'assets/images/Boto1_2.png',1148,371);
		this.load.spritesheet('Boton2', 'assets/images/Boto2.png',661,661);
		this.load.spritesheet('Boton_Sala', 'assets/images/boton_crearsala.png',1148,228);
		
		this.load.image('Panel_Salas', 'assets/images/Panel_Salas.png');
		this.load.image('Panel_Sala', 'assets/images/Panel_Sala.png');
		this.load.image('Panel_Sala_Escogida', 'assets/images/Panel_Sala_Escogida.png');
		this.load.image('Panel_usuarios', 'assets/images/Panel_Usuarios.png');
		this.load.image('Panel_leadership', 'assets/images/Panel_leadership.png');
		//Panel_leadership
	},

	create : function() {
		game.state.start('menuState') 
	},

	update : function() {

	}
}