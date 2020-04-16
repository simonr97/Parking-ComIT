// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

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


var mail,
    pass,
    auth,
    NyA;
    var errorCode
    var errorMessage
// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
   auth = firebase.auth();
  $$("#ingresar").on("click",fnIngreso);
  
});

// Option 1. Using one 'page:init' handler for all pages
$$(document).on('page:init', function (e) {
    // Do something here when page loaded and initialized
    console.log(e);

})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="about"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    
})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="pagRegistro"]', function (e) {
  // Do something here when page with data-name="pagRegistro" attribute loaded and initialized

  $$("#registraUsuario").on("click",fnRegistro)
  
})


function fnIngreso(){
  auth.signInWithEmailAndPassword(mail, pass).catch(function(error) {  
      errorCode = error.code;
      errorMessage = error.message;
  });
  console.log(mail)
  console.log(pass)
  console.log(errorCode)
  console.log(errorMessage)
}

 function fnRegistro(){
   NyA=$$("#registroName").val();
   mail=$$("#registroMail").val();
   pass=$$("#registroPass").val();

   auth.createUserWithEmailAndPassword(mail, pass).catch(function(error) {
      errorCode = error.code;
      errorMessage = error.message;
   });
 }