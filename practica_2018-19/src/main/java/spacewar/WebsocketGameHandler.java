package spacewar;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class WebsocketGameHandler extends TextWebSocketHandler {




	private SpacewarGame game = SpacewarGame.INSTANCE;
	private static final String PLAYER_ATTRIBUTE = "PLAYER";
	private ObjectMapper mapper = new ObjectMapper();
	private AtomicInteger playerId = new AtomicInteger(0);
	private AtomicInteger projectileId = new AtomicInteger(0);
	private ReentrantLock lock=new ReentrantLock();

	private ObjectMapper json = new ObjectMapper().setVisibility(PropertyAccessor.FIELD, Visibility.ANY);

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		lock.lock();
		Player player = new Player(playerId.incrementAndGet(), session);
		System.out.println("THIS WILL BE MY EPIC ID SUCKER"+player.getPlayerId());
		session.getAttributes().put(PLAYER_ATTRIBUTE, player);
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());
		game.addPlayer(player);
		synchronized(player.getSession()) {
			player.getSession().sendMessage(new TextMessage(msg.toString()));
		}
		lock.unlock();

	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		try {
			JsonNode node = mapper.readTree(message.getPayload());
			ObjectNode msg = mapper.createObjectNode();
			Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);

			switch (node.get("event").asText()) {
			case "JOIN":
				lock.lock();
				msg.put("event", "JOIN");
				msg.put("id", player.getPlayerId());
				msg.put("shipType", player.getShipType());
				lock.unlock();
				synchronized(player.getSession()) {
					player.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				break;
			case "JOINED":
				ArrayNode arrayNodePlayersInit= mapper.createArrayNode();
				Collection <Player> players = game.getPlayers();
				for (Player participant : players) {
					ObjectNode jsonPlayer = mapper.createObjectNode();
					jsonPlayer.put("id", participant.getPlayerId());
					jsonPlayer.put("nombre", participant.getName());
					jsonPlayer.put("fuel", participant.getFuel());
					jsonPlayer.put("room",participant.getRoom());
					jsonPlayer.put("vida", participant.getVida());
					jsonPlayer.put("ammo", participant.getAmmo());
					arrayNodePlayersInit.addPOJO(jsonPlayer);
				}
				msg.put("event", "OTHER PLAYERS");
				msg.putPOJO("players", arrayNodePlayersInit);
				game.broadcast(msg.toString());
				break;
				//evento que se usa para intentar unirse a una sala
			case "JOIN ROOM":
				msg.put("event", "JOIN ROOM");
				lock.lock();
				if(game.getSalas().get(node.get("roomName").asText()).addPlayer(player)) {
					System.out.println("me uno la concha"+node.get("roomName").asText());
					msg.put("respuesta", "jugador ha entrado");
					msg.put("roomName", game.getSalas().get(node.get("roomName").asText()).getNombre());
				}
				else {
					msg.put("respuesta", "error al conectar");
				}
				lock.unlock();
				synchronized(player.getSession()) {
					player.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				break;

				//comprueba una sala cada vez que alguien se une para saber si esta llena, si es asi comienza la partida
			case "CHECK ROOM":
				lock.lock();
				if(game.getSalas().get(node.get("room").asText()).esLlena()) {
					msg.put("event","BEGIN MATCH");
					ArrayNode arrayNodePlayers= mapper.createArrayNode();
					int numJugadores = game.getSalas().get(node.get("room").asText()).getNumeroJugadores();
					System.out.println("numJogs"+numJugadores);
					String []aux=game.getSalas().get(node.get("room").asText()).getJugadores().toArray(new String[game.getSalas().get(node.get("room").asText()).getJugadores().size()]);
					for (int i = 0; i < numJugadores; i++) {
						Player p=game.getPlayer(aux[i]);
						ObjectNode jsonPlayer = mapper.createObjectNode();
						jsonPlayer.put("id", p.getPlayerId());
						jsonPlayer.put("fuel", p.getFuel());
						jsonPlayer.put("ammo", p.getAmmo());
						jsonPlayer.put("room",p.getRoom());
						jsonPlayer.put("vida", p.getVida());
						arrayNodePlayers.addPOJO(jsonPlayer);
					}
					msg.putPOJO("players", arrayNodePlayers);
					lock.unlock();
					game.broadcast(msg.toString());

				}
				break;

				//puntuaciones
			case "PLAYERS RECORD":
				ArrayNode arrayNodePlayers = mapper.createArrayNode();
				lock.lock();
				String[] nombres = getRecordNames().toArray(new String[getRecordNames().size()]);
				String[] puntuaciones =   getRecordPoints().toArray(new String[getRecordPoints().size()]);
				int[] puntuacionesAux = new int[puntuaciones.length];

				for (int i = 0; i < puntuaciones.length; i++) {
					try {
						puntuacionesAux[i] = Integer.parseInt(puntuaciones[i]);
					}catch(NumberFormatException e) {

					}
				}

				int n = puntuacionesAux.length;
				for (int i = 0; i <= n - 2; i++) {
					for (int j = n - 1; j > i; j--) {
						if (puntuacionesAux[j - 1] < puntuacionesAux[j]) {
							permuta(puntuacionesAux,puntuaciones,nombres, j - 1, j);
						}
					}
				}

				for (int j = 0; j < nombres.length; j++) {
					if(player.getName() != null) 
					{
						if(player.getName().equals(nombres[j])) 
						{
							player.setPuntuacion(puntuaciones[j]);
						}
					}

					ObjectNode jsonPlayer = mapper.createObjectNode();
					jsonPlayer.put("name", nombres[j]);
					jsonPlayer.put("record", puntuaciones[j]);
					arrayNodePlayers.addPOJO(jsonPlayer);
				}	

				msg.put("event", "PLAYERS RECORD");
				msg.putPOJO("players", arrayNodePlayers);
				lock.unlock();
				synchronized(player.getSession()) {
					player.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				break;

				//para dar nombre al jugador
			case "PLAYER NAME":
				String nombre = node.get("name").asText();
				player.setName(nombre);

				//Comprobamos que el jugador se a actualizado y ha añadido su nombre
				game.setPlayerName(player);
				register(player);
				System.out.println(game.getPlayer(player.getSession().getId()).getName());

				break;


			case "PLAYER MSG":

				String PLayer_msg = node.get("msg").asText();
				msg.put("event", "PLAYER MSG");
				msg.put("name", player.getName());
				msg.put("msg", PLayer_msg);
				sendOtherParticipants(player.getSession(), msg);

				break;


			case "UPDATE MOVEMENT":
				lock.lock();
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean());
				if (node.path("bullet").asBoolean()) {
					Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
					player.setAmmo(player.getAmmo()-1);
					game.addProjectile(projectile.getId(), projectile);
				}
				lock.unlock();
				break;

				//evento que comprueba el estado de las salas cada medio segundo, la respuesta que devuelve son las salas que hay con sus jugadores
			case "ROOMS":
				msg.put("event", "ROOMS");
				lock.lock();
				ArrayNode arrayNodeSalas= mapper.createArrayNode();
				//no concurrente
				String [] keySet=game.getSalas().keySet().toArray(new String[game.getSalas().keySet().size()]);
				int j =0;
				if (game.getNumSalas()==0) {System.out.println("no salas");}
				else {
					while(j<game.getNumSalas())
					{
						ObjectNode jsonSala = mapper.createObjectNode();
						jsonSala.put("nombre",game.getSalas().get(keySet[j]).getNombre());
						jsonSala.put("jugadores",game.getSalas().get(keySet[j]).getNumeroJugadores());
						jsonSala.put("tipo",game.getSalas().get(keySet[j]).getMaximoJugadores());

						ArrayNode arrayNodeJugd = mapper.createArrayNode();

						int numJugadores =game.getSalas().get(keySet[j]).getNumeroJugadores();
						String []aux=game.getSalas().get(keySet[j]).getJugadores().toArray(new String[game.getSalas().get(keySet[j]).getJugadores().size()]);
						for (int i = 0; i < numJugadores; i++)
						{
							Player jgd = game.getPlayer(aux[i]);
							if(jgd!=null) {
								arrayNodeJugd.add(jgd.getName());
							}
						}

						jsonSala.putPOJO("usuarios",arrayNodeJugd);

						arrayNodeSalas.addPOJO(jsonSala);
						j++;
					}
					msg.putPOJO("salas", arrayNodeSalas);
				}
				msg.put("numSalas",game.getNumSalas());
				lock.unlock();
				synchronized(player.getSession()) {
					player.getSession().sendMessage(new TextMessage(msg.toString()));	
				}
				break;

				//evento usado para crear una nueva sala
			case "NEW ROOM":
				//mandaremos una respuesta indicando si ha tenido exito o no
				msg.put("event", "NEW ROOM");
				System.out.println("recibido mensaje, sala: "+node.get("name").asText());
				if(game.createRoom(node.get("name").asText(), node.get("tipo").asInt())) {
					game.getSalas().get(node.get("name").asText()).addPlayer(player);
					msg.put("respuesta","Sala creada");
					msg.put("room", node.get("name").asText());
				}
				else {
					msg.put("respuesta","Sala ya existe");
				}
				synchronized(player.getSession()) {
					player.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				break;
				//acabar partida de manera natural!!
			case "END MATCH":
				lock.lock();
				//si hemos ganado nos damos unos puntos extra?
				if(node.get("result").asText().equals("WON")) {
					player.setPuntuacion(player.getPuntuacion()+100);
				}
				//borramos al jugador de la sala
				if(!game.getSalas().get(player.getRoom()).equals("")) {
					Room room=game.getSalas().get(player.getRoom());
					room.removePlayer(player);
					//si la sala esta vacia la borramos
					if(room.getNumeroJugadores()==0) {
						game.deleteRoom(room.getNombre());
					}
				}
				lock.unlock();
				break;

				//usamos esto para indicar que estamos jugando
			case "UPDATE PLAYER STATE":
				player.setStatus(node.get("status").asText());
				break;
			default:
				break;
			}

		} catch (Exception e) {
			System.err.println("Exception processing message " + message.getPayload());
			e.printStackTrace(System.err);
		}
	}

	private static void permuta(int[] a,String[] b,String[] c, int i, int j) {
		int t;
		String f,l;
		t = a[i];
		f = b[i];
		l = c[i];
		a[i] = a[j];
		b[i] = b[j];
		c[i] = c[j];
		a[j] = t;
		b[j] = f;
		c[j] = l;
	}

	private void sendOtherParticipants(WebSocketSession session, ObjectNode msg) throws IOException {
		Collection <Player> players = game.getPlayers();

		for (Player participant : players) {
			if (!participant.getSession().getId().equals(session.getId())) {
				participant.getSession().sendMessage(new TextMessage(msg.toString()));
			}
		}
	}

	private void register (Player player) throws IOException {

		PrintWriter pw = new PrintWriter (new FileOutputStream(new File("target/classes/data.txt"),true));

		pw.append("   " + player.getName());
		pw.print("   0");

		pw.println();

		pw.close();
	}

	public ArrayList<String> getRecordNames() throws IOException{

		BufferedReader historial = new BufferedReader(new FileReader (new File("target/classes/data.txt")));
		String line;
		ArrayList<String> nombre = new ArrayList <String>();

		while((line = historial.readLine()) != null) 
		{
			String [] splited = line.split(" ");
			nombre.add(splited[3]);
		}

		historial.close();
		return nombre;
	}

	public ArrayList<String> getRecordPoints() throws IOException{

		BufferedReader historial = new BufferedReader(new FileReader (new File("target/classes/data.txt")));
		String line;
		ArrayList<String> puntuacion = new ArrayList <String>();

		while((line = historial.readLine()) != null)
		{
			String [] splited = line.split(" ");
			puntuacion.add(splited[6]);
		}

		historial.close();
		return puntuacion;
	}

	//cuando se da un abandono
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		lock.lock();
		Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);

		//si el jugador estaba en una partida
		if(player.getStatus().equals("Playing")) {
			//si al irse se quedara un solo jugador, notificamos que la sala debe cerrarse
			if(game.getSalas().get(player.getRoom()).getNumeroJugadores()-1==1) {
				ObjectNode msg=mapper.createObjectNode();
				msg.put("event","FORCE END MATCH");
				msg.put("id", player.getPlayerId());
				msg.put("room", player.getRoom());
				game.broadcast(msg.toString());
			}
		}
		//si no estaba jugando, comprobamos si es un host, de ser asi, vaciamos la sala y borramos
		else if((game.getNumSalas()!=0)&&(!player.getRoom().equals(""))) {
			String auxRoom=player.getRoom();
			Player jgd = game.getPlayer(game.getSalas().get(player.getRoom()).getJugadores().peek());
			if(jgd.getName().equals(player.getName())) {
				String[]aux=game.getSalas().get(player.getRoom()).getJugadores().toArray(new String [game.getSalas().get(player.getRoom()).getJugadores().size()]);
				for(int i=0;i<aux.length;i++) {
					game.getSalas().get(player.getRoom()).removePlayer(game.getPlayer(aux[i]));
					//reset the room for the clients!!!!!
				}
				//notificamos al cliente de que hemos borrado su sala
				ObjectNode msg2=mapper.createObjectNode();
				msg2.put("event","HOST LEFT");
				msg2.put("room", auxRoom);
				game.deleteRoom(auxRoom);
			}
			//finalmente, borramos al jugador del registro de player
			ObjectNode msg = mapper.createObjectNode();
			msg.put("event", "REMOVE PLAYER");
			msg.put("id", player.getPlayerId());
			game.broadcast(msg.toString());
		}

		//lo borramos a nivel de servidor
		game.removePlayer(player);

		System.out.println(player.getName() + " se ha deconectado");

		lock.unlock();
	}
}
