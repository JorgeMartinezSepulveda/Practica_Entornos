Spacewar.menuState = function(game) {
	this.letras_titulo 
	this.letras_InicioSesion
	this.numStars = 100 // Should be canvas size dependant
	this.enterKey
	this.nameP
	
	this.ranking1 = "none"
	this.ranking2 = "none"
	this.ranking3 = "none"
	this.ranking4 = "none"
	this.ranking5 = "none"
	this.ranking6 = "none"
	this.ranking7 = "none"
	this.ranking8 = "none"
	this.ranking9 = "none"
	this.ranking10 = "none"
	
}

Spacewar.menuState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MENU** state");
		}
	},

	preload : function() {
		
		for (var i = 0; i < this.numStars; i++) {
			let sprite = game.add.sprite(game.world.randomX,
					game.world.randomY, 'spacewar', 'staralpha.png');
			let random = game.rnd.realInRange(0, 0.6);
			sprite.scale.setTo(random, random)
		}
		
		// In case JOIN message from server failed, we force it
		if (typeof game.global.myPlayer.id == 'undefined') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Forcing joining server...");
			}
			let message = {
				event : 'JOIN'
			}
			game.global.socket.send(JSON.stringify(message))
		}
		
		let message = {
				event : 'PLAYERS RECORD'
			}
			game.global.socket.send(JSON.stringify(message))
	},

	create : function() {
		document.getElementById('nameFolder').style.display = 'block';
		document.getElementById('message').style.display = 'block';
		document.getElementById('chat').style.display = 'block';
		
		this.letras_titulo = game.add.text(95, 70,'SPACEWAR!',{font: "bold 55px Arial", fill: 'white'});
		this.letras_titulo.setShadow(10, 10, 'rgba(54, 178, 226,0.5)', 10);
		
		this.letras_InicioSesion = game.add.text(150, 420,'Introduzca un nombre',{font: "bold 20px Arial", fill: 'white'});
		this.letras_InicioSesion.setShadow(3, 3, 'rgba(54, 178, 226,0.8)', 2);
		
		this.button = this.game.add.button(100, 160, 'Boton1', this.actionOnClick1, this,1,0);
		this.button.width = 320;
		this.button.height = 100;
		
		this.button_1 = this.game.add.button(100, 285, 'Boton1_2', this.actionOnClick3, this,1,0);
		this.button_1.width = 320;
		this.button_1.height = 100;
		
		this.button1 = this.game.add.button(317, 453, 'Boton2', this.actionOnClick2, this,1,0);
		this.button1.width = 45;
		this.button1.height = 45;
		
		this.panel = this.game.add.sprite(500, 60, 'Panel_leadership');
		this.panel.width = 420
		this.panel.height = 220
		
		this.letras_ranking1 = game.add.text(560, 125,'1. ' + this.ranking1,{font: "17px Arial", fill: 'white'});
		this.letras_ranking2 = game.add.text(560, 155,'2. ' + this.ranking2,{font: "17px Arial", fill: 'white'});
		this.letras_ranking3 = game.add.text(560, 185,'3. ' + this.ranking3,{font: "17px Arial", fill: 'white'});
		this.letras_ranking4 = game.add.text(560, 215,'4. ' + this.ranking4,{font: "17px Arial", fill: 'white'});
		this.letras_ranking5 = game.add.text(560, 245,'5. ' + this.ranking5,{font: "17px Arial", fill: 'white'});
		this.letras_ranking6 = game.add.text(750, 125,' 6. ' + this.ranking6,{font: "17px Arial", fill: 'white'});
		this.letras_ranking7 = game.add.text(750, 155,' 7. ' + this.ranking7,{font: "17px Arial", fill: 'white'})
		this.letras_ranking8 = game.add.text(750, 185,' 8. ' + this.ranking8,{font: "17px Arial", fill: 'white'})
		this.letras_ranking9 = game.add.text(750, 215,' 9. ' + this.ranking9,{font: "17px Arial", fill: 'white'})
		this.letras_ranking10 = game.add.text(750, 245,'10. ' + this.ranking10,{font: "17px Arial", fill: 'white'})
		
		this.enterKey =  game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.ENTER ]);
		
		this.letras_ranking1.setText('1. ' + game.global.playerRanking[7])
	},
	
	actionOnClick1: function () 
	{
		if(game.global.myPlayer.name !== undefined){
			document.getElementById('nameFolder').style.transform = 'translate(50%,-960%)'
			document.getElementById("nameFolder").disabled = false;
			document.getElementById("nameFolder").placeholder = 'Nombre de sala';
			document.getElementById("nameFolder").style.backgroundColor = "#aadef3";
			$('#nameFolder').val("");
			
			document.getElementById('message').style.transform = 'translate(10%,-340%)'
			document.getElementById('message').style.width = '430px'
				
			document.getElementById('chat').style.transform = 'translate(10%,-215%)'
			document.getElementById('chat').rows = 12
			document.getElementById('chat').cols = 54
			
			this.game.state.start('lobby_1vs1State');
		}
	},
	
	actionOnClick3: function () 
	{
		if(game.global.myPlayer.name !== undefined){
			document.getElementById('nameFolder').style.display = 'none';
			document.getElementById('message').style.display = 'none';
			document.getElementById('chat').style.display = 'none';
			this.game.state.start('lobby_battleRState');
		}
	},
	
	actionOnClick2: function () 
	{
		var input = $('#nameFolder');
		game.global.myPlayer.name = input.val();
		
		
		if((game.global.myPlayer.name !== '')&&(game.global.myPlayer.name.length < 10)){
			let message = {
					event : 'PLAYER NAME',
					name : game.global.myPlayer.name
			}
			game.global.socket.send(JSON.stringify(message))
			
			document.getElementById("nameFolder").disabled = true;
			document.getElementById("nameFolder").style.backgroundColor = "grey";
		}
		
	},
	  
	update : function() {
		//if (typeof game.global.myPlayer.id !== 'undefined') {
		//	game.state.start('lobbyState')
		//}
		var offset = moveToXY(game.input.activePointer, this.letras_titulo.x, this.letras_titulo.y, 8);

		this.letras_titulo.setShadow(offset.x, offset.y, 'rgba(54, 178, 226,0.5)', distanceToPointer(this.letras_titulo, game.input.activePointer) / 30);
		
		if (this.enterKey.justDown) {
			var input2 = $('#message');
			messageP = input2.val();
			
			if(game.global.myPlayer.name !== undefined)
			{
				if((messageP !== ' ')&&(messageP !== ''))
				{
					let message = {
							event : 'PLAYER MSG',
							msg: messageP
						}
					game.global.socket.send(JSON.stringify(message))
					
					$('#message').val("");
					var textarea = document.getElementById('chat');
					var today = new Date();
					$('#chat').val($('#chat').val() + "\n" + "[" +  today.getHours() + ":" + today.getMinutes() + "] " + game.global.myPlayer.name + ": " + messageP);
					textarea.scrollTop = textarea.scrollHeight;
				}
			}
			else{
				$('#message').val("");
				var textarea = document.getElementById('chat');
				$('#chat').val($('#chat').val() + "\n" + "/* Introduzca un nombre de usuario */" );
				textarea.scrollTop = textarea.scrollHeight;
			}
		}
	}
	
}

function distanceToPointer(displayObject, pointer) {

    this._dx = displayObject.x - pointer.x;
    this._dy = displayObject.y - pointer.y;
    
    return Math.sqrt(this._dx * this._dx + this._dy * this._dy);

}

function moveToXY(displayObject, x, y, speed) {

    var _angle = Math.atan2(y - displayObject.y, x - displayObject.x);
    
    var x = Math.cos(_angle) * speed;
    var y = Math.sin(_angle) * speed;

    return { x: x, y: y };

}