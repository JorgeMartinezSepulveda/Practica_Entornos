Spacewar.lobby_1vs1State = function(game) {
	this.numStars = 100
	this.nombre_sala = 'Ninguna'
	this.letras_sala
	this.letras_estado
	this.nombreSala
	this.estado_jugador = 'Esperando sala'
	this.enSala = false
	
	this.button_crear
	
	this.panel_usuarios
	
	this.button1
	this.button2
	this.button3
	this.button4
	this.button5
	this.button6
	this.button7
	this.button8
	this.button9
	this.button10	
	
	this.texto_numJugadores1  = 0
	this.texto_numJugadores2  = 0
	this.texto_numJugadores3  = 0
	this.texto_numJugadores4  = 0
	this.texto_numJugadores5  = 0
	this.texto_numJugadores6  = 0
	this.texto_numJugadores7  = 0
	this.texto_numJugadores8  = 0
	this.texto_numJugadores9  = 0
	this.texto_numJugadores10 = 0
	
	this.texto_sala1  = 'Empty slot 1'
	this.texto_sala2  = 'Empty slot 2'
	this.texto_sala3  = 'Empty slot 3'
	this.texto_sala4  = 'Empty slot 4'
	this.texto_sala5  = 'Empty slot 5'
	this.texto_sala6  = 'Empty slot 6'
	this.texto_sala7  = 'Empty slot 7'
	this.texto_sala8  = 'Empty slot 8'
	this.texto_sala9  = 'Empty slot 9'
	this.texto_sala10 = 'Empty slot 10'
	
}

Spacewar.lobby_1vs1State.prototype = {

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
		
		$('#chat').val("__________________________________________________________"+ "\n" 
				+ "\n" + "/* Entra en una sala para empezar a jugar o crea una nueva e invita a tus amigos */" 
				+ "\n" + "__________________________________________________________"  + "\n")
	},

	create : function() {
		console.log("Lobby de 1 vs 1")
		
		panel = this.game.add.sprite(555, 35, 'Panel_Salas');
		panel.width = 420
		panel.height = 530
		
		this.button1 = this.game.add.button(586, 140, 'Panel_Sala', this.entrar_sala1, this,1,0);
		this.button1.width = 359
		this.button1.height = 30
		this.button1.inputEnabled = true
		this.button2 = this.game.add.button(586, 180, 'Panel_Sala', this.entrar_sala2, this,1,0);
		this.button2.width = 359
		this.button2.height = 30
		this.button2.inputEnabled = true
		this.button3 = this.game.add.button(586, 220, 'Panel_Sala', this.entrar_sala3, this,1,0);
		this.button3.width = 359
		this.button3.height = 30
		this.button3.inputEnabled = true
		this.button4 = this.game.add.button(586, 260, 'Panel_Sala', this.entrar_sala4, this,1,0);
		this.button4.width = 359
		this.button4.height = 30
		this.button4.inputEnabled = true
		this.button5 = this.game.add.button(586, 300, 'Panel_Sala', this.entrar_sala5, this,1,0);
		this.button5.width = 359
		this.button5.height = 30
		this.button5.inputEnabled = true
		this.button6 = this.game.add.button(586, 340, 'Panel_Sala', this.entrar_sala6, this,1,0);
		this.button6.width = 359
		this.button6.height = 30
		this.button6.inputEnabled = true
		this.button7 = this.game.add.button(586, 380, 'Panel_Sala', this.entrar_sala7, this,1,0);
		this.button7.width = 359
		this.button7.height = 30
		this.button7.inputEnabled = true
		this.button8 = this.game.add.button(586, 420, 'Panel_Sala', this.entrar_sala8, this,1,0);
		this.button8.width = 359
		this.button8.height = 30
		this.button8.inputEnabled = true
		this.button9 = this.game.add.button(586, 460, 'Panel_Sala', this.entrar_sala9, this,1,0);
		this.button9.width = 359
		this.button9.height = 30
		this.button9.inputEnabled = true
		this.button10 = this.game.add.button(586, 500, 'Panel_Sala', this.entrar_sala10, this,1,0);
		this.button10.width = 359
		this.button10.height = 30
		this.button10.inputEnabled = true
		
		letras_titulo1  = this.game.add.text(600, 146,this.texto_sala1,{font: " 18px Arial", fill: 'black'});
		letras_titulo2  = this.game.add.text(600, 186,this.texto_sala2,{font: " 18px Arial", fill: 'black'});
		letras_titulo3  = this.game.add.text(600, 226,this.texto_sala3,{font: " 18px Arial", fill: 'black'});
		letras_titulo4  = this.game.add.text(600, 266,this.texto_sala4,{font: " 18px Arial", fill: 'black'});
		letras_titulo5  = this.game.add.text(600, 306,this.texto_sala5,{font: " 18px Arial", fill: 'black'});
		letras_titulo6  = this.game.add.text(600, 346,this.texto_sala6,{font: " 18px Arial", fill: 'black'});
		letras_titulo7  = this.game.add.text(600, 386,this.texto_sala7,{font: " 18px Arial", fill: 'black'});
		letras_titulo8  = this.game.add.text(600, 426,this.texto_sala8,{font: " 18px Arial", fill: 'black'});
		letras_titulo9  = this.game.add.text(600, 465,this.texto_sala9,{font: " 18px Arial", fill: 'black'});
		letras_titulo10 = this.game.add.text(600, 505,this.texto_sala10,{font: " 18px Arial", fill: 'black'});
		
		panel_escogida1 = this.game.add.sprite(45, 35, 'Panel_Sala_Escogida');
		panel_escogida1.width = 460
		panel_escogida1.height = 240
		
		this.letras_sala = this.game.add.text(325, 67,this.nombre_sala,{font:"18px Arial", fill: 'white'});
		
		this.letras_estado = this.game.add.text(275, 130,this.estado_jugador,{font:"18px Arial", fill: 'white'});
		
		this.button_crear = this.game.add.button(237, 192.5, 'Boton_Sala', this.crearSala, this,1,0);
		this.button_crear.width = 260
		this.button_crear.height = 55
		
		this.panel_usuarios = this.game.add.sprite(780, 180, 'Panel_usuarios');
		this.panel_usuarios.width = 165
		this.panel_usuarios.height = 150
		this.panel_usuarios.alpha = 0
		
		this.enterKey =  game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.ENTER ]);
		//game.state.start('matchmakingState')
	},
	
	actionOnClick: function () 
	{
		this.enSala = true
		this.letras_sala.setText('Sala caracol')
		this.estado_jugador = "En sala. Entrando al juego"
		this.letras_estado.setText(this.estado_jugador)
		this.letras_estado.x = 230
		
		this.button_crear.alpha = 0.5
		
		document.getElementById("nameFolder").disabled = true;
		document.getElementById("nameFolder").style.backgroundColor = "grey";
	},
	
	crearSala: function () 
	{
		var input = $('#nameFolder');
		this.nombreSala = input.val();
		
		if((this.nombreSala !== '')&&(this.enSala == false))
		{
			game.global.myPlayer.room = this.nombreSala
			let message = {
					event : 'NEW ROOM',
					name : game.global.myPlayer.room
			}
			game.global.socket.send(JSON.stringify(message))
			
			console.log(game.global.myPlayer.room)
			
			this.estado_jugador = "En sala. Esperando jugadores"
			this.letras_estado.setText(this.estado_jugador)
			this.letras_estado.x = 220
			
			this.letras_sala.setText(this.nombreSala)
			
			this.enSala = true
			
			document.getElementById("nameFolder").disabled = true;
			document.getElementById("nameFolder").style.backgroundColor = "grey";
		}
	},

	update : function() {
		if (this.enterKey.justDown) {
			var input2 = $('#message');
			messageP = input2.val();

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
		
		if (this.button1.input.pointerOver()) 
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button1.y+40
		}
		else if(this.button2.input.pointerOver())
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button2.y+40
		}
		else if(this.button3.input.pointerOver())
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button3.y+40
		}
		else if(this.button4.input.pointerOver())
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button4.y+40
		}
		else if(this.button5.input.pointerOver())
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button5.y+40
		}
		else if(this.button6.input.pointerOver())
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button6.y+40
		}
		else if(this.button7.input.pointerOver())
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button7.y+40
		}
		else if(this.button8.input.pointerOver())
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button3.y+40
		}
		else if(this.button9.input.pointerOver())
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button4.y+40
		}
		else if(this.button10.input.pointerOver())
		{
			this.panel_usuarios.alpha = 1
			this.panel_usuarios.y = this.button5.y+40
		}
		else
		{
			this.panel_usuarios.alpha = 0
		}
	}
}