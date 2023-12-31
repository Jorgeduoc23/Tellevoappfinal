import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FireService } from 'src/app/services/fire.service';


declare var google;

@Component({
  selector: 'app-carrera',
  templateUrl: './carrera.page.html',
  styleUrls: ['./carrera.page.scss'],
})
export class CarreraPage implements OnInit {
  usuarios: any[] = [];
  user: any;
  viaje: any;
  id_viaje: any;
  vehiculo: any;
  ubicacionActual:  any;
  ubicacionInicio = { lat: 0, lng: 0};
  ubicacionFin = { lat: 0, lng: 0};
  KEY_VIAJES = 'viajes';
  viajes: any[] = [];

  //Variables mapa
  mapa: any;
  marker: any;
  search: any;
  search2: any;
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  direccion1: string;
  direccion2: string;


  constructor(private router: Router,
              private fireService: FireService,
              private alertController: AlertController) 
                {
                  this.user = this.router.getCurrentNavigation().extras.state.usuario;
                  this.viaje = this.router.getCurrentNavigation().extras.state.viaje;
                  this.id_viaje = this.router.getCurrentNavigation().extras.state.id_viaje;
                }


  async ngOnInit() {
    console.log(this.viaje);
    this.ubicacionInicio.lat = this.viaje.origen.lat;
    this.ubicacionInicio.lng = this.viaje.origen.lng;
    this.ubicacionFin.lat = this.viaje.destino.lat;
    this.ubicacionFin.lng = this.viaje.destino.lng;
    await this.dibujarMapa();
    //console.log(this.viaje.origen);
    console.log(this.user);
    console.log(this.ubicacionInicio);
    console.log(this.ubicacionFin);
    await this.calcularRuta();

    //this.viaje = this.viajes.find(dato => dato.rut == this.user.rut && dato.estado == true);
    console.log('Valor this.viaje: '+this.viaje);
    if (this.viaje != undefined) {
    
    }

    this.cargarDatos();
    //this.viaje = await this.storage.getViaje(this.KEY_VIAJES, this.user.correo);
    console.log(this.viajes);

    //this.viaje = [];
    //this.viaje.push(this.viajes.push(dato => dato.rut == this.user.rut));
    //console.log('This.user.rut: '+this.user.rut);
    //console.log('This.viajes.rut: '+this.viajes);
    //this.viaje = this.viajes.find(dato => dato.rut == this.user.rut && dato.estado == true);


  };

  async terminarViaje(){
    await this.presentAlert();
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¡Atención!',
      message: '¿Seguro que quieres terminar el viaje?',
      buttons: [{
        text: 'Sí, estoy seguro',
        handler: () => {
          this.cargarDatos();
          this.viaje.estado = false;
          if (this.viaje.pasajeros != undefined) {
            if (this.viaje.pasajeros.rut == undefined ) {
            for(let viaje2 of this.viaje.pasajeros){
              var users = this.usuarios.find(data => data.rut == viaje2.rut);
              users.viajeActivo = false;
              console.log(JSON.stringify(users));
              this.fireService.actualizar('usuarios', viaje2.rut, users);
            }
          }
          var users = this.viaje.pasajeros.rut;
          if (users == '' ) {
            this.user.carreraActiva = false;
            this.user.carreraActiva = false;
            this.fireService.actualizar('viajes',this.id_viaje, this.viaje)
            this.fireService.actualizar('usuarios',this.user.rut, this.user)
            this.router.navigate(['/home']);
            return;
          }
          if (users != '') {
            var users2 = this.usuarios.find(data => data.rut ==this.viaje.pasajeros.rut);
            users2.viajeActivo = false;
            this.fireService.actualizar('usuarios', users, users2);
          }
          console.log('valor rut: '+users);
          }
          this.user.carreraActiva = false;
          this.user.carreraActiva = false;
          this.fireService.actualizar('viajes',this.id_viaje, this.viaje)
          this.fireService.actualizar('usuarios',this.user.rut, this.user)
          this.router.navigate(['/home']);
        } 
      },{
        text: 'Volver'
      }],
    });

    await alert.present();

  }


  async cargarDatos(){
    this.fireService.getDatos('viajes').subscribe(
      response => {
        this.viajes = [];
        for (let usuario of response){
          this.viajes.push(usuario.payload.doc.data());
        }
      }
    );
    this.fireService.getDatos('usuarios').subscribe(
      response => {
        this.usuarios = [];
        for (let usuario of response){
          this.usuarios.push(usuario.payload.doc.data());
        }
      }
    );
  }

  async dibujarMapa(){
    var map: HTMLElement = document.getElementById('map');
    //await this.cargarDatos();
    this.mapa = new google.maps.Map(map, {
      center: this.ubicacionInicio,
      zoom: 18
    });

    this.directionsRenderer.setMap(this.mapa);
    var indicaciones: HTMLElement = document.getElementById('indicaciones');
    this.directionsRenderer.setPanel(indicaciones);

    this.marker = new google.maps.Marker({
      position: this.ubicacionInicio,
      map: this.mapa
    });

  }

  async calcularRuta(){
    console.log('Viaje.origen: '+this.viaje.origen);
    console.log('Viaje.destino: '+this.viaje.destino);
    var request = {
      origin: this.ubicacionInicio ,
      destination: this.ubicacionFin,
      travelMode: google.maps.TravelMode.DRIVING /* se traza el viaje */
    };

    await this.directionsService.route(request, (respuesta, status)=> {
      this.directionsRenderer.setDirections(respuesta);
    });

    this.marker.setPosition(null);

  }
  //mi ubicacion actual:
  async getUbicacionActual(): Promise<any>{
    return await new Promise(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    );
  }
}
