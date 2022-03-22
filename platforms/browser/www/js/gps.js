var map = null;
var infoWindow = null;
var direccion = null;
var poly = null;
var perimetro = [];
 
function openInfoWindow(marker,lat,long) {
      
      var markerLatLng;
        var newLong;
        var newLat;
      if(lat == ''){
            markerLatLng = marker.getPosition();
            newLong = markerLatLng.lng();
            newLat = markerLatLng.lat()
      }else{
            newLong = long; 
            newLat = lat;
        }
    document.getElementById('direccionMapa').value=direccion;
    document.getElementById('latitud').value=newLat;
    document.getElementById('longitud').value=newLong;    
    
    convertirCordenadasAdireccion(newLat,newLong);
    infoWindow.setContent([
/*        '<b>Tu direccion es :</b>',
        direccion,
        '<br><b>Latitud :</b>',
        newLat,
        '<br><b>Longitud :</b>',
        newLong,*/
        '<b> Arrastrame y haz doble click para actualizar la posición.</b>'
    ].join(''));
    infoWindow.open(map, marker);
}
 
function ubicacionMapa(latitud,longitud,titulo)
  {
    // alert('algo');
    var latd = latitud;
    var longtd =  longitud;
    var myLatlng = new google.maps.LatLng(latd, longtd);
    var myOptions = {
      zoom: 13,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
 
    map = new google.maps.Map(document.getElementById("map-container"), myOptions);
 
    infoWindow = new google.maps.InfoWindow();
 
    var marker = new google.maps.Marker({
        position: myLatlng,
        draggable: true,
        map: map,
        title:'Marcador arrastrable'
    });
 
    google.maps.event.addListener(marker, 'click', function(){
        openInfoWindow(marker,'');
    });
}
 
  function convertirDireccionAcordenadas(){
    var dir1 = document.getElementById('dir1').value;
    var dir2 = document.getElementById('dir2').value;
    var dir3 = document.getElementById('dir3').value;
    var dir4 = document.getElementById('dir4').value;
    var ciudad = document.getElementById('ciudad').value;
    var geocoder = new google.maps.Geocoder();
    var address = dir1+' '+dir2+' # '+dir3+' '+dir4+','+ciudad+', Colombia';
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
          var latitude = results[0].geometry.location.lat();
          var  longitude = results[0].geometry.location.lng();
           // alert('La longitud es: ' + longitude + ', la latitud es: ' + latitude+' la direccion es'+address);
          document.getElementById('latitud').value=latitude;
          document.getElementById('longitud').value=longitude;
/* document.getElementById('direccionMapa').value = convertirCordenadasAdireccion(latitude,longitude); */
          } 
    }); 
  }
function convertirCordenadasAdireccion(latitud,longitud){
    var geocoder = new google.maps.Geocoder();
    var tuLocalizacion = new google.maps.LatLng(latitud, longitud);
    geocoder.geocode({ 'latLng': tuLocalizacion },function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
            direccion =  results[0].formatted_address;
            lopidoyapp.direccionEntregaDomicilio.direccion = direccion;
            lopidoyapp.direccionEntregaDomicilio.latitud = latitud;
            lopidoyapp.direccionEntregaDomicilio.longitud  = longitud;
            $(".inputAdress").val(lopidoyapp.direccionEntregaDomicilio.direccion);
            preoloadOut();
            crearStorage('location',btoa(JSON.stringify(lopidoyapp.direccionEntregaDomicilio)));
            } else {
            error('Google no retorno resultado alguno.');
            }
        }
    });
}



function convertirDireccion(address,latId,longId){
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
          var latitude = results[0].geometry.location.lat();
          var  longitude = results[0].geometry.location.lng();
          $("#"+latId).val(latitude);
          $("#"+longId).val(longitude);
          } 
    }); 
  }

var coordenadas = {};
function gestionarErrores(objPositionError){
  var mistake = '';
  switch (objPositionError.code) {
      case objPositionError.PERMISSION_DENIED:
        mistake = "No se ha permitido el acceso a la posición del usuario.";
      break;
      case objPositionError.POSITION_UNAVAILABLE:
        mistake = "No se ha podido acceder a la información de su posición.";
      break;
      case objPositionError.TIMEOUT:
        mistake = "El servicio ha tardado demasiado tiempo en responder.";
      break;
      default:
        mistake = "Error desconocido.";
    }
  console.log(mistake);
  msjAlerta(mistake);
}
 
function ObtenerUbicacion(){
  if (navigator.geolocation) {
        navigator.geolocation.watchPosition(onSuccess,gestionarErrores,{ enableHighAccuracy:true } );
  } else {
    alert('El navegador no soporta Geolocalización.')
      
  }
  console.log(coordenadas);
}
function onSuccess(position) {
  convertirCordenadasAdireccion(position.coords.latitude,position.coords.longitude);
}




// Este ejemplo muestra un formulario de dirección, utilizando la función de autocompletar
// de Google places API para ayudar a los usuarios rellenar la información.


function AutoCompleteAddress(id) {
  // Cree el objeto de autocompletado, restringiendo la búsqueda
  autocomplete = new google.maps.places.Autocomplete(
     (document.getElementById(id)),
      { types: ['geocode'] });
  // Cuando el usuario selecciona una dirección en el menú desplegable,
  // rellena los campos de dirección en el formulario.
  /*google.maps.event.addListener(autocomplete, 'place_changed', function() {
    fillInAddress();
  });*/
  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
  // Obtener los detalles de lugar el objeto de autocompletado.
  var place = autocomplete.getPlace();
  console.log( JSON.stringify(place) );
  var ubi = place["formatted_address"].split(','); 
  console.log(ubi);

}



//ubicación geográfica del usuario,

