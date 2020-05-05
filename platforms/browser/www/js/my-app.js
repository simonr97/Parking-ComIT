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
        path: '/pagInfoGarages/',
        url: 'pagGarages.html',
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
var arrServer = []
var iGlobal=0
var jGlobal=0
var availSpotGarageMinesam = "false"




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

    db = firebase.firestore();
    refUsuarios = db.collection("USUARIOS");
    refGarage = db.collection("GARAGES");

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

      garages.addEventListener('tap', function (evt) {
        // event target is the marker itself, group is a parent event target
        // for all objects that it contains
        var infoData = evt.target.getData()
        infoData = infoData.toString()
        infoData = infoData.slice(0, 5)
        console.log(infoData)
        
        var largoString = arrServer.length
        for (var i=0; i<largoString; i++){
          var nom = arrServer[i].nomGarage
          var searchResult = nom.search(infoData)
          if(searchResult==0){
            iGlobal = i
            console.log(arrServer[i].nomGarage)
            console.log(arrServer[i].calleGarage)
            console.log(arrServer[i].alturaGarage)
            console.log(arrServer[i].ciudadGarage)
          }
        }
      })

      $$('#availGarage').change(function (){
        if ($$(this).is( ":checked" )) {
          $$(this).val("true")
          availSpotGarageMinesam = $$(this).val() 
          fnCreateMap()
        } else{
          $$(this).val("false")
          availSpotGarageMinesam = $$(this).val()
          fnCreateMap()
        }
        largoString = arrServer.length
        for (var j=0; j<largoString; j++){
          var nomb = arrServer[j].nomGarage
          var nomSearch = nomb.search(gName)
          if(nomSearch==0){
            jGlobal = j
          }
        }
      })



});



// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="pagRegistro"]', function (e) {
  // Do something here when page with data-name="pagRegistro" attribute loaded and initialized
  fnGeolocalizacion()
  $$("#registraUsuario").on("click",fnRegister)
  
})


// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="pagInfoGarages"]', function (e) {
  // Do something here when page with data-name="pagGarage" attribute loaded and initialized
  $$("#navbarNomGarage").html(arrServer[iGlobal].nomGarage)
  $$("#infotelGarage").html(arrServer[iGlobal].telGarage)
  $$("#infoprecioGarage").html(arrServer[iGlobal].precioGarage)
  $$("#infohoraApertura").html(arrServer[iGlobal].horaAperturaGarage)
  $$("#infohoraCierre").html(arrServer[iGlobal].horaCierreGarage)
  // $$("#infoaccesoDiscapacitados").html(arrServer[iGlobal].garageDiscapacitados)
  // $$("#infomotoGarage").html(arrServer[iGlobal].garageMotos)
  if(arrServer[iGlobal].accesoDiscapacitados == "true"){
    $$("#infoaccesoDiscapacitados").html("Provee Acceso para discapacitados")
  } else{
    $$(".infoaccesoDiscapacitados").hide()
  }

  if(arrServer[iGlobal].estacionamientoMotos == "true"){
    $$("#infomotoGarage").html("Posee Estacionamiento para Motocicletas")
  } else{
    $$(".infomotoGarage").hide()
  }
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

    db = firebase.firestore();
    refUsuarios = db.collection("USUARIOS");
    refGarage = db.collection("GARAGES");

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

  lat = -32.955204
  lon = -60.62875

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
    window.addEventListener('resize', () => map.getViewPort().resize());

    // Inicio HardCode de Marcadores para la muestra

      //Inicio Marcador Minesam
        if(availSpotGarageMinesam == "false"){
           console.log("Azul")
           var imagenMine = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAnCAYAAACIVoEIAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABWJJREFUeNrMWF1MW3UUP+396u3XbaFQLAst4cNNtlF8cRuOYZSoCSozvosPvrgHiTFxUeJKYnQmi4PEGB/Hg/GBGKu+bMliWDSZiS7SGZRFFzD4oMBKP6G9t731nEsLDNbeW1oTT3Luvfnn/s//d8/3uaZCoQD/N2IPuvHZj2+NcCwTZBnzIMuaAe/AsgxwW89zuDaL99mpYX+sWtmmajR1+sObATxsDHkUD5QQVBHMPlA7awwzjWuhi0O+pbqDOvH+9yGOYQiQ5HQI0OX3QJPbBg6bsO/d1IYMmxkFkukskHgNKGueQpCh0EBzrGZQwQuzLhQWRqFnXHYRjj3cAn6fy7B2CWAKwYEJSHMR1ObI+KnGpQODOvrOt66ib/R2+Ruh7xEfkMmqJTqDwKlqgUwcJz88/5h7rtz7Zh15s8i9gVa3BohIyeWr5lxeBYvAaj6GJCGHL92Ku6qOvsPnr0+ShlqbndB3xAeKotYc6iaTCYp28SNfQR4xbL7ON68FUc0/S3YLPHWqU3PUepIgcKUoPTsWdISNaipEl+6AR/MHWcnXFZQWkXYtaifJlLqaan/jaoAxmxadqKUnT3YYOkRRVdjM54E1m8DCsGBErx5MJwLPUuCcPXfUGtbTlGbn5kY7OmllP5IRSCQahXhOgSMeB5jNLPCQBzfHg1munGoojxGo4nnGQDVIoq7Zri4vQ2eTFWaG+8C3ZQ5YiG7CV3cTcC+lQiqeKbs3gbnL5RTpcdBISgjSxWblK4b5/L0oZFQFvngxuA1Ii9oGEV495gFBRNNwTNn9lO2L5P9kfsOlpylpKx9VNt1iMgnPdXvBwe8X0WBhoN3JwZ2UAvFkxohbBos5sXKeUnRMl8Wv9UtixXesIqcrp6qMrpelrRhl3/z+T1nB61lV01IlGdWDwi+sxId4EW6vJGHmt7/316a/UhDL5mFlLVV2P9XBXbSk51M3kM9QdIiYecuRZOKghbXA2PUFiKymof+QG3isbb+sZeBuIgdKUoFYorw/USAVKf5aj1UX1JwGKpUFxlw5DXYwNlgpyPD1nVWYXU6AyyKAk+Mgn8zB+lq64l63ZN1d9HXLDBXK1zcwudl3vqa8cMBWRqHEI0MaiI2Rr9lRegzr+tTiR8+Qpv7MY7uR3pQP1KrosddjL/Vl8QeBKpcSqFBeplJA7UY9ibqDnk7vtlWw7sWMgiIThrBWS7KcqyuwE71tu7vXScMp4Y9LT8dKGwoaY/uCaq+Vjx9ugaYGW+mYCeyllqqd+wjUKNUmikKGN2t99kGGV9JM/6N+eKhp27nj5bRkZHAYwcHhy9IcR+CokBI4o9TR1gjHu7wgYskpzYZ4fwUHhyu1jFhhFPICgcK5TwNnxmaOgKWRM9kc5NWd4k0HU9vTiE1coNWFCZgvzX0lUDdwxBqsdWwfLZYBadsRERQd7MVGUG9C3kPxcsNCNSMWzE0MxowIMkijqKVYzaCIfnp3gErBRI2AJnBkD9fUuuylH95+nCac6QMCmn7viZZQzf3Ug+i7t06Sf0WqBBS5OOQbrUuTV4EGjQJzi0x0fMD7q6LkxlVVHS7uDdT1/1SJhqZ+pD8xk5gUXy4XfT0NBTjdlAMBKwpHIxfmOAu2Njy2NnS3WCy3OY67YGgYrYae/3RuDAFc3guqm1mDDhO1yiZcY7V1BAF2mw1syA6HHRx2OzidTgTMtu/tPE21/vO8Nr/y0s35xZmozICNyUEXgrGAfN9PDdISAZCcDnC5JHC73eB02OOiaD2HOe+zumrqvukmm+1fj8U/SCVTbbKiYKIt8AzDqoLAJ1BLq8gLokWICILw+V7N/Geg6kn/CjAAiy/VLN5rAD8AAAAASUVORK5CYII="
           var marcadorMine = new H.map.Icon(imagenMine)
           var coordsMine = {lat: -32.9546207, lng: -60.6417938},
               markerMine = new H.map.Marker(coordsMine, {icon: marcadorMine});
               map.addObject(markerMine);
               markerMine.addEventListener('tap', function (evt) {
                 var bubbleMine =  new H.ui.InfoBubble(evt.target.getGeometry(), {
                   content:"Minegarage"+" "+"Mitre"+" "+"1500"+" "+"Rosario"+ 
                   "<a class='button' id='regarage' href='/pagInfoGarages/'>Ver Info</a>"
                 });
                 ui.addBubble(bubbleMine);
               }, false);
        } else{ 
          console.log("Rojo")
          var imagenMine = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAnCAYAAACIVoEIAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABONJREFUeNrMWEtsG1UUvfPGHo/rz9hpkvKr4ybioy6oi0SlFKSkEpuuiAQSWVRVikBsU1GxyCYREgJRCQXBhhXJjh0RmwghgWmVIpUFroRQYQFJCyJt8xkn/ns8j3ufx47dTsbjn8STnp8Tz7v33P+9I3HO4f+2PJ1cujkQi0scphjwhMQ5fQf8DnRKwHXGIYln8uT+v6lO6EvtaOqnoyOTyHABGU4cAKmCaQAFzDrx7w3G+cKz2c2lnoNaG4yTNpYIDDE8YpTBb1RAMU0BqnGZkiS2wXBLDAEiOIANfG7m6dy9ZE9AXR86MYOEFxGUFiiXIVwqgexSuxzBlQkkYwI8A7g8lru32BWoawgIpfzSgxoZKBRBrVQ6clyhOdysynB5NH9/piNQPw6PTuGPX5NWhvIF8CKwbha3NCd8EPjlE/kHi22B+mF4NIJSreOP2nAu3zWgJoZQD4ZzI4UHyXZSAkmhaeg/HgRNEvZyWcFBPBKuNPX9sTGMNP6XF/9PWupLcjQrGCyC+aVYceuRdMFs7izQRxAjjUvgaovwZ9VU4Ob5CquznbUDbQdqij6UigmYhRx3kcmgKz7Ier3AEs9DGZmZ1bTpeI/yl7VO3fUNxh1BoekmyZcoKfKGRGi3Cx4E5FMg9uE8vLhzB567/i2c/Ps2DM1dQdOYTYnUblcO/HSylaaE41G0tTLBnqLAyHuz8Pg7b9Yvy+EQDM69C+EL0y1pGAcmTLQCFanlFCf1l9BsJOmx6ddtHTl84Q2R9Z3MyB9SRMuUIIg5pIGa6tXjTzpGGdW9MmOHlqBD79lfcN7MknN79TtbouU7d8VZktmhNByFOawkOJmPHvCY2Jd8vAiVvf3mOre3BzsfXBU+Y7oz33or81HanyeCXtO5E/Bhcc7++hvcmjgPj02/BuGXxyF37Qbon38BoOuQ8SqOLuA5KF0px4yOKYEcfZfKwBHDgFbFpcaUnJqYeCxBimg2J0BEfxiLfLU4w+njxa1UqzKzgv98lXKV3Kf+3Y8CR4olYr6BZSbuxqdWRIQx0eD2ZVOzaK2ldloXHdFqsmmC1GMtBa3ulVULchQ1pbuKPqutcCwTnWzyuVCprqVlO0CtQKUbW7NuTUaABorFGsF0rRtxDerc/T/1xraCiQLLUVroaKsVA3v8gsjwNaGx61zvdHBIIc1TzJrtiEEZ6x536WgUvRHUDo1j1jQjIg4Hh3g3EzJNHb80MvFiOJtWlX+oBaknRUq8ftSOD8GwR4We6cXct4CE522mXzcTcm0YrWnqU5z7Zns1ISeRwUSXoG7hhJxwY3bmMr1MNUdj2ytt12F2BeqlrXXdIpruFBBqSe8pKFpnt9dTbpzULlieyW629UqItfPw+PYG1cVLbp8/OndlbSz9zyuGYbxladqVCaVO3uTdHIhNohOvoHNrto4eCABcfR/ghdPAMHUoOGTIcvX0+/3gV305RfGtMiYRWL0noGj9HI3FEcgSEphoBFXCvn3z7YtQiD0lADFMtghCgAkg2FAoCMFgEMKhEJ6BZTuXkLp953n7k88yW9+sBuRsFvTxM7B79kyzf1iaikYioGlhiEYjENE0E4Gteb2ei3btsNSrF7GZTPajnd3d89lM7gmskirhUX1qXvWr+wjqD9TW76qq3pBl+au++FS/138CDACn9PoaLOqUkAAAAABJRU5ErkJggg=="
          var marcadorMine = new H.map.Icon(imagenMine)
          var coordsMine = {lat: -32.9546207, lng: -60.6417938},
              markerMine = new H.map.Marker(coordsMine, {icon: marcadorMine});
              map.addObject(markerMine);
              markerMine.addEventListener('tap', function (evt) {
                var bubbleMine =  new H.ui.InfoBubble(evt.target.getGeometry(), {
                  content:"Minegarage"+" "+"Mitre"+" "+"1500"+" "+"Rosario"+ 
                  "<a class='button' id='regarage' href='/pagInfoGarages/'>Ver Info</a>"
                });
                ui.addBubble(bubbleMine);
              }, false);
        
        }
        // var marcadorMine = new H.map.Icon(imagenMine)
        // var coordsMine = {lat: -32.9546207, lng: -60.6417938},
        //     markerMine = new H.map.Marker(coordsMine, {icon: marcadorMine});
        //     map.addObject(markerMine);
        //     markerMine.addEventListener('tap', function (evt) {
        //       var bubbleMine =  new H.ui.InfoBubble(evt.target.getGeometry(), {
        //         content:"Minegarage"+" "+"Mitre"+" "+"1500"+" "+"Rosario"+ 
        //         "<a class='button' id='regarage' href='/pagInfoGarages/'>Ver Info</a>"
        //       });
        //       ui.addBubble(bubbleMine);
        //     }, false);
      //Fin Marcador Minesam  
      
      //Inicio Marcador Marcos Peda
      var imagenMarcos = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAnCAYAAACIVoEIAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABWJJREFUeNrMWF1MW3UUP+396u3XbaFQLAst4cNNtlF8cRuOYZSoCSozvosPvrgHiTFxUeJKYnQmi4PEGB/Hg/GBGKu+bMliWDSZiS7SGZRFFzD4oMBKP6G9t731nEsLDNbeW1oTT3Luvfnn/s//d8/3uaZCoQD/N2IPuvHZj2+NcCwTZBnzIMuaAe/AsgxwW89zuDaL99mpYX+sWtmmajR1+sObATxsDHkUD5QQVBHMPlA7awwzjWuhi0O+pbqDOvH+9yGOYQiQ5HQI0OX3QJPbBg6bsO/d1IYMmxkFkukskHgNKGueQpCh0EBzrGZQwQuzLhQWRqFnXHYRjj3cAn6fy7B2CWAKwYEJSHMR1ObI+KnGpQODOvrOt66ib/R2+Ruh7xEfkMmqJTqDwKlqgUwcJz88/5h7rtz7Zh15s8i9gVa3BohIyeWr5lxeBYvAaj6GJCGHL92Ku6qOvsPnr0+ShlqbndB3xAeKotYc6iaTCYp28SNfQR4xbL7ON68FUc0/S3YLPHWqU3PUepIgcKUoPTsWdISNaipEl+6AR/MHWcnXFZQWkXYtaifJlLqaan/jaoAxmxadqKUnT3YYOkRRVdjM54E1m8DCsGBErx5MJwLPUuCcPXfUGtbTlGbn5kY7OmllP5IRSCQahXhOgSMeB5jNLPCQBzfHg1munGoojxGo4nnGQDVIoq7Zri4vQ2eTFWaG+8C3ZQ5YiG7CV3cTcC+lQiqeKbs3gbnL5RTpcdBISgjSxWblK4b5/L0oZFQFvngxuA1Ii9oGEV495gFBRNNwTNn9lO2L5P9kfsOlpylpKx9VNt1iMgnPdXvBwe8X0WBhoN3JwZ2UAvFkxohbBos5sXKeUnRMl8Wv9UtixXesIqcrp6qMrpelrRhl3/z+T1nB61lV01IlGdWDwi+sxId4EW6vJGHmt7/316a/UhDL5mFlLVV2P9XBXbSk51M3kM9QdIiYecuRZOKghbXA2PUFiKymof+QG3isbb+sZeBuIgdKUoFYorw/USAVKf5aj1UX1JwGKpUFxlw5DXYwNlgpyPD1nVWYXU6AyyKAk+Mgn8zB+lq64l63ZN1d9HXLDBXK1zcwudl3vqa8cMBWRqHEI0MaiI2Rr9lRegzr+tTiR8+Qpv7MY7uR3pQP1KrosddjL/Vl8QeBKpcSqFBeplJA7UY9ibqDnk7vtlWw7sWMgiIThrBWS7KcqyuwE71tu7vXScMp4Y9LT8dKGwoaY/uCaq+Vjx9ugaYGW+mYCeyllqqd+wjUKNUmikKGN2t99kGGV9JM/6N+eKhp27nj5bRkZHAYwcHhy9IcR+CokBI4o9TR1gjHu7wgYskpzYZ4fwUHhyu1jFhhFPICgcK5TwNnxmaOgKWRM9kc5NWd4k0HU9vTiE1coNWFCZgvzX0lUDdwxBqsdWwfLZYBadsRERQd7MVGUG9C3kPxcsNCNSMWzE0MxowIMkijqKVYzaCIfnp3gErBRI2AJnBkD9fUuuylH95+nCac6QMCmn7viZZQzf3Ug+i7t06Sf0WqBBS5OOQbrUuTV4EGjQJzi0x0fMD7q6LkxlVVHS7uDdT1/1SJhqZ+pD8xk5gUXy4XfT0NBTjdlAMBKwpHIxfmOAu2Njy2NnS3WCy3OY67YGgYrYae/3RuDAFc3guqm1mDDhO1yiZcY7V1BAF2mw1syA6HHRx2OzidTgTMtu/tPE21/vO8Nr/y0s35xZmozICNyUEXgrGAfN9PDdISAZCcDnC5JHC73eB02OOiaD2HOe+zumrqvukmm+1fj8U/SCVTbbKiYKIt8AzDqoLAJ1BLq8gLokWICILw+V7N/Geg6kn/CjAAiy/VLN5rAD8AAAAASUVORK5CYII="
      var marcadorMarcos = new H.map.Icon(imagenMarcos)
      var coordsMarcos = {lat: -32.9626168, lng: -60.6305449},
          markerMarcos = new H.map.Marker(coordsMarcos, {icon: marcadorMarcos});
          map.addObject(markerMarcos);
          markerMarcos.addEventListener('tap', function (evt) {
            var bubbleMarcos =  new H.ui.InfoBubble(evt.target.getGeometry(), {
              content:"Marcos Garage"+" "+"Ayacucho"+" "+"2000"+" "+"Rosario"+ 
              "<a class='button' id='regarage' href='/pagInfoGarages/'>Ver Info</a>"
            });
            ui.addBubble(bubbleMarcos);
          }, false);
      //Fin Marcador Marcos Peda 

      //Inicio Marcador Riquelme
      var imagenRiquelme = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAnCAYAAACIVoEIAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABWJJREFUeNrMWF1MW3UUP+396u3XbaFQLAst4cNNtlF8cRuOYZSoCSozvosPvrgHiTFxUeJKYnQmi4PEGB/Hg/GBGKu+bMliWDSZiS7SGZRFFzD4oMBKP6G9t731nEsLDNbeW1oTT3Luvfnn/s//d8/3uaZCoQD/N2IPuvHZj2+NcCwTZBnzIMuaAe/AsgxwW89zuDaL99mpYX+sWtmmajR1+sObATxsDHkUD5QQVBHMPlA7awwzjWuhi0O+pbqDOvH+9yGOYQiQ5HQI0OX3QJPbBg6bsO/d1IYMmxkFkukskHgNKGueQpCh0EBzrGZQwQuzLhQWRqFnXHYRjj3cAn6fy7B2CWAKwYEJSHMR1ObI+KnGpQODOvrOt66ib/R2+Ruh7xEfkMmqJTqDwKlqgUwcJz88/5h7rtz7Zh15s8i9gVa3BohIyeWr5lxeBYvAaj6GJCGHL92Ku6qOvsPnr0+ShlqbndB3xAeKotYc6iaTCYp28SNfQR4xbL7ON68FUc0/S3YLPHWqU3PUepIgcKUoPTsWdISNaipEl+6AR/MHWcnXFZQWkXYtaifJlLqaan/jaoAxmxadqKUnT3YYOkRRVdjM54E1m8DCsGBErx5MJwLPUuCcPXfUGtbTlGbn5kY7OmllP5IRSCQahXhOgSMeB5jNLPCQBzfHg1munGoojxGo4nnGQDVIoq7Zri4vQ2eTFWaG+8C3ZQ5YiG7CV3cTcC+lQiqeKbs3gbnL5RTpcdBISgjSxWblK4b5/L0oZFQFvngxuA1Ii9oGEV495gFBRNNwTNn9lO2L5P9kfsOlpylpKx9VNt1iMgnPdXvBwe8X0WBhoN3JwZ2UAvFkxohbBos5sXKeUnRMl8Wv9UtixXesIqcrp6qMrpelrRhl3/z+T1nB61lV01IlGdWDwi+sxId4EW6vJGHmt7/316a/UhDL5mFlLVV2P9XBXbSk51M3kM9QdIiYecuRZOKghbXA2PUFiKymof+QG3isbb+sZeBuIgdKUoFYorw/USAVKf5aj1UX1JwGKpUFxlw5DXYwNlgpyPD1nVWYXU6AyyKAk+Mgn8zB+lq64l63ZN1d9HXLDBXK1zcwudl3vqa8cMBWRqHEI0MaiI2Rr9lRegzr+tTiR8+Qpv7MY7uR3pQP1KrosddjL/Vl8QeBKpcSqFBeplJA7UY9ibqDnk7vtlWw7sWMgiIThrBWS7KcqyuwE71tu7vXScMp4Y9LT8dKGwoaY/uCaq+Vjx9ugaYGW+mYCeyllqqd+wjUKNUmikKGN2t99kGGV9JM/6N+eKhp27nj5bRkZHAYwcHhy9IcR+CokBI4o9TR1gjHu7wgYskpzYZ4fwUHhyu1jFhhFPICgcK5TwNnxmaOgKWRM9kc5NWd4k0HU9vTiE1coNWFCZgvzX0lUDdwxBqsdWwfLZYBadsRERQd7MVGUG9C3kPxcsNCNSMWzE0MxowIMkijqKVYzaCIfnp3gErBRI2AJnBkD9fUuuylH95+nCac6QMCmn7viZZQzf3Ug+i7t06Sf0WqBBS5OOQbrUuTV4EGjQJzi0x0fMD7q6LkxlVVHS7uDdT1/1SJhqZ+pD8xk5gUXy4XfT0NBTjdlAMBKwpHIxfmOAu2Njy2NnS3WCy3OY67YGgYrYae/3RuDAFc3guqm1mDDhO1yiZcY7V1BAF2mw1syA6HHRx2OzidTgTMtu/tPE21/vO8Nr/y0s35xZmozICNyUEXgrGAfN9PDdISAZCcDnC5JHC73eB02OOiaD2HOe+zumrqvukmm+1fj8U/SCVTbbKiYKIt8AzDqoLAJ1BLq8gLokWICILw+V7N/Geg6kn/CjAAiy/VLN5rAD8AAAAASUVORK5CYII="
      var marcadorRiquelme = new H.map.Icon(imagenRiquelme)
      var coordsRiquelme = {lat: -32.954286, lng: -60.6572093},
          markerRiquelme = new H.map.Marker(coordsRiquelme, {icon: marcadorRiquelme});
          map.addObject(markerRiquelme);
          markerRiquelme.addEventListener('tap', function (evt) {
            var bubbleRiquelme =  new H.ui.InfoBubble(evt.target.getGeometry(), {
              content:"El Ultimo 10"+" "+"Av. Pellegrini"+" "+"2300"+" "+"Rosario"+ 
              "<a class='button' id='regarage' href='/pagInfoGarages/'>Ver Info</a>"
            });
            ui.addBubble(bubbleRiquelme);
          }, false);
      //Fin Marcador Riquelme 

      //Inicio Marcador Juan Perez
      var imagenJuan = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAnCAYAAACIVoEIAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABWJJREFUeNrMWF1MW3UUP+396u3XbaFQLAst4cNNtlF8cRuOYZSoCSozvosPvrgHiTFxUeJKYnQmi4PEGB/Hg/GBGKu+bMliWDSZiS7SGZRFFzD4oMBKP6G9t731nEsLDNbeW1oTT3Luvfnn/s//d8/3uaZCoQD/N2IPuvHZj2+NcCwTZBnzIMuaAe/AsgxwW89zuDaL99mpYX+sWtmmajR1+sObATxsDHkUD5QQVBHMPlA7awwzjWuhi0O+pbqDOvH+9yGOYQiQ5HQI0OX3QJPbBg6bsO/d1IYMmxkFkukskHgNKGueQpCh0EBzrGZQwQuzLhQWRqFnXHYRjj3cAn6fy7B2CWAKwYEJSHMR1ObI+KnGpQODOvrOt66ib/R2+Ruh7xEfkMmqJTqDwKlqgUwcJz88/5h7rtz7Zh15s8i9gVa3BohIyeWr5lxeBYvAaj6GJCGHL92Ku6qOvsPnr0+ShlqbndB3xAeKotYc6iaTCYp28SNfQR4xbL7ON68FUc0/S3YLPHWqU3PUepIgcKUoPTsWdISNaipEl+6AR/MHWcnXFZQWkXYtaifJlLqaan/jaoAxmxadqKUnT3YYOkRRVdjM54E1m8DCsGBErx5MJwLPUuCcPXfUGtbTlGbn5kY7OmllP5IRSCQahXhOgSMeB5jNLPCQBzfHg1munGoojxGo4nnGQDVIoq7Zri4vQ2eTFWaG+8C3ZQ5YiG7CV3cTcC+lQiqeKbs3gbnL5RTpcdBISgjSxWblK4b5/L0oZFQFvngxuA1Ii9oGEV495gFBRNNwTNn9lO2L5P9kfsOlpylpKx9VNt1iMgnPdXvBwe8X0WBhoN3JwZ2UAvFkxohbBos5sXKeUnRMl8Wv9UtixXesIqcrp6qMrpelrRhl3/z+T1nB61lV01IlGdWDwi+sxId4EW6vJGHmt7/316a/UhDL5mFlLVV2P9XBXbSk51M3kM9QdIiYecuRZOKghbXA2PUFiKymof+QG3isbb+sZeBuIgdKUoFYorw/USAVKf5aj1UX1JwGKpUFxlw5DXYwNlgpyPD1nVWYXU6AyyKAk+Mgn8zB+lq64l63ZN1d9HXLDBXK1zcwudl3vqa8cMBWRqHEI0MaiI2Rr9lRegzr+tTiR8+Qpv7MY7uR3pQP1KrosddjL/Vl8QeBKpcSqFBeplJA7UY9ibqDnk7vtlWw7sWMgiIThrBWS7KcqyuwE71tu7vXScMp4Y9LT8dKGwoaY/uCaq+Vjx9ugaYGW+mYCeyllqqd+wjUKNUmikKGN2t99kGGV9JM/6N+eKhp27nj5bRkZHAYwcHhy9IcR+CokBI4o9TR1gjHu7wgYskpzYZ4fwUHhyu1jFhhFPICgcK5TwNnxmaOgKWRM9kc5NWd4k0HU9vTiE1coNWFCZgvzX0lUDdwxBqsdWwfLZYBadsRERQd7MVGUG9C3kPxcsNCNSMWzE0MxowIMkijqKVYzaCIfnp3gErBRI2AJnBkD9fUuuylH95+nCac6QMCmn7viZZQzf3Ug+i7t06Sf0WqBBS5OOQbrUuTV4EGjQJzi0x0fMD7q6LkxlVVHS7uDdT1/1SJhqZ+pD8xk5gUXy4XfT0NBTjdlAMBKwpHIxfmOAu2Njy2NnS3WCy3OY67YGgYrYae/3RuDAFc3guqm1mDDhO1yiZcY7V1BAF2mw1syA6HHRx2OzidTgTMtu/tPE21/vO8Nr/y0s35xZmozICNyUEXgrGAfN9PDdISAZCcDnC5JHC73eB02OOiaD2HOe+zumrqvukmm+1fj8U/SCVTbbKiYKIt8AzDqoLAJ1BLq8gLokWICILw+V7N/Geg6kn/CjAAiy/VLN5rAD8AAAAASUVORK5CYII="
      var marcadorJuan = new H.map.Icon(imagenJuan)
      var coordsJuan = {lat: -32.9534232, lng: -60.6288744},
          markerJuan = new H.map.Marker(coordsJuan, {icon: marcadorJuan});
          map.addObject(markerJuan);
          markerJuan.addEventListener('tap', function (evt) {
            var bubbleJuan =  new H.ui.InfoBubble(evt.target.getGeometry(), {
              content:"Juan Garage"+" "+"Mendoza"+" "+"345"+" "+"Rosario"+ 
              "<a class='button' id='regarage' href='/pagInfoGarages/'>Ver Info</a>"
            });
            ui.addBubble(bubbleJuan);
          }, false);
      //Fin Marcador Juan Perez


    // Fin HardCode de Marcadores para la muestra


    var svgMarkup = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/'+
    'PjxzdmcgaGVpZ2h0PSIyNCIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9'+
    'yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6L'+
    'y9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLX'+
    'N5bnRheC1ucyMiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTEwMjguNCkiPjxwYXRoIGQ9Im0xMiAwYy00LjQxODMgMi4zNj'+
    'g1ZS0xNSAtOCAzLjU4MTctOCA4IDAgMS40MjEgMC4zODE2IDIuNzUgMS4wMzEyIDMuOTA2IDAuMTA3OSAwLjE5MiAwLjIyMSAwLjM4M'+
    'SAwLjM0MzggMC41NjNsNi42MjUgMTEuNTMxIDYuNjI1LTExLjUzMWMwLjEwMi0wLjE1MSAwLjE5LTAuMzExIDAuMjgxLTAuNDY5bDAuMDYz'+
    'LTAuMDk0YzAuNjQ5LTEuMTU2IDEuMDMxLTIuNDg1IDEuMDMxLTMuOTA2IDAtNC40MTgzLTMuNTgyLTgtOC04em0wIDRjMi4yMDkgMCA0IDEuNzk'+
    'wOSA0IDQgMCAyLjIwOS0xLjc5MSA0LTQgNC0yLjIwOTEgMC00LTEuNzkxLTQtNCAwLTIuMjA5MSAxLjc5MDktNCA0LTR6IiBmaWxsPSIjZTc0YzNjI'+
    'iB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDEwMjguNCkiLz48cGF0aCBkPSJtMTIgM2MtMi43NjE0IDAtNSAyLjIzODYtNSA1IDAgMi43NjEgMi4yMzg2ID'+
    'UgNSA1IDIuNzYxIDAgNS0yLjIzOSA1LTUgMC0yLjc2MTQtMi4yMzktNS01LTV6bTAgMmMxLjY1NyAwIDMgMS4zNDMxIDMgM3MtMS4zNDMgMy0zIDMtMy0xLj'+
    'M0MzEtMy0zIDEuMzQzLTMgMy0zeiIgZmlsbD0iI2MwMzkyYiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxMDI4LjQpIi8+PC9nPjwvc3ZnPg==';

    // Create an icon, an object holding the latitude and longitude, and a marker:
    var icon = new H.map.Icon(svgMarkup),
        coords = {lat: lat, lng: lon},
        marker = new H.map.Marker(coords, {icon: icon});
    // Add the marker to the map and center the map at the location of the marker:
      map.addObject(marker);
      map.setCenter(coords);
      // addInfoBubble(map, ui)
}


function fnGarages(){

  var cont = 0
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

            arrServer[cont] =doc.data()

            console.log(arrServer)
          cont ++
          addMarkerToGroup(garages,{lat: gLat, lng:gLon},nombre+" "+calle+" "+altura+" "+ciudad+ 
          "<a class='button' id='regarage' href='/pagInfoGarages/'>Aceptar</a>") 
    });
});

}

function addMarkerToGroup(g, coordinate, html) {
  var imagenMarker = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAnCAYAAACIVoEIAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABWJJREFUeNrMWF1MW3UUP+396u3XbaFQLAst4cNNtlF8cRuOYZSoCSozvosPvrgHiTFxUeJKYnQmi4PEGB/Hg/GBGKu+bMliWDSZiS7SGZRFFzD4oMBKP6G9t731nEsLDNbeW1oTT3Luvfnn/s//d8/3uaZCoQD/N2IPuvHZj2+NcCwTZBnzIMuaAe/AsgxwW89zuDaL99mpYX+sWtmmajR1+sObATxsDHkUD5QQVBHMPlA7awwzjWuhi0O+pbqDOvH+9yGOYQiQ5HQI0OX3QJPbBg6bsO/d1IYMmxkFkukskHgNKGueQpCh0EBzrGZQwQuzLhQWRqFnXHYRjj3cAn6fy7B2CWAKwYEJSHMR1ObI+KnGpQODOvrOt66ib/R2+Ruh7xEfkMmqJTqDwKlqgUwcJz88/5h7rtz7Zh15s8i9gVa3BohIyeWr5lxeBYvAaj6GJCGHL92Ku6qOvsPnr0+ShlqbndB3xAeKotYc6iaTCYp28SNfQR4xbL7ON68FUc0/S3YLPHWqU3PUepIgcKUoPTsWdISNaipEl+6AR/MHWcnXFZQWkXYtaifJlLqaan/jaoAxmxadqKUnT3YYOkRRVdjM54E1m8DCsGBErx5MJwLPUuCcPXfUGtbTlGbn5kY7OmllP5IRSCQahXhOgSMeB5jNLPCQBzfHg1munGoojxGo4nnGQDVIoq7Zri4vQ2eTFWaG+8C3ZQ5YiG7CV3cTcC+lQiqeKbs3gbnL5RTpcdBISgjSxWblK4b5/L0oZFQFvngxuA1Ii9oGEV495gFBRNNwTNn9lO2L5P9kfsOlpylpKx9VNt1iMgnPdXvBwe8X0WBhoN3JwZ2UAvFkxohbBos5sXKeUnRMl8Wv9UtixXesIqcrp6qMrpelrRhl3/z+T1nB61lV01IlGdWDwi+sxId4EW6vJGHmt7/316a/UhDL5mFlLVV2P9XBXbSk51M3kM9QdIiYecuRZOKghbXA2PUFiKymof+QG3isbb+sZeBuIgdKUoFYorw/USAVKf5aj1UX1JwGKpUFxlw5DXYwNlgpyPD1nVWYXU6AyyKAk+Mgn8zB+lq64l63ZN1d9HXLDBXK1zcwudl3vqa8cMBWRqHEI0MaiI2Rr9lRegzr+tTiR8+Qpv7MY7uR3pQP1KrosddjL/Vl8QeBKpcSqFBeplJA7UY9ibqDnk7vtlWw7sWMgiIThrBWS7KcqyuwE71tu7vXScMp4Y9LT8dKGwoaY/uCaq+Vjx9ugaYGW+mYCeyllqqd+wjUKNUmikKGN2t99kGGV9JM/6N+eKhp27nj5bRkZHAYwcHhy9IcR+CokBI4o9TR1gjHu7wgYskpzYZ4fwUHhyu1jFhhFPICgcK5TwNnxmaOgKWRM9kc5NWd4k0HU9vTiE1coNWFCZgvzX0lUDdwxBqsdWwfLZYBadsRERQd7MVGUG9C3kPxcsNCNSMWzE0MxowIMkijqKVYzaCIfnp3gErBRI2AJnBkD9fUuuylH95+nCac6QMCmn7viZZQzf3Ug+i7t06Sf0WqBBS5OOQbrUuTV4EGjQJzi0x0fMD7q6LkxlVVHS7uDdT1/1SJhqZ+pD8xk5gUXy4XfT0NBTjdlAMBKwpHIxfmOAu2Njy2NnS3WCy3OY67YGgYrYae/3RuDAFc3guqm1mDDhO1yiZcY7V1BAF2mw1syA6HHRx2OzidTgTMtu/tPE21/vO8Nr/y0s35xZmozICNyUEXgrGAfN9PDdISAZCcDnC5JHC73eB02OOiaD2HOe+zumrqvukmm+1fj8U/SCVTbbKiYKIt8AzDqoLAJ1BLq8gLokWICILw+V7N/Geg6kn/CjAAiy/VLN5rAD8AAAAASUVORK5CYII="
  var icon = new H.map.Icon(imagenMarker)
  var marker = new H.map.Marker(coordinate, {icon: icon});
  var markerString = Object.values(marker)
  console.log(markerString)
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
        content:evt.target.getData()
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
  garageData.accesoDiscapacitados = gDisabled
  garageData.estacionamientoMotos = gBike


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