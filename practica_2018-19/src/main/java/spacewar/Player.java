package spacewar;

import java.util.Random;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

public class Player extends Spaceship {

	private final WebSocketSession session;
	private final int playerId;
	private final String shipType;
	private String name;
	public AtomicInteger vida=new AtomicInteger(SpacewarGame.vidaValue);
	private AtomicInteger puntuacion=new AtomicInteger();
	private Semaphore isHit=new Semaphore(1);
	private String room;
	private String status;

	public Player(int playerId, WebSocketSession session) {
		this.playerId = playerId;
		this.session = session;
		this.shipType = this.getRandomShipType();
		this.name = null;
		this.status="Not Playing";
	}
	

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getPlayerId() {
		return this.playerId;
	}

	public WebSocketSession getSession() {
		return this.session;
	}

	public void sendMessage(String msg) throws Exception {
		this.session.sendMessage(new TextMessage(msg));
	}

	public String getShipType() {
		return shipType;
	}

	private String getRandomShipType() {
		String[] randomShips = { "blue", "darkgrey", "green", "metalic", "orange", "purple", "red" };
		String ship = (randomShips[new Random().nextInt(randomShips.length)]);
		ship += "_0" + (new Random().nextInt(5) + 1) + ".png";
		return ship;
	}
	
	public void hit(Player p) {
		try {
			isHit.acquire();
			if(this.vida.get()>=20) {
				p.puntuacion.getAndAdd(1);
				this.vida.addAndGet(-20);
			}
			else{
				p.puntuacion.getAndAdd(20);
				this.vida.set(0);
			}
		} catch (InterruptedException e) {
			e.printStackTrace();
		}finally {
			isHit.release();
		}
	}
	public void setPuntuacion(String puntuaciones) {
		 int i=Integer.parseInt(puntuaciones);
		 this.puntuacion.getAndAdd(i);
	 }
	public void setPuntuacion(int i) {
		this.puntuacion.getAndAdd(i);
		
	}

	public int getPuntuacion() {
		// TODO Auto-generated method stub
		return this.puntuacion.get();
	}


	public int getVida() {
		// TODO Auto-generated method stub
		return this.vida.get();
	}


	public String getRoom() {
		return room;
	}


	public void setRoom(String room) {
		this.room = room;
	}


	public String getStatus() {
		return status;
	}


	public void setStatus(String status) {
		this.status = status;
	}
	
	public void resetPlayer() {
		this.setRoom("");
		this.setVida(SpacewarGame.vidaValue);
		this.setFuel(SpacewarGame.fuelValue);
		this.setStatus("Not Playing");
	}


	private void setVida(int i) {
		this.vida.set(i);
	}



		
}
