// If we need to use custom DOM library, let's save it to $$ variable'

var $$ = Dom7;

var mostrarErrores =1;

var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'My App',
    // App id
    id: 'com.myapp.test',
    // Enable swipe panel
    panel: {
      swipe: 'left',
      swipe: false,
      rezisable:true,
      backdrop: true
    },
    // Add default routes
    routes: [
      {
        path: '/about/',
        url: 'about.html',
      },
      {
        path: '/registro/',
        url: 'pagRegistro.html',
      }
    ]
    // ... other parameters
  });

var mainView = app.views.create('.view-main');


var elMail, laPass, auth, userName, userLastName, userBirth, loginError=0, lat, lon;
var errorCode    
var errorMessage

/*VAR LOCAL STORAGE*/
var storage = window.localStorage;
var user = { "email": "", "clave": "" };
var userLocal, passLocal;
/*FIN VAR LOCAL STORAGE*/

/*VAR BASE DE DATOS*/
var db 
var refusers 
/*FIN VAR BASE DE DATOS */


// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

  consultarLocalStorage();

  console.log("ready") 

  $$("#ingresar").on("click",fnIngreso);

  
});

// Option 1. Using one 'page:init' handler for all pages
$$(document).on('page:init', function (e) {
    // Do something here when page loaded and initialized
    fnMostrarError(e);
    db = firebase.firestore();
    refUsuarios = db.collection("USUARIOS");
    auth = firebase.auth();
})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="about"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized

      fnCrearMapa()

      fnTraerDatos()

})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="pagRegistro"]', function (e) {
  // Do something here when page with data-name="pagRegistro" attribute loaded and initialized

  $$("#registraUsuario").on("click",fnRegistro)
  
})


function fnIngreso(){

  loginError=0;
  elMail=$$("#ingresoMail").val();
  laPass=$$("#ingresoPass").val();
  console.log(userName)
  console.log(userLastName)
  console.log(userBirth)

  auth.signInWithEmailAndPassword(elMail, laPass).catch(function(error) {  
      loginError=1;
      console.log(loginError)
      errorCode = error.code;
      errorMessage = error.message;
      alert(errorMessage)
  }).then(function(){
    if(loginError==0){
      //ingreso por localStorage
      user = { email: elMail, clave: laPass };
      var usuarioAGuardar = JSON.stringify(user);
      storage.setItem("usuario", usuarioAGuardar);
      // console.log("usuarioAGuardar: " + usuarioAGuardar);
      // console.log("usuario: " + user.email + "password: " + user.clave); 
      mainView.router.navigate("/about/");
    }
  })
  fnMostrarError(errorCode)
  fnMostrarError(errorMessage)
  
}

function fnTraerDatos(){

  refUsuarios.doc(elMail).get().then(function(doc){
    if(doc.exists){
        userName=doc.data().nombre
        userLastName=doc.data().apellido
        userBirth=doc.data().fnac
    }else
      {
      console.log("No Such Document!")
      }
  }).catch(function(error)
    {
    console.log("Error getting document:", error)
    })   
 
  $$("#nomPanel").html(userName)
  $$("#apePanel").html(userLastName)
  $$("#mailPanel").html(elMail)
  $$("#fnacPanel").html(userBirth)


  console.log("Este es el userName: "+userName)
  console.log("Este es el apellido: "+userLastName)
  console.log("Este es la fecha de nacimiento: "+userBirth)

  $$("#userName").html(userName)
  $$("#apellido").html(userLastName)
  $$("#fnacimiento").html(userBirth)

}

function fnCrearMapa(){

  fnGeolocalizacion()

  // Initialize the platform object:
  var platform = new H.service.Platform({
    'apikey': 'uW83Ibh5o_c-r3d91_AmnFpkF-KuFmPXfJNCaquYsVk'
  });

  // Obtain the default map types from the platform object
  var maptypes = platform.createDefaultLayers();

  // Instantiate (and display) a map object:
  var map = new H.Map(
    document.getElementById('mapContainer'),
    maptypes.vector.normal.map,
    {
      zoom: 10,
      center: { lat: lat , lng: lon }
    });
    var ui = H.ui.UI.createDefault(map, maptypes, "es-ES");
    var mapEvents = new H.mapevents.MapEvents(map) 
    var behavior = new H.mapevents.Behavior(mapEvents);
}

function fnGeolocalizacion(){

  var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
  if ( app ) {
    // PhoneGap application

    var onSuccess = function(position) {
      alert('Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n');
          };
          // onError Callback receives a PositionError object
          //
          function onError(error) {
              alert('code: '    + error.code    + '\n' +
                    'message: ' + error.message + '\n');
          }
       navigator.geolocation.getCurrentPosition(onSuccess, onError);
      
      } 
      else {
           // Web page
           lat = "-32.95";
           lon = "-60.64";
           console.log("LAT BROWSER: "+lat+" LON BROWSER: "+lon);
       }  
      
 }


function fnRegistro(){

  db = firebase.firestore();
  refUsuarios = db.collection("USUARIOS");

   userName=$$("#registroName").val();
   userLastName=$$("#registroApellido").val();
   elMail=$$("#registroMail").val();
   laPass=$$("#registroPass").val();
   userBirth=$$("#registroBirth").val();
   
   var data = {
    nombre: userName,
    apellido: userLastName,
    fnac: userBirth,
   }
   refUsuarios.doc(elMail).set(data);
    
    auth.createUserWithEmailAndPassword(elMail, laPass).catch(function(error) {
      errorCode = error.code;
      errorMessage = error.message;
   });
 }

 function consultarLocalStorage(){
        
  var usuarioGuardado = storage.getItem("usuario");
  // usuarioGuardado = JSON.parse(usuarioGuardado);
  // convertimos el string en JSON

      if (usuarioGuardado == null){ 
          mainView.router.navigate("/registro/");
          console.log("no hay datos en el local");
          } 
          else {
                usuarioGuardado = JSON.parse(usuarioGuardado);
                console.log(" usuarioguardado.email: " + usuarioGuardado.email);
                console.log(" usuarioguardado.clave: " + usuarioGuardado.clave);
                //pasar los datos del json a dos variables independientes
                usuarioLocal = usuarioGuardado.email;
                passLocal = usuarioGuardado.clave;
                console.log("usuariolocal + passLocal: " + usuarioLocal + passLocal)
                //si la variable tiene datos llamamos a una funcion de login pasandole las variables como parametros
                  if ( usuarioGuardado != null){
                      LoguearseConLocal(usuarioLocal, passLocal);
                    }
              }
}

function LoguearseConLocal(u,c ){
       console.log("loguearseconlocal, u+c"+u+c)
       
  //Se declara la variable loginError (bandera)
  var loginError = 0;     
  firebase.auth().signInWithEmailAndPassword(u, c)
      .catch(function(error){
          //Si hubo algun error, ponemos un valor referenciable en la variable loginError
          loginError = 1;
          var errorCode = error.code;
          var errorMessage = error.message;
          console.error(errorMessage);
          console.log(errorCode);
      })
      .then(function(){   
          //En caso de que esté correcto el inicio de sesión y no haya errores, se dirige a la siguiente página
          if(loginError == 0){
            $$("#ingresoMail").val(u)
            $$("#ingresoPass").val(c)
            fnIngreso();
            console.log("te logueaste");
          }
      }); 

};



function fnMostrarError(txt){
  if(mostrarErrores==1){
      console.log("ERROR: "+txt);
  }

}