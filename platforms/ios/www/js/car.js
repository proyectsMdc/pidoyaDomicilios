

var shopCar = {

  shopingCar: leerStorage('shop'),

  arreglocarrito : function(){
    if(this.shopingCar == null){
        return null;
    }else{
        var arreglo = JSON.parse(atob(this.shopingCar));
        return arreglo;
    }
  },
  printCantidad: function(id) {
    var cant = 0;
    if(this.arreglocarrito() != null){
        var data = this.arreglocarrito();
        cant = data['cantidadProductos'];
    }
    $("#"+id).text(cant);
  },

  addcar: function(dataProduct){
    var sedeId = dataProduct['sedeId'];
    
    if(this.shopingCar == null){
        var createCar = {"cantidadProductos":1,"cupon":false,"domicilio":parseInt(dataProduct['domicilio'])};
            createCar[sedeId]= {
              'nombreEmpresa':dataProduct['nombreEmpresa'],
              'logoEmpresa':dataProduct['logoEmpresa'],
              'domicilio':dataProduct['domicilio'],
              'productos':{}
            }
            createCar[sedeId]['productos'][dataProduct['productoId']] = {
                          'productoId':dataProduct['productoId'],
                          'nombre':dataProduct['nombre'],
                          'valor':dataProduct['valor'],
                          'descripcion':dataProduct['descripcion'],
                          'imagenProducto':dataProduct['imagenProducto'],
                          'sedeId': dataProduct['sedeId'],
                          'empresaId': dataProduct['empresaId'],
                          'domicilio': parseInt(dataProduct['domicilio']),
                          'cantidad': 1
                        }

    }else{
      var createCar = this.arreglocarrito();
      if(createCar != null){
          if(typeof createCar[sedeId] != 'undefined'){//valido que exista la sede en el carro
            if(typeof createCar[sedeId]['productos'][dataProduct['productoId']] != 'undefined'){//valido que exista el producto
              createCar[sedeId]['productos'][dataProduct['productoId']]['cantidad'] = parseInt(createCar[sedeId]['productos'][dataProduct['productoId']]['cantidad']) + 1;
              createCar['cantidadProductos'] = parseInt(createCar['cantidadProductos']) + 1;
            }else{
                createCar[sedeId]['productos'][dataProduct['productoId']] = {
                          'productoId':dataProduct['productoId'],
                          'nombre':dataProduct['nombre'],
                          'valor':dataProduct['valor'],
                          'descripcion':dataProduct['descripcion'],
                          'imagenProducto':dataProduct['imagenProducto'],
                          'sedeId': dataProduct['sedeId'],
                          'empresaId': dataProduct['empresaId'],
                          'domicilio': parseInt(dataProduct['domicilio']),
                          'cantidad': 1
                        }
              createCar['cantidadProductos'] = parseInt(createCar['cantidadProductos']) + 1;
            }  
          }else{
            var createCar = this.arreglocarrito();
            createCar['cantidadProductos'] = parseInt(createCar['cantidadProductos']) + 1;
            createCar['domicilio'] = parseInt(createCar['domicilio']) + parseInt(dataProduct['domicilio']);
            createCar[sedeId]= {
                'nombreEmpresa':dataProduct['nombreEmpresa'],
                'logoEmpresa':dataProduct['logoEmpresa'],
                'domicilio':parseInt(dataProduct['domicilio']),
                'productos':{}
              }
            createCar[sedeId]['productos'][dataProduct['productoId']] = {
                            'productoId':dataProduct['productoId'],
                            'nombre':dataProduct['nombre'],
                            'valor':dataProduct['valor'],
                            'descripcion':dataProduct['descripcion'],
                            'imagenProducto':dataProduct['imagenProducto'],
                            'sedeId': dataProduct['sedeId'],
                            'empresaId': dataProduct['empresaId'],
                            'domicilio': parseInt(dataProduct['domicilio']),
                            'cantidad': 1
                          };
          }
        
      }
       
    }
    console.log(createCar);
    crearStorage('shop', btoa( JSON.stringify(createCar)));
    this.shopingCar = leerStorage('shop');
    this.printCantidad("cantProductsTxt");
    
  },

  removeItemCar:function(sedeId,productoId){
    console.log(sedeId,productoId);
      var createCar = this.arreglocarrito();
      if(createCar != null){
        if(typeof createCar[sedeId] != 'undefined' && typeof createCar[sedeId]['productos'][productoId] != 'undefined' && createCar[sedeId]['productos'][productoId]['cantidad'] > 0){
            createCar[sedeId]['productos'][productoId]['cantidad'] = parseInt(createCar[sedeId]['productos'][productoId]['cantidad']) - 1;
            createCar['cantidadProductos'] = parseInt(createCar['cantidadProductos']) - 1;
            crearStorage('shop', btoa( JSON.stringify(createCar)));
            this.shopingCar = leerStorage('shop');
            this.printCantidad("cantProductsTxt");
            console.log(this.arreglocarrito());
            if(createCar[sedeId]['productos'][productoId]['cantidad'] == 0){
              this.deleteProductCar(parseInt(sedeId),parseInt(productoId));
            }
        }
      }
  },

  deleteProductCar:function(sedeId,productoId){
      var createCar = this.arreglocarrito();
      if(typeof createCar[sedeId]['productos'][productoId] ){
          createCar['cantidadProductos'] = parseInt(createCar['cantidadProductos']) - parseInt(createCar[sedeId]['productos'][productoId]['cantidad']) ;
          delete createCar[sedeId]['productos'][productoId];
          if($.isEmptyObject(createCar[sedeId]['productos']) == true){
            delete createCar[sedeId];
          }
          if(createCar['cantidadProductos'] == 0){
            delete createCar;
            eliminarStorage('shop');
            this.cargarCarrito();
          }else{
            console.log(createCar);
            crearStorage('shop', btoa( JSON.stringify(createCar)));
          }
          this.shopingCar = leerStorage('shop');
          this.printCantidad("cantProductsTxt");
          $("#containerCompra").empty();
          if(createCar['cantidadProductos'] == 0){
            this.cargarCarrito();
          }else{
            shopCar.pintarCarrito();
          }
      }
  },
  
  boleanCaja:0,
  cargarCarrito:function(){
      //llamo lista de pasises pasarela de pago
    if(this.arreglocarrito() != null){
      if(this.boleanCaja == 0){
        $("#menuCompra").removeClass("off");
        this.boleanCaja = 1;
        this.pintarCarrito();
      }else{
        $("#menuCompra").addClass("off");
        this.boleanCaja = 0;
        setTimeout(function(){
          $("#containerCompra").empty();
        },1000);
      }
      // console.log(this.boleanCaja);
    }
  },
  pintarCarrito:function(){
    var divTitle = document.createElement('div');
        divTitle.className= 'titlecar';
        divTitle.onclick = function(){
          shopCar.cargarCarrito();
        }
        
        logoCar =  document.createElement('img'); 
        logoCar.src = "img/logo.png";
        divTitle.append(logoCar);
    var divBody = $("<div class='bodyCar' ></div>");
    
    // estas son las secciones del carrito de compras
    var arrCarrito = this.arreglocarrito();
    console.log(arrCarrito);
    for(var a in arrCarrito){
      if (typeof arrCarrito[a] == 'object'){//valido que la llave sea un arreglo [id de la sede]
        var secProductSedes = $("<div class='secProducSedes' ></div>");
            secProductSedes.append($("<div class='titleSede' ></div>").append($("<img src='"+arrCarrito[a]['logoEmpresa']+"' />"),$("<span></span>").text(arrCarrito[a]['nombreEmpresa'])));
        var ProductSedes = $("<div class='ProducSedes' ></div>");


        var proCar = arrCarrito[a]['productos'];
        for(var b  in proCar){
          // console.log(typeof proCar[b]);
          if (typeof proCar[b] == 'object'){ //valido que la llave sea un arreglo
            
            var cajaIndividualPro = $("<div class='itmPro'></div>");
            var cajaImgPro = $("<div class='cjaImgPro'></div>");
            var cajaDescPro = $("<div class='cjaDescPro'></div>");
            var cajaDerPro = $("<div class='der'></div>");
            var cajaIzqPro = $("<div class='izq'></div>");
            var cajaDownPro = $("<div class='down'></div>").html("<p>"+proCar[b]['descripcion'].slice(0,50)+"...</p>");
                cajaDownPro.append($("<span class='precio'></span").text("$"+separatorMil(proCar[b]['valor'])));
            // creamos los contenedores de los productos
            
               
            var imgPro = document.createElement("img");
                imgPro.src = urldataApp+'admin/img/productos/'+proCar[b]['imagenProducto'];
            cajaImgPro.append(imgPro);//agregamos la imagen del producto
            
            var idDeletePro = {'deleteSede':parseInt(a), 'deletePro':parseInt(proCar[b]['productoId']) };
            var delePro = document.createElement('i');
                delePro.className = 'far fa-times-circle delete';
                delePro.id = btoa(JSON.stringify(idDeletePro));
                delePro.onclick = function(){
                  var dl = JSON.parse(atob(this.id));
                  console.log(dl);
                  shopCar.deleteProductCar(dl['deleteSede'],dl['deletePro']);
                  $("#itemsProLista"+dl['deletePro']).text(0);
                }
            cajaDerPro.append($("<span class='name'></span").text(proCar[b]['nombre'].toLowerCase()),delePro);
            var idPlus = {'productoId':parseInt(proCar[b]['productoId']),'sedeId':parseInt(a)};

            var imgPlus = document.createElement("img");
                imgPlus.src = 'img/icoPlus.png'; 
                imgPlus.className = 'plus'; 
                imgPlus.id = btoa(JSON.stringify(idPlus)); 
                imgPlus.onclick = function(){
                    dataProduct = JSON.parse(atob(this.id));
                    shopCar.addcar(dataProduct);
                    shopCar.totalCompra();
                    var car = shopCar.arreglocarrito();
                    $("#itemsProLista"+dataProduct['productoId']).text(car[dataProduct['sedeId']]['productos'][dataProduct['productoId']]['cantidad']);
                    $("#itemsProListaCar"+dataProduct['productoId']).text(car[dataProduct['sedeId']]['productos'][dataProduct['productoId']]['cantidad']);
                }; 
            
            var idPro = parseInt(proCar[b]['productoId']);
            proEscogidos = proCar[b]['cantidad'];
            var divCanProduct = $("<span class='itemsProListaCar' id='itemsProListaCar"+proCar[b]['productoId']+"'></span>").text(proEscogidos) ;

            var idLess = {'sedeId': parseInt(a),'productoId':parseInt(proCar[b]['productoId'])};
            var imgLess = document.createElement("img");
                imgLess.src = 'img/icoLess.png'; 
                imgLess.className = 'less'; 
                imgLess.id = btoa(JSON.stringify(idLess)); 
                imgLess.onclick = function(){
                    dataProduct = JSON.parse(atob(this.id));
                    console.log(dataProduct);
                    shopCar.removeItemCar(dataProduct['sedeId'],dataProduct['productoId']);
                    var car = shopCar.arreglocarrito();
                    if(car != null){
                      if(typeof car[dataProduct['sedeId']] != 'undefined' && typeof car[dataProduct['sedeId']]['productos'][dataProduct['productoId']] != 'undefined'){
                          shopCar.totalCompra();
                          var cantlss = car[dataProduct['sedeId']]['productos'][dataProduct['productoId']]['cantidad'];
                          $(this).removeClass("disabled");
                      }else{
                          var cantlss = 0;
                          $(this).addClass("disabled");
                      }
                      $("#itemsProLista"+dataProduct['productoId']).text(cantlss);
                      $("#itemsProListaCar"+dataProduct['productoId']).text(cantlss);
                    }
                }; 
            
            cajaIzqPro.append(imgLess, divCanProduct, imgPlus);
            
            cajaDescPro.append( cajaDerPro, cajaDownPro, cajaIzqPro );
            cajaIndividualPro.append( cajaImgPro, cajaDescPro );
            ProductSedes.append(cajaIndividualPro);
            secProductSedes.append(ProductSedes);
            divBody.append( secProductSedes );

            
          }
        }// cierra el for de los productos
      }//cierro el if que valida el objeto de las sedes
    }
    
    var divRecibo = $("<div class='regCompra' ></div>");
    $("#containerCompra").append( divTitle, divBody,divRecibo );
    this.totalCompra();

  },
  totalCompra: function(){
    $(".regCompra").empty();
    var carrito = this.arreglocarrito();
    var subT = 0;
    var domicilio = {};
    for(var a  in carrito){
      console.log(carrito[a]);
      if (typeof carrito[a] == 'object'){//valido que la llave sea un arreglo de sedes
        var proCar = carrito[a]['productos'];

        for(var b  in proCar){
          console.log(proCar[b]);
          subT +=  (parseInt(proCar[b]['valor']) * proCar[b]['cantidad']);
        }
      }// valido que sean las sedes


    }

    var secCupon = $("<div class='secCuponCompra' ></div>").text("Selecciona tus cupones.");
    var imgCupon = document.createElement('img');
        imgCupon.src='img/icoCupon.png';
        imgCupon.onclick = function(){
          console.log("alerta cupon");
          shopCar.callCupon();
        };
    secCupon.append(imgCupon);
    var total = subT + parseInt(carrito['domicilio']);
    var secSubtotal = $("<ul class='secRegistro' ></ul>").html("<li>Sub Total</li><li>$"+separatorMil(subT)+"</li>");
    var secCostoDomicilio = $("<ul class='secRegistro' ></ul>").html("<li>Costo Domicilio</li><li>$"+separatorMil(carrito['domicilio'])+"</li>");
    if(carrito['cupon'] == false){
      var off = 'off';
      var descuento = '';
    }else{
      var off = '';
      var dcto = 0;
      for(var c in carrito['cupon']){
          dcto += parseInt(carrito['cupon'][c]['valor_cupon']);
      }
      
      var descuento = (carrito['domicilio'] * dcto) / 100;
      total = (subT + parseInt(carrito['domicilio']) ) - descuento
    }
    var secDescCupon = $("<ul class='secRegistro "+off+"' ></ul>").html("<li>Descuento Cupon</li><li>$"+separatorMil(descuento)+"</li>");
    var totalPedido = $("<ul class='secRegistro' ></ul>").html("<li>Total</li><li class='total'>$"+separatorMil(total)+"</li>");
    var btnPagar = document.createElement('a');
        btnPagar.className= "btnPagar";
        btnPagar.innerHTML= "Pagar";
        btnPagar.onclick = function(){
            shopCar.escogerMetodopago();
        }
    $(".regCompra").append(secCupon, secSubtotal, secCostoDomicilio, secDescCupon, totalPedido, btnPagar);
    if(carrito['cantidadProductos']==0){
        this.cargarCarrito();
        this.shopingCar = null;
        eliminarStorage('shop');
    }
    
  },
  cuponesEscogidos:false,
  callCupon: function(){
    var formData = new FormData();
    formData.append('sv','GET_CUPON');
    formData.append('usrId',lopidoyapp.dataUsr('id_usr'));
    callService(formData,'POST',this.escogerCupon);
    var createCar = shopCar.arreglocarrito();
    shopCar.cuponesEscogidos = createCar['cupon'];
  },
  escogerCupon: function(response){
    console.log(response);
    response = JSON.parse(response);
    if(response['count'] > 0){
        var capa = $("<div class='capaCupones' id='capaCupones'></div>");
        $(".app").append(capa);
        $(".capaCupones").animate({
            "opacity" : "1",
            },{
            "complete" : function() {
              var CjaCupones = $("<div  class='cjaCupones animated fast fadeInDown' ></div>");
              var cjaChk = $("<div class='cjachkCupon' ></div>");
              for (var i in response['data']) {
                  var cpn =  document.createElement('div');
                  cpn.className='cupon';
                  if(shopCar.cuponesEscogidos != false){
                    if(typeof shopCar.cuponesEscogidos[response['data'][i]['cupon_id']] != 'undefined'){
                      cpn.className='cupon chk';
                    }
                  } 
                  cpn.id = btoa(JSON.stringify(response['data'][i]));
                  cpn.onclick = function(){
                    console.log('click cupon');
                    var dataCupon = JSON.parse(atob(this.id));
                    var idCupon = dataCupon['cupon_id'];
                    console.log(dataCupon);
                    if(dataCupon['estadoCupon'] == 1){  
                      if(shopCar.cuponesEscogidos == false){
                        shopCar.cuponesEscogidos = {};
                        shopCar.cuponesEscogidos[idCupon] = dataCupon;
                        $(this).addClass('chk');
                      }else{
                        if(typeof shopCar.cuponesEscogidos[idCupon] == 'undefined'){
                          shopCar.cuponesEscogidos[idCupon] = dataCupon;
                          $(this).addClass('chk');
                        }else{
                          delete shopCar.cuponesEscogidos[idCupon];
                          if($.isEmptyObject(shopCar.cuponesEscogidos) == true){
                            shopCar.cuponesEscogidos = false;
                          }
                          $(this).removeClass('chk');
                        }
                      }
                    }else{
                      msjAlerta("Este cupón se encuantra inactivo en este momento");
                    }//valido que el cupon este activado
                    // console.log(shopCar.cuponesEscogidos);
                  }

                  var imgCupon = document.createElement('img');
                  imgCupon.src = 'img/cupones/cupon'+response['data'][i]['img_cupon']+'.png';
                  var dcto = document.createElement('span'); 
                  dcto.innerHTML= response['data'][i]['valor_cupon']+'%';
                  cpn.append(imgCupon,dcto);
                  cjaChk.append(cpn);
              }
              var saveCupon  = document.createElement('a');
              saveCupon.className="btn-outcolor saveCupon";
              saveCupon.innerHTML="Aceptar";
              saveCupon.onclick = function(){
                  $(".capaCupones").animate({
                      "opacity" : "0",
                      },{
                      "complete" : function() {
                          $("#capaCupones").remove();
                          var createCar = shopCar.arreglocarrito();
                          createCar['cupon'] = shopCar.cuponesEscogidos
                          crearStorage('shop', btoa( JSON.stringify(createCar)));
                          shopCar.shopingCar = leerStorage('shop');
                          console.log(shopCar.arreglocarrito());
                          shopCar.totalCompra();
                      }
                  });
              }

              CjaCupones.append(cjaChk,saveCupon);
              capa.append(CjaCupones);
              

            }
        });
    }else{
      msjAlerta("Ups! <br>No tienes cupones disponibles.");
    }
  },
  validDataEpayco: function(post){
    var formData = new FormData();
    formData.append('sv',"EPAYCO");
    for (var pair of post.entries()) {
          formData.append(pair[0],pair[1].trim());
      }
    callService(formData,'POST',shopCar.responseEpayco);
    preoloadIn();
  },
  responseEpayco: function(response){
    console.log(response);
    response = JSON.parse(response);
    console.log(response);
    if(response['epayco']['status'] == true){
      if(response['epayco']['data']['estado'] == "Aceptada"){
        response['epayco']['data']['secuenciaFac'] = response['factura']['secuencia'];
        shopCar.comprarProductos(response['epayco']['data']);
      }else{
        msjAlerta(response['epayco']['data']['respuesta']);
      }
    }else{
      if(typeof response['epayco']['data']['errors'] != 'undefined'){
        msjAlerta(response['epayco']['data']['errors'][0]['errorMessage']);
      }else{
        msjAlerta(response['epayco']['data']['description']);
      }
      preoloadOut();
    }
    
  },
  comprarProductos:function(dataEpayco){

    lopidoyapp.ubicacionUsr('direccion');
    console.log(lopidoyapp.direccionEntregaDomicilio);
    var carrito = this.arreglocarrito();
    var subT = 0;
    var sendCar = {};
    var senCupon = [];
     for(var a  in carrito){
      console.log(carrito[a]);
      if (typeof carrito[a] == 'object'){//valido que la llave sea un arreglo de sedes
        sendCar[a] = carrito[a];
        var proCar = carrito[a]['productos'];
        for(var b  in proCar){
          sT = (parseInt(proCar[b]['valor']) * proCar[b]['cantidad']);
          subT +=  sT;
        }
      }// valido que sean las sedes

    }
  var total = subT + parseInt(carrito['domicilio']);

    descuento = 0;
    if(carrito['cupon'] != false){
      var dcto = 0;
      for(var c in carrito['cupon']){
          senCupon.push(parseInt(carrito['cupon'][c]['cupon_id']));
          dcto += parseInt(carrito['cupon'][c]['valor_cupon']);
      }
      
      descuento = (carrito['domicilio'] * dcto) / 100;
      total = (subT + parseInt(carrito['domicilio']) ) - descuento
    }

    var formData = new FormData();
    formData.append('sv','COMPRAR');
    formData.append('usr_app_id',lopidoyapp.dataUsr('id_usr'));
    formData.append('direccion_domicilio', lopidoyapp.ubicacionUsr('direccion')+' '+lopidoyapp.ubicacionUsr('adicional'));
    formData.append('latitud_domicilio', lopidoyapp.ubicacionUsr('latitud'));
    formData.append('longitud_domicilio', lopidoyapp.ubicacionUsr('longitud'));
    formData.append('venta_total_pedido',total);
    formData.append('descuento_cupon',descuento);
    formData.append('cuponCar',JSON.stringify(senCupon));
    formData.append('pago_usr_app',subT);
    formData.append('metodo_pago',$("#metodoPago").val());
    formData.append('costo_domicilio', parseInt(carrito['domicilio']));
    formData.append('tiempo_entrega',30);
    formData.append('shop',JSON.stringify(sendCar));
    if(typeof dataEpayco != 'undefined'){
      for (var i in dataEpayco) {
          // console.log(i,dataEpayco[i]);
          formData.append(i,dataEpayco[i]);
        
      }
    }
    callService(formData,'POST',shopCar.respuestaCompra);
    preoloadIn();

        
  },
  respuestaCompra: function(response){
    // preoloadOut();
    console.log(response);
    response = JSON.parse(response);
    if(response['insert'] == 1){
        var dataCategory = lopidoyapp.categorySelected;
        lopidoyapp.cargarProductos(dataCategory['id_tipo'], dataCategory['tipoEmp']);
        shopCar.cargarCarrito();
        shopCar.shopingCar = null;
        eliminarStorage('shop');
        shopCar.printCantidad("cantProductsTxt");
        $("#vistaHistory").remove();//obligo actualizar la vista del historial de compras
        $("#vistaCreditCard").remove();
        msjAlerta("Se realizó la compra satisfactoriamente");
        dataUsr = JSON.parse(atob(leerStorage('usrApp') ));
        dataUsr['PedidoChat'] = response['pedidoId'];
        crearStorage('usrApp',btoa(JSON.stringify(dataUsr))); 
        console.log(dataUsr);
        $("#vistasMenu").remove();
        $(".app").append($("<div id='vistasMenu'></div>"));
        setTimeout(function(){
          chatUsr();
        },1000);
        // me falta validar que si existe vistasmenu no lo cree
      }
  },
  escogerMetodopago: function(){
    lopidoyapp.ejecutarFuncionVista = lopidoyapp.closeVistasMenu;
    console.log(shopCar.codPaises)
    var carrito = this.arreglocarrito();
    var descripcionCompra = '';
    var subT = 0;
    for(var a  in carrito){
      console.log(carrito[a]);
      if (typeof carrito[a] == 'object'){//valido que la llave sea un arreglo de sedes
        var proCar = carrito[a]['productos'];
        descripcionCompra += 'Empresa: '+carrito[a]['nombreEmpresa']+'\n Productos:';
        for(var b  in proCar){
          descripcionCompra += ' - '+proCar[b]['cantidad']+' '+proCar[b]['nombre']+'\n';
          subT +=  (parseInt(proCar[b]['valor']) * proCar[b]['cantidad']);
        }
      }// valido que sean las sedes

    }
    var dataLogin = JSON.parse(atob(leerStorage('usrApp')));
    console.log(descripcionCompra,dataLogin);
    var total = subT + parseInt(carrito['domicilio']);
    var carrito = this.arreglocarrito();
    if(carrito['cupon'] != false){
      var dcto = 0;
      for(var c in carrito['cupon']){
          dcto += parseInt(carrito['cupon'][c]['valor_cupon']);
      }
      var descuento = (carrito['domicilio'] * dcto) / 100;
      total = (subT + parseInt(carrito['domicilio']) ) - descuento;
    }

    if(lopidoyapp.dataUsr('id_usr') == null){
        alert("Debes iniciar sesion");
      }else{
        dataUsr = JSON.parse(atob(leerStorage('usrApp') ));
        if($('#vistaCreditCard').children().length != 0) {
            // console.log("ya hay contenido");
            $("#vistaCreditCard").removeClass().addClass("activeView");
        }else{
            var inputsForm = [
                {
                    'label': 'Pais',
                    'type': 'select',
                    'name': 'pais',
                    'option': lopidoyapp.codPaises

                },
                {
                    'label': 'Nombres',
                    'type': 'text',
                    'name': 'nameTarjeta',
                    'value': lopidoyapp.dataUsr('nombres')

                },
                {
                    'label': 'Apellidos',
                    'type': 'text',
                    'name': 'apellidoTarjeta',
                    'value': lopidoyapp.dataUsr('apellidos')

                },
                {
                    'label': 'Correo',
                    'type': 'email',
                    'name': 'correoTarjeta',
                    'value': lopidoyapp.dataUsr('correo')

                },
                {
                    'label': 'Num. Documento',
                    'type': 'tel',
                    'name': 'num_doc'

                },
                {
                    'label': 'Celular',
                    'type': 'text',
                    'value': lopidoyapp.dataUsr('celular'),
                    'name': 'telTarjeta'

                },
                {
                    'label': 'Número de Tarjeta',
                    'type': 'tel',
                    'name': 'numTarjeta'

                },
                {
                    'label': 'Fecha de Vencimiento',
                    'type': 'date',
                    'name': 'vencimientoTarjeta'

                },
                {
                    'label': 'Código de Seguridad',
                    'type': 'text',
                    'name': 'cvv'

                },
                {
                    'label': 'Num Cuotas',
                    'type': 'number',
                    'name': 'num_cuotas'

                },
                {
                    'label': '',
                    'type': 'hidden',
                    'name': 'metodoPago'

                },
                {
                    'label': '',
                    'type': 'hidden',
                    'value': 'CC',
                    'name': 'tipo_docTarjeta'

                },
                {
                    'label': '',
                    'type': 'hidden',
                    'value': total,
                    'name': 'valorCompra'

                },
                {
                    'label': '',
                    'type': 'hidden',
                    'value': descripcionCompra,
                    'name': 'descCompra'

                }

            ];
                
            var vista = $("<div id='vistaCreditCard' class='enableView'></div>");
            var titlePage = $("<div class='titlePage'></div>");
            var butonBack = $("<div class='butonBackViews'></div>");
            var i_Back  = document.createElement('i');
            i_Back.className="fas fa-chevron-left back";
            i_Back.onclick = function(){
                lopidoyapp.closeVistasMenu();

            }
            butonBack.append(i_Back);
            titlePage.append(butonBack,$("<h1></h1>").text("Métodos de Pago"));
            // creo el boton hacia atras y el titulo de la vista
            var bodyPage = $("<div class='bodyViews'></div>");
            var formRegCard = $("<form id='formCreditCard' class=''></div>");
            var msjErrorReg = $("<span id='msjAlerUp' class='msjError'></span>");

            var listaMetodospago = $("<ul class='metodospago' ></ul>");
            var arrMetodos = [
                  {
                    'label':'Tarjeta de Crédito',
                    'valor':'TC'
                  },
                  {
                    'label':'Datafono',
                    'valor':'DTF'
                  },
                  {
                    'label':'Efecivo',
                    'valor':'EFE'
                  }
                ];
            for (var a in arrMetodos) {
              var lim = document.createElement('li');
                  lim.innerHTML = arrMetodos[a]['label'];
                  lim.id = arrMetodos[a]['valor'];
                  lim.onclick = function(a){
                    $("ul.metodospago li.active").removeClass();
                    $(this).addClass('active');
                    $("#metodoPago").val(this.id);
                    if(this.id == 'TC'){
                      $("#formCreditCard").addClass("formOn");
                    }else{
                      $("#formCreditCard").removeClass("formOn");
                    }

                  }
                  listaMetodospago.append(lim);
            }

            for (var i = 0; i < inputsForm.length; i++) {
                var out = '';
                if(inputsForm[i]['type'] == 'hidden'){
                  out='out';
                }
                var secInputs = $("<div class='inlineForm "+out+"'></div>")
                var lbel = document.createElement('label');
                lbel.for = inputsForm[i]['name'];
                lbel.innerHTML = inputsForm[i]['label'];
                
                if(inputsForm[i]['type'] != 'select'){
                  var input = document.createElement('input');
                  input.type = inputsForm[i]['type'];
                  input.name = inputsForm[i]['name'];
                  input.id = inputsForm[i]['name'];
                  if(typeof inputsForm[i]['value'] != 'undefined'){
                    input.value = inputsForm[i]['value'];
                  }
                  secInputs.append(lbel,input);//añadimos el input al formulario
                  formRegCard.append(secInputs);//añadimos el input al formulario 
                }else{
                  var options = inputsForm[i]['option'];
                  console.log(options);
                  var input = $("<select name='"+inputsForm[i]['name']+"' id='"+inputsForm[i]['name']+"' ></select>");
                                   
                  for (var ot = 0; ot < options.length; ot++) {
                    var chk = '';
                    if(options[ot]['cod_iso'] == 'COP'){
                      chk = 'selected';
                    }
                    var opt = $("<option value='"+options[ot]['cod_iso']+"' "+chk+" ></option>").text(options[ot]['nombre']);
                    input.append(opt);
                  }
                  secInputs.append(lbel,input);//añadimos el input al formulario
                  formRegCard.append(secInputs);//añadimos el input al formulario 
                  

                }

            }

            var btnSaveReg = document.createElement("a");
            btnSaveReg.innerHTML = "Pagar";
            btnSaveReg.className = "btnSaveReg pay";
            btnSaveReg.onclick = function(){
                preoloadIn();
                var camposLibres = [];
                var camposIguales = "";
                if($("#metodoPago").val() == ''){
                  msjAlerta("Debes escoger un método de pago");
                }else{
                  if($("#metodoPago").val() == 'TC'){
                    var validarForm = validarCampos('formCreditCard',camposLibres,camposIguales);
                        console.log(validarForm);
                        if(validarForm['successForm'] == false){
                        }else{
                          var frm = document.getElementById('formCreditCard');
                          formData = new FormData(frm);
                          shopCar.validDataEpayco(formData);
                        }
                    }else{
                          shopCar.comprarProductos();
                    }
                  }
                }

                // formRegCard.append(btnSaveReg);
                bodyPage.append(listaMetodospago,formRegCard,btnSaveReg);
                vista.append(titlePage,bodyPage);
                $(".app").append(vista); 
                setTimeout(function(){
                  $("#vistaCreditCard").removeClass().addClass("activeView");
                },500);
        }    
      }

  }

}

