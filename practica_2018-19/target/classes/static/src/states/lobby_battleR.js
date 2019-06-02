Spacewar.lobby_battleRState = function(game) {
	this.numStars = 100 
}

Spacewar.lobby_battleRState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **LOBBY** state");
		}
	},

	preload : function() {
		for (var i = 0; i < this.numStars; i++) {
			let sprite = game.add.sprite(game.world.randomX,
					game.world.randomY, 'spacewar', 'staralpha.png');
			let random = game.rnd.realInRange(0, 0.6);
			sprite.scale.setTo(random, random)
		}
	},

	create : function() {
		console.log("Lobby de Battle Royale")
		document.getElementById('nameFolder').style.display = 'none';
		//game.state.start('matchmakingState')
	},

	update : function() {

	}
}