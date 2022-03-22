var chatApp = {
	pedido: null,
	iniChat: function(contenedorId,pedidoId){
		this.pedido = pedidoId;
		// console.log(this.pedido);
        var formData = new FormData();
	    formData.append('sv','CHAT_USR');
	    formData.append('pedidoId',pedidoId);
		callService(formData,'POST',chatApp.chatConstruct,contenedorId);
        chatApp.intervalCon(contenedorId,pedidoId);
	},
	chatConstruct:function(response,contenedorId){
		response = JSON.parse(response);
		if($("#"+contenedorId).length > 0){
			if(response['count'] > 0){
				var bodyChat = $("<div class='chatContainer'></div>");
				for (var i in response['data']) {
						CssMsj = "lft";
					if(response['data'][i]['quien_envia'] == 'LOPIDOYA'){
					var CssMsj = "rght";
					}
					var msjChat = $("<div class='msjChat "+CssMsj+"'></div>").html("<p>"+response['data'][i]['mensaje']+"</p>");
					bodyChat.append(msjChat);
				}
				var cajaForm = $("<div id='cajaForm' ></div>");
				var input = document.createElement("input");
					input.id='msjChat';
					input.name='msjChat';
					input.type='text';
					input.placeholder='Escribe tu mensaje';
					input.onkeypress = function(e){
						evt = e ? e : event;
						tcl = (window.Event) ? evt.which : evt.keyCode;
						if (tcl == 13) {
							if($(this).val() != ''){
								// console.log('send messege enter');
								var vlue = $(this).val().trim();
								chatApp.sendMessege(vlue);
								$(this).val("");
							}
						}
					};
				var btnSave = document.createElement("a");
					btnSave.innerHTML='<i class="fas fa-location-arrow"></i>';
					btnSave.onclick = function(){
						if($("#msjChat").val() != ''){
							// console.log('send messege');
							var vlue = $("#msjChat").val().trim();
							chatApp.sendMessege(vlue);
							$("#msjChat").val("");
						}
					}
				cajaForm.append(input,btnSave);
				$("#"+contenedorId).append(bodyChat,cajaForm);
				bodyChat.animate({scrollTop: bodyChat[0].scrollHeight },0 );
			}else{
				$("#"+contenedorId).append($("<div class='card' ></div>").append($("<div class='card-body' ></div>").text("No tienes ningun chat pendiente")));
			}
		}		
	},
	sendMessege:function(text){
		var formData = new FormData();
	    formData.append('sv','IN_CHAT');
	    formData.append('msj',text);
	    formData.append('pedidoId',chatApp.pedido);
		callService(formData,'POST',chatApp.intervalCon);
	},
	LastChat:function(response,container){
		$(container).empty();
		// console.log(response);
		response = JSON.parse(response);
		var bodyChat = $(container);
		var countSinVisto = 0;
		for (var i in response['data']) {
				CssMsj = "lft";
			if(response['data'][i]['quien_envia'] == 'PIDOYA'){
				var CssMsj = "rght";
			}
			if(response['data'][i]['quien_envia'] == 'PIDOYA-COND'){
				var CssMsj = "rght cond";
			}
			if(response['data'][i]['quien_envia'] == 'CLIENTE' && parseInt(response['data'][i]['visto']) == 0){
				countSinVisto++;
			}
			var msjChat = $("<div class='msjChat "+CssMsj+"'></div>").html("<p>"+response['data'][i]['mensaje']+"</p>");
			bodyChat.append(msjChat);
		}
		$("#newChat"+chatApp.pedido).html(countSinVisto);
		if(parseInt(countSinVisto) > 0 ){
			msjAlerta("Tienes un nuevo mensaje en el chat.");
		}
		if(bodyChat[0]){
			var formData = new FormData();
            formData.append('sv','VISTO_MSJ');
            formData.append('pedidoId',chatApp.pedido);
            callService(formData,'POST');
			bodyChat.animate({scrollTop: bodyChat[0].scrollHeight },0 );
		}
	},
	intervalConversation:false,
	scrolling: false,
	intervalCon: function(){

		var formData = new FormData();
	    formData.append('sv','CHAT_USR');
	    formData.append('pedidoId',chatApp.pedido);
		callService(formData,'POST',chatApp.LastChat,".chatContainer");
		$(".chatContainer").on("scroll",function(e){
			chatApp.scrolling = true;
			clearTimeout($.data(this, 'scrollTimer'));
			$.data(this, 'scrollTimer', setTimeout(function() {
				chatApp.scrolling = false;
			}, 1000));
		});
		if(chatApp.intervalConversation == false){
			chatApp.intervalConversation = setInterval(function(){
				// console.log(chatApp.pedido);
												var formData = new FormData();
											    formData.append('sv','CHAT_USR');
											    formData.append('pedidoId',chatApp.pedido);
												if(!chatApp.scrolling){
													callService(formData,'POST',chatApp.LastChat,".chatContainer");
												}
											}, 5000);
		}
	}

}	
