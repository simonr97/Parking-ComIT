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
      },
      {
        path: '/regGaraje/',
        url: 'pagRegistroGaraje.html',
      },
    ]
    // ... other parameters
  });

var mainView = app.views.create('.view-main');


var elMail, laPass, auth, userName, userLastName, userBirth, loginError=0,
    gName,gTel,gPrice,gOpenTime,gCloseTime,gDesc,gDisabled,gBike,gStreet,gAddress,gCity,
lat=0, lon=0,
gLat=0, gLon=0,
bdLat=0,bdLon=0;
var errorCode    
var errorMessage
var garages
var garageDiscapacitados
var garageMotos
var garageData
var restGarageData




/*VAR LOCAL STORAGE*/
var storage = window.localStorage;
var user = { "email": "", "clave": ""};
var userLocal, passLocal;
/*FIN VAR LOCAL STORAGE*/

/*VAR BASE DE DATOS*/
var db 
var refusers 
/*FIN VAR BASE DE DATOS */


// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

  checkLocalSotorage();

  $$("#ingresar").on("click",fnLogin);

});

// Option 1. Using one 'page:init' handler for all pages
$$(document).on('page:init', function (e) {
    // Do something here when page loaded and initialized
    
    // fnShowError(e);
    db = firebase.firestore();
    refUsuarios = db.collection("USUARIOS");
    refGarage = db.collection("GARAGES");
    auth = firebase.auth();
})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="about"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
      
      fnGetUserData()

      fnCreateMap()
      $$("#nomPanel").html(userName)
      $$("#apePanel").html(userLastName)
      $$("#mailPanel").html(elMail)
      $$("#fnacPanel").html(userBirth)


      $$("#nomGarage").html(gName)
      $$("#descGarage").html(gDesc)
      $$("#telGarage").html(gTel)
      $$("#precioGarage").html(gPrice)
      $$("#horaApertura").html(gOpenTime)
      $$("#horaCierre").html(gCloseTime)
});



// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="pagRegistro"]', function (e) {
  // Do something here when page with data-name="pagRegistro" attribute loaded and initialized
  fnGeolocalizacion()
  $$("#registraUsuario").on("click",fnRegister)
  
})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="regGaraje"]', function (e) {
  // Do something here when page with data-name="regGaraje" attribute loaded and initialized
  db = firebase.firestore();
  refGarage = db.collection("GARAGES");

  
   
   $$(".hiddenStart").hide();
   

   $$("#verificarDatos").on("click", function(){
   gName=$$("#garageName").val();

   gStreet=$$("#garageStreet").val()
   gAddress=$$("#garageAddress").val()
   gCity=$$("#garageCity").val()
   gDisabled=$$("#disabledGarage").val()
   gBike=$$("#bikesGarage").val()

    var dire = gStreet+" "+gAddress+" "+gCity
    
      url = "https://geocoder.ls.hereapi.com/6.2/geocode.json";
      app.request.json(url,{
       searchtext: dire,
       apikey: "uW83Ibh5o_c-r3d91_AmnFpkF-KuFmPXfJNCaquYsVk",
       gen: "9"
       },
       function(data){
        bdLat = data.Response.View[0].Result[0].Location.DisplayPosition.Latitude
        bdLon = data.Response.View[0].Result[0].Location.DisplayPosition.Longitude
        garageData={
          latitud: bdLat,
          longitud: bdLon,
          nomGarage: gName,
          calleGarage: gStreet,
          alturaGarage: gAddress,
          ciudadGarage: gCity
        }
        if(bdLat!=0 && bdLon !=0){
          console.log(bdLat+" "+bdLon)
          $$("#verificarDatos").hide()
          $$(".hiddenStart").show();
        }
       }, function (xhr, status) {
         console.log("Error geocode: " + status);
         alert("Verifique la Direccion e intente denuevo")
       }) 

       
    })
    $$('#disabledGarage').change(function(){
        if ($$(this).is( ":checked" )) {
          $$(this).val("true")
        } else{
          $$(this).val("false")
        }
        console.log($$(this).val())
      })
      
      $$('#bikesGarage').change(function (){
        if ($$(this).is( ":checked" )) {
          $$(this).val("true")
        } else{
          $$(this).val("false")
        }
        console.log($$(this).val())
      })

      

      

  $$("#registraGarage").on("click",fnRegisterGarage)
})

//Funcion para el Logeo de Usuario con Email y Contraseña
function fnLogin(){

  loginError=0;
  elMail=$$("#ingresoMail").val();
  laPass=$$("#ingresoPass").val();
  console.log(userName)
  console.log(userLastName)
  console.log(userBirth) 
  
  fnGetUserData()

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
      mainView.router.navigate("/about/");
    }
  })
  fnShowError(errorCode)
  fnShowError(errorMessage)
  
  console.log("Este es el userName: "+userName)
  console.log("Este es el apellido: "+userLastName)
  console.log("Este es la fecha de nacimiento: "+userBirth)

}

//Funcion para conseguir los datos desde la base de datos desde los datos del ususario hasta los datos del garage
//Ademas sirve para mostrar o no la informacion en caso de tener un garage registrado

function fnGetUserData(){

  refUsuarios.doc(elMail).get().then(function(doc){
    if(doc.exists){
        userName=doc.data().nombre
        userLastName=doc.data().apellido
        userBirth=doc.data().fnac
        lat=doc.data().latitud
        lon=doc.data().longitud
    }else{
      console.log("No Such Document!")
      }
  }).catch(function(error){
    console.log("Error getting document:", error)
    })   
  
    refGarage.doc(elMail).get().then(function(doc){
      if(doc.exists){
          $$("#espacioGarage").show()
          gName=doc.data().nomGarage
          gOpenTime=doc.data().horaAperturaGarage
          gCloseTime=doc.data().horaCierreGarage
          gTel=doc.data().telGarage
          gPrice=doc.data().precioGarage
          gCity=doc.data().ciudadGarage
          gAddress=doc.data().alturaGarage
          gStreet=doc.data().calleGarage
          
          $$("#registrarGarageButton").hide()
          $$("#nomGarage").show()
          $$("#descGarage").show()
          $$("#telGarage").show()
          $$("#precioGarage").show()
          if(gCloseTime=="24 Horas" && gOpenTime=="24 Horas"){
            $$("#divHoraApertura").show()
            $$("#divHoraCierre").hide()
          }else{
            $$("#divHoraApertura").show()
            $$("#divHoraCierre").show()
          }
          $$("#motoGarage").show()
          $$("#accesoDiscapacitados").show()
          dire=gStreet+" "+gAddress+" "+gCity
      }else{
          console.log("no traji los datos del garage")
          $$("#nomGarage").hide()
          $$("#divTelGarage").hide()
          $$("#divPrecioGarage").hide()
          $$("#divHoraApertura").hide()
          $$("#divHoraCierre").hide()
          $$("#divMotoGarage").hide()
          $$("#espacioGarage").hide()
          $$("#divAccesoDiscapacitados").hide()
        console.log("No Such Document!")
        }
    }).catch(function(error){
      console.log("Error getting document:", error)
      })     

  console.log("Este es el userName: "+userName)
  console.log("Este es el apellido: "+userLastName)
  // console.log("Este es la fecha de nacimiento: "+userBirth) 
}

//Funcion para conseguir la Latitud y Longitud de la persona
function fnGeolocalizacion(){
  // console.log(lat)
  // console.log(lon) 
   if(lat==0||lon==0){
     console.log("entro")
     var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
     if ( app ){
         // PhoneGap application
         var onSuccess = function(position){
               lat=position.coords.latitude;
               lon=position.coords.longitude;
              };
             // onError Callback receives a PositionError object
             function onError(error){
                 alert('code: '    + error.code    + '\n' +
                       'message: ' + error.message + '\n');
             }
         navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }
     } 
      //   else{
      //   lat = "-32.954552"
      //    lon= "-60.643696"
      //  }
 }  


//Funcion que crea el mapa y ubica un marcador en la posicion conseguida de la Geolocalizacion
function fnCreateMap(){ 

  fnGarages()
  console.log("ejecuto mapa")

  // fnGeolocalizacion()

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
      zoom: 15,
      center: { lat: lat , lng: lon }
    });
    var ui = H.ui.UI.createDefault(map, maptypes, "es-ES");
    var mapEvents = new H.mapevents.MapEvents(map) 
    var behavior = new H.mapevents.Behavior(mapEvents);

    var svgMarkup = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIyNCIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTEwMjguNCkiPjxwYXRoIGQ9Im0xMiAwYy00LjQxODMgMi4zNjg1ZS0xNSAtOCAzLjU4MTctOCA4IDAgMS40MjEgMC4zODE2IDIuNzUgMS4wMzEyIDMuOTA2IDAuMTA3OSAwLjE5MiAwLjIyMSAwLjM4MSAwLjM0MzggMC41NjNsNi42MjUgMTEuNTMxIDYuNjI1LTExLjUzMWMwLjEwMi0wLjE1MSAwLjE5LTAuMzExIDAuMjgxLTAuNDY5bDAuMDYzLTAuMDk0YzAuNjQ5LTEuMTU2IDEuMDMxLTIuNDg1IDEuMDMxLTMuOTA2IDAtNC40MTgzLTMuNTgyLTgtOC04em0wIDRjMi4yMDkgMCA0IDEuNzkwOSA0IDQgMCAyLjIwOS0xLjc5MSA0LTQgNC0yLjIwOTEgMC00LTEuNzkxLTQtNCAwLTIuMjA5MSAxLjc5MDktNCA0LTR6IiBmaWxsPSIjZTc0YzNjIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDEwMjguNCkiLz48cGF0aCBkPSJtMTIgM2MtMi43NjE0IDAtNSAyLjIzODYtNSA1IDAgMi43NjEgMi4yMzg2IDUgNSA1IDIuNzYxIDAgNS0yLjIzOSA1LTUgMC0yLjc2MTQtMi4yMzktNS01LTV6bTAgMmMxLjY1NyAwIDMgMS4zNDMxIDMgM3MtMS4zNDMgMy0zIDMtMy0xLjM0MzEtMy0zIDEuMzQzLTMgMy0zeiIgZmlsbD0iI2MwMzkyYiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxMDI4LjQpIi8+PC9nPjwvc3ZnPg==';

    // Create an icon, an object holding the latitude and longitude, and a marker:
    var icon = new H.map.Icon(svgMarkup),
        coords = {lat: lat, lng: lon},
        marker = new H.map.Marker(coords, {icon: icon});
    // Add the marker to the map and center the map at the location of the marker:
      map.addObject(marker);
      map.setCenter(coords);
      addInfoBubble(map, ui)
}


function fnGarages(){

  garages = new H.map.Group();

  console.log("entro a lo del forEach")
  refGarage.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        //doc.data() is never undefined for query doc snapshots
         console.log(doc.id, " => ", doc.data());
           nombre = doc.data().nomGarage
           calle=doc.data().calleGarage
           altura=doc.data().alturaGarage
           ciudad=doc.data().ciudadGarage
           gLat=doc.data().latitud
           gLon=doc.data().longitud 
          addMarkerToGroup(garages,{lat: gLat, lng:gLon}, nombre+" "+calle+" "+altura+" "+ciudad) 
    });
});

}

function addMarkerToGroup(g, coordinate, html) {
  var marker = new H.map.Marker(coordinate);
  // add custom data to the marker
  g.addObject(marker);
  marker.setData(html);
}

 function addInfoBubble(map, ui) {
    map.addObject(garages);
    // add 'tap' event listener, that opens info bubble, to the group
    garages.addEventListener('tap', function (evt) {
      // event target is the marker itself, group is a parent event target
      // for all objects that it contains
      var bubble =  new H.ui.InfoBubble(evt.target.getGeometry(), {
        // read custom data
        content: evt.target.getData()
      });
      // show info bubble
      ui.addBubble(bubble);
    }, false);
 }

//Funcion de Registro del Usuario y Guardado de sus datos en la base de datos con Clave principal siendo su Email
function fnRegister(){
  fnGeolocalizacion()
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
    
    auth.createUserWithEmailAndPassword(elMail, laPass).catch(function(error){
      errorCode = error.code;
      errorMessage = error.message;
   });
 }

 //Funcion de Registro de Garage y Guardado de sus datos en la base de datos con Clave principal siendo su Email 
 function fnRegisterGarage(){
  db = firebase.firestore();
  refGarage = db.collection("GARAGES");
  console.log(gTel)

      gTel=$$("#garageNumber").val();
      gPrice=$$("#hourChargeGarage").val();
      gOpenTime=$$("#openTimeGarage").val();
      gCloseTime=$$("#closeTimeGarage").val();
      gDisabled=$$("#disabledGarage").val();
      gBike=$$("#bikesGarage").val()
    
       if(gOpenTime =="" && gCloseTime==""){
         gCloseTime="24 Horas"
         gOpenTime="24 Horas"
       }

  garageData.telGarage = gTel
  garageData.precioGarage = gPrice
  garageData.horaAperturaGarage = gOpenTime
  garageData.horaCierreGarage = gCloseTime
  garageData.garageDiscapacitados = gDisabled
  garageData.garageMotos = gBike


  console.log(garageData)
   
  refGarage.doc(elMail).set(garageData);
   
 }

//Funcion para Chekear el estado de localStorage si tiene datos lo mand a logearse
//Si no manda directamente a la pantalla de Registro
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

//Funcion para el logeo en caso de que haya datos guardados en el localStorage
function LoguearseConLocal(u,c ){
       console.log("loguearseconlocal, "+u+c)
       
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

//Funcion para mostrar los datos mas claramente
function fnShowError(txt){
  if(mostrarErrores==1){
      console.log("ERROR: "+txt);
  }

}