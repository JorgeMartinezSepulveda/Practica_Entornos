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
		numRooms: 0
	}

	// WEBSOCKET CONFIGURATOR
	game.global.socket = new WebSocket("ws://192.168.0.18:8090/spacewar")
	
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
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] ID assigned to player: ' + game.global.myPlayer.id)
			}
			break
		case 'NEW ROOM' :
            if (game.global.DEBUG_MODE) {
                console.log('[DEBUG] NEW ROOM message recieved')
                console.dir(msg)
            }
            if (msg.respuesta=="Sala creada"){
                console.log("SUCCESS");
            }
            else{
                console.log("error")
            }
            game.global.myPlayer.room = {
                    name : msg.room
            }
            break
		case 'ROOMS':
            if(msg.numSalas=="0"){
                console.log("aun no hay salas")
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
					if (game.global.myPlayer.id == player.id) {
						game.global.myPlayer.image.x = player.posX
						game.global.myPlayer.image.y = player.posY
						game.global.myPlayer.image.angle = player.facingAngle
					} else {
						if (typeof game.global.otherPlayers[player.id] == 'undefined') {
							game.global.otherPlayers[player.id] = {
									image : game.add.sprite(player.posX, player.posY, 'spacewar', player.shipType)
							}
							game.global.otherPlayers[player.id].image.anchor.setTo(0.5, 0.5)
						} else {
							game.global.otherPlayers[player.id].image.x = player.posX
							game.global.otherPlayers[player.id].image.y = player.posY
							game.global.otherPlayers[player.id].image.angle = player.facingAngle
						}
					}
				}
				
				for (var projectile of msg.projectiles) {
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
			break
		case 'REMOVE PLAYER' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] REMOVE PLAYER message recieved')
				console.dir(msg.players)
			}
			game.global.otherPlayers[msg.id].image.destroy()
			delete game.global.otherPlayers[msg.id]
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