Spacewar.gameState = function(game) {
	this.bulletTime
	this.fireBullet
	this.numStars = 100 // Should be canvas size dependant
	this.maxProjectiles = 100 // 8 per player
}

Spacewar.gameState.prototype = {

		init : function() {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Entering **GAME** state");
			}

		},

		preload : function() {
			// We create a procedural starfield background
			for (var i = 0; i < this.numStars; i++) {
				let sprite = game.add.sprite(game.world.randomX,
						game.world.randomY, 'spacewar', 'staralpha.png');
				let random = game.rnd.realInRange(0, 0.6);
				sprite.scale.setTo(random, random)
			}

			// We preload the bullets pool
			game.global.proyectiles = new Array(this.maxProjectiles)
			for (var i = 0; i < this.maxProjectiles; i++) {
				game.global.projectiles[i] = {
						image : game.add.sprite(0, 0, 'spacewar', 'projectile.png')
				}
				game.global.projectiles[i].image.anchor.setTo(0.5, 0.5)
				game.global.projectiles[i].image.visible = false
			}

			// we load a random ship
			let random = [ 'blue', 'darkgrey', 'green', 'metalic', 'orange',
				'purple', 'red' ]
			let randomImage = random[Math.floor(Math.random() * random.length)]
			+ '_0' + (Math.floor(Math.random() * 6) + 1) + '.png'
			game.global.myPlayer.image = game.add.sprite(0, 0, 'spacewar',
					game.global.myPlayer.shipType)
					game.global.myPlayer.image.anchor.setTo(0.5, 0.5)
		},

		create : function() {

			document.getElementById("nameFolder").style.display = "none";
			document.getElementById("message").style.display="none";
			document.getElementById("chat").style.display="none";
			this.bulletTime = 0
			this.fireBullet = function() {
				if (game.time.now > this.bulletTime) {
					this.bulletTime = game.time.now + 250;
					// this.weapon.fire()
					return true
				} else {
					return false
				}
			}

			this.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
			this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
			this.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
			this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
			this.escKey=game.input.keyboard.addKey(Phaser.Keyboard.ESC);
			this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

			// Stop the following keys from propagating up to the browser
			game.input.keyboard.addKeyCapture([ Phaser.Keyboard.W,
				Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D,
				Phaser.Keyboard.SPACEBAR ]);

			game.camera.follow(game.global.myPlayer.image);



		},

		update : function() {
			for(var i=0;i<game.global.otherPlayers.length;i++){
				if((game.global.otherPlayers[i]!=undefined)&&(game.global.otherPlayers[i].room==game.global.myPlayer.room)){
					if(game.global.otherPlayers[i].ready==true){
						game.global.allReady=true
					}
					else{
						game.global.allReady=false
					}

					console.log("this player is"+game.global.otherPlayers[i].ready)
				}
				console.log("i am "+game.global.allReady)
				if(game.global.allReady){
					if(game.global.myPlayer.forcedEnd){
						//si no estamos muertos es que el rival abandona, lo que nos da la victoria
						if(!game.global.myPlayer.dead){
							let msg=new Object();
							msg.event="END MATCH";
							msg.result="WON";
							game.global.socket.send(JSON.stringify(msg))
							game.global.myPlayer.room=undefined;
							//te echan de la sala al segundo y medio
							setTimeout(function(){
								this.game.state.start('lobby_1vs1State');
							},1500);
							console.log("xWINx")
						}
					}
					else{
						if((game.global.myPlayer.vida==0)&&(!game.global.myPlayer.dead)){
							game.global.myPlayer.dead=true;	
							//cargamos la explosion
							let explosion = game.add.sprite(game.global.myPlayer.image.x, game.global.myPlayer.image.y, 'explosion')
							explosion.animations.add('explosion')
							explosion.anchor.setTo(0.5, 0.5)
							explosion.scale.setTo(2, 2)
							explosion.animations.play('explosion', 15, false, true)
							game.global.myPlayer.image.visible=false;

							//mandamos que hemos perdido al servidor
							let msg=new Object();
							msg.event="END MATCH";
							msg.result="LOST";
							game.global.socket.send(JSON.stringify(msg))
							game.global.myPlayer.room=undefined;
							//te echan de la sala al segundo y medio
							setTimeout(function(){
								this.game.state.start('lobby_1vs1State');
							},1500);
							console.log("killed")
						}

						//comprobamos los enemigos
					
						for(var i=0;i<game.global.otherPlayers.length;i++){
							//si el jugador rival existe y es de mi sala comprobamos su vida
							if((game.global.otherPlayers[i]!=undefined)&&(game.global.otherPlayers[i].room==game.global.myPlayer.room)){

								//contamos cuantos rivales vivos hay
								if(game.global.otherPlayers[i].dead==false){
						
									game.global.enemiesLeft+=1
									
								}
								//cargamos la animacion de morir
								if((game.global.otherPlayers[i].vida==0)&&(game.global.otherPlayers[i].dead==false)){
									game.global.enemiesLeft-=1
									console.log("lolo"+game.global.enemiesLeft)
									game.global.otherPlayers[i].dead=true;
									let explosion = game.add.sprite(game.global.otherPlayers[i].image.x, game.global.otherPlayers[i].image.y, 'explosion')
									explosion.animations.add('explosion')
									explosion.anchor.setTo(0.5, 0.5)
									explosion.scale.setTo(2, 2)
									explosion.animations.play('explosion', 15, false, true)
									game.global.otherPlayers[i].image.visible=false;
								}
							}
						}
						//si no quedan enemigos, notificamos al servidor de que hemos ganado
						if(game.global.enemiesLeft==0){
							if(!game.global.won){
								game.global.won=true
								let msg=new Object();
								msg.event="END MATCH";
								msg.result="WON";
								game.global.socket.send(JSON.stringify(msg))
								game.global.myPlayer.room=undefined;
								//te echan de la sala al segundo y medio
								setTimeout(function(){
									this.game.state.start('lobby_1vs1State');
								},3000);
								console.log("WIN")
							}	
						}

						let msg = new Object()
						msg.event = 'UPDATE MOVEMENT'

							msg.movement = {
							thrust : false,
							brake : false,
							rotLeft : false,
							rotRight : false
						}

						msg.bullet = false
						//parar el juego para el cliente, damos medio segundo de espera
						if(this.escKey.isDown){
							setTimeout(function(){
								game.global.paused=!game.global.paused
							},500)
						}

						//HACER EL EVENTO DE IRSE, SOLO ES TIRAR UN END MATCH CON LOSE, IGUAL QUE EL RESTO

						//si no estamos parados tenemos control de la nave
						if(!game.global.paused){
							if((game.global.myPlayer.fuel>0)&&(game.global.myPlayer.vida>0)){
								if (this.wKey.isDown)
									msg.movement.thrust = true;
								if (this.sKey.isDown)
									msg.movement.brake = true;
								if (this.aKey.isDown)
									msg.movement.rotLeft = true;
								if (this.dKey.isDown)
									msg.movement.rotRight = true;
								if (this.spaceKey.isDown) {
									msg.bullet = this.fireBullet()
								}
							}
							if (game.global.DEBUG_MODE) {
								console.log("[DEBUG] Sending UPDATE MOVEMENT message to server")
							}
						}
						game.global.socket.send(JSON.stringify(msg))
						
					}
				}

			}
		}
}
