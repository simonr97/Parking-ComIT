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

/*VAR LOCAL STORAGE*/
var storage = window.localStorage;
var usuario = { "email": "", "clave": "" };
var usuarioLocal, claveLocal;
/*FIN VAR LOCAL STORAGE*/

 /*VAR BASE DE DATOS*/
  var db 
  var refUsuarios 
 /*FIN VAR BASE DE DATOS */

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

  consultarLocalStorage();

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

      refUsuarios.doc(elMail).get().then(function(doc){
        if(doc.exists){
            nombre=doc.data().nombre
            apellido=doc.data().apellido
            fNac=doc.data().fnac
        }else{
          console.log("No Such Document!")
        }
      }).catch(function(error){
        console.log("Error getting document:", error)
      })   
     
      $$("#nomPanel").html(nombre)
      $$("#apePanel").html(apellido)
      $$("#mailPanel").html(elMail)
      $$("#fnacPanel").html(fNac)


     console.log("Este es el nombre"+nombre)
     console.log("Este es el apellido"+apellido)
     console.log("Este es la fecha de nacimiento"+fNac)

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
  elMail=$$("#ingresoMail").val();
  laPass=$$("#ingresoPass").val();
  console.log(nombre)
  console.log(apellido)
  console.log(fNac)

  auth.signInWithEmailAndPassword(elMail, laPass).catch(function(error) {  
      huboError=1;
      console.log(huboError)
      errorCode = error.code;
      errorMessage = error.message;
      alert(errorMessage)
  }).then(function(){
    if(huboError==0){
      //ingreso por localStorage
      usuario = { email: elMail, clave: laPass };
      var usuarioAGuardar = JSON.stringify(usuario);
      storage.setItem("usuario", usuarioAGuardar);
      console.log("usuarioAGuardar: " + usuarioAGuardar);
      console.log("usuario: " + usuario.email + "password: " + usuario.clave); 
      mainView.router.navigate("/about/");
    }
  })
  fnMostrarError(errorCode)
  fnMostrarError(errorMessage)
  
}

 function fnRegistro(){

  db = firebase.firestore();
  refUsuarios = db.collection("USUARIOS");

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

 function consultarLocalStorage(){
        
  var usuarioGuardado = storage.getItem("usuario");
  usuarioGuardado = JSON.parse(usuarioGuardado);
  // convertimos el string en JSON

      if (usuarioGuardado.email == ""){
          console.log("no hay datos en el local");
          } 
          else {
                console.log(" usuarioguardado.email: " + usuarioGuardado.email);
                console.log(" usuarioguardado.clave: " + usuarioGuardado.clave);
                //pasar los datos del json a dos variables independientes
                usuarioLocal = usuarioGuardado.email;
                claveLocal = usuarioGuardado.clave;
                console.log("usuariolocal + clavelocal: " + usuarioLocal + claveLocal)
                //si la variable tiene datos llamamos a una funcion de login pasandole las variables como parametros
                  if ( usuarioGuardado != null){
                      LoguearseConLocal(usuarioLocal, claveLocal);
                    }
              }
}

function LoguearseConLocal(u,c ){
       console.log("loguearseconlocal, u+c"+u+c)
       
  //Se declara la variable huboError (bandera)
  var huboError = 0;     
  firebase.auth().signInWithEmailAndPassword(u, c)
      .catch(function(error){
          //Si hubo algun error, ponemos un valor referenciable en la variable huboError
          huboError = 1;
          var errorCode = error.code;
          var errorMessage = error.message;
          console.error(errorMessage);
          console.log(errorCode);
      })
      .then(function(){   
          //En caso de que esté correcto el inicio de sesión y no haya errores, se dirige a la siguiente página
          if(huboError == 0){
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