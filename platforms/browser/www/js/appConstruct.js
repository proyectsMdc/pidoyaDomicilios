

var domiApp = {
    ejecutarFuncionVista : null,
    datafuncionVista:null,
    categorySelected:null,
    cantidadPedidosSinVer:0,
    cantidadPedidosRevisados:0,
    iniApp: function(){
        this.versionApp();/* Valido que el usuario descargue la ultima version existente */
        loadApp();
        
        configTokenFCM.ini((token)=>{
            this.saveToken(token);
        });
        
        this.CrearAlarma();
        // document.addEventListener("backbutton", onBackKeyDown, false);
        if(domiApp.dataUsr('id_domiciliario') != null){
            var formData = new FormData();
            formData.append('sv','NUEVOS_PEDIDOS');
            formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
            callService(formData,'POST',this.menuPedidos);
        }else{
            this.login();

        }        
    },
    versionApp:function(){
        var dispo = "";
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            dispo = "ios";
        }else if (navigator.userAgent.match(/Android/i)){
            dispo = "android";
        }
        var formData = new FormData();
        formData.append('sv', 'VERSION_CODE');
        formData.append('versionCode', v_app);
        formData.append('dispo', dispo);
        callService(formData,'POST',this.responseVersion);

    },
    responseVersion: function(response){
        console.log(response);
        if(response['actualizarApp'] == true){
            var cf = confirm("Actualiza la aplicación para mejorar la experiencia con nosotros");
            if(cf){
                window.location.href= response['url'];
            }
        }
    },
    CrearAlarma: function(){
        ion.sound({
            sounds: [
                {name: "claro_guatemala"}
            ],
            path: "sounds/",
            preload: true,
            volume: 1.0,
        });
    },
    callAlarmNP:function(){
        ion.sound.play("claro_guatemala",{loop:true});
    },
    destroyAlarmNP:function(){
        console.log(domiApp.cantidadPedidosRevisados);
        if(domiApp.cantidadPedidosRevisados < domiApp.cantidadPedidosSinVer){
            domiApp.cantidadPedidosRevisados++;
            if(domiApp.cantidadPedidosRevisados == domiApp.cantidadPedidosSinVer){
                ion.sound.destroy("claro_guatemala");
            }
        }else{
            ion.sound.destroy("claro_guatemala");
        }
            
    },
    CallnuevosPedidos : function(animacion){

        var formData = new FormData();
        formData.append('sv','NUEVOS_PEDIDOS');
        formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
        callService(formData,'POST',this.nuevosPedidos,animacion);
        $("#bodyPedidos").removeClass();
    },
    responseEstadoPedido : function(response,estado){
        //console.log("respuesta estados",response);
        msjAlerta(response['msj']);
        if(estado == 5){
            $("#pageDetalle").animate({
                "opacity" : "0",
                },{
                "complete" : function() {
                    $("#pageDetalle").remove();
                }
            });
        }
        domiApp.callmisPedidos();

    },
    nuevosPedidos : function(response,animacion){ 
        var bodyPedidos = $("#bodyPedidos");
        domiApp.cantidadPedidosSinVer = response['rows'].length;
        console.log(domiApp.cantidadPedidosSinVer);
        if(response['rows'].length > 0){
            if(domiApp.cantidadPedidosSinVer > domiApp.cantidadPedidosRevisados){
                domiApp.callAlarmNP();
            }
            var listaPedidos = $("<ul class='listaPedidos' ></ul>");
            for(var i in response['rows']){
                //console.log(response['rows'][i],i);
                iscompany = response['rows'][i]['is_company'];
                var domiVal = (parseInt(response['rows'][i]['costo_domicilio']) - parseInt(response['rows'][i]['descuento_cupon']));
                domiVal = separatorMil(domiVal);
                var itm = $("<li></li>");
                var cajaDesc = $("<div></div>");
                var imgEmp = $("<img src='"+urldataApp+"admin/img/logosSucursal/"+response['rows'][i]['imagen_corporativa']+"' />");
                var desc = $("<div></div>");
                var descTitle = $("<span class='descTitle'></span>").text(response['rows'][i]['nameEmpresa']);
                var valorDomi = $("<span class='valorDomi'></span>").text("$"+domiVal);
                var dire = response['rows'][i]['direccion_domicilio'].split(',');
                var dirDomicilio = $("<span class='dirDomicilio'></span>").text(dire[0]);
                var descripcion = $("<p class='descripcion'></p>").text(response['rows'][i]['descripcion_producto'].substring(0, 65)+'...');
                
                desc.append(descTitle, valorDomi, dirDomicilio, descripcion);
                cajaDesc.append(imgEmp, desc);
                var detallePedido = document.createElement('a');
                    detallePedido.innerHTML = "Ver Detalle";
                    // detallePedido.id = btoa(JSON.stringify({'pedidoId':response['rows'][i]['pedido_id'],'detalle':'pendiente'}));
                    response['rows'][i]['detalle'] = 'pendiente';
                    detallePedido.dataset.pedido = JSON.stringify(response['rows'][i]);
                    detallePedido.onclick = function(){
                        var data = JSON.parse(this.dataset.pedido);
                        // console.log(data); return;
                        domiApp.destroyAlarmNP();
                        var formData = new FormData();
                            formData.append('sv','DETALLE_PEDIDO');
                            formData.append('pedidoId',data['id_pedido']);
                            formData.append('iscompany',data['is_company']);
                            formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
                            callService(formData,'POST',domiApp.detallePedido);
                    }
                var aceptarPedido = document.createElement('a');
                    aceptarPedido.innerHTML = "Aceptar";
                    aceptarPedido.id = btoa(JSON.stringify({'pedidoId':response['rows'][i]['pedido_id']}));
                    aceptarPedido.onclick = function(){
                        domiApp.destroyAlarmNP();
                        var data = JSON.parse(atob(this.id));
                        //console.log(data);
                        var formData = new FormData();
                            formData.append('sv','ACEPTAR_PEDIDOS');
                            formData.append('pedidoId',data['pedidoId']);
                            formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
                            callService(formData,'POST',domiApp.aceptarPedido);
                    }
                
                itm.append(cajaDesc,detallePedido, aceptarPedido);
                listaPedidos.append(itm);
            }
        }else{
            var listaPedidos = $("<div class='panel'></div>").text("No hay pedidos nuevos");
        }
        if(domiApp.vistaMisPedidos == false){
            bodyPedidos.empty();
            bodyPedidos.append(listaPedidos);
            if(typeof animacion != 'undefined'){
                $("#bodyPedidos").addClass('animated fast fadeInLeft');
            }
        }
    },
    callmisPedidos : function(){
        var formData = new FormData();
        formData.append('sv','MIS_PEDIDOS');
        formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
        callService(formData,'POST',this.misPedidos);
        $("#bodyPedidos").removeClass();
        $("#bodyPedidos").empty();
    },
    misPedidos : function(response){
        //console.log(response);
        var bodyPedidos = $("#bodyPedidos");
        if(response['rows'].length > 0){
            var listaPedidos = $("<ul class='listaPedidos' ></ul>");
            for(var i in response['rows']){
                //console.log(response,i);
                response['rows'][i]['detalle'] = 'pendiente';
                var itm = $("<li data-pedido='"+JSON.stringify(response['rows'][i])+"'></li>");
                itm.click(function() {
                    var data = JSON.parse(this.dataset.pedido);
                    //console.log(data);
                    var formData = new FormData();
                        formData.append('sv','DETALLE_PEDIDO');
                        formData.append('pedidoId',data['id_pedido']);
                        formData.append('iscompany',data['is_company']);
                        formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
                        callService(formData,'POST',domiApp.detallePedido,'domiciliario');

                });
                var domiVal = (parseInt(response['rows'][i]['costo_domicilio']) - parseInt(response['rows'][i]['descuento_cupon']));
                domiVal = separatorMil(domiVal);

                var cajaDesc = $("<div></div>");
                var imgEmp = $("<img src='"+urldataApp+"admin/img/logosSucursal/"+response['rows'][i]['imagen_corporativa']+"' />");
                var desc = $("<div></div>");
                var descTitle = $("<span class='descTitle'></span>").text(response['rows'][i]['nameEmpresa']);
                var valorDomi = $("<span class='valorDomi'></span>").text("$"+domiVal);
                
                var dire = response['rows'][i]['direccion_domicilio'].split(',');
                var dirDomicilio = $("<span class='dirDomicilio'></span>").text(dire[0]);
                var descripcion = $("<p class='descripcion'></p>").text(response['rows'][i]['descripcion_producto'].substring(0, 65)+'...');
                
                desc.append(descTitle, valorDomi, dirDomicilio, descripcion);
                cajaDesc.append(imgEmp, desc);
                
                itm.append(cajaDesc);
                listaPedidos.append(itm);
            }
        }else{
            var listaPedidos = $("<div class='panel'></div>").text("No tienes pedidos asignados");
        }
        
        bodyPedidos.append(listaPedidos);
        $("#bodyPedidos").addClass('animated fast fadeInRight');
    },
    reloadHistorial:function(response){
        console.log(response);
        domiApp.callhistorialDomicilios();
        $("#bodyHistorial").empty();
    },
    callhistorialDomicilios : function(){
        var formData = new FormData();
        formData.append('sv','HISTORIAL');
        formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
        callService(formData,'POST',this.historialDomicilios);
        
    },
    historialDomicilios : function(response){
        //console.log(response);
        var bodyPedidos =  $("#bodyHistorial");
        var butonBack = $("<div class='butonBackViews'></div>");
        var i_Back  = document.createElement('i');
        i_Back.className="fas fa-chevron-left back";
        i_Back.onclick = function(){
            $("#bodyHistorial").removeClass("active");
            $("#bodyHistorial").empty();
            
        }
        butonBack.append(i_Back);
        var header = $("<div class='header' ></div>").append(butonBack,$("<h1></h1>").text('Historial'));
        bodyPedidos.append(header);

        if(response['rows'].length > 0){
            if($(".listaPedidos").length){
                // $(".listaPedidos").remove();
            }
            var listaPedidos = $("<ul class='listaPedidos' ></ul>");
            for(var i in response['rows']){
                //console.log(response,i);
                var itm = $("<li></li>");
                
                var domiVal = (parseInt(response['rows'][i]['costo_domicilio']) - parseInt(response['rows'][i]['descuento_cupon']));
                domiVal = separatorMil(domiVal);
                var cajaDesc = $("<div></div>");
                var imgEmp = $("<img src='"+urldataApp+"admin/img/logosSucursal/"+response['rows'][i]['imagen_corporativa']+"' />");
                // var desc = $("<div id='"+btoa(JSON.stringify({'pedidoId':response['rows'][i]['pedido_id'],'detalle':'pendiente'}))+"' ></div>");
                response['rows'][i]['detalle'] = 'pendiente';
                var desc = $("<section data-pedido='"+JSON.stringify(response['rows'][i])+"'></section>");
                desc.click(function() {
                    var data = JSON.parse(this.dataset.pedido);
                    //console.log(data);
                    var formData = new FormData();
                        formData.append('sv','DETALLE_PEDIDO');
                        formData.append('pedidoId',data['id_pedido']);
                        formData.append('iscompany',data['is_company']);
                        formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
                        callService(formData,'POST',domiApp.detalleHistorial,'domiciliario');
                });
                var descTitle = $("<span class='descTitle'></span>").text(response['rows'][i]['nameEmpresa']);
                var valorDomi = $("<span class='valorDomi'></span>").text(`$ ${domiVal}`);
                var dire = response['rows'][i]['direccion_domicilio'].split(',');
                var dirDomicilio = $("<span class='dirDomicilio'></span>").text(dire[0]);
                var descripcion = $("<p class='descripcion'></p>").text(response['rows'][i]['descripcion_producto'].substring(0, 65)+'...');
                
                desc.append(descTitle, valorDomi, dirDomicilio, descripcion);
                cajaDesc.append(imgEmp, desc);

                var btnDelete = document.createElement('a');
                btnDelete.className= "btnDelete";
                btnDelete.id = btoa(JSON.stringify({'pedId':response['rows'][i]['pedido_id']}));
                btnDelete.innerHTML= "Borrar";
                btnDelete.onclick = function(){   
                    dataId =    JSON.parse(atob(this.id)); 
                    console.log(dataId,domiApp.dataUsr('id_domiciliario'));  
                   var formData = new FormData();
                    formData.append('sv','DELETE_HISTORIAL');
                    formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
                    formData.append('pedidoId',dataId['pedId']);
                    callService(formData,'POST',domiApp.reloadHistorial);
                }
                
                itm.append(cajaDesc,btnDelete);
                listaPedidos.append(itm);
            }
        }else{
            var listaPedidos = $("<div class='panel'></div>").html("</br>No tienes pedidos asignados</br></br>");
        }
        
        bodyPedidos.append(listaPedidos);
        $("#bodyHistorial").addClass('active');
    },
    callChatDomicilios : function(pedidoId){
        var bodyPedidos =  $("#bodyChat");
        var butonBack = $("<div class='butonBackViews'></div>");
        var i_Back  = document.createElement('i');
        i_Back.className="fas fa-chevron-left back";
        i_Back.onclick = function(){
            $("#bodyChat").removeClass("active");
            $("#bodyChat").empty();
            
        }
        butonBack.append(i_Back);
        var header = $("<div class='header' ></div>").append(butonBack,$("<h1></h1>").text('Chat del pedido'));
        var cuerpoChat = $("<div class='bodyViews' id='containerChat'></div>");
        bodyPedidos.append(header,cuerpoChat); 
        chatApp.iniChat('containerChat',pedidoId);
        
        $("#bodyChat").addClass('active');
    },
    vistaMisPedidos:false,
    menuPedidos : function(response){
        console.log(response);
        // var response = JSON.parse(response);
        var container = $("<div id='pagePedidos' ></div>");
        var itm = $('<i class="fas fa-sign-out-alt icoLogout"></i>');
            itm.click(function() {
                cerrarSesion();
            });

        var header = $("<div class='header' ></div>").append(itm,$("<h1></h1>").text('Pedidos'));
        
        var menu = $("<ul class='menuTop' ></ul>");
        var items = [ 
                {'label':"Pedidos",'class':"active",},
                {'label':"Mis Pedidos", 'class':""} 
            ];
        for(var i in items){
            var dtaId = JSON.stringify({'pos':i});
            var itm = document.createElement('li');
            itm.innerHTML = items[i]['label'];
            itm.className = items[i]['class'];
            itm.id = btoa(dtaId);
            itm.onclick = function(){
                $("ul.menuTop li.active").removeClass('active');
                $(this).addClass('active');
                var data = JSON.parse(atob(this.id));
                if(parseInt(data['pos']) == 0){
                    //// console.log('CallnuevosPedidos');
                    clearInterval(timerPedidos);
                    domiApp.CallnuevosPedidos('ok');
                    timerPedidos = setInterval(function(){ 
                        domiApp.CallnuevosPedidos();
                    }, 2500);
                    domiApp.vistaMisPedidos = false;
                }else{
                    //// console.log('callmisPedidos');
                    // clearInterval(timerPedidos);
                    domiApp.vistaMisPedidos = true;
                    domiApp.callmisPedidos();
                }

                }
            menu.append(itm);
        }
        var bodyPedidos = $("<div id='bodyPedidos' ></div>");
        var bodyHistorial = $("<div id='bodyHistorial' ></div>");
        var bodyChat = $("<div id='bodyChat' ></div>");
        var imgHistorial = document.createElement('img');
            imgHistorial.src='img/icoHistoria.png';
            imgHistorial.className='btnHistorial';
            imgHistorial.onclick = function(){
                //console.log('show historial');
                domiApp.callhistorialDomicilios();
            }
        container.append(header,menu,bodyPedidos);
        $(".app").append(container,imgHistorial,bodyHistorial,bodyChat);
        /* insertamos los pedidos ya sean nuevos o propios */
        domiApp.nuevosPedidos(response,'ok');
        timerPedidos = setInterval(function(){ 
            domiApp.CallnuevosPedidos();
        }, 2500);
    },
    login: function(){
        var pLogin = $("<div id='pageLogin' ></div>");
        var imgLogin = $("<img src='img/logoApp.png' />");
        var arrayFormLogin = [
            {
                'label': 'Correo Electrónico',
                'type': 'email',
                'name': 'emailLogin',
            },
            {
                'label': 'Contraseña',
                'type': 'password',
                'name': 'pwdLogin',
            }

        ];
        var formLog = $("<form id='logUser' class='formLog'></div>");
        for (var i = 0; i < arrayFormLogin.length; i++) {
            var input = document.createElement('input');
                input.type = arrayFormLogin[i]['type'];
                input.placeholder = arrayFormLogin[i]['label'];
                input.name = arrayFormLogin[i]['name'];
                input.id = arrayFormLogin[i]['name'];

                input.autocomplete = 'off';
                input.dataset.ico = i;
                input.onfocus = function(){
                    var ico = ($(this).data('ico') == 0)? "far fa-user" : "fas fa-unlock-alt";
                    var obj = {
                        ico: ico,
                        placeholder : $(this).prop('placeholder'),
                        id_return: "#"+$(this).prop('id'),
                        value: $(this).val(),
                        type: $(this).prop('type')
                    }
                    showTextboxPress(obj)
                }

            formLog.append(input);
        }
        var btnSaveLog = document.createElement("a");
            btnSaveLog.innerHTML = "Iniciar Sesion <i class='fas fa-user-plus'></i>";
            btnSaveLog.className = "btnSaveReg";
            btnSaveLog.onclick = function(){
                camposLibres = [];
                var validarForm = validarCampos('logUser',camposLibres,'',domiApp.iniciarSesion,"LOGIN");
                //console.log(validarForm);
            }
        
        formLog.append(btnSaveLog);
        pLogin.append(imgLogin,formLog);
        $(".app").append(pLogin);

    },
    iniciarSesion: function(response){
        //console.log(response);
        var response = JSON.parse(response);
        if(response['rows'] == 1){
            var dataLogin = btoa(JSON.stringify(response['dataUsr'])); 
            crearStorage(keyUser,dataLogin);
            if(leerStorage(keyToken)!= null){
                domiApp.saveToken(leerStorage(keyToken),(resp)=>{
                    domiApp.responseSaveToken(resp);
                });
            }else{
                window.location.reload();
            }
        }else{
            // $("#msjAlerLog").html("* "+response['msj']);
            msjAlerta(response['msj']);
        }
    },
    dataUsr: function(key){
        if(leerStorage(keyUser) != null){
            var dataLogin = JSON.parse(atob(leerStorage(keyUser)));
            if(typeof key != 'undefined'){
                return dataLogin[key];
            }else{
                return dataLogin;
            }
        }else{
            return null
        }

    },
    responseSaveToken: function(response){
        console.log(response);
        window.location.reload();
    },
    detallePedido:function(response){
        console.log(response);
        var container = $("<div id='pageDetalle' ></div>");
        var butonBack = $("<div class='butonBackViews'></div>");
        var i_Back  = document.createElement('i');
        i_Back.className="fas fa-chevron-left back";
        i_Back.onclick = function(){
            $("#pageDetalle").animate({
                "opacity" : "0",
                },{
                "complete" : function() {
                    $("#pageDetalle").remove();
                }
            });
        }
        butonBack.append(i_Back);
        var header = $("<div class='header' ></div>").append(butonBack,$("<h1></h1>").text('Pedidos'));
        container.append(header);
        /* validamos que el detalle sea un pedido asignado´para mostrar los estados del pedido */
            if(response['estadoPedido'] != null){
                chatApp.iniChat('containerChat',response['pedidoId']);
                // chatApp.intervalCon('contenedorId',response['pedidoId']);
                //console.log('entro el domici');
                var esP = $("<div class='estadosPedido' ></div>");
                idslec = btoa(JSON.stringify({'pedidoId':response['pedidoId'],'listaEstados':true}));
                var slect = $("<select id='"+idslec+"' ></select>");
                var estados = response['estados'];
                for (var i in estados) {
                    var sleted = "";
                    if(estados[i]['id_estado'] == parseInt(response['estadoPedido'])){
                        sleted = "selected";
                    }
                    if(parseInt(estados[i]['id_estado']) > 2 && parseInt(estados[i]['id_estado']) < 6){
                        var op = $("<option value='"+estados[i]['id_estado']+"' "+sleted+" ></option").text(estados[i]['detalle']);
                        slect.append(op);
                    }
                }
                slect.change(function() {
                    data = JSON.parse(atob(this.id));
                    //console.log(this.value, data);

                    var formData = new FormData();
                    formData.append('sv','CAMBIAR_ESTADO_PEDIDO');
                    formData.append('pedidoId',data['pedidoId']);
                    formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
                    formData.append('estado',parseInt(this.value));
                    callService(formData,'POST',domiApp.responseEstadoPedido,parseInt(this.value));
                });
                esP.append(slect);
                container.append(esP);
            }
        /* Finalizamos los estados del pedido */
        var body = $("<div class='bodyDetalle' ></div>");
        var au = 1;
        var infoCompraUser = {'nombreUser':null,'celUser':null,'domicilioDir':null,'costoDomi':null,'pedidoId':null,'metodo_pago':null,'cuanto_paga':null,'comisionPidoya':null,'is_company':null};
        for (var a in response['rows']) {
            var detalleJson = response['rows'][a];
            if(infoCompraUser['pedidoId'] == null){
                infoCompraUser['pedidoId'] = detalleJson[0]['pedido_id'];
            }
            if(infoCompraUser['metodo_pago'] == null){
                infoCompraUser['metodo_pago'] = detalleJson[0]['metodo_pago'];
            }
            if(infoCompraUser['cuanto_paga'] == null){
                infoCompraUser['cuanto_paga'] = detalleJson[0]['cuanto_paga'];
            }
            if(infoCompraUser['nombreUser'] == null){
                infoCompraUser['nombreUser'] = detalleJson[0]['nombres']+' '+detalleJson[0]['apellidos'];
            }
            if(infoCompraUser['celUser'] == null){
                infoCompraUser['celUser'] = detalleJson[0]['celular']; 
            }
            if(infoCompraUser['domicilioDir'] == null){
                infoCompraUser['domicilioDir'] = detalleJson[0]['direccion_domicilio']; 
            }
            if(infoCompraUser['comisionApp'] == null){
                infoCompraUser['comisionApp'] = detalleJson[0]['comision']; 
            }
            if(detalleJson[0]['is_company'] != null){
                infoCompraUser['is_company'] = detalleJson[0]['is_company']; 
            }
            if(infoCompraUser['costoDomi'] == null){
                var domi = (parseInt(detalleJson[0]['costo_domicilio']) - parseInt(detalleJson[0]['descuento_cupon']));
                infoCompraUser['costoDomi'] = domi; 
            }
            var cajaSucursal = $("<div class='cajaCompraSuc' ></div>");
            var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa']);
            var cajaDetalleCompra = $("<div class='detalle' ></div>");
                cajaDetalleCompra.append($("<div class='tiraGray'></div>").text("Pedido "+au));
            var listaProd = $("<ul></ul>");
            var TotalSucursal = parseInt(detalleJson[0]['pago_usr_app']);
            for (var i = 0; i < detalleJson.length; i++) {
                // TotalSucursal += parseInt(detalleJson[i]['venta_producto']);
                //console.log(detalleJson[i]);
                if(detalleJson[i]['adicionesData'].length > 0){
                    var ulAdiciones = $("<ul></ul>");
                    var  adii = `<b>(Adiciones Prod) Nº ${i+1}</b><div class="secIng" > `;
                    var adicionesData = detalleJson[i]['adicionesData'];
                    for (let index = 0; index < adicionesData.length; index++) {
                        var row = detalleJson[i]['adicionesData'];
                        adii += '- '+adicionesData[index]['nombre_adicion'].toLowerCase()+" - $"+separatorMil(adicionesData[index]['valor'])
                        TotalSucursal += parseInt(adicionesData[index]['valor']);
                        adii += '</div>';
                        var liAdi = $("<li></li>").html(adii);
                        adii='';
                        ulAdiciones.append(liAdi);
                    }
                    var ulIngredientes = $("<ul></ul>");
                    var ingreData = detalleJson[i]['ingredientes'];

                    if(ingreData!='' && ingreData!=null){
                        ingreData = JSON.parse(ingreData);
                        if(ingreData[0].length > 0){
                            for (let index = 0; index < ingreData.length; index++) {
                                const ing = `<b>(Ingrediente) producto Nº ${i+1}</b><br><div class="secIng" > - ${ingreData[index].join("<br> - ")}</div>`
                                var liAdi = $("<li></li>").html(ing);
                                ulIngredientes.append(liAdi);
                            }
                        }
                        var li = $("<li></li>").append('<b>Cantidad '+detalleJson[i]['cantidad']+'</b><br>'+detalleJson[i]['nombre_producto']+" - $"+separatorMil(detalleJson[i]['valor_producto']) ,ulIngredientes,ulAdiciones);
                    }else{
                        var li = $("<li></li>").append('<b>Cantidad '+detalleJson[i]['cantidad']+'</b><br>'+detalleJson[i]['nombre_producto']+" - $"+separatorMil(detalleJson[i]['valor_producto']) ,ulAdiciones);
                    }


                }else{
                    var li = $("<li></li>").html('<b>Cantidad '+detalleJson[i]['cantidad']+'</b><br>'+detalleJson[i]['nombre_producto']+" - $"+separatorMil(detalleJson[i]['valor_producto']));
                    if(detalleJson[i]['is_company'] != null){
                        img='';
                        if(detalleJson[i]['file']!=null){
                            img = `<img src='${urldataApp+"admin/img/productos/"+detalleJson[i]['file']}' class='imgIsComp'>`
                        }
                        var li = $("<li></li>").html('<b>Detalle del pedido </b><br>'+detalleJson[i]['descripcion_producto'].substring(0, 65)+'...'+img);
                    }
                }
                listaProd.append(li);
            }
            var liTotal = $("<li></li>").html("<b>Valor del Pedido: $"+separatorMil(TotalSucursal)+"</b>");
            var liDir = $("<li></li>").text(detalleJson[0]['direccion_mapa']);
            listaProd.append(liDir,liTotal);
            
            cajaDetalleCompra.append(listaProd);
            cajaSucursal.append(nombreEmpresa,cajaDetalleCompra);
            body.append(cajaSucursal);
        au++;
        }
        /*  a continuacion creo el campo con los datos del cliente repitinedo el codigo anterior */
        var cajaUsrData = $("<div class='cajaCompraSuc' ></div>");
        var cajaDetalleUser = $("<div class='detalle' ></div>");
            cajaDetalleUser.append($("<div class='tiraGray'></div>").text("Datos del cliente "));
        var listaDataUsr = $("<ul></ul>");
            var li = $("<li></li>").html("<b>"+infoCompraUser['nombreUser']+"</b>");
            var li2 = $("<li></li>").text(infoCompraUser['celUser']);
            listaDataUsr.append(li,li2);

        cajaDetalleUser.append(listaDataUsr);
        cajaUsrData.append(cajaDetalleUser);

         /*  a continuacion creo el campo con los datos del cliente repitinedo el codigo anterior */

        var cajaDomi = $("<div class='cajaCompraSuc' ></div>");
        // var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa'].toLowerCase());
        var cajaDetalleDomi = $("<div class='detalle' ></div>");
            cajaDetalleDomi.append($("<div class='tiraGray'></div>").text(" Costo total del domicilio:"));
        var listaDataDomi = $("<ul></ul>");
            var li = $("<li></li>").html(`<b><span>$ ${separatorMil(infoCompraUser['costoDomi'])}</span></b>`);
            listaDataDomi.append(li);

        cajaDetalleDomi.append(listaDataDomi);
        cajaDomi.append(cajaDetalleDomi);
        body.append(cajaDomi); 
        
        var totalComision = ( parseInt(TotalSucursal) * parseInt(infoCompraUser['comisionApp']) ) / 100;
        var TotalCompraSinComision = (parseInt(TotalSucursal) - totalComision );

        var label_entregado = " Total Entregado al establecimiento:";
        var label_cobrado = " Total Cobrado al usurario:";
        if(infoCompraUser['is_company'] == null){

            var cajaDomi = $("<div class='cajaCompraSuc' ></div>");
            // var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa'].toLowerCase());
            var cajaDetalleDomi = $("<div class='detalle' ></div>");
                cajaDetalleDomi.append($("<div class='tiraGray'></div>").text(` Porcentaje App [ ${infoCompraUser['comisionApp']}%]`));
            var listaDataDomi = $("<ul></ul>");
                var li = $("<li></li>").html(`<b><span>$ ${separatorMil(totalComision)}</span></b>`);
                listaDataDomi.append(li);
    
            cajaDetalleDomi.append(listaDataDomi);
            cajaDomi.append(cajaDetalleDomi);
            body.append(cajaDomi); 

        }else{
            TotalCompraSinComision = parseInt(TotalSucursal) ;
            label_entregado = ` Total Entregado a ${nameApp}:`;
            
            label_cobrado = " Total Cobrado al establecimiento:";
        }

        /*  a continuacion creo el campo con los datos del cliente repitinedo el codigo anterior */
        var cajaDomi = $("<div class='cajaCompraSuc' ></div>");
        // var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa'].toLowerCase());
        var cajaDetalleDomi = $("<div class='detalle' ></div>");
            cajaDetalleDomi.append($("<div class='tiraGray'></div>").text(label_entregado));
        var listaDataDomi = $("<ul></ul>");
            var li = $("<li></li>").html("<b> <span>$ "+separatorMil(TotalCompraSinComision)+"</span>");
            listaDataDomi.append(li);

        cajaDetalleDomi.append(listaDataDomi);
        cajaDomi.append(cajaDetalleDomi);
        body.append(cajaDomi);

        var cajaDomi = $("<div class='cajaCompraSuc' ></div>");
        // var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa'].toLowerCase());
        var cajaDetalleDomi = $("<div class='detalle' ></div>");
            cajaDetalleDomi.append($("<div class='tiraGray'></div>").text(label_cobrado));
        var listaDataDomi = $("<ul></ul>");
            var li = $("<li></li>").html("<b> <span>$ "+separatorMil(parseInt(infoCompraUser['costoDomi']) + parseInt(TotalSucursal))+"</span>");
            listaDataDomi.append(li);

        cajaDetalleDomi.append(listaDataDomi);
        cajaDomi.append(cajaDetalleDomi);
        body.append(cajaDomi);


        /*img de l icono del chat */
        var imgHistorial = document.createElement('img');
            imgHistorial.src='img/icoComentarios.png';
            imgHistorial.className='btnChat';
            imgHistorial.id = btoa('{ "pedidoId": '+response['pedidoId']+'}');
            imgHistorial.onclick = function(){
                data = JSON.parse(atob(this.id));
                console.log(data.pedidoId);
                domiApp.callChatDomicilios(data.pedidoId);
            }
        var badgeChat = $("<div id='newChat"+response['pedidoId']+"' class='newChat' >0</div>");
        if(response['estadoPedido'] != null){
            body.append(badgeChat,imgHistorial,cajaUsrData);
        }else{
            body.append(cajaUsrData);
        }
        /* insertamos las nueva seccion a la page */
        /*  a continuacion creo el campo con los datos del cliente repitinedo el codigo anterior */
        var cajaDirEntr = $("<div class='cajaCompraSuc' ></div>");
        var cajaDetaDir = $("<div class='detalle' ></div>");
        var tiraGray = $("<div class='tiraGray'></div>");

        var listaDataUsr = $("<ul></ul>");
            var li = $("<li></li>").html("<b>"+infoCompraUser['domicilioDir']+"</b>");
            listaDataUsr.append(li);

        tiraGray.text("Direccion de entrega ");
        cajaDetaDir.append(tiraGray,listaDataUsr);
        cajaDirEntr.append(cajaDetaDir);
        body.append(cajaDirEntr);   
        /* insertamos las nueva seccion a la page */
        var cajaDirEntr3 = $("<div class='cajaCompraSuc' ></div>");
        var cajaDetaDir3 = $("<div class='detalle' ></div>");
        var tiraGray3 = $("<div class='tiraGray'></div>").text("Método de Pago");

        console.log(infoCompraUser);
        var listaDataUsr3 = $("<ul></ul>");
        infoCompraUser['metodo_pago']
        infoCompraUser['cuanto_paga']
            switch(infoCompraUser['metodo_pago']){
                case 'TC':
                var labelmp = "Tarjeta de Crédito";
                break;
                case 'DTF':
                var labelmp = "Datafono";
                break;
                case 'EFE':
                var labelmp = "Efecivo";
                break;
            }
            var li3 = $("<li></li>").html("<b>"+labelmp+"</b>");
            if(infoCompraUser['metodo_pago'] == 'EFE'){
                var li31 = $("<li></li>").html(`Paga con <font style="color:var(--colortema); font-size: 18px;margin-left: 8px;">$ ${separatorMil(infoCompraUser['cuanto_paga'])}</font>`);
                listaDataUsr3.append(li3,li31);
            }else{
                listaDataUsr3.append(li3);
            }

        cajaDetaDir3.append(tiraGray3,listaDataUsr3);
        cajaDirEntr3.append(cajaDetaDir3);
        body.append(cajaDirEntr3);   
        /* insertamos las nueva seccion a la page */

         
        /* insertamos las nueva seccion a la page */

        /* validamos que el detalle sea NO sea un pedido asignado para mostrar el boton de aceptar pedido */
            if(response['estadoPedido'] == null){
                var aceptarPedido = document.createElement('a');
                    aceptarPedido.innerHTML = "Aceptar Pedido";
                    aceptarPedido.id = btoa(JSON.stringify({'pedidoId':infoCompraUser['pedidoId'], 'detalle':1}));
                    aceptarPedido.onclick = function(){
                        var data = JSON.parse(atob(this.id));
                        //console.log(data);
                        var formData = new FormData();
                            formData.append('sv','ACEPTAR_PEDIDOS');
                            formData.append('pedidoId',data['pedidoId']);
                            formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
                            callService(formData,'POST',domiApp.aceptarPedido);
                    }
                
                body.append(aceptarPedido);
            }
        /* Finalizamos la validacion de los estados  */
        

        container.append(body);
        $(".app").append(container);
        $("#pageDetalle").animate({"opacity" : "1"});

    },
    aceptarPedido:function(response){
        clearInterval(timerPedidos);
        //console.log(response);
        msjAlerta(response['msj']);
        $("#pageDetalle").animate({
            "opacity" : "0",
            },{
            "complete" : function() {
                $("#pageDetalle").remove();
            }
        });
        clearInterval(timerPedidos);
        domiApp.CallnuevosPedidos();
        timerPedidos = setInterval(function(){ 
            domiApp.CallnuevosPedidos();
        }, 2500);

    },
    detalleHistorial:function(response){
        //console.log(response);
        var container = $("<div id='pageDetalle' ></div>");
        var butonBack = $("<div class='butonBackViews'></div>");
        var i_Back  = document.createElement('i');
        i_Back.className="fas fa-chevron-left back";
        i_Back.onclick = function(){
            $("#pageDetalle").animate({
                "opacity" : "0",
                },{
                "complete" : function() {
                    $("#pageDetalle").remove();
                }
            });
        }
        butonBack.append(i_Back);
        var header = $("<div class='header' ></div>").append(butonBack,$("<h1></h1>").text('Detalle Historial'));
        container.append(header);
     
        var body = $("<div class='bodyDetalle' ></div>");
        var au = 1;
        var infoCompraUser = {'nombreUser':null,'celUser':null,'domicilioDir':null,'costoDomi':null,'pedidoId':null,'metodo_pago':null,'cuanto_paga':null,'comisionPidoya':null};
        for (var a in response['rows']) {
            var detalleJson = response['rows'][a];
            if(infoCompraUser['pedidoId'] == null){
                infoCompraUser['pedidoId'] = detalleJson[0]['pedido_id'];
            }
            if(infoCompraUser['metodo_pago'] == null){
                infoCompraUser['metodo_pago'] = detalleJson[0]['metodo_pago'];
            }
            if(infoCompraUser['cuanto_paga'] == null){
                infoCompraUser['cuanto_paga'] = detalleJson[0]['cuanto_paga'];
            }
            if(infoCompraUser['nombreUser'] == null){
                infoCompraUser['nombreUser'] = detalleJson[0]['nombres']+' '+detalleJson[0]['apellidos'];
            }
            if(infoCompraUser['celUser'] == null){
                infoCompraUser['celUser'] = detalleJson[0]['celular']; 
            }
            if(infoCompraUser['domicilioDir'] == null){
                infoCompraUser['domicilioDir'] = detalleJson[0]['direccion_domicilio']; 
            }
            if(infoCompraUser['comisionApp'] == null){
                infoCompraUser['comisionApp'] = detalleJson[0]['comision']; 
            }
            if(infoCompraUser['costoDomi'] == null){
                var domi = (parseInt(detalleJson[0]['costo_domicilio']) - parseInt(detalleJson[0]['descuento_cupon']));
                infoCompraUser['costoDomi'] = domi; 
            }
            var cajaSucursal = $("<div class='cajaCompraSuc' ></div>");
            var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa']);
            var cajaDetalleCompra = $("<div class='detalle' ></div>");
                cajaDetalleCompra.append($("<div class='tiraGray'></div>").text("Pedido "+au));
            var listaProd = $("<ul></ul>");
            var TotalSucursal = parseInt(detalleJson[0]['pago_usr_app']);
             for (var i = 0; i < detalleJson.length; i++) {
                // TotalSucursal += parseInt(detalleJson[i]['venta_producto']);
                //console.log(detalleJson[i]);
                if(detalleJson[i]['adicionesData'].length > 0){
                    var ulAdiciones = $("<ul></ul>");
                    var adicionesData = detalleJson[i]['adicionesData'];
                    for(var ad in adicionesData){
                        var liAdi = $("<li></li>").html("<b>(Adición)</b> "+adicionesData[ad]['nombre_adicion'].toLowerCase()+" - $"+separatorMil(adicionesData[ad]['valor']));
                        TotalSucursal += parseInt(adicionesData[ad]['valor']);
                        ulAdiciones.append(liAdi);
                        
                    }
                    var li = $("<li></li>").append(detalleJson[i]['cantidad']+' '+detalleJson[i]['nombre_producto']+" - $"+separatorMil(detalleJson[i]['valor_producto']) ,ulAdiciones);
                }else{
                    var li = $("<li></li>").text(detalleJson[i]['cantidad']+' '+detalleJson[i]['nombre_producto']+" - $"+separatorMil(detalleJson[i]['valor_producto']));
                }
                listaProd.append(li);
            }
            var liTotal = $("<li></li>").html("<b>Costo del Pedido: $"+separatorMil(TotalSucursal)+"</b>");
            var liDir = $("<li></li>").text(detalleJson[0]['direccion_mapa']);
            listaProd.append(liDir,liTotal);
            
            cajaDetalleCompra.append(listaProd);
            cajaSucursal.append(nombreEmpresa,cajaDetalleCompra);
            body.append(cajaSucursal);
        au++;
        }

         /*  a continuacion creo el campo con los datos del cliente repitinedo el codigo anterior */
        var cajaDomi = $("<div class='cajaCompraSuc' ></div>");
        // var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa'].toLowerCase());
        var cajaDetalleDomi = $("<div class='detalle' ></div>");
            cajaDetalleDomi.append($("<div class='tiraGray'></div>").text(" Costo total del domicilio:"));
        var listaDataDomi = $("<ul></ul>");
            var li = $("<li></li>").html("<b> $"+separatorMil(infoCompraUser['costoDomi']));
            listaDataDomi.append(li);

        cajaDetalleDomi.append(listaDataDomi);
        cajaDomi.append(cajaDetalleDomi);
        body.append(cajaDomi);

        var totalComision = ( parseInt(TotalSucursal) * parseInt(infoCompraUser['comisionApp']) ) / 100;
        var TotalCompraSinComision = (parseInt(TotalSucursal) - totalComision );

        var cajaDomi = $("<div class='cajaCompraSuc' ></div>");
        // var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa'].toLowerCase());
        var cajaDetalleDomi = $("<div class='detalle' ></div>");
            cajaDetalleDomi.append($("<div class='tiraGray'></div>").text(` Porcentaje App [ ${infoCompraUser['comisionApp']}%]`));
        var listaDataDomi = $("<ul></ul>");
            var li = $("<li></li>").html(`<b><span>$ ${separatorMil(totalComision)}</span></b>`);
            listaDataDomi.append(li);

        cajaDetalleDomi.append(listaDataDomi);
        cajaDomi.append(cajaDetalleDomi);
        body.append(cajaDomi); 

       /*  a continuacion creo el campo con los datos del cliente repitinedo el codigo anterior */
        var cajaDomi = $("<div class='cajaCompraSuc' ></div>");
        // var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa'].toLowerCase());
        var cajaDetalleDomi = $("<div class='detalle' ></div>");
            cajaDetalleDomi.append($("<div class='tiraGray'></div>").text(" Total Entregado al establecimiento:"));
        var listaDataDomi = $("<ul></ul>");
            var li = $("<li></li>").html("<b> <span>$ "+separatorMil(TotalCompraSinComision)+"</span>");
            listaDataDomi.append(li);

        cajaDetalleDomi.append(listaDataDomi);
        cajaDomi.append(cajaDetalleDomi);
        body.append(cajaDomi);

        var cajaDomi = $("<div class='cajaCompraSuc' ></div>");
        // var nombreEmpresa = $("<h1></h1>").text(response['rows'][a][0]['nameEmpresa'].toLowerCase());
        var cajaDetalleDomi = $("<div class='detalle' ></div>");
            cajaDetalleDomi.append($("<div class='tiraGray'></div>").text(" Total Cobrado al usurario:"));
        var listaDataDomi = $("<ul></ul>");
            var li = $("<li></li>").html("<b> <span>$ "+separatorMil(parseInt(infoCompraUser['costoDomi']) + parseInt(TotalSucursal))+"</span>");
            listaDataDomi.append(li);

        cajaDetalleDomi.append(listaDataDomi);
        cajaDomi.append(cajaDetalleDomi);
        body.append(cajaDomi);

        /*  a continuacion creo el campo con los datos del cliente repitinedo el codigo anterior */
        var cajaUsrData = $("<div class='cajaCompraSuc' ></div>");
        var cajaDetalleUser = $("<div class='detalle' ></div>");
            cajaDetalleUser.append($("<div class='tiraGray'></div>").text("Datos del cliente "));
        var listaDataUsr = $("<ul></ul>");
            var li = $("<li></li>").html("<b>"+infoCompraUser['nombreUser']+"</b>");
            var li2 = $("<li></li>").text(infoCompraUser['celUser']);
            listaDataUsr.append(li,li2);

        cajaDetalleUser.append(listaDataUsr);
        cajaUsrData.append(cajaDetalleUser);
        body.append(cajaUsrData);   
        /* insertamos las nueva seccion a la page */
        /*  a continuacion creo el campo con los datos del cliente repitinedo el codigo anterior */
        var cajaDirEntr = $("<div class='cajaCompraSuc' ></div>");
        var cajaDetaDir = $("<div class='detalle' ></div>");
        var tiraGray = $("<div class='tiraGray'></div>");

        var listaDataUsr = $("<ul></ul>");
            var li = $("<li></li>").text(infoCompraUser['domicilioDir']);
            listaDataUsr.append(li);

        tiraGray.text("Direccion de entrega ");
        cajaDetaDir.append(tiraGray,listaDataUsr);
        cajaDirEntr.append(cajaDetaDir);
        body.append(cajaDirEntr);   
        /* insertamos las nueva seccion a la page */

        var cajaDirEntr3 = $("<div class='cajaCompraSuc' ></div>");
        var cajaDetaDir3 = $("<div class='detalle' ></div>");
        var tiraGray3 = $("<div class='tiraGray'></div>").text("Método de Pago");

        console.log(infoCompraUser);
        var listaDataUsr3 = $("<ul></ul>");
        infoCompraUser['metodo_pago']
        infoCompraUser['cuanto_paga']
            switch(infoCompraUser['metodo_pago']){
                case 'TC':
                var labelmp = "Tarjeta de Crédito";
                break;
                case 'DTF':
                var labelmp = "Datafono";
                break;
                case 'EFE':
                var labelmp = "Efecivo";
                break;
            }
            var li3 = $("<li></li>").html("<b>"+labelmp+"</b>");
            if(infoCompraUser['metodo_pago'] == 'EFE'){
                var li31 = $("<li></li>").text("Paga con $"+separatorMil(infoCompraUser['cuanto_paga']));
                listaDataUsr3.append(li3,li31);
            }else{
                listaDataUsr3.append(li3);
            }

        cajaDetaDir3.append(tiraGray3,listaDataUsr3);
        cajaDirEntr3.append(cajaDetaDir3);
        body.append(cajaDirEntr3);   
        /* insertamos las nueva seccion a la page */

          
        /* insertamos las nueva seccion a la page */

        /* validamos que el detalle sea NO sea un pedido asignado para mostrar el boton de aceptar pedido */
            if(response['estadoPedido'] == null){
                var aceptarPedido = document.createElement('a');
                    aceptarPedido.innerHTML = "Aceptar Pedido";
                    aceptarPedido.id = btoa(JSON.stringify({'pedidoId':infoCompraUser['pedidoId'], 'detalle':1}));
                    aceptarPedido.onclick = function(){
                        var data = JSON.parse(atob(this.id));
                        //console.log(data);
                        var formData = new FormData();
                            formData.append('sv','ACEPTAR_PEDIDOS');
                            formData.append('pedidoId',data['pedidoId']);
                            formData.append('domiciliarioId',domiApp.dataUsr('id_domiciliario'));
                            callService(formData,'POST',domiApp.aceptarPedido);
                    }
                
                body.append(aceptarPedido);
            }
        /* Finalizamos la validacion de los estados  */
        

        container.append(body);
        $(".app").append(container);
        $("#pageDetalle").animate({"opacity" : "1","z-index":6});

    },
    saveToken:function(token,callback){
        if(domiApp.dataUsr() != null ){
            var formData = new FormData();
            formData.append('sv','SAVE_TOKEN');
            formData.append('tokenDevice',token);
            formData.append('usrId',domiApp.dataUsr('id_domiciliario'));
            callService(formData,'POST',(resp)=>{
                resp = JSON.parse(resp);
                if(typeof callback === 'function'){
                    callback(resp);
                }
            });
        }
    },
    closeApp: function(){
        navigator.app.exitApp();
    }
}   