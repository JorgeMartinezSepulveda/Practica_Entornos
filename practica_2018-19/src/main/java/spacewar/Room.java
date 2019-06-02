package spacewar;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class Room {

	private AtomicInteger numeroJugadores;
	
	private String nombre;
	
	private int maximoJugadores;
	
	private ArrayBlockingQueue<Integer> jugadores;
	
	private int tipo;

	public Room(String no,int tip) {
			this.nombre=no;
			this.numeroJugadores=new AtomicInteger(0);
			this.tipo=tip;
			switch(tipo) {
			case 0:
				this.maximoJugadores=2;
				break;
			case 1:
				this.maximoJugadores=20;
				break;
			default:
				System.out.println("Error");
				break;
			}
			this.jugadores=new ArrayBlockingQueue<Integer>(this.maximoJugadores);

	}
	
	public boolean esLlena() {
		return this.numeroJugadores.compareAndSet(this.maximoJugadores, this.maximoJugadores);
	}

	public ArrayBlockingQueue<Integer> getJugadores() {
		return jugadores;
	}

	public String getNombre() {
		return nombre;
	}

	public void addPlayer(Player j) {
		this.jugadores.add(j.getPlayerId());
		this.numeroJugadores.getAndIncrement();
	}
	
	public void removePlayer(Player j) {
		this.jugadores.remove(j.getPlayerId());
		this.numeroJugadores.getAndDecrement();
	}
	
	public String getNumeroJugadores() {
		return this.numeroJugadores.toString();
	}
	
}
