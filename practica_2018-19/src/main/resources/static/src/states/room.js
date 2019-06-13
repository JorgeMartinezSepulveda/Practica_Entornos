Spacewar.roomState = function(game) {

}

Spacewar.roomState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **ROOM** state");
		}
	},

	preload : function() {
		console.log("waiting");
	},

	create : function() {
		
	},

	update : function() {
		game.state.start('gameState')
	}
}