// If we need to use custom DOM library, let's save it to $$ variable:
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


var elMail, laPass, auth, nombre, apellido, fNac, huboError=0;
var errorCode    
var errorMessage

 /*VAR BASE DE DATOS*/
  var db 
  var refUsuarios 
 /*FIN VAR BASE DE DATOS */

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

  console.log("ready")
   
   db = firebase.firestore();
   refUsuarios = db.collection("USUARIOS");

   auth = firebase.auth();

   $$("#ingresar").on("click",fnIngreso);

});

// Option 1. Using one 'page:init' handler for all pages
$$(document).on('page:init', function (e) {
    // Do something here when page loaded and initialized
    fnMostrarError(e);
  

})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="about"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    $$("#nombre").html(nombre)
    $$("#apellido").html(apellido)
    $$("#fnacimiento").html(fNac)
})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="pagRegistro"]', function (e) {
  // Do something here when page with data-name="pagRegistro" attribute loaded and initialized

  $$("#registraUsuario").on("click",fnRegistro)
  
})


function fnIngreso(){
  huboError=0;
  elMail=$$("#mail").val();
  laPass=$$("#pass").val();

  auth.signInWithEmailAndPassword(elMail, laPass).catch(function(error) {  
      huboError=1;
      console.log(huboError)
      errorCode = error.code;
      errorMessage = error.message;
  }).then(function(){
    if(huboError==0){
      alert("HOLA")
      mainView.router.navigate("/about/");
    }
  })
  fnMostrarError(errorCode)
  fnMostrarError(errorMessage)
  
}

 function fnRegistro(){
   nombre=$$("#registroName").val();
   apellido=$$("#registroApellido").val();
   elMail=$$("#registroMail").val();
   laPass=$$("#registroPass").val();
   fNac=$$("#registroBirth").val();

   var data = {
    nombre: nombre,
    apellido: apellido,
    fnac: fNac,
   }
   refUsuarios.doc(elMail).set(data);
    
    auth.createUserWithEmailAndPassword(elMail, laPass).catch(function(error) {
      errorCode = error.code;
      errorMessage = error.message;
   });
 }

function fnMostrarError(txt){
  if(mostrarErrores==1){
      console.log("ERROR: "+txt);
  }

}