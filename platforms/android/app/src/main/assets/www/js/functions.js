var spiner = '<div class="preload"> <img src="img/preload.gif" alt=""> </div> </div>';

var timerPedidos = null;
var v_app = 4;
var nameApp = "Pidoya";
var keyToken = 'tokenDeviceDomi';
var keyUser = 'usrAppDomi';

var urlService = "https://pidoya.co/webService/serviciosDomi.php"; // produccion
var urldataApp = "https://pidoya.co/";

// var urlService = "http://127.0.0.1/proyectsInHouse/mdc/pidoya/webService/serviciosDomi.php"; // pruebas
// var urldataApp = "http://127.0.0.1/proyectsInHouse/mdc/pidoya/"; // pruebas

function callService(vars,metod,metodoAccion,jsonData){
	/*console.log(urlService);
		for (var pair of vars.entries()) {
		    console.log(pair[0]+ ', ' + pair[1]); 
		}*/
      $.ajax({
        type:metod,
        url: urlService,
        data:vars,
        // dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        success:function(data){
        	// console.log(data);
          if(typeof metodoAccion == 'function'){
                metodoAccion(data,jsonData);
           }  
         },
        error: function(data){
          console.log(data);
          if(data['readyState'] == 0){
          	msjAlerta("No tienes conexion a internet");
          }
        }
      });
}


function soloNumeros(e){
	var key = window.Event ? e.which : e.keyCode
	return (key >= 48 && key <= 57)
}
var crearStorage = function (key, value) {
    localStorage.setItem(key, value);
}
var leerStorage = function (key) {
    keyValue = localStorage.getItem(key);
    return keyValue;
}
var eliminarStorage = function (key) {
    localStorage.removeItem(key);
}
function cerrarSesion(){
  domiApp.saveToken("");
  localStorage.clear();
	clearInterval(timerPedidos);
	window.location.reload();
}


function moveSection(id,container){
	$(container).scrollTop(0);
	var elementContainerPositionTop = $(container).offset().top;
	var elementIdPositionTop = $(id).offset().top;
	var tope = (elementIdPositionTop - elementContainerPositionTop);
	$(container).animate({ scrollTop:tope }, 'slow');
	console.log(elementIdPositionTop, elementContainerPositionTop);
	
	
}
function estaVisibleEnPantalla(elemento,elementoPadre) {
    var estaEnPantalla = false;
    var posicionElemento = $(elemento).get(0).getBoundingClientRect();
    var posicionElementoPadre = $(elementoPadre).get(0).getBoundingClientRect();
    console.log(posicionElemento,posicionElementoPadre,window.innerHeight);
    var paddinBotton = 100;
    if (posicionElemento.top >= 0 && posicionElemento.top <= (window.innerHeight - paddinBotton) && posicionElemento.bottom > posicionElementoPadre.top ) {
        estaEnPantalla = true;
    }

    return estaEnPantalla;
}



function removeItemFromArr( arr, item ) {
    console.log(arr);
    delete arr[item];
    console.log(arr);
    return arr;
}

function preoloadIn(){
	$("#alertsModal").html(spiner);
    $("#alertsModal").addClass('in');
}
function preoloadOut(){
	$("#alertsModal").empty();
	$("#alertsModal").removeClass();
}
function separatorMil(numero){
	var num = numero;//.replace(/\./g,'');
    num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.');
    num = num.split('').reverse().join('').replace(/^[\.]/,'');
    return num;
}

function validarCampos(idFormulario,camposLibres,camposIguales,funcionRespuesta,svice){
	var frm = document.getElementById(idFormulario);
	var formData = new FormData(frm);
	var error = 0;
	var errorMail = 0;
	
	$(".input-error").removeClass('input-error')
	for (i=0;i<frm.elements.length;i++) {
		if($("#"+frm[i].id).val() == ''){
			$("#"+frm[i].id).addClass('input-error');
			if(typeof camposLibres != 'undefined'){
	    		var a = camposLibres.indexOf(frm[i].id);
				if(a < 0){
					error++;
				}else{
					$("#"+frm[i].id).removeClass('input-error');
				}	
			}else{
				error++;
			}
		}else{
			
			if(frm[i].type == 'email'){
				if(validarEmail( $("#"+frm[i].id).val() ) == false ){
					$("#"+frm[i].id).addClass('input-error');
					$("#"+frm[i].id).focus();
					error++;
					errorMail++;
				}	
			}
			formData.append(frm[i].id,$("#"+frm[i].id).val().trim());
		}
	}
	if(error == 0){
		var resp = {'successForm':true};
		if(typeof camposIguales != 'undefined' || camposIguales != ''){
			if($("#"+camposIguales[0]).val() === $("#"+camposIguales[1]).val()){
				var resp = {'successForm':true};
            }else{
                $("#"+camposIguales[0]).addClass('input-error');
                $("#"+camposIguales[1]).addClass('input-error');
                msjAlerta("* Las contraseñas deben ser iguales");
				var resp = {'successForm':false};
            }
		}
	}else{
		var resp = {'successForm': false};
		if(errorMail > 0){
			msjAlerta("* Introduzca un correo válido");
		}else{
			msjAlerta("* Debes llenar Los campos requeridos");
		}
	}
	if(typeof svice != 'undefined'){
		formData.append('sv',svice);
	}
	if(typeof funcionRespuesta != 'undefined' && resp['successForm'] == true){
		formData.append('sv',svice);
		callService(formData,'POST',funcionRespuesta);
	}
	return resp;	
}
function validarEmail(valor) {
  if (/^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i.test(valor)){
   //alert("La dirección de email " + valor + " es correcta.");
   return true;
  } else {
   //alert("La dirección de email es incorrecta.");
   return false;
  }
}

function getBase64(file) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     console.log(reader.result);
   };
   reader.onerror = function (error) {
     console.log('Error: ', error);
   };
}

function msjAlerta(msj){
    var alerta = $("<div class='alertaMsjApp animated flipInX' id='alertaMsjApp' ></div>").html(msj);
    $(".app").append(alerta);
    setTimeout(function(){
        $("#alertaMsjApp").removeClass("flipInX");
        $("#alertaMsjApp").addClass("flipOutX");
    },3000);
    setTimeout(function(){
            $("#alertaMsjApp").remove();
    },3500);
    preoloadOut();
}

function loadApp(){
    var load = $("<div id='loadview' class='active' ></div>");
    // $("#loadview").addClass("active");
    var container = $("<div class='bodyLoad' ></div>");
    var containerLogo = $("<div></div>");
    
    var logP1 = document.createElement("img");
        logP1.src = "img/logoApp.png";
        logP1.className = "center animated fadeInLeft";
    setTimeout(function(){
        $(".bodyLoad").addClass("active");
    },500);
    setTimeout(function(){
        containerLogo.append(logP1);
    },1000);
    setTimeout(function(){
        containerLogo.append($("<h1 class='animated fadeInRight' ></h1>").text('Domiciliarios'));        
    },2500);
    container.append(containerLogo);
    load.append(container);
    $(".app").append(load);
    closeloadApp(3500);
}

function showTextboxPress(obj,callback=null){
    console.log(obj);
    var cjaIn = `<div class="" id="cjaFixTexbox">
            <div class="cja_input">
                <i class="${obj['ico']}"></i>
                <input type="${obj['type']}" placeholder="${obj['placeholder']}" id="txtboxFix" autocomplete="off" value="${obj['value']}" >
            </div>
        </div>`;
    if($('#cjaFixTexbox').length > 0 ){
        $('#cjaFixTexbox').remove();
    }
    $('.app').append(cjaIn);
    $('.cja_input').click(function(e){
        e.stopPropagation();
    });
    $('#cjaFixTexbox').click(function(e){
        $("#cjaFixTexbox").removeClass("on");
    });
    $( "#txtboxFix" ).keyup(function(e) {
        if(e.keyCode == 13){
        $("#cjaFixTexbox").removeClass("on");
        $(obj['id_return']).next().focus()
        }
        $(obj['id_return']).val($(this).val());
    });
    window.location.href="#txtboxFix";
    setTimeout(() => {
        $("#cjaFixTexbox").addClass("on");
        var nvl = $('#txtboxFix').val();
        $('#txtboxFix').focus().val("").val(nvl);
    }, 300);
    $( "#txtboxFix" ).blur(function() {
        $("#cjaFixTexbox").removeClass("on");
        if(callback!=null){
        callback();
        }
    });
}
function closeloadApp(segundos){
    setTimeout(function(){
        $("#loadview").animate({
            "opacity" : "0",
            "duration":500
            },{
            "complete" : function() {
                $("#loadview").removeClass("active");        
                $("#loadview").attr("style","");        
                $(".bodyLoad").removeClass("active");
                setTimeout(function(){
                    $("#loadview").remove();
                },1000);
            }
        });
    },segundos);
}

/* firebase.messaging plugin */
var configTokenFCM = {
    ini: function(callback){
      this.requestPermission(callback);
    },
    requestPermission(callback){
      cordova.plugins.firebase.messaging.requestPermission({forceShow: true}).then(function() {
          console.log("Push messaging is allowed");
          configTokenFCM.getToken(callback);
          configTokenFCM.notificationReceived();
      });
    },
    getToken: function(callback){
      console.log('android token FCM')
      cordova.plugins.firebase.messaging.getToken().then(function(token) {
          console.log("Got device token: ", token);
          crearStorage(keyToken,token);
          callback(token)
      });
  
    },
    createChanel: function(){
      id = Math.floor((Math.random() * 100 ) + 1 );
      cordova.plugins.firebase.messaging.createChannel({
          id: `${id}_canal_push_pidoya_domi`,
          name: "Notificaciones Pidoya",
          importance: 4,
          badge:true,
          light:true
      });
    },
    notificationReceived: function(){ 
      cordova.plugins.firebase.messaging.onMessage(function(data) {
          console.log("New foreground FCM message: ", data);
          icon = 'https://pidoya.co/www/img/logoApp.png';
          if(typeof data.infoPush != 'undefined'){
            data.infoPush = JSON.parse(data.infoPush);
            icon = data.infoPush.smallIcon;
          }
          cordova.plugins.notification.local.schedule({
            id: Math.floor((Math.random() * 100 ) + 1 ),
            title: data.gcm.title,
            text: data.gcm.body,
            foreground: true,
            icon: icon
          });
      });
      cordova.plugins.firebase.messaging.onBackgroundMessage(function(data) {
          console.log("New background FCM message: ", data);
      });
    }
}
  
  
  
  /* FCM UPDATE PLUGIN */
  var configToken_FCM = {
    ini: function(){
      cordova.plugins.notification.local.requestPermission(function (granted) {
        console.log("Permisos notificaiones ",granted);
      });
      FCMPlugin.hasPermission((resp)=>{
        console.log("permisos",resp);
      });
      this.getToken();
      this.notificationReceived();
    },
    getToken: function(){
      if (cordova.platformId !== "ios") {
        console.log('android token FCM')
        FCMPlugin.getToken(function(token){
            console.log(token);
            crearStorage(keyToken,token);
        });
        FCMPlugin.onTokenRefresh(function(token){
          console.log( token );
          crearStorage(keyToken,token);
        }); 
      }else{
        console.log('ios token FCM')
        FCMPlugin.getAPNSToken((token)=>{
            console.log("Started listening APNS as " + token );
            crearStorage(keyToken,token);
          },(error)=>{
            console.log("Error on listening for APNS token: " + error );
          }
        );
      }
    },
    notificationReceived: function(){ 
      FCMPlugin.onNotification(function(data){
          if(data.wasTapped){
            //Notification was received on device tray and tapped by the user.
            console.log(data);
            cordova.plugins.notification.local.schedule({
              id: Math.floor((Math.random() * 100 ) + 1 ),
              title: data.title,
              text: data.message,
              foreground: true,
              // attachments: ['file:///android_asset/www/img/logoApp.png'],
              // smallIcon: 'https://pidoya.co/www/img/logoApp.png',
              icon: data.smallIcon
            });
        //   });
          }else{
            //se recive la notificacion con la aplicacion abierta en primer plano
            console.log(data);
            cordova.plugins.notification.local.schedule({
              id: Math.floor((Math.random() * 100 ) + 1 ),
              title: data.title,
              text: data.message,
              foreground: true,
              icon: data.smallIcon
            });
          }
          /* if(typeof data.tipoNotificacion != 'undefined'){
            if(data.tipoNotificacion == "Nuevo Pedido"){
              domiApp.callAlarmNP();
            }
          } */
      });
    }
  }