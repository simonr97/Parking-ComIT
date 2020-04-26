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
    // panel: {
    //   swipe: 'left',
    //   swipe: false,
    //   rezisable:true,
    //   backdrop: true
    // },
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


var elMail, laPass, auth, userName, userLastName, userBirth, loginError=0, 
lat=" ", lon=" ";
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

  checkLocalSotorage();

  console.log("ready") 

  $$("#ingresar").on("click",fnLogin);

  
});

// Option 1. Using one 'page:init' handler for all pages
$$(document).on('page:init', function (e) {
    // Do something here when page loaded and initialized
    
    fnShowError(e);
    db = firebase.firestore();
    refUsuarios = db.collection("USUARIOS");
    auth = firebase.auth();
})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="about"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized

      fnCreateMap()

      fnGetUserData()

})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="pagRegistro"]', function (e) {
  // Do something here when page with data-name="pagRegistro" attribute loaded and initialized
  fnGeolocalizacion()
  $$("#registraUsuario").on("click",fnRegister)
  
})


function fnLogin(){

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
  fnShowError(errorCode)
  fnShowError(errorMessage)
  
}

function fnGetUserData(){

  refUsuarios.doc(elMail).get().then(function(doc){
    if(doc.exists){
        userName=doc.data().nombre
        userLastName=doc.data().apellido
        userBirth=doc.data().fnac
        lat=doc.data().latitud
        lon=doc.data().longitud
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

  lat=Number.toString(lat)
  lon=Number.toString(lon)

  console.log("Este es el userName: "+userName)
  console.log("Este es el apellido: "+userLastName)
  console.log("Este es la fecha de nacimiento: "+userBirth)

  $$("#userName").html(userName)
  $$("#apellido").html(userLastName)
  $$("#fnacimiento").html(userBirth)

}

function fnGeolocalizacion(){

  if(lat==""||lon==" "){
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
  if ( app ) {
    // PhoneGap application
    console.log("Geolocalizacion  ")
    var onSuccess = function(position) {

            lat=position.coords.latitude;
            lon=position.coords.longitude;

            alert("latitud: "+lat+" Longitud: "+lon)
          };
          // onError Callback receives a PositionError object
          //
          function onError(error) {
              alert('code: '    + error.code    + '\n' +
                    'message: ' + error.message + '\n');
          }
       navigator.geolocation.getCurrentPosition(onSuccess, onError);
      
      } 
       else{
            // Web page
            lat = "-32.955204";
            lon = "-60.62875";
        }  
  }else{
    alert("latitud: "+lat+" Longitud: "+lon)
  }

  
      
 }

function fnCreateMap(){

  fnGeolocalizacion()

  // Initialize the platform object:
  var platform = new H.service.Platform({
    'apikey': 'uW83Ibh5o_c-r3d91_AmnFpkF-KuFmPXfJNCaquYsVk'
  });
  // Get an instance of the geocoding service:
  var service = platform.getSearchService();
  service.reverseGeocode({
    at: lat+","+lon,
  },(result) => {
     // Add a marker for each location found
     result.items.forEach((item) => {
       map.addObject(new H.map.Marker(item.position));
     });

  }, alert);
  
  // Obtain the default map types from the platform object
  var maptypes = platform.createDefaultLayers();

  // Instantiate (and display) a map object:
  var map = new H.Map(
    document.getElementById('mapContainer'),
    maptypes.vector.normal.map,
    {
      zoom: 15,
      center: { lat: lat , lng: lon }
    });
    var ui = H.ui.UI.createDefault(map, maptypes, "es-ES");
    var mapEvents = new H.mapevents.MapEvents(map) 
    var behavior = new H.mapevents.Behavior(mapEvents);

  //    //Geodecodificador de Direcciones
  //   url = 'https://geocoder.ls.hereapi.com/6.2/geocode.json';
  //   app.request.json(url, {
  //   searchtext: 'Cordoba 3201, rosario, santa fe',
  //   apiKey: 'uW83Ibh5o_c-r3d91_AmnFpkF-KuFmPXfJNCaquYsVk',
  //   gen: '9'
  // }, function (data) {
  //    // hacer algo con data
  //    console.log("geo:" + data);
  //   // POSICION GEOCODIFICADA de la direccion
  //   latitud = data.Response.View[0].Result[0].Location.DisplayPosition.Latitude;
  //   longitud = data.Response.View[0].Result[0].Location.DisplayPosition.Longitude;
  //   console.log(latitud)
  //   console.log(longitud)
  //   //alert(latitud + " / " + longitud);
  //       coordsG = {lat: latitud, lng: longitud},
  //       markerG = new H.map.Marker(coordsG);
  //       map.addObject(markerG);
  //   //     alert(JSON.stringify(data));
  //   }, function(xhr, status) { console.log("error geo: "+status); }   );

}

function fnRegister(){
  db = firebase.firestore();
  refUsuarios = db.collection("USUARIOS");

   userName=$$("#registroName").val();
   userLastName=$$("#registroApellido").val();
   elMail=$$("#registroMail").val();
   laPass=$$("#registroPass").val();
   userBirth=$$("#registroBirth").val();
   latitude=lat;
   longitude=lon;
   
   var data = {
    nombre: userName,
    apellido: userLastName,
    fnac: userBirth,
    latitud:latitude,
    longitud:longitude,
   }
   refUsuarios.doc(elMail).set(data);
    
    auth.createUserWithEmailAndPassword(elMail, laPass).catch(function(error) {
      errorCode = error.code;
      errorMessage = error.message;
   });
 }

 function checkLocalSotorage(){
        
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
            fnLogin();
            console.log("te logueaste");
          }
      }); 

};



function fnShowError(txt){
  if(mostrarErrores==1){
      console.log("ERROR: "+txt);
  }

}