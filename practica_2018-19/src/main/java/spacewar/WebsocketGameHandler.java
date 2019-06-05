package spacewar;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Enumeration;
import java.util.Set;
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
		Player player = new Player(playerId.incrementAndGet(), session);
		session.getAttributes().put(PLAYER_ATTRIBUTE, player);
		
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());
		player.getSession().sendMessage(new TextMessage(msg.toString()));
		
		game.addPlayer(player);
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		try {
			JsonNode node = mapper.readTree(message.getPayload());
			ObjectNode msg = mapper.createObjectNode();
			Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);

			switch (node.get("event").asText()) {
			case "JOIN":
				msg.put("event", "JOIN");
				msg.put("id", player.getPlayerId());
				msg.put("shipType", player.getShipType());
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "JOIN ROOM":
				msg.put("event", "NEW ROOM");
				msg.put("room", "GLOBAL");	
				//arreglar, necesito el nombre de la sala desde javascript
				if(game.getSalas().get("nombre de mi sala").addPlayer(player)) {
					msg.put("respuesta", "jugador ha entrado");
				}
				else {
					msg.put("respuesta", "error al conectar");
				}
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "PLAYERS RECORD":
				ArrayNode arrayNodePlayers = mapper.createArrayNode();
				lock.lock();
				String[] nombres = getRecordNames().toArray(new String[getRecordNames().size()]);
				String[] puntuaciones =   getRecordPoints().toArray(new String[getRecordPoints().size()]);
				int[] puntuacionesAux = new int[puntuaciones.length];
				
				for (int i = 0; i < puntuaciones.length; i++) {
					puntuacionesAux[i] = Integer.parseInt(puntuaciones[i]);
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
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
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
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean());
				if (node.path("bullet").asBoolean()) {
					Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
					game.addProjectile(projectile.getId(), projectile);
				}
				break;
            case "ROOMS":
				msg.put("event", "ROOMS");
				ArrayNode arrayNodeSalas= mapper.createArrayNode();
				//no concurrente
				Object [] keySet=game.getSalas().keySet().toArray();
				int j =0;
				if (game.getNumSalas().equals("0")) {System.out.println("no salas");}
				else {
					while(j<keySet.length)
					{
						ObjectNode jsonSala = mapper.createObjectNode();
						jsonSala.put("nombre",game.getSalas().get(keySet[j]).getNombre());
						jsonSala.put("jugadores",game.getSalas().get(keySet[j]).getNumeroJugadores());
						jsonSala.put("tipo",game.getSalas().get(keySet[j]).getMaximoJugadores());
						
						ArrayNode arrayNodeJugd = mapper.createArrayNode();
						
						int numJugadores = game.getSalas().get(keySet[j]).getJugadores().size();
						for (int i = 0; i < numJugadores; i++)
						{
							Player jgd = game.getPlayer(game.getSalas().get(keySet[j]).getJugadores().peek());
							arrayNodeJugd.add(jgd.getName());
						}
						
						jsonSala.putPOJO("usuarios",arrayNodeJugd);
						
						arrayNodeSalas.addPOJO(jsonSala);
						System.out.println("el nombre "+game.getSalas().get(keySet[j]).getNombre());
						j++;
					}
					msg.putPOJO("salas", arrayNodeSalas);
				}
				msg.put("numSalas",game.getNumSalas());
				player.getSession().sendMessage(new TextMessage(msg.toString()));				
				break;
            case "NEW ROOM":
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
            	player.getSession().sendMessage(new TextMessage(msg.toString()));
            	
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
	
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
		game.removePlayer(player);

		System.out.println(player.getName() + " se ha deconectado");
		
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "REMOVE PLAYER");
		msg.put("id", player.getPlayerId());
		game.broadcast(msg.toString());
	}
}
