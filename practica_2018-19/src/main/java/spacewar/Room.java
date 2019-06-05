package spacewar;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;

public class Room {

	private AtomicInteger numeroJugadores;
	
	private String nombre;
	
	private int maximoJugadores;
	
	private ArrayBlockingQueue<String> jugadores;
	
	private int tipo;

	private Semaphore sem=new Semaphore(1);
	
	private Semaphore numToString=new Semaphore(1);
	
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
			this.jugadores=new ArrayBlockingQueue<String>(this.maximoJugadores);

	}
	
	public int getMaximoJugadores() {
		return maximoJugadores;
	}

	public void setMaximoJugadores(int maximoJugadores) {
		this.maximoJugadores = maximoJugadores;
	}

	public boolean esLlena() {
		return this.numeroJugadores.compareAndSet(this.maximoJugadores, this.maximoJugadores);
	}

	public ArrayBlockingQueue<String> getJugadores() {
		return jugadores;
	}

	public String getNombre() {
		return nombre;
	}

	public boolean addPlayer(Player j) throws InterruptedException{
			sem.acquire();
			if(!esLlena()) {
				this.jugadores.add(j.getSession().getId());
				this.numeroJugadores.getAndIncrement();
				sem.release();
				return true;
			}
			else {
				sem.release();
				return false;
			}
			
	}
	
	public boolean removePlayer(Player j)throws InterruptedException{
			sem.acquire();
			if(!numeroJugadores.compareAndSet(0,0)) {
				this.jugadores.remove(j.getSession().getId());
				this.numeroJugadores.getAndDecrement();
				sem.release();
				return true;
			}
			else {
				sem.release();
				return false;
			}
	}
	
	public synchronized String getNumeroJugadores(){
		return this.numeroJugadores.toString();
	}
	
}
