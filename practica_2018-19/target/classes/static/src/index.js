window.onload = function() {

	game = new Phaser.Game(1024, 600, Phaser.AUTO, 'gameDiv')

	// GLOBAL VARIABLES
	game.global = {
		FPS : 30,
		DEBUG_MODE : false,
		socket : null,
		myPlayer : new Object(),
		otherPlayers : [],
		projectiles : [],
		playerRanking : [],
		pointRanking : [],
		onevsoneRoom : [],
		battleRoom : [],
		pagRooms : 0,
		nameP : undefined,
		refreshRank : false,
		refreshRooms : false,
		numRooms: 0,
		enemiesLeft:0,
		paused:false,
	}

	// WEBSOCKET CONFIGURATOR
	game.global.socket = new WebSocket("ws://192.168.0.13:8090/spacewar")

	game.global.socket.onopen = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection opened.')
		}
	}

	game.global.socket.onclose = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection closed.')
		}
	}

	game.global.socket.onmessage = (message) => {
		var msg = JSON.parse(message.data)

		switch (msg.event) {
		case 'JOIN':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] JOIN message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.id = msg.id
			game.global.myPlayer.shipType = msg.shipType
			game.global.myPlayer.room=undefined;
			game.global.myPlayer.inMatch=false;
			game.global.myPlayer.end=false;
			game.global.myPlayer.forcedEnd=false;
			console.log('[DEBUG] ID assigned to player: ' + game.global.myPlayer.id)
			let msg2=new Object();
			msg2.event='JOINED'
			game.global.socket.send(JSON.stringify(msg2))
			
			break
		case 'OTHER PLAYERS':
			for(var player of msg.players){
				if((game.global.myPlayer.id!=player.id)&&(game.global.otherPlayers[player.id]==undefined)){
					game.global.otherPlayers[player.id]=new Object()
					game.global.otherPlayers[player.id].id=player.id
					game.global.otherPlayers[player.id].nombre=player.nombre
				}
			}
			break
		case 'JOIN ROOM':
			if (msg.respuesta=="jugador ha entrado"){
				game.global.myPlayer.room=msg.roomName
				console.log(msg.roomName);

				let msg2 = new Object()
				msg2.event = 'CHECK ROOM'
					msg2.room=msg.roomName
					game.global.socket.send(JSON.stringify(msg2))
			}
			else{
				console.log("error")
			}
			break
		case 'BEGIN MATCH':
			console.log("begin match")
			for (var player of msg.players){
				console.log("other player")
				if(game.global.myPlayer.room==player.room){
					game.global.myPlayer.vida=player.vida;
					game.global.myPlayer.fuel=player.fuel;
					game.global.myPlayer.dead=false;
					game.global.myPlayer.ammo=player.ammo;
					game.global.myPlayer.inMatch=true;
					let msg2=new Object();
					msg2.event="UPDATE PLAYER STATE";
					msg2.status="Playing";
					game.global.socket.send(JSON.stringify(msg2));
				}
				if(game.global.otherPlayers[player.id]!=undefined){
					game.global.otherPlayers[player.id].vida=player.vida;
					game.global.otherPlayers[player.id].fuel=player.fuel;
					game.global.otherPlayers[player.id].room=player.room;
					game.global.otherPlayers[player.id].dead=false;
				}

			}
			break;

		case 'FORCE END MATCH':
			console.log("end match")
			if (msg.room==game.global.myPlayer.room){
				game.global.myPlayer.forcedEnd=true;
			}
			if(game.global.otherPlayers[msg.id]!=undefined){
				if(game.global.otherPlayers[msg.id].image!=undefined){
					game.global.otherPlayers[msg.id].image.destroy()
					delete game.global.otherPlayers[msg.id]
				}
				else{
					delete game.global.otherPlayers[msg.id]
				}
			}
			break;
		case 'NEW ROOM' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] NEW ROOM message recieved')
				console.dir(msg)
			}
			if (msg.respuesta=="Sala creada"){
				game.global.myPlayer.room = msg.room
				console.log("Creaste la sala: " + game.global.myPlayer.room)
			}
			else{
				console.log("ay el error")
			}
			break
		case 'ROOMS':
			if(msg.numSalas=="0"){
				//vaciame las salas
			}
			else{
				if(msg.numSalas != game.global.numRooms){
					game.global.numRooms = msg.numSalas;
					game.global.refreshRooms = true
				}

				for (var sala of msg.salas) 
				{
					var igual = false
					var i = 0

					if(sala.tipo == "2"){
						while((!igual)&&(i<game.global.onevsoneRoom.length))
						{
							igual = (game.global.onevsoneRoom[i].nombre == sala.nombre)
							i++
						}

						if(!igual)
						{
							game.global.onevsoneRoom[i] = sala
						}
					}
					else if(sala.tipo == "20")
					{
						while((!igual)&&(i<game.global.battleRoom.length))
						{
							igual = (game.global.battleRoom[i].nombre == sala.nombre)
							i++
						}

						if(!igual)
						{
							game.global.battleRoom[i] = sala
						}
					}
				}

				for(var sala of msg.salas)
				{
					if(sala.nombre == game.global.myPlayer.room)
					{
						if(sala.jugadores == "2")
						{
							game.global.beginGame = true
						}
					}
				}
			}
			break
		case 'PLAYER MSG' :
			var textarea = document.getElementById('chat');
			var today = new Date();
			$('#chat').val($('#chat').val() + "\n" + "[" +  today.getHours() + ":" + today.getMinutes() + "] " + msg.name + ": " + msg.msg);
			textarea.scrollTop = textarea.scrollHeight;
			break
		case 'PLAYERS RECORD' :
			var i = 0
			for (var player of msg.players) 
			{
				game.global.playerRanking[i] = player.name;
				game.global.pointRanking[i] = player.record;
				i++;
			}

			game.global.refreshRank = true
			break
		case 'GAME STATE UPDATE' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] GAME STATE UPDATE message recieved')
				console.dir(msg)
			}
			if (typeof game.global.myPlayer.image !== 'undefined') {
				for (var player of msg.players) {
					if((game.global.myPlayer.room==player.room)&&(player.room!="")){
						if (game.global.myPlayer.id == player.id) {		
							game.global.myPlayer.image.x = player.posX
							game.global.myPlayer.image.y = player.posY
							game.global.myPlayer.image.angle = player.facingAngle
							game.global.myPlayer.fuel=player.fuel
							game.global.myPlayer.vida=player.vida
							game.global.myPlayer.ammo=player.ammo
							//console.log("i am "+game.global.myPlayer.id);
							//console.log("and i should be"+player.id);
							//console.log("my ammo is "+game.global.myPlayer.ammo);
							//console.log("and it should be"+player.ammo)
						} else {
							if (typeof game.global.otherPlayers[player.id].image == 'undefined') {
								game.global.otherPlayers[player.id] = {
										image : game.add.sprite(player.posX, player.posY, 'spacewar', player.shipType)
								}
								game.global.otherPlayers[player.id].image.anchor.setTo(0.5, 0.5)
							} else if(game.global.otherPlayers[player.id]!=undefined) {
								game.global.otherPlayers[player.id].image.x = player.posX
								game.global.otherPlayers[player.id].image.y = player.posY
								game.global.otherPlayers[player.id].image.angle = player.facingAngle
								game.global.otherPlayers[player.id].vida=player.vida;
								game.global.otherPlayers[player.id].room=player.room;
								game.global.otherPlayers[player.id].nombre=player.nombre;
							}
						}
					}
				}

				for (var projectile of msg.projectiles) {
					if((game.global.myPlayer.room==projectile.ownerRoom)&&(player.room!="")){
						if (projectile.isAlive) {
							game.global.projectiles[projectile.id].image.x = projectile.posX
							game.global.projectiles[projectile.id].image.y = projectile.posY
							if (game.global.projectiles[projectile.id].image.visible === false) {
								game.global.projectiles[projectile.id].image.angle = projectile.facingAngle
								game.global.projectiles[projectile.id].image.visible = true
							}
						} else {
							if (projectile.isHit) {

								console.log("Colision")

								// we load explosion
								let explosion = game.add.sprite(projectile.posX, projectile.posY, 'explosion')
								explosion.animations.add('explosion')
								explosion.anchor.setTo(0.5, 0.5)
								explosion.scale.setTo(2, 2)
								explosion.animations.play('explosion', 15, false, true)

								/*
							if(game.global.otherPlayers[player.id] !== undefined)
							{
								console.log("lol")
								game.global.otherPlayers[player.id].image.destroy()
							}
							else{
								game.global.myPlayer.image.destroy()
							}*/

							}
							game.global.projectiles[projectile.id].image.visible = false
						}
					}
				}
				for (var hit of msg.hits){
					if(game.global.myPlayer.id == hit.id){
						game.global.myPlayer.vida=hit.vida;
					}
					else if(game.global.otherPlayers[hit.id]!==undefined){
						game.global.otherPlayers[hit.id].vida=hit.vida;
					}
					if(game.global.myPlayer.id==hit.hitBy){
						game.global.myPlayer.puntuacion=hit.point;
					}
					else if(game.global.otherPlayers[hit.hitBy]!==undefined){
						game.global.otherPlayers[hit.hitBy].puntuacion=hit.point;
					}
				}
			}
			break
		case 'HOST LEFT':
			console.log("HOST LEFT THE SESSION");
			break;
		case 'REMOVE PLAYER' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] REMOVE PLAYER message recieved')
				console.dir(msg.players)
			}
			if(game.global.otherPlayers[msg.id]!=undefined){
				delete game.global.otherPlayers[msg.id]
			}
		default :
			console.dir(msg)
			break
		}
	}

	// PHASER SCENE CONFIGURATOR
	game.state.add('bootState', Spacewar.bootState)
	game.state.add('preloadState', Spacewar.preloadState)
	game.state.add('menuState', Spacewar.menuState)
	game.state.add('lobby_1vs1State', Spacewar.lobby_1vs1State)
	game.state.add('lobby_battleRState', Spacewar.lobby_battleRState)
	game.state.add('matchmakingState', Spacewar.matchmakingState)
	game.state.add('roomState', Spacewar.roomState)
	game.state.add('gameState', Spacewar.gameState)

	game.state.start('bootState')

}