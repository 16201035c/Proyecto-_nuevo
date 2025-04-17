sap.ui.define(["sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	'sap/m/Text',
	"../js/instascan.min",
	"rendicionER/libs/xlsx",
	"sap/m/Label",
	"sap/m/TextArea",
	"sap/m/ButtonType",
	"sap/ui/core/Core",
	'sap/ui/core/BusyIndicator'
], function (Controller, BaseController, MessageBox, Fragment, Filter, FilterOperator, MessageToast, JSONModel, Dialog, DialogType,
	Button, Text,
	instascan, xlsxjs, Label, TextArea, ButtonType, Core, BusyIndicator) {
	"use strict";

	var contfilasGlob		= 0;
	var scanner 			= null;
	var camara				= null;
	var contQR				= 0;
	var contaBtn			= true;
	var arrayComSubt		= [];
	var contMo				= 0;
	var arrayInf			= [];
	var Device				= "";
	var cont				= 0;
	var validar_tabs		= false;
	var arrSelected 		= [];
	var contadorValidSunat = 0;
	var validacion_centro	= false;//14/07/2022
	var arrayTabla			= [];
	const HostName			= location.hostname.includes("webide") ? "" : "/sap/fiori/rendicioner" ;
	//var DatosComprobantes=[];
	return BaseController.extend("rendicionER.controller.DetalleSolicitudConER", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DetalleSolicitudConER").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var global = this.getModel("Global");
		},

		handleRouteMatched: function () {
			var that = this;
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var SelectedDetalle = ModelProyect.getProperty("/SelectedDetalle");

			this.getDataCentro();

			var oSplitContainer = this.byId("mySplitContainer");

			//oView.byId("list").setSelectedItem(false);
			oView.byId("list").removeSelections(true);

			if (contaBtn === false) {//-----------------------------------CORREGIR CODIGO 
				oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());
			}
			contaBtn = true;	
		
			// oView.byId("mySplitContainer").removeDetailPage();
			// oView.byId("mySplitContainer").removeMasterPage();
			oView.byId("mySplitContainer").setSecondaryContentSize("155px");

			

			var mobile = {
				Android: function () {
					return navigator.userAgent.match(/Android/i);
				},
				BlackBerry: function () {
					return navigator.userAgent.match(/BlackBerry/i);
				},
				iOS: function () {
					return navigator.userAgent.match(/iPhone|iPad|iPod/i);
				},
				Opera: function () {
					return navigator.userAgent.match(/Opera Mini/i);
				},
				Windows: function () {
					return navigator.userAgent.match(/IEMobile/i);
				},
				any: function () {
					return (mobile.Android() || mobile.BlackBerry() || mobile.iOS() || mobile.Opera() || mobile.Windows());
				}
			};

			if (!mobile.any()) {
				var oSplitApp = oView.byId("SplitAppMatestros");
				var detalleOK = oView.byId("NotFound").getId();
				oSplitApp.toDetail(detalleOK);

			} else {
				var oDetalle = oView.byId("detail");
				oDetalle.setShowNavButton(true);
			}

			window.onhashchange = function () {
				if (window.innerDocClick != false) {
					window.innerDocClick = false;
				} else {
					// scanner.stop();
				}
			}

			// console.log(mobile.any()) ;

			// this.limpiar();
		},

		onAfterRendering: function () {
			var vista = this.getView();
			var contadorGlobal = vista.getModel("contadorGlobal").getProperty("/contador");
			var json = [];
			var array2 = [];
			var array5 = [];

			if (contadorGlobal === 1) {
				var that = this;
				var oView = this.getView();
				var ModelProyect = oView.getModel("Proyect");
				
				oView.byId("mySplitContainer").setOrientation("Vertical");

				// if (ModelProyect.getProperty("/SelectedDetalle") == undefined) {

				// }

				// cambios JRodriguez 25/03/2022
				var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");

				if (DataComprobanteConfirmacion.length > 0) {
					ModelProyect.setProperty("/btnEliminarTabla", true);
				}
				//--------------------------------------------

				ModelProyect.setProperty("/ProveedorNoExistente", []);
				contaBtn = true;
				// ModelProyect.setProperty("/eliminar_compro",arrSelected);
				ModelProyect.setProperty("/btnDetIcon", "sap-icon://hide");
				ModelProyect.setProperty("/btnDetType", "Emphasized");
				ModelProyect.setProperty("/datosImputs", array2);
				ModelProyect.setProperty("/deseableporcentaje", true);
				ModelProyect.setProperty("/deseableimporte", false);
				ModelProyect.setProperty("/visibleMovil", false);
				ModelProyect.setProperty("/datosfecha", array5);
				ModelProyect.setProperty("/noGrabada", "0.00");
				ModelProyect.setProperty("/impueDet", "0.00");
				ModelProyect.setProperty("/subTotal", "0.00");
				ModelProyect.setProperty("/subTotalComp", "0.00");
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/visbleExcedente", false);
				//ModelProyect.setProperty("/monedas", "---Seleccionar---");
				

				ModelProyect.setProperty("/seleccion_CECO", "id1");
				ModelProyect.setProperty("/enableCeco", false);

				// -------------Cambios JRodriguez--------------
				ModelProyect.setProperty("/visBtnHeader", true);
				ModelProyect.setProperty("/visBtnLevObs", false);
				ModelProyect.setProperty("/modeList", "None");

				// var miModel = this.getView().getModel("midata");
				var pruebas2 = ModelProyect.getProperty("/beneficiarios");
				var areaAprob = ModelProyect.getProperty("/areaAprob");

				if (pruebas2.includes("Beneficiario: ")) {
					pruebas2.replace("Beneficiario: ", "");
				}

				if (areaAprob) {
					ModelProyect.setProperty("/modeList", "SingleSelectLeft");
					ModelProyect.setProperty("/visBtnHeader", false);
					ModelProyect.setProperty("/visBtnLevObs", true);
					// miModel.setProperty("/botonesTablaPropiedades/btnEdit", false) ;
				}

				ModelProyect.setProperty("/beneficiarios2", pruebas2);

				this.selectMoneda();
			
				this.selectDocIden();
				this.selectBanco();
				this.codSap();
				this.onImportePermitido();
				this.Ruc_beneficiario();
				this.sizeChanged(sap.ui.Device.media.getCurrentRange(sap.ui.Device.media.RANGESETS.SAP_STANDARD));
				cont++;
				vista.getModel("contadorGlobal").setProperty("/contador", 2);
			} else if (contadorGlobal === 0) {
				this.oRouter.navTo("RendicionConER");
				return;
			}
		},
		handleSwitchOrientation: function (oEvent) {
			this.byId("mySplitContainer").setOrientation("Horizontal");

		},

		sizeChanged: function (mParams) {
			var vista = this.getView();
			var tabla = "";
			switch (mParams.name) {
			case "Phone":

				tabla = sap.ui.xmlfragment("rendicionER.fragments.TablaUI", this);
				vista.byId("idTabDesglose").addContent(tabla);
				Device = "Cel";

				break;

			case "Tablet":

				tabla = sap.ui.xmlfragment("rendicionER.fragments.TablaUI", this);
				vista.byId("idTabDesglose").addContent(tabla);

				Device = "Cel";

				break;

			case "Desktop":

				tabla = sap.ui.xmlfragment("rendicionER.fragments.TablaUI", this);
				vista.byId("idTabDesglose").addContent(tabla);

				Device = "Esc";

				break;
				

			}
		},

		Ruc_beneficiario: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_GET_RUCSet"; //
			// jQuery.ajax({
			// 	type: "GET",
			// 	cache: false,
			// 	headers: {
			// 		"Accept": "application/json"
			// 	},
			// 	contentType: "application/json",
			// 	url: url,
			// 	async: true,
			// 	success: function (data, textStatus, jqXHR) {
			// 		var datos = data.d.results[0];
			// 		ModelProyect.setProperty("/RUC_BENE", datos.RUC);
			// 	},
			// 	error: function () {
			// 		MessageBox.error("Ocurrio un error al obtener los datos");
			// 	}
			// });
		},

		changeMotivo: function () {
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var validaciones				= "";
			var numero2 					= 50;
			var Glosa						= oView.byId("idMotivo").getValue();
			var tipoNif 					= ModelProyect.getProperty("/tipoNif");
			var ruc 						= ModelProyect.getProperty("/ruc");
			var Motivo						= ModelProyect.getProperty("/Glosa");
			var razonSocial 				= ModelProyect.getProperty("/razonSocial");
			var monedas 					= ModelProyect.getProperty("/monedas");
			var seleccion					= ModelProyect.getProperty("/selecPress");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			
			if (Glosa.length > numero2) {
				validaciones = Glosa.slice(0, numero2);
				oView.byId("idMotivo").setValue(validaciones);

			}
			DataComprobanteConfirmacion.forEach(function (ITEMS) {
				if (ITEMS.keySeg === seleccion.keySeg) {//21/07/2022
					// ITEMS.RUC			= ruc ;                      
					ITEMS.RAZON_SOCIAL = razonSocial;
					ITEMS.WAERS = monedas;
					ITEMS.GLOSA = Motivo;
					ITEMS.PRUEBA_GLOSA=Motivo;
					ITEMS.validacion_guardado= false;//30/06/22
				}

			});
			
			ModelProyect.refresh(true);

		},
		OnPressComentarios : function (oEvent){
			var vista			= this.getView();
			var ModelProyect	= vista.getModel("Proyect");	
			var that			= this;
			//var oBindingContext = oEvent.getSource().getBindingContext("Proyect");
			// var model			= oBindingContext.getModel();
			// var sPath			= oBindingContext.getPath();
			// var seleccion		= model.getProperty(sPath);
			var indiceComp		= 0;
			var seleccion					=ModelProyect.getProperty("/selecPress");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			
			if (seleccion.validaComentario === undefined || seleccion.validaComentario === false) {
				
				seleccion.validaComentario = true;
				sap.ui.core.BusyIndicator.show(0);
				// var datos = {
				// 	  "FLAG": "",
				// 	  "ZET_HISTORIAL_RCHSet": [{
				// 	      "COMPROBANTE": seleccion.COMPROBANTE,
				// 	      "RUC": seleccion.RUC,
				// 	      "POSIC": "",
				// 	      "COD_SAP": seleccion.COD_SAP,
				// 	      "FECHA_ENV": "",
				// 	      "NROD0": "",
				// 	      "COD_REPO": "",
				// 	      "COD_REEM": "",
				// 	      "DOC_PAGO": "",
				// 	      "TIPO_REND": "",
				// 	      "CONCPT_RCH": "",
				// 	      "RESPBL_RCH": "",
				// 	      "NIVEL_RCH": ""
				// 	  }]
				// };

				// $.ajax({
				// 	url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
					
				// 	type: "GET",
				// 	headers: {
				// 		"x-CSRF-Token": "Fetch"
				// 	}
				// }).always(function (data, status, response) {
				// 	var token = response.getResponseHeader("x-csrf-token");
				// 	$.ajax({
				// 		url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_HISTORIAL_RCH_CABSet",
				// 		method: "POST",
				// 		headers: {
				// 			"x-CSRF-Token": token
				// 		},
				// 		async: true,
				// 		contentType: "application/json",
				// 		dataType: "json",
				// 		data: JSON.stringify(datos),
				// 	}).always(async function (data, status, response) {
						
				// 		console.log(data);
						
				// 		var datos = data.d.ZET_HISTORIAL_RCHSet.results;
						
				// 		if (datos && datos.length > 0) {
							
				// 			DataComprobanteConfirmacion.forEach(function (items, inde1) {
				// 				if (items.keySeg === seleccion.keySeg) {//21/07/2022
				// 					indiceComp = inde1;
				// 					var arrayLogCom = [];
				// 					datos.forEach(function (items2, indeDes) {
										
				// 						var logComent = {
				// 							POSIC		:items2.POSIC,// fecha 28/06/2022 cambios 
				// 							COMPROBANTE	: items2.COMPROBANTE,
				// 							CONCPT_RCH	: items2.CONCPT_RCH,
				// 							RESPBL_RCH	: items2.RESPBL_RCH,
				// 							NIVEL_RCH	: items2.NIVEL_RCH
				// 						}
										
				// 						logComent.FECHA_ENV = items2.FECHA_ENV.substring(6,8)+"/"+items2.FECHA_ENV.substring(4,6)+"/"+items2.FECHA_ENV.substring(0,4);
										
									
										
				// 						arrayLogCom.push(logComent);
				// 					});
				// 					items.logComentarios = arrayLogCom;
				// 				}
				// 			});
							
				// 			ModelProyect.setProperty("/datos_logRechazo", DataComprobanteConfirmacion[indiceComp].logComentarios);
							
				// 		}else{
				// 		ModelProyect.setProperty("/datos_logRechazo",[]);	
				// 		}
						 
				// 		sap.ui.core.BusyIndicator.hide();
						
				// 	});
				// });
			}else{
				
				sap.ui.core.BusyIndicator.show(0);
				var estado_comprobante =false;
				DataComprobanteConfirmacion.forEach(function (items, inde1) {
					
					if (items.keySeg === seleccion.keySeg) {//21/07/2022
					if (items.COD_EST_COMP === "CR"){// ES DIFERENTE AL COMPROBANTE RECHAZADO 
					
						indiceComp = inde1;
						estado_comprobante = true;
					}
					}
				});
				
				if (estado_comprobante === true){
				if(DataComprobanteConfirmacion[indiceComp].logComentarios !== undefined && DataComprobanteConfirmacion[indiceComp].logComentarios.length > 0){
					ModelProyect.setProperty("/datos_logRechazo", DataComprobanteConfirmacion[indiceComp].logComentarios);
					
				}
				}else{
					ModelProyect.setProperty("/datos_logRechazo",[]);
				}
				
				ModelProyect.refresh(true);
				sap.ui.core.BusyIndicator.hide();
			}
		},
		fnRegistroComprobante: function (oEvent) {// CAMBIOS 04/06/2022
			var that						= this;
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var value						= oEvent.getSource().getValue();
			var datosprueba 				= value;
			var seleccion					= ModelProyect.getProperty("/selecPress");
			var comprobante 				= oView.byId("sRegistroComprobante").getValue();
			var DataComprobanteConfirmacion	=ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var valor						= datosprueba.substring(6, 15); // CAMBIOS 19/08/2022
			var convertircomprobante		="";
			var serie                       = datosprueba.substring(0,5);
			var formateo					= valor.replaceAll("_", "");
			var formateo1					= serie.replaceAll("_", "");
			var Key_comprobante 			= ModelProyect.getProperty("/Key_comprobante");
			
			//padStart agregra digitos a la izquierda
			if (formateo.length < 9 || formateo1.length < 5)  {
				
				var valores1 = formateo.padStart(9, "0");//01/08/2022
				var valores2 = formateo1.padStart(5, "0");
				var valores = valores2 + "-" + valores1;
				
				convertircomprobante = valores.toUpperCase();
				oView.byId("sRegistroComprobante").setValue(convertircomprobante);
				ModelProyect.refresh(true);
			} else {
				
				if(Key_comprobante !== undefined){
					if(Key_comprobante === "KR"){
						if(formateo1.substring(0 , 1) !== "0"){
							var formatoSerie = formateo1.replaceAll(formateo1.substring(0 , 1) , "0");
							var formatoComprobante = formatoSerie + "-" + value.substring(6,15);
							value = formatoComprobante;
							
						}
						
						
					}
					
				}
				
				convertircomprobante =value.toUpperCase();
				oView.byId("sRegistroComprobante").setValue(convertircomprobante);
				ModelProyect.setProperty("/codigoregistrado", convertircomprobante);
				ModelProyect.refresh(true);
			}
			
			DataComprobanteConfirmacion.forEach(function(obj){
				if(obj.keySeg ===  seleccion.keySeg){//21/07/2022
				obj.COMPROBANTE1 = convertircomprobante;
				obj.VALIDAR_DATOS = true;
				
				//obj.COMPROBANTE_PRUEBA = convertircomprobante;// comentado por mientras 
			}
			
			});
			
		},
	
		changeFactura: function () {
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var seleccion					= ModelProyect.getProperty("/selecPress");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var idReferenciaFact			= oView.byId("idFactura").getValue();
			var valor						= idReferenciaFact.substring(6, 13);
			var referencia_prueba			="";//cambio en 23062022
			var serie                       = idReferenciaFact.substring(0,5);
			var formateo1					= serie.replaceAll("_", "");
			var formateo					= valor.replaceAll("_", "");
			
			if (formateo.length < 9 || formateo1.length < 5) {
			
				var valores1 = formateo.padStart(9, "0");//01/08/2022
				var valores2 = formateo1.padStart(5 , "0");
				var valores = valores2 + "-" + valores1;
				referencia_prueba = valores;
			} else {

				referencia_prueba = idReferenciaFact;
			}
			
			DataComprobanteConfirmacion.forEach(function (ITEMS) {
				if (ITEMS.keySeg === seleccion.keySeg) {//21/07/2022
					oView.byId("idFactura").setValue(referencia_prueba);
					ITEMS.REF_FACTURA = referencia_prueba;
					ITEMS.validacion_guardado= false;

				}

			});
		},
		changeNroDoc: function () {//cambio de 09/06/2022
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var seleccion					= ModelProyect.getProperty("/selecPress");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var nroDoc						= ModelProyect.getProperty("/ruc");
			var idRuc						= oView.byId("idRuc").getValue();
			var numero1 					= 11;
			var numero2 					= 8;
			var validaciones				= "";

			var tipoNif = ModelProyect.getProperty("/tipoNif");
			DataComprobanteConfirmacion.forEach(function(items){
			if(seleccion.keySeg === items.keySeg){
				items.RUC_PRUEBA = idRuc;//27/06/2022
				items.validacion_guardado= false;
				items.VALIDAR_DATOS = true; //01/09/2022 
			}	
				
			});
			
			if (tipoNif === "RUC" || tipoNif === "DEXT") {//24/07/2022
				if (idRuc.length > numero1) {
					validaciones = idRuc.slice(0, numero1);
					oView.byId("idRuc").setValue(validaciones);

				}
			} else {
				if (idRuc.length > numero2) {
					validaciones = idRuc.slice(0, numero2);
					oView.byId("idRuc").setValue(validaciones);

				}
			}
		
			

		},
		// changeTipoDoc: function (oEvent) {
		// 	var oView						= this.getView();
		// 	var ModelProyect				= oView.getModel("Proyect")
		// 	var tipoNif 					= ModelProyect.getProperty("/tipoNif");
		// 	var seleccion					= ModelProyect.getProperty("/selecPress");
		// 	var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			
		// 	if((seleccion.COD_TIPO_COMP !== "SK" || seleccion.COD_TIPO_COMP !== "PM") && tipoNif === "DNI"){
		// 	MessageBox.warning("No se puede seleccionar el DNI para el tipo de comprobante seleccionado.");
		// 	return;	
		// 	}else if(seleccion.COD_TIPO_COMP !== "KX" && tipoNif === "DEXT"){
		// 	MessageBox.warning("No se puede seleccionar el DEXT para el tipo de comprobante seleccionado.");
		// 	return;		
		// 	}else if((seleccion.COD_TIPO_COMP === "SK" || seleccion.COD_TIPO_COMP === "PM" || seleccion.COD_TIPO_COMP === "KX" ) && tipoNif === "RUC"){
		// 	MessageBox.warning("No se puede seleccionar el RUC para el tipo de comprobante seleccionado.");	
		// 	return;
		// 	}
			
		// 	if (tipoNif === "RUC") {

		// 		ModelProyect.setProperty("/visbleCampoRUC", true);
		// 		// ModelProyect.setProperty("/visbleCampoDNI",false);
		// 		ModelProyect.setProperty("/estadoMone", "None");
		// 		ModelProyect.setProperty("/estadoglos", "None");
		// 		ModelProyect.setProperty("/ruc", "");
		// 		ModelProyect.setProperty("/visbleValidar", true);
		// 		ModelProyect.setProperty("/razonSocial", "");
		// 		//ModelProyect.setProperty("/monedas", "---Seleccionar---");
		// 		ModelProyect.setProperty("/Glosa", "");

		// 	} else {

		// 		ModelProyect.setProperty("/estadoMone", "None");
		// 		ModelProyect.setProperty("/estadoglos", "None");
		// 		ModelProyect.setProperty("/visbleCampoRUC", true);
		// 		ModelProyect.setProperty("/visbleValidar", true);
		// 		ModelProyect.setProperty("/ruc", "");
		// 		ModelProyect.setProperty("/razonSocial", "");
		// 		//ModelProyect.setProperty("/monedas", "---Seleccionar---");
		// 		ModelProyect.setProperty("/Glosa", "");

		// 	}
			
		// 	DataComprobanteConfirmacion.forEach(function(items){
		// 	if(seleccion.keySeg === items.keySeg){//21/07/2022
		// 		items.RUC_COPIA1 = tipoNif;
		// 		items.validacion_guardado= false;
		// 	}	
				
		// 	});
			

		// },
		
		changeTipoDoc: function (oEvent) {//12/08/2022
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect")
			var tipoNif 					= ModelProyect.getProperty("/tipoNif");
			var seleccion					= ModelProyect.getProperty("/selecPress");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var Key_comprobante             =ModelProyect.getProperty("/Key_comprobante");
			var validacion_clase			= false;
			
			ModelProyect.setProperty("/Validacion_Clase" , validacion_clase);
			
			if((Key_comprobante !== "PM" && tipoNif === "DNI") && Key_comprobante !== "SK"){

			MessageBox.warning("No se puede seleccionar el DNI para el tipo de comprobante seleccionado.");
			validacion_clase = false;
			ModelProyect.setProperty("/Validacion_Clase" , validacion_clase);
			return;	
			}else if(Key_comprobante !== "KX" && tipoNif === "DEXT"){
			MessageBox.warning("No se puede seleccionar el DEXT para el tipo de comprobante seleccionado.");
			validacion_clase = true;
			ModelProyect.setProperty("/Validacion_Clase" , validacion_clase);
			return;		
			}else if((Key_comprobante === "PM" || Key_comprobante === "KX" ) && tipoNif === "RUC"){
			MessageBox.warning("No se puede seleccionar el RUC para el tipo de comprobante seleccionado.");
			validacion_clase = false;
			ModelProyect.setProperty("/Validacion_Clase" , validacion_clase);
			return;
			}
			
			if (tipoNif == "RUC") {

				ModelProyect.setProperty("/visbleCampoRUC", true);
				// ModelProyect.setProperty("/visbleCampoDNI",false);
				ModelProyect.setProperty("/estadoMone", "None");
				ModelProyect.setProperty("/estadoglos", "None");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/razonSocial", "");
				//ModelProyect.setProperty("/monedas", "---Seleccionar---");
				ModelProyect.setProperty("/Glosa", "");

			} else {

				ModelProyect.setProperty("/estadoMone", "None");
				ModelProyect.setProperty("/estadoglos", "None");
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/razonSocial", "");
			//	ModelProyect.setProperty("/monedas", "---Seleccionar---");
				ModelProyect.setProperty("/Glosa", "");

			}
			DataComprobanteConfirmacion.forEach(function(items){
			if(seleccion.keySeg === items.keySeg){//21/07/2022
				items.RUC_COPIA1 = tipoNif;
			}	
				
			});

		},

		codSap: function () {
			var that = this;
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_PROV_DIVERSOSSet";
			// jQuery.ajax({
			// 	type: "GET",
			// 	cache: false,
			// 	headers: {
			// 		"Accept": "application/json"
			// 	},
			// 	contentType: "application/json",
			// 	url: url,
			// 	async: true,
			// 	success: function (data, textStatus, jqXHR) {
			// 		var datos = data.d.results;
			// 		ModelProyect.setProperty("/codigoGenerico", datos[0].LIFNR);
			// 	},
			// 	error: function () {
			// 		MessageBox.error("Ocurrio un error al obtener los datos de codigo generico");
			// 	}
			// });

		},
		onGuardarProveedor: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var NroRuc = ModelProyect.getProperty("/NroRuc");
			var razonSocial = ModelProyect.getProperty("/razonSocialP");
			var poblacion = ModelProyect.getProperty("/poblacion");
			var tipoNif = ModelProyect.getProperty("/tipoNif");
			var that = this;
			//12345698745
			//09678961, dni
			var tipo = "";
			if (tipoNif === "RUC") {
				tipo = "6";
			} else {
				tipo = "1";
			}

			// var datos = {
			// 	"FLAG": "X",
			// 	"ZET_UPD_PROV_DIVERSOSSet": [{
			// 		"RUC": NroRuc,
			// 		"NOMBRE": razonSocial,
			// 		"LUGAR": poblacion,
			// 		"STCDT": tipo,
			// 		"MENSAJE": ""
			// 	}]
			// }
			// $.ajax({
			// 	url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",

			// 	type: "GET",
			// 	headers: {
			// 		"x-CSRF-Token": "Fetch"
			// 	}
			// }).always(function (data, status, response) {
			// 	var token = response.getResponseHeader("x-csrf-token");
			// 	$.ajax({
			// 		url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_UPD_PROV_DIVERSOS_CABSet",
			// 		method: "POST",
			// 		headers: {
			// 			"x-CSRF-Token": token
			// 		},
			// 		async: true,
			// 		contentType: "application/json",
			// 		dataType: "json",
			// 		data: JSON.stringify(datos),
			// 	}).always(function (data, status, response) {
			// 		var datos = data.d.results;
			// 		MessageBox.information("Se guardo con éxito.", {
			// 			actions: ["OK", ],
			// 			onClose: function (sAction) {
			// 				if (sAction === "OK") {
			// 					that.Nuevo1.close();
			// 					ModelProyect.setProperty("/razonSocial", razonSocial);
			// 					ModelProyect.setProperty("/visbleCampo", true);
			// 					ModelProyect.setProperty("/NroRuc", "");
			// 					ModelProyect.setProperty("/razonSocialP", "");
			// 					ModelProyect.setProperty("/poblacion", "");
			// 				}
			// 			}
			// 		});

			// 	});
			// });
		},

		onCanlProveedor: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			ModelProyect.setProperty("/NroRuc", "");
			ModelProyect.setProperty("/razonSocial", "");
			ModelProyect.setProperty("/poblacion", "");

			this.Nuevo1.close();
		},

		onImportePermitido: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_IMP_LIM_MOVSet";
			// jQuery.ajax({
			// 	type: "GET",
			// 	cache: false,
			// 	headers: {
			// 		"Accept": "application/json"
			// 	},
			// 	contentType: "application/json",
			// 	url: url,
			// 	async: true,
			// 	success: function (data, textStatus, jqXHR) {
			// 		var datos = data.d.results;
			// 		ModelProyect.setProperty("/ImportesPermitos", datos[0].IMP_LMOV);
			// 	},
			// 	error: function () {
			// 		MessageBox.error("Ocurrio un error al obtener los datos de codigo generico");
			// 	}
			// });
		},

		onAceptaMov: function () {
			var oView = this.getView();
			var that = this;
			var ModelProyect = oView.getModel("Proyect");
			var datosfecha = ModelProyect.getProperty("/datosfecha");
			var ImportePermito = ModelProyect.getProperty("/ImportePermito");
			var Excedentes = ModelProyect.getProperty("/Excedentes");
			var fecha = ModelProyect.getProperty("/fecha");
			var ImportesPermitos = ModelProyect.getProperty("/ImportesPermitos");
			var jsonData = ModelProyect.getProperty("/jsonData");
			var seleccionMov = ModelProyect.getProperty("/seleccionMov");
			var sumatoria = 0;
			var sumatoria1 = 0;
			var validaciones01 = false;
			var valor = false;
			var mensaje = "";
			var contad = 0;
			var excedentes = "";
			var datosMovilidad = ModelProyect.getProperty("/datosMovilidad");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var totalmovilidad = 0;
			var resta = 0;
			var conta02 = 0;
			var formato = fecha.substring(6, 8) + "/" + fecha.substring(4, 6) + "/" + fecha.substring(0, 4);
			// var ImportesP=parseFloat(ImportesPermitos);
			var Importetotal = ModelProyect.getProperty("/Importetotal");
			var DP1 = sap.ui.getCore().byId("DP1").getValue();
			var Importetotal01 = Importetotal.replaceAll(",", "");
			var ImportesP01 = ImportesPermitos.replaceAll(",", "");
			var format01 = DP1.substring(6, 8) + "/" + DP1.substring(4, 6) + "/" + DP1.substring(0, 4);

			//20220211

			DataComprobanteConfirmacion.forEach(function (items2, ix) {
				if (items2.COMPROBANTE === seleccionMov.COMPROBANTE) {
					indiced = ix;
					items2.desglose.forEach(function (items, index) {
						if (items.POSIC === seleccionMov.POSIC) {
							indicedes = index;
							items.movilidad.forEach(function (obj) {
								if (obj.FECHA === formato) {
									validaciones01 = true;
								}
							});
						}
					});
				}
			});

			if (validaciones01) {
				mensaje = "Existe una movilidad con la fecha .";
				MessageBox.warning(mensaje, {
					actions: ["OK"],
					onClose: function (sAction) {}
				});
				return;
			}

			if (parseFloat(ImportePermito) > parseFloat(ImportesPermitos)) {
				resta = (parseFloat(Importetotal01) - parseFloat(ImportesP01)).toFixed(2);
			} else if (parseFloat(ImportePermito) <= parseFloat(ImportesPermitos)) {
				ImportesP01 = ImportePermito;
				resta = "0.00";
			}

			contMo++;

			var datMov = {
				COMPROBANTE: seleccionMov.COMPROBANTE,
				POSICDESGLO: seleccionMov.POSIC,
				POSICMOV: (jsonData[indicedes].movilidad.length + 1).toString(),
				FECHA: format01,
				IMP_PERM: ImportesP01,
				IMP_EXED: resta
			}

			//datosMovilidad.push(datMov);
			DataComprobanteConfirmacion[indiced].desglose[indicedes].movilidad.push(datMov);

			ModelProyect.setProperty("/datosMovilidad", DataComprobanteConfirmacion[indiced].desglose[indicedes].movilidad);

			DataComprobanteConfirmacion[indiced].desglose[indicedes].movilidad.forEach(function (rs) {
				sumatoria += parseFloat(rs.IMP_PERM);
				sumatoria1 += parseFloat(rs.IMP_EXED);
			});

			// datosMovilidad.forEach(function(mov){
			// sumatoria	+= parseFloat(mov.IMP_PERM);
			// sumatoria1	+= parseFloat(mov.IMP_EXED);	
			// });

			that.abrirfrag.close();

			ModelProyect.setProperty("/ImporteP", sumatoria.toFixed(2));
			ModelProyect.setProperty("/ImporteE", sumatoria1.toFixed(2));
			ModelProyect.setProperty("/fecha", "");
			ModelProyect.setProperty("/ImportePermito", "");
			ModelProyect.setProperty("/Excedentes", "");
			ModelProyect.refresh(true);
		},
		fnChangeFecha_mov: function (oEvent) { // CRomero 03/11/2022
			var that						= this;
			var oView						= this.getView();
			var valores_mov 				= oEvent.getParameters().value;
			var ModelProyect				= oView.getModel("Proyect");
			var validaciones01				= false;
			var indicedes					= 0;
			var indiced 					= 0;
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var seleccionMov				= ModelProyect.getProperty("/seleccionMov");
			var FECHA						= sap.ui.getCore().byId("fechaMovi").getValue();
			var mensaje 					= "";
			var formato 					= FECHA.substring(6, 8) + "/" + FECHA.substring(4, 6) + "/" + FECHA.substring(0, 4);
			var contadores_01				= 0;
			var datos_selecciones			= ModelProyect.getProperty("/datos_selecciones");//21/07/2022
			var RegExPattern				= /^(?:(?:(?:0?[1-9]|1\d|2[0-8])[/](?:0?[1-9]|1[0-2])|(?:29|30)[/](?:0?[13-9]|1[0-2])|31[/](?:0?[13578]|1[02]))[/](?:0{2,3}[1-9]|0{1,2}[1-9]\d|0?[1-9]\d{2}|[1-9]\d{3})|29[/]0?2[/](?:\d{1,2}(?:0[48]|[2468][048]|[13579][26])|(?:0?[48]|[13579][26]|[2468][048])00))$/;
			
			
			ModelProyect.setProperty("/fecha_se", FECHA);
			
			if ((valores_mov.match(RegExPattern)) && (valores_mov != '')) {
				
				DataComprobanteConfirmacion.forEach(function (items2, ix) {
				if (items2.keySeg === datos_selecciones.keySeg) {//21/07/2022
					indiced = ix;
					items2.desglose.forEach(function (items, index) {
						if (items.POSIC === seleccionMov.POSIC) {
							indicedes = index;
							items.movilidad.forEach(function (obj, i) {
								if (obj.POSICMOV === (i + 1).toString()) {
									if (obj.FECHA === valores_mov) {
										// validaciones01 = true;
										contadores_01++;
									}
								}
							});
						}
					});
				}
			});	
			
			
			}else{
				
				MessageBox.error("Formato de fecha incorrecta, el formato debe ser DD/MM/YYYY.");
				
				return;
			}
			
		},

		onCanMov: function () {
			var that = this;
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			this.abrirfrag.close()
			ModelProyect.setProperty("/fecha", "");
			ModelProyect.setProperty("/ImportePermito", "");
			ModelProyect.setProperty("/Excedentes", "");

		},

		onBorrarMov: function (oArg) {
			var that = this;
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var datosMovilidad01 = ModelProyect.getProperty("/datosMovilidad");
			var deleteRecord = oArg.getSource().oPropagatedProperties.oBindingContexts.Proyect.sPath;
			var datos = ModelProyect.getProperty(deleteRecord);
			var subTotal = ModelProyect.getProperty("/subTotal");
			var noGrabada = ModelProyect.getProperty("/noGrabada");
			var impueDet = ModelProyect.getProperty("/impueDet");
			var subTotalComp = ModelProyect.getProperty("/subTotalComp");
			var Importe_total = ModelProyect.getProperty("/Importe_total");
			var totalmov = 0;

			for (var i = 0; i < datosMovilidad01.length; i++) {
				if (datosMovilidad01[i] === datos) {
					datosMovilidad01.splice(i, 1); //removing 1 record from i th index.

					ModelProyect.refresh(true);
					if (Importe_total !== undefined || parseFloat(Importe_total) > 0) {
						totalmov = parseFloat(Importe_total) - parseFloat(datos.impTotalMov);
						//items_06.totalmov =totalmov;
						if (isNaN(totalmov) || totalmov === "0") {// CRomero 03/11/2022
							totalmov = "0.00";
						}
						ModelProyect.setProperty("/Importe_total", totalmov.toFixed(2));
					}
				}
			}

			datosMovilidad01.forEach(function (objeto, index) {
				if (objeto.POSICMOV !== index + 1) {
					objeto.POSICMOV = index + 1
				}
			});
			
			ModelProyect.refresh(true);

		},

		onSeleccionGastos: function (oEvent) {
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var datosGastos 				= ModelProyect.getProperty("/datosGastos");
			var seleccion					= oEvent.getSource().oParent.oBindingContexts.Proyect.sPath;
			var seleGatos					= ModelProyect.getProperty(seleccion);
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var datosGlose					= "";
			var datosGastos 				= ModelProyect.getProperty("/datosGastos");
			var jsonData					= ModelProyect.getProperty("/jsonData");
			var validacionGastos			= false;
			var indice						= "";
			var datos_selecciones			=ModelProyect.getProperty("/datos_selecciones");//26/07/2022

				DataComprobanteConfirmacion.forEach(function (xs) {
				if (xs.keySeg === datos_selecciones.keySeg) {//21/07/2022
					xs.validacion_guardado= false;
					xs.desglose.forEach(function (items, index) {
						if (items.POSIC === (index + 1).toString()) {
							
							
							items.NUEVO_GASTOS = items.COD_CONT;// NUEVO 04/06/22
							if(items.ANTIGUO_GASTO === undefined){
							items.ANTIGUO_GASTO = items.COD_CONT;
							
							}
							if(items.ANTIGUO_GASTO !== items.COD_CONT ){	
							items.ANTIGUO_GASTO = items.ANTIGUO_GASTO;
							
							}
							
							// if (xs.COD_TIPO_COMP === "PM") {

							// 	if (seleGatos.COD_CONT === "151") {
							// 		items.validaciones1 = true;
							// 		items.validacionBase = false;
							// 		items.validacionInafecto = false;
							// 		items.validacionIndicador = false;
							// 		items.IND_IMP = "C0";
							// 		items.enableImputa = true;

							// 	} else {
							// 		items.validaciones1 = false; //movilidad
							// 		items.validacionIndicador = true;
							// 		// items.IND_IMP				="---Seleccionar--";
							// 		items.validacionBase = true;
							// 		items.validacionInafecto = true;
							// 		items.enableImputa = true;
							// 	}

							// } else if (xs.COD_TIPO_COMP === "KH") { //agregado por claudia
							// 	items.validaciones1 = false;
							// 	items.validacionBase = false;
							// 	items.validacionInafecto = true;
							// 	items.validacionIndicador = false;
							// 	// items.IND_IMP = "C0";
							// 	items.enableImputa = true;
							// } else if (xs.COD_TIPO_COMP === "KI") { //agregado por claudia  
							// 	items.validaciones1 = false;
							// 	items.validacionBase = true;
							// 	items.validacionInafecto = true;
							// 	items.validacionIndicador = false;
							// 	// items.IND_IMP = "C4";
							// 	items.enableImputa = true;
							// } else {

							// 	if (seleGatos.COD_CONT === "151") {
							// 		items.validaciones1 = false;
							// 		items.enableImputa = true;
							// 		items.validacionIndicador = true;
							// 		// items.IND_IMP				="---Seleccionar--";
							// 		items.validacionBase = false;
							// 		items.validacionInafecto = true;

							// 	} else {
							// 		items.validaciones1 = false;
							// 		items.validacionIndicador = true;
							// 		items.enableImputa = true;
							// 		// items.IND_IMP				="---Seleccionar--";
							// 		items.validacionBase = true;
							// 		items.validacionInafecto = true;
							// 	}

							// }

						}
					});
				}
			});

			ModelProyect.refresh(true);

		},

	
		onGuardar_mov: function (oEvent) {// CRomero 03/11/2022
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var ImporteP					= ModelProyect.getProperty("/ImporteP");
			var ImporteE					= ModelProyect.getProperty("/ImporteE");
			var Importe_total				= ModelProyect.getProperty("/Importe_total");
			var seleccionMov				= ModelProyect.getProperty("/seleccionMov");
			var datosMovilidad				= ModelProyect.getProperty("/datosMovilidad");
			var IGV 						= ModelProyect.getProperty("/IGV");
			var totalmovilidad				= 0;
			var valor						= false;
			var impuestos					= 0;
			var impuestoVenta				= 0;
			var base_mov					= 0;
			var inafecto_mov				= 0;
			var jsonData					= ModelProyect.getProperty("/jsonData");
			var that						= this;
			var acumulador_mov				= 0;
			var resta_saldo_mov 			= 0;
			var importe_Solic				= ModelProyect.getProperty("/importe")
			var contdor_mov 				= 0;
			var mensaje 					= "";
			var mensaje_imp 				= "";
			var datos_movi					= "";
			var indice_data 				= "";
			var indice_desglo				= "";
			var excedente					= "";
			var permitido_mov				= "";
			var impo_total_mov				= "";
			var posici						= "";
			var validar_monto				= false;
			var importe_movilidad			= 0;
			var selecPress					= ModelProyect.getProperty("/selecPress");
			var ImportesPermitos			= ModelProyect.getProperty("/ImportesPermitos");
			var Validacion_importe  		=ModelProyect.getProperty("/Validacion_importe");
			var contador_dupliaco			=0;
			var importe_permi				=0;
			var datos_selecciones			= ModelProyect.getProperty("/datos_selecciones");//21/07/2022
			var duplicadosFecha				= [];
			var fechaAnt					= "";
			var activate					= false;
			var contador_datos				=0;
			var RegExPattern				= /^(?:(?:(?:0?[1-9]|1\d|2[0-8])[/](?:0?[1-9]|1[0-2])|(?:29|30)[/](?:0?[13-9]|1[0-2])|31[/](?:0?[13578]|1[02]))[/](?:0{2,3}[1-9]|0{1,2}[1-9]\d|0?[1-9]\d{2}|[1-9]\d{3})|29[/]0?2[/](?:\d{1,2}(?:0[48]|[2468][048]|[13579][26])|(?:0?[48]|[13579][26]|[2468][048])00))$/;
			var contFecha					=0;
			
			var resultData = datosMovilidad.reduce(function(groups, item) {//24/07/2022
				var val = item["FECHA"]; 
				groups[val] = groups[val] || {FECHA: item.FECHA, impTotalMov: 0};
				groups[val].impTotalMov += parseFloat(item.impTotalMov);
				
				if ((item.FECHA.match(RegExPattern) === null)) {
					
					contFecha++;
				}
				
				if(groups[val].FECHA === fechaAnt && !activate){
					if(groups[val].impTotalMov > parseFloat(ImportesPermitos)){
						duplicadosFecha.push(groups[val].FECHA);
						activate = true;
					}
				}else{
					activate = false;
					if(groups[val].impTotalMov > parseFloat(ImportesPermitos) && !activate){
						duplicadosFecha.push(groups[val].FECHA);
						activate = true;
					}
				}
				
				fechaAnt = groups[val].FECHA;
				
				return groups;
				
			}, {});
			
			if(contFecha > 0){
				MessageBox.error("Formato de fecha incorrecta, el formato debe ser DD/MM/YYYY.");
			
				return;
			}
			
			if(duplicadosFecha.length > 0){
				var mensajeDuplicado = "La movilidad con fecha " + duplicadosFecha[0] + " excede el importe permitido de " + ImportesPermitos + " soles según lo establecido por SUNAT.";
				if(duplicadosFecha.length > 1){
					mensajeDuplicado = "Las movilidades con fechas " + duplicadosFecha.join(", ") + " exceden el importe permitido de " + ImportesPermitos + " soles según lo establecido por SUNAT."
				}
				MessageBox.warning(mensajeDuplicado);
			}
			
			DataComprobanteConfirmacion.forEach(function (items_01, index) {
				if (items_01.keySeg === datos_selecciones.keySeg) {//21/07/2022
					indice_data = index;
					items_01.desglose.forEach(function (items_xs, xs) {
						if (items_xs.POSIC === selecPress.desglose[xs].POSIC) {
							indice_desglo = xs;

						}
					});
				}

			});

			DataComprobanteConfirmacion[indice_data].desglose[indice_desglo].movilidad = datosMovilidad;
			if (Importe_total === "") {
				Importe_total = "0.00";
			} else {
				Importe_total = parseFloat(Importe_total).toFixed(2);
				if (isNaN(Importe_total) || Importe_total === "0") {
					Importe_total = "0.00";
				}
			}
			
		
			DataComprobanteConfirmacion.forEach(function (items) {
				if (items.keySeg === datos_selecciones.keySeg) {//21/07/2022
					items.desglose.forEach(function (rs) {

						if (rs.POSIC === seleccionMov.POSIC) {
							if(rs.movilidad.length > 0){
							rs.movilidad.forEach(function (obj, index) {
								datosMovilidad.forEach(function (sr , index) {

									if (obj.POSICMOV === sr.POSICMOV) {
										if (rs.COD_CONT === "151") {
											if(duplicadosFecha[index] === sr.FECHA){//25/07/2022
											rs.COD_CONT2 = "095";	
											}
											
											rs.INAFECTO = Importe_total;
											rs.BASE_IMP = "0.00";//21/07/2022
											rs.TOTAL = Importe_total;
											rs.impTotalMov = Importe_total;
										}
										if(obj.IMP_EXED === "0.00" || obj.IMP_EXED === ""){
											rs.COD_CONT2 = "";
										}else{
											contador_datos ++;//25/07/2022
											rs.COD_CONT2 = "095";
										}
										if (sr.impTotalMov === "" || sr.impTotalMov === "0.00") {
											validar_monto = true;

										}

									}

								});
								
							});
							inafecto_mov += parseFloat(rs.INAFECTO);
							importe_movilidad += parseFloat(rs.impTotalMov);
							}else{
							inafecto_mov = 0;
							importe_movilidad = 0;
            				rs.INAFECTO= "0.00";
							rs.TOTAL= "0.00";
							}      
							//base_mov += parseFloat(rs.BASE_IMP);//21/07/2022
							
						}
						
						if(contador_datos > 0){//25/07/2022
						rs.COD_CONT2 = "095";
						}
						
					});

					impuestoVenta = parseFloat(IGV);
					items.totalImp = "0.00";//21/07/2022
					items.totalNoGr = inafecto_mov.toFixed(2);
					// impuestos			=	parseFloat(items.totalImp) * impuestoVenta;
					// impuestos			=	impuestos/100;
					items.totalImpu = "0.00";
					//items.totales 		=    (parseFloat(items.totalImp) + parseFloat(items.totalImpu) + parseFloat(items.totalNoGr)).toFixed(2);
					items.totales = inafecto_mov.toFixed(2);

					items.totalmovilidad = importe_movilidad.toFixed(2);
					ModelProyect.setProperty("/subTotal", items.totalImp);
					ModelProyect.setProperty("/noGrabada", items.totalNoGr);
					ModelProyect.setProperty("/subTotalComp", items.totales);
					ModelProyect.setProperty("/impueDet", items.totalImpu);
					ModelProyect.setProperty("/Importe_total", items.totalmovilidad);

					// items.ImporteRendido = acumulador_mov.toFixed(2);                  
					// items.SaldoTotal	=  resta_saldo_mov.toFixed(2);                 

				}

			});
			DataComprobanteConfirmacion.forEach(function (js) {//21/07/2022
				js.desglose.forEach(function (ds) {
					acumulador_mov += parseFloat(ds.TOTAL);
				});

			});
			resta_saldo_mov = parseFloat(acumulador_mov) - parseFloat(importe_Solic);
			ModelProyect.setProperty("/Saldo", resta_saldo_mov.toFixed(2));
			ModelProyect.setProperty("/ImporteRend", acumulador_mov.toFixed(2));
			///ModelProyect.refresh(true);-ojo
			if (validar_monto === true) {
				mensaje_imp = "Llenar los campos vacios."
				MessageBox.warning(mensaje_imp, {
					actions: ["OK"],
					onClose: function (sAction) {}
				});
				return;
			} else {
				// that.Movilidades.close();
				MessageToast.show("¡Se guardaron los datos corréctamente!");
			}
		},
		onCerrarMovi: function () {// CRomero 03/11/2022
			var oView					= this.getView();
			var ModelProyect			= oView.getModel("Proyect");
			var CopiadatosMovilidad		=ModelProyect.getProperty("/CopiadatosMovilidad");
			var CopiaImporteP			=ModelProyect.getProperty("/CopiaImporteP");
			var CopiaImporteE			=ModelProyect.getProperty("/CopiaImporteE");
			var CopiaImporte_total		=ModelProyect.getProperty("/CopiaImporte_total");
			
			ModelProyect.setProperty("/datosMovilidad" , CopiadatosMovilidad);
			ModelProyect.setProperty("/ImporteP" , CopiaImporteP);
			ModelProyect.setProperty("/ImporteE" , CopiaImporteE);
			ModelProyect.setProperty("/Importe_total" , CopiaImporte_total);
			this.Movilidades.close();

			ModelProyect.refresh(true);

		},
		presCentroC: function (oEvent) {
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");// nuevos cambio 05/06/2022
			var centroC 					= oEvent.mParameters.value;
			var datosImputacion 			= ModelProyect.getProperty("/datosImputacion");
			var Imputacion_press			= ModelProyect.getProperty("/Imputacion_press");
			var DataComprobanteConfirmacion	=ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var contadores  				 =0;
			var  formato_ceco				=centroC.substring(0,10);
			
			ModelProyect.setProperty("/select_ceco", formato_ceco.substring(0,8));
			ModelProyect.setProperty("/select", centroC);
			ModelProyect.setProperty("/keySelect", centroC);

		},

		aceptarImp: function () {
			var that = this;

			this.DATOS1.close();
		},

		handleToggleSecondaryContent: function (oEvent) {
			var oSplitContainer = this.byId("mySplitContainer");
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");

			oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());

			if (contaBtn) {
				contaBtn = false;
				ModelProyect.setProperty("/btnDetIcon", "sap-icon://show");
				ModelProyect.setProperty("/btnDetType", "Ghost");
			} else {
				contaBtn = true;
				ModelProyect.setProperty("/btnDetIcon", "sap-icon://hide");
				ModelProyect.setProperty("/btnDetType", "Emphasized");
			}

		},

		onOpenFragQR: function () {
			var vistaFrag = sap.ui.getCore();
			var that = this;
			contQR = 0;
			var oView			= this.getView();
			var ModelProyect	= oView.getModel("Proyect");
			var data2			= ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var comprobanteDatos = [];
			var contDatos        = 0;
			
			if(data2.length > 0){
			data2.forEach(function (js) {
			
			if(js.DATOS_SAP === true){  //01/09/2022
				
			if(js.VALIDAR_DATOS === true){
				if(js.COMPROBANTE1 !== js.COMPROBANTE){	
			  	comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				
				if(js.FECHA_PRUEBA !== ""){
				if(js.FECHA_PRUEBA !== js.FECHA_COMP){	
				comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				}
				
				if(js.RUC_PRUEBA !== ""){
				if(js.RUC_PRUEBA !==  js.RUC){
				comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				}	
				
				
			}
			}else{
			if(js.DATOS_SAP === false){//01/09/2022
			if(js.VALIDAR_DATOS === true){
				if(js.COMPROBANTE1 !== js.COMPROBANTE){	
			  	comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				
				if(js.FECHA_PRUEBA !== ""){
				if(js.FECHA_PRUEBA !== js.FECHA_COMP){	
				comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				}
				
				if(js.RUC_PRUEBA !== ""){
				if(js.RUC_PRUEBA !==  js.RUC){
				comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				}	
			
			}	
				
			}	
				
			}
			});
			}
			
			var numero_prueba1 ="";
			if(contDatos > 0){
			if(comprobanteDatos.join() !== ""){
			const filteredArray = comprobanteDatos.filter(function(ele , pos){
			 return comprobanteDatos.indexOf(ele) == pos;
			}) 
			numero_prueba1 ="Lo(s) comprobate(s) :" + filteredArray.join(" , ");
			}
			
			MessageBox.warning("Debe validar o registrar los comprobante(s) \n " + numero_prueba1 + " antes de grabar .");
			comprobanteDatos =[];
			sap.ui.core.BusyIndicator.hide();
			return;	
			}
			
			if (!that.pDialog) {
				that.pDialog = sap.ui.xmlfragment("rendicionER.fragments.dialogQRScan", that);
				that.getView().addDependent(that.pDialog);
			}

			that.pDialog.open();

			this._busyDialog = new sap.m.BusyDialog({});
			this._busyDialog.open();

			scanner = new Instascan.Scanner({
				video: document.getElementById(vistaFrag.byId("preview").getId()),
				mirror: false
			});

			that.getCam();

		},

		onCloseFragQR: function () {
			sap.ui.getCore().byId("dialogQRScan").close();
		},

		getCam: function () {
			var vista = this.getView();
			var ModelProyect = vista.getModel("Proyect");
			var newArray = [];
			var cont = 0;
			var that = this;

			Instascan.Camera.getCameras().then(function (cameras) {
				camara = cameras;

				cameras.map(function (obj) {

					var objetos = {
						codigo: cont,
						nombre: obj.name
					}

					newArray.push(objetos);
					cont++
				});

				ModelProyect.setProperty("/datosCamaraAll", newArray);

				ModelProyect.refresh(true);

				if (cameras.length > 0) {
					scanner.start(cameras[0]);
					that._busyDialog.close();
				} else {
					alert('No hay camaras disponibles');
					scanner.stop();
					that._busyDialog.close();
				}

			}).catch(function (e) {
				alert(e);
				that._busyDialog.close();
			});

			this.addScanner();
		},

		onChangeCamera: function (event) {
			this._busyDialog.open();
			scanner.start(camara[event.getParameter("selectedItem").getKey()]);
			jQuery.sap.delayedCall(400, this, function () {
				this._busyDialog.close();
			});
		},

		// addScanner: function () {//05/09/2022
		// 	const that				= this;
		// 	const oView 			= this.getView();
		// 	var ModelProyect		= oView.getModel("Proyect");
		// 	var selected			= oView.getModel("Proyect").getProperty("/CountComprobante");
		// 	// var data = ModelProyect.getProperty("/DataComprobantePreeliminar");
		// 	var data2				= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var solicitud			= ModelProyect.getProperty("/solicitud");
		// 	var COD_SAP 			= ModelProyect.getProperty("/COD_SAP");
		// 	var IGV2				= ModelProyect.getProperty("/IGV");
		// 	var moneda				= ModelProyect.getProperty("/moneda");
		// 	var datosIndicador		= ModelProyect.getProperty("/datosIndicador");
		// 	var  Indicador			= "";
		// 	var  mensaje_validacion	= false;
		// 	var hoy 				= new Date();
		// 	var mes 				= hoy.getMonth() + 1;
		// 	var hoyp				= hoy.getDate().toString();
		// 	if (hoyp < 10) {
		// 		var hoyn = "0" + hoy.getDate().toString();
		// 	} else {
		// 		var hoyn = hoy.getDate().toString();
		// 	}
	
		// 	if (mes < 10) {
		// 		mes = "0" + mes.toString();
		// 	}
			
		// 	var fechaActual		= hoy.getFullYear().toString() + mes.toString() +hoyn.toString();

		// 	scanner.addListener('scan', async function (content) {
		// 		console.log(content);

		// 		var datosQR = (content.replaceAll(" ", "")).split("|");

		// 		$('<audio>').attr('src', 'https://webidetesting6329744-n8pid6w2h2.dispatcher.us2.hana.ondemand.com/webapp/audio/scan.mp3').attr(
		// 			'preload', 'auto')[0].play();

		// 		scanner.stop();
		// 		sap.ui.getCore().byId("dialogQRScan").close();

		// 		// if(datosQR.length > 2  && datosQR.length <= 10){

		// 		try {
		// 			let Correlativo = data2.length === 0 ? 1 : that.NumMayor(data2);
		// 			const Ruc = datosQR[0];
		// 			const TipoComp = that.TipoComprobanteQr(datosQR[1]);
		// 			const Serie = datosQR[2].padStart(5, "0");
		// 			const numComp = datosQR[3].padStart(9, "0");
		// 			const IGV = datosQR[4];
		// 			const TOTAL = datosQR[5];
		// 			const fecha = datosQR[6];
		// 			const dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
		// 				pattern: "dd/MM/YYYY"
		// 			});
		// 			let fechaTransform = new Date(fecha);
		// 			fechaTransform.setHours(24);
		// 			var fechaFormato = dateFormat.format(fechaTransform);
		// 			const BaseImp = parseFloat(TOTAL.replaceAll(",", "")) - (parseFloat(IGV.replaceAll(",", "")))
					
		// 			var porcentajeIGV = ((IGV * 100)/BaseImp )*1;//05/09/2022
		// 			if(porcentajeIGV  > 0){
		// 			datosIndicador.map(function(rt){
		// 			if(rt.PORCENTAJE === porcentajeIGV.toFixed(0)){
		// 			 Indicador = rt.INDICADOR ; 
		// 			ModelProyect.setProperty("/IGV" , rt.PORCENTAJE);	
		// 			}	
						
		// 			});
		// 			}else{
		// 			Indicador = "C0"; 
		// 			ModelProyect.setProperty("/IGV" , "0.00");	
		// 			}
					
		// 				//let BaseImp ;
		// 				//( (parseFloat(IGV.replaceAll(",",""))*100/(parseFloat(IGV.replace("%",""))) ).toFixed(2) ) - 0.2;

		// 			//	BaseImp = parseFloat(IGV.replaceAll(",","")) * 100 / parseFloat(IGV2.replace("%","")) ;
		// 			//BaseImp = BaseImp - 0.02;
					
		// 				//validacion temporal
					
		// 			var estructura = {
		// 				NROD0			: solicitud,
		// 				DOC_PAGO		:	 "",
		// 				COD_SAP			: COD_SAP,
		// 				keySeg			: Correlativo,
		// 				key				: Correlativo,
		// 				COMPROBANTE		: Serie + "-" + numComp,
		// 				QR				: true,
		// 				TIPO_COMP		: TipoComp.DENOMINACION, //nombre,
		// 				COD_COMP		: TipoComp.CLASE,
		// 				COD_TIPO_COMP	: TipoComp.CLASE,//12/07/2022
		// 				TIPODOCI		: "RUC",
		// 				FECHA_COMP		: fechaFormato,
		// 				RUC				: Ruc.toString(),
		// 				RAZON_SOCIAL	: "", //falta razon social en QR
		// 				WAERS			: moneda, //falta Moneda en QR
		// 				KOSTL			: "",
		// 				ESTADO			: "",
		// 				DATOS_SAP		:false,
		// 				GLOSA			: "", //falta glosario en QR
		// 				iconComp		: "sap-icon://pending",
		// 				stateComp		: "Warning",
		// 				EST_COMP		: "COMP. PEND. APR.",
		// 				COMPROBANTE_ANTIGUO:Serie + "-" + numComp,//27/07/2022
		// 				TIPO_PRUEBA		: TipoComp.CLASE,//16/08/2022
		// 				FECHA_PRUEBA	:fechaFormato,//16/08/2022
		// 				COMPROBANTE_PRUEBA  :Serie + "-" + numComp,//16/08/2022
		// 				RUC_COPIA		: Ruc.toString(),//27/07/2022
		// 				VALIDA_GRABADO	:false,//27/07/2022
		// 				VALIDAR_DATOS	:false,//01/09/2022
		// 				desglose: [{
		// 					stateCeco: "Warning",
		// 					iconCeco: "sap-icon://pending",
		// 					POSIC: 1,
		// 					COMPROBANTE: Serie + "-" + numComp,
		// 					COD_CONT: "",
		// 					centro: "",
		// 					BASE_IMP: parseFloat(IGV.replaceAll(",", "")) <= 0 ? TOTAL : BaseImp.toFixed(2),
		// 					IGV: IGV,
		// 					INAFECTO: parseFloat(IGV.replaceAll(",", "")) <= 0 ? TOTAL : "0.00",
		// 					TOTAL: TOTAL,
		// 					IND_IMP: Indicador,
		// 					imp: "",
		// 					validaciones1: false,
		// 					validacionBase: parseFloat(IGV.replaceAll(",", "")) <= 0 ? true : false,
		// 					validacionInafecto: true,
		// 					validacionIndicador: true,
		// 					movilidad: [],
		// 					imputacion: []
		// 				}],
		// 				archivoAd: [],
		// 				DeleteArchivo : []
		// 			};
					
					
		// 			// ModelProyect.setProperty("/jsonData", importar[0].desgloce);
				
		// 			let dateFormatSend = sap.ui.core.format.DateFormat.getDateInstance({
		// 				pattern: "YYYYMMdd"
		// 			});

		// 			let fechaSend = dateFormatSend.format(new Date(fecha));
		// 			let send = {
		// 				"FLAG": "X",
		// 				"ZET_VALIDA_COMPROBANTESet": [{
		// 					"COMPROBANTE": Serie + "-" + numComp,
		// 					"MENSAJE": "",
		// 					"RUC": Ruc,
		// 					"TIPO_COMP": TipoComp.CLASE,
		// 					"FECHA_COMP": fechaSend
		// 				}]
		// 			};

		// 			if (data2.findIndex(obj => obj.COMPROBANTE === Serie + "-" + numComp && obj.RUC === Ruc) !== -1) {//21/07/2022
		// 				MessageBox.error("El Comprobante ya fue ingresado");
		// 				return;
		// 			}

		// 			const Mensaje = await that.ValidacionRucExistente(send);
		// 			if (Mensaje[0].MENSAJE === "Ya existe el número de comprobante") {
		// 				MessageBox.error("Ya existe el número de comprobante");
		// 			} else {
					
		// 			var fechaRegistrada	= estructura.FECHA_COMP.substring(10, 6) + estructura.FECHA_COMP.substring(5, 3) + estructura.FECHA_COMP.substring(2, 0);
					
		// 			var RegExPattern = /^(?:(?:(?:0?[1-9]|1\d|2[0-8])[/](?:0?[1-9]|1[0-2])|(?:29|30)[/](?:0?[13-9]|1[0-2])|31[/](?:0?[13578]|1[02]))[/](?:0{2,3}[1-9]|0{1,2}[1-9]\d|0?[1-9]\d{2}|[1-9]\d{3})|29[/]0?2[/](?:\d{1,2}(?:0[48]|[2468][048]|[13579][26])|(?:0?[48]|[13579][26]|[2468][048])00))$/;
					
		// 			if(estructura.COD_TIPO_COMP === "KH" || estructura.COD_TIPO_COMP === "KT" || estructura.COD_TIPO_COMP === "KX" || estructura.COD_TIPO_COMP === "KB" || estructura.COD_TIPO_COMP === "KM" || estructura.COD_TIPO_COMP === "SK" || estructura.COD_TIPO_COMP === "KV"){//09/09/2022
						
		// 			if ((estructura.FECHA_COMP.match(RegExPattern)) && (estructura.FECHA_COMP != '')) {
				
		// 			var añoActual	= hoy.getFullYear().toString();
		// 			var añoMinimo	= (añoActual *1) -1;
		// 			var mesActual	= mes.toString();
		// 			var diaActual	= hoyn.toString();	
					
		// 			var RangoMaximo = añoActual + mesActual + diaActual ;
		// 			var RangoMinimo	= añoMinimo + mesActual + diaActual ;
						
		// 			if(fechaRegistrada *1 <  RangoMinimo *1 || fechaRegistrada *1 > RangoMaximo *1){
					
		// 			MessageBox.error("La fecha de comprobante no debe ser mayor a la fecha actual ni menor a un año de la fecha actual");
		// 			return;
		// 			}
					
		// 			if(estructura.desglose[0].IND_IMP !== "C0"){
		// 				mensaje_validacion = true;		
		// 			}else{
		// 				mensaje_validacion = false;	
		// 			}
					
		// 			} else {
		// 			MessageBox.error("Formato de fecha incorrecta, el formato debe ser DD/MM/YYYY.");
					
		// 				return false;
		// 			}	
							
		// 			}
					
					
		// 			if(mensaje_validacion === true){
		// 			MessageBox.warning("El indicador de IGV asignado no es correcto, por favor verifique y actualice.");	
		// 			return;
		// 			}	
					
		// 				const url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_VALIDA_PROVEEDORSet?$filter=STCD1 eq '" + Ruc + "'";
		// 				that.validar_sunat1(Ruc, async function (Proveedor, mensajes) {

		// 					if (mensajes.length > 0) {
		// 						MessageBox.error("El RUC esta " + mensajes);
		// 						return;
		// 					}

		// 					if (Proveedor.responseJSON !== undefined) {
		// 						if (Proveedor.responseJSON.error !== undefined) {
		// 							MessageBox.error("El Ruc del QR no existe en Sunat");
		// 						}
		// 						return;
		// 					}

		// 					const datos = await that.ObtenerProveedorMedianteRuc([url])

		// 					if (datos[0].d.results[0].MENSAJE === "Proveedor no existe, por favor completar datos") {

		// 						const ProveedorNoExistente = ModelProyect.getProperty("/ProveedorNoExistente");

		// 						if (ProveedorNoExistente.findIndex(obj => obj === Ruc.toString()) !== -1) {
		// 							ProveedorNoExistente.push(Ruc.toString());
		// 						}

		// 					}

		// 					estructura.RAZON_SOCIAL = Proveedor.nombre;
							
							
		// 					estructura.desglose.map(function(xs){
		// 					if(xs.IND_IMP === "C0"){	
		// 					xs.BASE_IMP ="0.00";
		// 					xs.IGV ="0.00";	
		// 					}
		// 					});	
								
							

		// 					if (data2 !== undefined)
		// 						data2.push(estructura);
		// 					else
		// 						ModelProyect.setProperty("/DataComprobanteConfirmacion", estructura);
								
							
		// 						var contador_temporal=0;
		// 						data2.forEach(function (obj) {
		// 						if(obj.DATOS_SAP !== true){
		// 						contador_temporal++;	
					
		// 						}	
					
		// 						});
			
		// 				if (contador_temporal === 5) {
		// 				MessageBox.error("Para continuar con el registro se deben guardar los 5 comprobantes que fueron creados.", {
		// 				actions: [MessageBox.Action.OK],
		// 				emphasizedAction: MessageBox.Action.OK,
		// 				onClose: function (sAction) {}
		// 				});
		// 				return;
		// 				}	
								

		// 					that.SumatoriaImporte_Saldo();
		// 					MessageToast.show("¡Comprobante Registrado!", {
		// 						duration: 3000,
		// 						my: "center center",
		// 						at: "center center"
		// 					});

		// 				});

		// 				// }

		// 				ModelProyect.refresh(true);
		// 			}
		// 		} catch (er) {
		// 			MessageBox.error("No se puede leer el QR , vuelva a intentarlo");
		// 		}
		// 		// }

		// 	});
		// },

		SumatoriaImporte_Saldo: function () {
			const that				= this;
			const oView 			= this.getView();
			var ModelProyect		= oView.getModel("Proyect");
			var importe 			= ModelProyect.getProperty("/importe");
			var datas				= ModelProyect.getProperty("/DataComprobanteConfirmacion");
			let acumuladores		= 0;
			var formato_nu			="";
			datas.forEach(function (items_04, index) {

				items_04.desglose.forEach(function (desg) {
					formato_nu = desg.TOTAL.replaceAll(",","");	
					acumuladores += parseFloat(desg.TOTAL);
				});
				acumuladores += parseFloat(formato_nu);
				// if(items_04.key !== index +1){	
				// 	items_04.key =index +1;
				// }
			});

			var resta = parseFloat(acumuladores) - parseFloat(importe);
			ModelProyect.setProperty("/ImporteRend", acumuladores.toFixed(2));

			if (parseFloat(importe) < acumuladores) {
			ModelProyect.setProperty("/estado_saldo", "Success");
			}else if (acumuladores === "0.00"){
			ModelProyect.setProperty("/estado_saldo", "None");	
			} else {
			ModelProyect.setProperty("/estado_saldo", "Error");
			}

			ModelProyect.setProperty("/Saldo", resta.toFixed(2));
		},

		// validar_sunat1: function (datos, callback) {
		// 	var oView = this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	// var array_estructura    =ModelProyect.getProperty("/array_estructura");

		// 	jQuery.ajax({
		// 		type: "GET",
		// 		url: "/SUNAT/ruc?numero=" + datos,
		// 		async: true,
		// 		success: function (data1, textStatus, jqXHR) {

		// 			var condicion_01 = data1.condicion.toUpperCase();
		// 			var estado_01 = data1.estado.toUpperCase();
		// 			var mensajes = "";
		// 			switch (condicion_01) {
		// 			case "NO HALLADO":
		// 				mensajes = "NO HALLADO";
		// 				break;
		// 			case "NO HABIDO":
		// 				mensajes = "NO HABIDO";
		// 				break;

		// 			}

		// 			switch (estado_01) {

		// 			case "BAJA DEFINITIVA":

		// 				if (mensajes.length > 0) {
		// 					mensajes += " y BAJA DEFINITIVA";
		// 				} else {
		// 					mensajes = "BAJA DEFINITIVA";
		// 				}
		// 				break;
		// 			case "BAJA DE OFICIO":

		// 				if (mensajes.length > 0) {
		// 					mensajes += " y BAJA DE OFICIO";
		// 				} else {
		// 					mensajes = "BAJA DE OFICIO";
		// 				}
		// 				break;
		// 			}

		// 			if (condicion_01 === "HABIDO" && estado_01 === "ACTIVO") {
		// 				mensajes = "";
		// 			} else {
		// 				mensajes = "RUC :" + condicion_01 + " y " + estado_01;
		// 			}

		// 			callback(data1, mensajes);
		// 		},
		// 		error: function (er) {

		// 			callback(er);

		// 			console.log(er);
		// 		}
		// 	});
		// },

		// validar_Dni: async function (obj) {
		// 	var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_VALIDA_PROVEEDORSet?$filter=STCD1 eq '" + obj.RUC + "'";
		// 	await jQuery.ajax({
		// 		type: "GET",
		// 		cache: false,
		// 		headers: {
		// 			"Accept": "application/json"
		// 		},
		// 		contentType: "application/json",
		// 		url: url,
		// 		async: true,
		// 		success: function (data, textStatus, jqXHR) {
		// 			var datos = data.d.results[0].NAME1;
		// 			obj.Nombre = datos;
		// 			obj.MENSAJE = "";
					
		// 		},
		// 		error: function () {
		// 			MessageBox.error("Ocurrio un error al obtener los datos");
		// 		}
		// 	});
		// },

		// validar_sunat2: async function (obj) {
		// 	var oView = this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	// var array_estructura    =ModelProyect.getProperty("/array_estructura");

		// 	return new Promise(async(resolve, reject) => {

		// 		await jQuery.ajax({
		// 			type: "GET",
		// 			url: "/SUNAT/ruc?numero=" + obj.RUC,
		// 			async: true,
		// 			success: function (data1, textStatus, jqXHR) {

		// 				var condicion_01 = data1.condicion.toUpperCase();
		// 				var estado_01 = data1.estado.toUpperCase();
		// 				var mensajes = "";
		// 				switch (condicion_01) {
		// 				case "NO HALLADO":
		// 					mensajes = "NO HALLADO";
		// 					break;
		// 				case "NO HABIDO":
		// 					mensajes = "NO HABIDO";
		// 					break;

		// 				}

		// 				switch (estado_01) {

		// 				case "BAJA DEFINITIVA":

		// 					if (mensajes.length > 0) {
		// 						mensajes += " y BAJA DEFINITIVA";
		// 					} else {
		// 						mensajes = "BAJA DEFINITIVA";
		// 					}
		// 					break;
		// 				case "BAJA DE OFICIO":

		// 					if (mensajes.length > 0) {
		// 						mensajes += " y BAJA DE OFICIO";
		// 					} else {
		// 						mensajes = "BAJA DE OFICIO";
		// 					}
		// 					break;
		// 				}

		// 				if (condicion_01 === "HABIDO" && estado_01 === "ACTIVO") {
		// 					obj.Nombre = data1.nombre;
		// 					obj.MENSAJE = "";
		// 				} else {
		// 					obj.MENSAJE = "RUC :" + condicion_01 + " y " + estado_01;
		// 				}

		// 				// obj.MENSAJE = mensajes;
		// 				// obj.Nombre = data1.nombre;

		// 				resolve(obj);
		// 			},
		// 			error: function (err) {
		// 				if (err.responseJSON && err.responseJSON.error === "RUC invalido") {
		// 					obj.MENSAJE = err.responseJSON.error
		// 					resolve(obj);
		// 				} else {
		// 					sap.m.MessageBox.error("Hubo un Error, por favor comuníquese con el administrador del sistema");
		// 					reject(err);
		// 				}
		// 				// resolve(er.responseJSON);
		// 				console.log(err);
		// 			}
		// 		});

		// 	});

		// },

		NumMayor: function (data) {
			let data1 = data.map(obj => obj.key);
			return data1.sort()[data1.length - 1] + 1;
		},

		TipoComprobanteQr: function (Tipo) {
			var that = this;
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var TipoDocumento = ModelProyect.getProperty("/TipoDocumento");
			let TipoCompApp = "";

			TipoCompApp = TipoDocumento.find(obj => obj.INVTP === Tipo);

			// switch (Tipo){
			// case "01": TipoCompApp = TipoDocumento.find(obj=> obj.INVTP ==="KX") ;break;
			// case "03": TipoCompApp = TipoDocumento.find(obj=> obj.INVTP ==="KB") ;break;
			// case "04": TipoCompApp = "" ;break;
			// case "07": TipoCompApp = TipoDocumento.find(obj=> obj.INVTP ==="KG") ;break;
			// case "08": TipoCompApp = TipoDocumento.find(obj=> obj.INVTP ==="KD") ;break;
			// case "R1": TipoCompApp = TipoDocumento.find(obj=> obj.INVTP ==="KH") ;break;
			// case "R7": TipoCompApp = "" ;break;
			// }

			return TipoCompApp;
		},

		// ValidacionRucExistente: async function (Send) {
		// 	let token;
		// 	let Mensaje;
		// 	await $.ajax({
		// 		url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
		// 		type: "GET",
		// 		headers: {
		// 			"x-CSRF-Token": "Fetch"
		// 		}
		// 	}).always(function (data, status, response) {
		// 		token = response.getResponseHeader("x-csrf-token");
		// 	});

		// 	await $.ajax({
		// 		url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_VALIDA_COMPROBANTE_CABSet",
		// 		method: "POST",
		// 		headers: {
		// 			"x-CSRF-Token": token
		// 		},
		// 		async: true,
		// 		contentType: "application/json",
		// 		dataType: "json",
		// 		data: JSON.stringify(Send),
		// 	}).always(function (data, status, response) {

		// 		Mensaje = data.d.ZET_VALIDA_COMPROBANTESet.results;
		// 	});

		// 	return Mensaje;
		// },

		// ObtenerProveedorMedianteRuc: async function (Urls) {
		// 	let datos;
		// 	try {
		// 		const results = await Promise.all(Urls.map(url =>
		// 			// "/sap/fiori/irequestbvregistrodocliq"+
		// 			fetch(HostName+url, {
		// 				method: "GET",
		// 				contentType: "application/json",
		// 				headers: {
		// 					"Accept": "application/json"
		// 				},
		// 			})
		// 		))
		// 		const finalData = await Promise.all(results.map(result =>
		// 			result.json()));
		// 		return finalData;
		// 		console.log(finalData);
		// 	} catch (err) {
		// 		console.log(err);
		// 	}
		// 	// await jQuery.ajax({
		// 	// 	type: "GET",
		// 	// 	cache: false,
		// 	// 	headers: {
		// 	// 		"Accept": "application/json"
		// 	// 	},
		// 	// 	contentType: "application/json",
		// 	// 	url: Url,
		// 	// 	async: true,
		// 	// 	success: function (data, textStatus, jqXHR) {
		// 	// 		datos = data.d.results[0].MENSAJE;
		// 	// 	},
		// 	// 	error: function () {
		// 	// 		datos = MessageBox.error("Ocurrio un error al obtener los datos de codigo generico");
		// 	// 	}
		// 	// });

		// 	return datos;
		// },

		// getDataCentro: function () {
		// 	var that = this;
		// 	var oView = this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	var descrip = "";
		// 	var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_IND_IMPSet"; 
		// 	jQuery.ajax({
		// 		type: "GET",
		// 		cache: false,
		// 		headers: {
		// 			"Accept": "application/json"
		// 		},
		// 		contentType: "application/json",
		// 		url: url,
		// 		async: true,
		// 		success: function (data, textStatus, jqXHR) {
		// 			var datos = data.d.results;
		// 			datos.forEach(function (items) {
		// 				descrip = items.DESCRIPCION.replaceAll("%", "");

		// 				var num1 = descrip.replaceAll(/[0-9]/g, "");
		// 				items.NOMBRE = num1;

		// 			});

		// 			ModelProyect.setProperty("/datosIndicador", datos);
		// 			ModelProyect.refresh(true)
		// 		},
		// 		error: function () {
		// 			MessageBox.error("Ocurrio un error al obtener los datos");
		// 		}
		// 	});

			
		// },

		
		// selectBanco: function () { ///cambios de Claudia
		// 	var oView		= this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	var arrayBancos	=[];
		// 	var moneda		=ModelProyect.getProperty("/moneda")
		// 	var url 		= "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_CUENTA_BANCOSSet";
		// 	jQuery.ajax({
		// 		type: "GET",
		// 		cache: false,
		// 		headers: {
		// 			"Accept": "application/json"
		// 		},
		// 		contentType: "application/json",
		// 		url: url,
		// 		async: true,
		// 		success: function (data, textStatus, jqXHR) {
		// 			var datos = data.d.results;
		// 			datos.forEach(function (items_02) {
						
		// 				if(items_02.WAERS === moneda){
		// 				items_02.TEXT1 = items_02.TEXT1.replaceAll(" Cta.", "-");
		// 				var DESCRIPC1 = items_02.TEXT1.split("-")[0];
		// 				var DESCRIPC2 = items_02.TEXT1.split("-")[1]; //divide el objecto en una arreglo.
		// // 				items_02.DESCRIPCION = items_02.BANKN + " - " + DESCRIPC1;
						
		// // 				arrayBancos.push(items_02);
						
		// 				}else if(items_02.WAERS === moneda){
		// 				items_02.TEXT1 = items_02.TEXT1.replaceAll(" Cta.", "-");
		// 				var DESCRIPC1 = items_02.TEXT1.split("-")[0];
		// 				var DESCRIPC2 = items_02.TEXT1.split("-")[1]; //divide el objecto en una arreglo.
		// 				items_02.DESCRIPCION = items_02.BANKN + " - " + DESCRIPC1;
						
		// 				arrayBancos.push(items_02);
		// 				}
		// 			});
		// 			ModelProyect.refresh(true);

		// 			ModelProyect.setProperty("/datosBancos", arrayBancos);
		// 			ModelProyect.refresh(true);
		// 		},
		// 		error: function () {
		// 			MessageBox.error("Ocurrio un error al obtener los datos");
		// 		}
		// 	});
		// },
		
	
		onPressNavButton: function () {
			var that = this;
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			MessageBox.information("Se perderan los campos que no se grabaron ,¿Desea volver atras?", {
				actions: ["Aceptar", "Cancelar"],
				onClose: function (sAction) {
					if (sAction === "Aceptar") {

						oView.byId("sRegistroComprobante").setValue("");
						// oView.byId("sfechaComprobante").setValue("")	;
						ModelProyect.setProperty("/impueDet", "0.00");
						ModelProyect.setProperty("/subTotal", "0.00");
						ModelProyect.setProperty("/noGrabada", "0.00");
						ModelProyect.setProperty("/subTotalComp", "0.00");
						ModelProyect.setProperty("/COMPROBANTE", "");
						ModelProyect.setProperty("/FECHA_COMP", "");
						ModelProyect.setProperty("/TIPO_COMP", "");
						ModelProyect.setProperty("/Key_comprobante", "---Seleccionar---");
						ModelProyect.setProperty("/tipoNif", "RUC");
						ModelProyect.setProperty("/ruc", "");
						ModelProyect.setProperty("/razonSocial", "");
						ModelProyect.setProperty("/monedas", "---Seleccionar---");
						ModelProyect.setProperty("/Glosa", "");
						ModelProyect.setProperty("/DataComprobanteConfirmacion", []);
						ModelProyect.setProperty("/jsonData", []);
						ModelProyect.setProperty("/seleccion_CECO", "id1");
						ModelProyect.setProperty("/compValState", "None");
						ModelProyect.setProperty("/fecCompValState", "None");
						ModelProyect.setProperty("/tipCompValState", "None");
						ModelProyect.setProperty("/rucValState", "None");
						ModelProyect.setProperty("/eliminar_compro", []);
						ModelProyect.refresh(true);
						that.oRouter.navTo("RendicionConER");
						// that.oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						//      			that.oRouter.getTarget("RendicionConER").attachDisplay(jQuery.proxy(that.handleRouteMatched, that));

					}
				}
			});

			// this.limpiar();
			//mensaje :se perderan los campos que no se grabaron, desea volver atras.( si le da aceptar se pondra vacio la propiedad de la lista
			//y las propiedades que se utilizan).

		},
		onPressNavButtonDetail: function () {
			var that = this;
			var oView = this.getView

			var oSplitApp = this.getView().byId("SplitAppMatestros");
			oSplitApp.toDetail(this.getView().byId("master").getId());
		},

		onAgregarComprobante: function () {
			var that						= this;
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var hoy 						= new Date();
			var fecha						= "";
			var detalleOK					= this.getView().byId("detail").getId();
			var mes 						= hoy.getMonth() + 1;
			var hoyp						= hoy.getDate().toString();
			var oSplitApp					= this.getView().byId("SplitAppMatestros");
			var pageDetail					= this.getView().byId("SplitAppMatestros");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var sRegistroComprobante		= oView.byId("sRegistroComprobante").getValue();
			var seleccion					= ModelProyect.getProperty("/selecPress");
			var validar 					= false;
			var datosComprobante			= ModelProyect.getProperty("/datosComprobante");
			var datosImputacion				= ModelProyect.getProperty("/datosImputacion");
			var datosMovilidad				= ModelProyect.getProperty("/datosMovilidad");

			if (hoyp < 10) {
				var hoyn = "0" + hoy.getDate().toString();
			} else {
				var hoyn = hoy.getDate().toString();
			}

			if (mes < 10) {
				mes = "0" + mes.toString();
			}

			fecha = hoyn.toString() + "/" + mes.toString() + "/" + hoy.getFullYear().toString();
			

		
			var boleano_campos			= false;
			var contador_modifi 		=0;
			var info_comprobante		=[];
			var comrpobantes_nograbados	=[];
			var comprobanteDatos		=[];
			var contDatos				=[];
			
			
			DataComprobanteConfirmacion.forEach(function (js) {// nuevo scambios de 05/06/2022
			
			if(js.DATOS_SAP === true && seleccion !== undefined){ 
				
			if(js.VALIDAR_DATOS === true){
				if(js.COMPROBANTE1 !== js.COMPROBANTE){	
			  	comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				
				if(js.FECHA_PRUEBA !== ""){
				if(js.FECHA_PRUEBA !== js.FECHA_COMP){	
				comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				}
				
				if(js.RUC_PRUEBA !== ""){
				if(js.RUC_PRUEBA !==  js.RUC){
				comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				}	
				
				
			}//01/09/2022	
				
			if(js.COMPROBANTE_ANTIGUO !== "" && js.COMPROBANTE_PRUEBA !== "" ){	
				
			if(js.COMPROBANTE_ANTIGUO !== js.COMPROBANTE){// valida si el comprobante fue grabado
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);
				
			}
			
			}
				js.validacion_guardado = false;//30062022
			
			if(js.FECHA_ANTIGUA !== "" && js.FECHA_PRUEBA !==""){
			
			if(js.FECHA_ANTIGUA !== js.FECHA_COMP){
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);
				
			}
			}
			
			
			if(js.COPIA_COD_TIPO !== "" && js.TIPO_PRUEBA !== ""){
				
				if(js.COPIA_COD_TIPO !== js.COD_TIPO_COMP){
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);
				
			}
			}
			
			if(js.RUC_COPIA1 !== "" && js.RUC_COPIA !== ""){// cambio  de 08/06/2022
				if(js.RUC_COPIA1 !== js.RUC){
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);
				
				}
				
			}
			
			if(js.COPIA_RAZON !== "" && js.COPIA_RAZON !== undefined){//24/07/2022
			if(js.COPIA_RAZON !== js.RAZON_SOCIAL){
				contador_modifi++;
			comrpobantes_nograbados.push(js.COMPROBANTE);
			//return;
			}	
			}
			
			if(js.PRUEBA_GLOSA !== "" && js.COPIA_GLOSA !== ""){
			if(js.COPIA_GLOSA !== js.GLOSA){
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);
				
			}	
			}
			
			
			if(js.COPIA_REFERENCIA !== js.REF_FACTURA){ // CAMBIO DE 16/06/2022
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);	
			}
			
			
			if(js.COPIA_ORDEN !== js.ORDEN_INT){// CAMBIO DE 16/06/2022
			contador_modifi++;
			comrpobantes_nograbados.push(js.COMPROBANTE);	
			}
			
			if(js.COPIA_VIAJES !== js.VIAJES){// CAMBIO DE 16/06/2022
			contador_modifi++;
			comrpobantes_nograbados.push(js.COMPROBANTE);	
			}
			
			js.desglose.forEach(function(xs){
			  
			if(xs.ANTIGUO_GASTO !== xs.COD_CONT){
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);
				
			}
			
			if(xs.ANTIGUO_IND !== xs.IND_IMP){
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);
				
			}
			
			if(xs.ANTIGUA_BASE !== xs.BASE_IMP){
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);
			
			}
			
			if(xs.ANTIGUO_INAFECTO !== xs.INAFECTO){
				contador_modifi++;
				comrpobantes_nograbados.push(js.COMPROBANTE);
				
			}
			
			
		
		
			});
			}
			else{
			if(js.DATOS_SAP === false){//01/09/2022
			if(js.VALIDAR_DATOS === true){
				if(js.COMPROBANTE1 !== js.COMPROBANTE){	
			  	comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				
				if(js.FECHA_PRUEBA !== ""){
				if(js.FECHA_PRUEBA !== js.FECHA_COMP){	
				comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				}
				
				if(js.RUC_PRUEBA !== ""){
				if(js.RUC_PRUEBA !==  js.RUC){
				comprobanteDatos.push(js.COMPROBANTE);
				contDatos++;
				
				}
				}	
			
			}	
				
			}	
				
			}
			}); 
			
			var numero_prueba01="";
			if(contDatos  > 0){
			const filteredArray = comprobanteDatos.filter(function(ele , pos){
			 return comprobanteDatos.indexOf(ele) == pos;
			}) 		
			if(comprobanteDatos.join() !== ""){
			numero_prueba01 =	"Lo(s) comprobate(s) :" + filteredArray.join(" , ");
			}
				
			MessageBox.warning("Debes de validar o registrar los comprobantes .\n " + numero_prueba01);
			comprobanteDatos=[];
			return;	
				
			}
			
			var numero_prueba="";
			if(contador_modifi >0){
			if(comrpobantes_nograbados.join() !== ""){
				
			const filteredArray = comrpobantes_nograbados.filter(function(ele , pos){
			 return comrpobantes_nograbados.indexOf(ele) == pos;
			}) 	
			numero_prueba =	"Lo(s) comprobate(s) :" + filteredArray.join(" , ");
			}
				
			MessageBox.warning("Debes de grabar las ediciones antes de agregar un nuevo comprobante .\n " + numero_prueba);
			return;	
				
			}
			
		
			
			DataComprobanteConfirmacion.forEach(function (obj) {
				if (obj.key === "Nuevo Comprobante") {
					validar = true;
				}
				
			});
			
			if (validar) {
				MessageBox.error("Se necesita validar el comprobante agregado antes de agregar otro a la lista", {
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {}
				});
				return;
			}
			
			//validacion temporal
			var contador_temporal=0;
			DataComprobanteConfirmacion.forEach(function (obj) {
			if(obj.DATOS_SAP !== true){
				contador_temporal++;	
				
			}	
				
			});
			
			if (contador_temporal === 5) {
				MessageBox.error("Para continuar con el registro se deben guardar los 5 comprobantes que fueron creados.", {
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {}
				});
				return;
			}
			

			var obje = {
				NROD0: "",
				DOC_PAGO: "",
				COD_SAP: "",
				visibleState: false,
				iconComp: "sap-icon://pending",
				stateComp: "Warning",
				key: "Nuevo Comprobante",
				keySeg: DataComprobanteConfirmacion.length + 1,
				COMPROBANTE: "",
				TIPO_COMP: "",
				COD_TIPO_COMP: "",
				FECHA_COMP: "",
				RUC: "",
				RAZON_SOCIAL: "",
				WAERS: datosComprobante.WAERS,
				KOSTL: "",
				NROD0: "",
				ESTADO: "",
				GLOSA: "",
				ORDEN_INT: "",
				REF_FACTURA: "",
				VIAJES: "",
				EST_COMP: "COMP. PEND. APR.",
				COD_EST_COMP: "CPA",
				HABILI_COMPRO: true,
				COMPROBANTE_PRUEBA: "",
				COMPROBANTE_ANTIGUO: "",
				RUC_PRUEBA: "",
				FECHA_ANTIGUA :"",
			    TIPO_COMPRO_ANTIGUO:"",
			    ANTIGUO_GASTO: "",
				ANTIGUA_BASE: "",
				ANTIGUO_INAFECTO:"",
				ANTIGUO_TOTAL:"",
				ANTIGUO_IGV	:"",
				ANTIGUO_IND	: "",
				ANTIGUO_CUENTA: "",
			    DATOS_SAP:false ,
			    validacion_guardado:false, //30/06/2022
				TIPODOCI: "RUC",
				VALIDA_GRABADO:false,//27/07/2022
				totalImpu: "0.00",
				totalImp: "0.00",
				totalNoGr: "0.00",
				totales: "0.00",
				desglose: [],
				archivoAd: [],
				DeleteArchivo:[]
			};

			DataComprobanteConfirmacion.push(obje); //------------------ACTUALIZACION
			var mobile = {
				Android: function () {
					return navigator.userAgent.match(/Android/i);
				},
				BlackBerry: function () {
					return navigator.userAgent.match(/BlackBerry/i);
				},
				iOS: function () {
					return navigator.userAgent.match(/iPhone|iPad|iPod/i);
				},
				Opera: function () {
					return navigator.userAgent.match(/Opera Mini/i);
				},
				Windows: function () {
					return navigator.userAgent.match(/IEMobile/i);
				},
				any: function () {
					return (mobile.Android() || mobile.BlackBerry() || mobile.iOS() || mobile.Opera() || mobile.Windows());
				}
			};

			if (!mobile.any()) {
				var detalleOK = this.getView().byId("NotFound").getId();
				oSplitApp.toDetail(detalleOK);
			}

			ModelProyect.setProperty("/DataComprobanteConfirmacion", DataComprobanteConfirmacion);
			ModelProyect.setProperty("/selecPress", obje);
			ModelProyect.setProperty("/monedas", datosComprobante.WAERS);
			ModelProyect.setProperty("/fecharegistrada", fecha);
			oView.byId("cSelectedTipoDocumento").setSelectedKey("");
			oView.byId("sRegistroComprobante").setValue("");
			oView.byId("sfechaComprobante").setValue(fecha);
		},

		// livechangeIden:  function(oEvent){
		// 	sap.ui.core.BusyIndicator.show(0);
		// 	var oView								= this.getView();
		// 	var ModelProyect						= oView.getModel("Proyect");
		// 	var ruc 								= ModelProyect.getProperty("/ruc");
		// 	var tipoNif 							= ModelProyect.getProperty("/tipoNif");
		// 	var mensajes							= "";
		// 	var mensaje1							= "";
		// 	var that								= this;
		// 	var Nombre								= "";
		// 	validar_tabs							= false;
		// 	var Nombre_Boton						= oEvent.getSource().mProperties.text;
		// 	var seleccion							= ModelProyect.getProperty("/selecPress");
		// 	var DataComprobanteConfirmacion 		= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var DescRegistroComprobante 			= oView.byId("sRegistroComprobante").getValue();
		// 	var FechaComprobante					= oView.byId("sfechaComprobante").getValue();
		// 	var Key_comprobante 					= ModelProyect.getProperty("/Key_comprobante");
		// 	var COD_SAP 							= ModelProyect.getProperty("/COD_SAP");
		// 	var datosComprobante01					= ModelProyect.getProperty("/datosComprobante");
		// 	var SelectedTipoDocumento				= oView.byId("cSelectedTipoDocumento").getSelectedItem().getText();
		// 	var formato_defecha 					= FechaComprobante.substring(6, 10) + FechaComprobante.substring(5, 3) + FechaComprobante.substring(2, 0);
		// 	var razonSocial 						= ModelProyect.getProperty("/razonSocial");
		// 	var tipoNif 							= ModelProyect.getProperty("/tipoNif");
		// 	var RUC_BENE							= ModelProyect.getProperty("/RUC_BENE");
		// 	var Monto_comprobante					=ModelProyect.getProperty("/Monto_comprobante");
		// 	var codigo_clase						= "";
		// 	var validacion_comprobant				= false;//21/07/2022
		// 	ModelProyect.setProperty("/Nombre_boton", Nombre_Boton);
		// 	var VALIDAR_EDICIONES					= false;
		// 	var validacionFecha                      =ModelProyect.getProperty("/validacionFecha");
		// 	var Validacion_Clase					=ModelProyect.getProperty("/Validacion_Clase");
		// 	var validacionRango						=  ModelProyect.getProperty("/validacionRango");
			
		// 	//27/07/2022
		// 		if(seleccion.key  === "Nuevo Comprobante" || seleccion.COMPROBANTE1 !== seleccion.COMPROBANTE_ANTIGUO || (seleccion.RUC_PRUEBA !== "" && seleccion.RUC_PRUEBA !== seleccion.RUC_COPIA)){
		// 		//si se son distitintos van a validar y si no 
				
		// 		if (Nombre_Boton === "Validar"){
		// 			if (DescRegistroComprobante.length < 13 || ruc === undefined || (tipoNif === "RUC" && ruc.length < 11) || (tipoNif === "DNI" &&
		// 				ruc
		// 				.length < 8) || (FechaComprobante === undefined || FechaComprobante === "") || (Key_comprobante === undefined || Key_comprobante ===
		// 				"0"  || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "")) {
		// 			var mensajes1 = "Complete corréctamente los campos en rojos";
		// 			ModelProyect.setProperty("/visbleCampo", false);
		// 			ModelProyect.setProperty("/razonSocial", "");
		// 			ModelProyect.setProperty("/Glosa", "");
		// 				//ModelProyect.setProperty("/monedas", "---Seleccionar---");
		// 			MessageBox.error(mensajes1, {
		// 				actions: [MessageBox.Action.OK],
		// 				emphasizedAction: MessageBox.Action.OK,
		// 				onClose: function (sAction) {
		// 				sap.ui.core.BusyIndicator.hide();	
		// 				}
		// 			});

		// 			if (DescRegistroComprobante.length < 13) {
		// 				ModelProyect.setProperty("/compValState", "Error");
		// 				ModelProyect.setProperty("/compValStateText", "Complete corréctamente los números del comprobante");
		// 			} else {
		// 				ModelProyect.setProperty("/compValState", "None");
		// 				ModelProyect.setProperty("/compValStateText", "");
		// 			}

		// 			if (tipoNif === "RUC" && (ruc === undefined || ruc.length < 11)) {
		// 				ModelProyect.setProperty("/rucValState", "Error");
		// 				ModelProyect.setProperty("/rucValStateText", "Complete corréctamente el RUC");
		// 			} else {

		// 				if (tipoNif === "DNI" && (ruc === undefined || ruc.length < 8)) {
		// 					ModelProyect.setProperty("/rucValState", "Error");
		// 					ModelProyect.setProperty("/rucValStateText", "Complete corréctamente el DNI");
		// 				} else {
		// 					ModelProyect.setProperty("/rucValState", "None");
		// 					ModelProyect.setProperty("/rucValStateText", "");
		// 				}

		// 			}

		// 			if (FechaComprobante === undefined || FechaComprobante === "") {
		// 				ModelProyect.setProperty("/fecCompValState", "Error");
		// 				ModelProyect.setProperty("/fecCompValStateText", "Completar la fecha del comprobante");
		// 			} else {
		// 				ModelProyect.setProperty("/fecCompValState", "None");
		// 				ModelProyect.setProperty("/fecCompValStateText", "");
		// 			}

		// 			if (Key_comprobante === undefined || Key_comprobante === "0" || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "") {
		// 				ModelProyect.setProperty("/tipCompValState", "Error");
		// 				ModelProyect.setProperty("/tipCompValStateText", "Seleccionar un tipo de comprobante");
		// 			} else {
		// 				ModelProyect.setProperty("/tipCompValState", "None");
		// 				ModelProyect.setProperty("/tipCompValStateText", "");
		// 			}

		// 			return;
		// 		}
				
		// 		if(Key_comprobante !== undefined){
		// 			if(Key_comprobante ==="KR"){
		// 				if(DescRegistroComprobante.substring(0,1) !== "0"){
		// 					MessageBox.error("Los comprobantes del tipo KR siempre deben tene un cero a la izquierda en la serie.");
		// 					sap.ui.core.BusyIndicator.hide();	
		// 					return ;	
							
							
		// 				}
						
						
		// 			}
					
					
		// 		}
				
		// 		if(validacionFecha != undefined &&  !validacionFecha){
		// 			MessageBox.error("Formato de fecha incorrecta, el formato debe ser DD/MM/YYYY.");
		// 			sap.ui.core.BusyIndicator.hide();	
		// 			return false;	
		// 		}
					
		// 		if(validacionRango != undefined && validacionRango){
		// 		MessageBox.error("La fecha de comprobante no debe ser mayor a la fecha actual ni menor a un año de la fecha actual.");
		// 		sap.ui.core.BusyIndicator.hide();	
		// 		return ;	
		// 		}
					
		// 		if(Validacion_Clase === true){//12/08/2022
		// 		 MessageBox.warning("No se puede seleccionar el DEXT para el tipo de comprobante seleccionado.");
		// 		 ModelProyect.setProperty("/Validacion_Clase" , false);
		// 		 sap.ui.core.BusyIndicator.hide();
		// 		 return;	
		// 		}	

		// 		ModelProyect.setProperty("/compValState", "None");
		// 		ModelProyect.setProperty("/compValStateText", "");
		// 		ModelProyect.setProperty("/rucValState", "None");
		// 		ModelProyect.setProperty("/rucValStateText", "");
		// 		ModelProyect.setProperty("/rucValState", "None");
		// 		ModelProyect.setProperty("/rucValStateText", "");
		// 		ModelProyect.setProperty("/tipCompValState", "None");
		// 		ModelProyect.setProperty("/tipCompValStateText", "");
		// 		ModelProyect.setProperty("/fecCompValState", "None");
		// 		ModelProyect.setProperty("/fecCompValStateText", "");

				
		// 		DataComprobanteConfirmacion.forEach(function (ITEMS_02) {//21/07/2022
		// 			if(ITEMS_02.COMPROBANTE === DescRegistroComprobante && ITEMS_02.RUC === ruc && ITEMS_02.keySeg !== seleccion.keySeg){
		// 				validacion_comprobant = true;				
							
		// 		}
		// 		});
				
		// 		if(validacion_comprobant){
					
		// 				MessageBox.warning("Ya existe el número de comprobante.", {
		// 					actions: ["Aceptar"],
		// 					//title: "Llenar los campos faltantes",
		// 					emphasizedAction: "",
		// 					onClose: async function (sAction) {
		// 						if (sAction === "Aceptar") {
								
		// 						}
								
		// 						sap.ui.core.BusyIndicator.hide();
		// 					}
		// 				});
		// 				ModelProyect.setProperty("/razonSocial", "");
		// 				ModelProyect.setProperty("/ruc", "");
		// 				ModelProyect.setProperty("/visbleCampo", false);
		// 				return;
		// 			}

		// 		//if()
				
		// 		// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_VALIDA_PROVEEDORSet?$filter=STCD1 eq '" + ruc + "'";

		// 		// var datitos = {
		// 		// 	"FLAG": "X",
		// 		// 	"ZET_VALIDA_COMPROBANTESet": [{
		// 		// 		"COMPROBANTE": DescRegistroComprobante,
		// 		// 		"MENSAJE": "",
		// 		// 		"RUC": ruc,
		// 		// 		"TIPO_COMP": Key_comprobante,
		// 		// 		"FECHA_COMP": formato_defecha
		// 		// 	}]
		// 		// }
		// 		// $.ajax({
		// 		// 	url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
		// 		// 	type: "GET",
		// 		// 	headers: {
		// 		// 		"x-CSRF-Token": "Fetch"
		// 		// 	}
		// 		// }).always(function (data, status, response) {
		// 		// 	var token = response.getResponseHeader("x-csrf-token");
		// 		// 	$.ajax({
		// 		// 		url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_VALIDA_COMPROBANTE_CABSet",
		// 		// 		method: "POST",
		// 		// 		headers: {
		// 		// 			"x-CSRF-Token": token
		// 		// 		},
		// 		// 		async: true,
		// 		// 		contentType: "application/json",
		// 		// 		dataType: "json",
		// 		// 		data: JSON.stringify(datitos),
		// 		// 	}).always(function (data, status, response) {
		// 		// 	var mensaje_compro = data.d.ZET_VALIDA_COMPROBANTESet.results[0].MENSAJE;
		// 		// 	if (mensaje_compro === "Ya existe el número de comprobante") {
		// 		// 	MessageBox.error("Ya existe el número de comprobante");
		// 		// 	sap.ui.core.BusyIndicator.hide();
		// 		// 	}else{
		// 		// 	if(tipoNif === "RUC"){
						
		// 		// 	if(Key_comprobante === "KB" && ruc.substring(0,2) === "20"){
		// 		// 	MessageBox.warning("Los comprobantes de tipo Boletas deben ser distinto a Ruc 20");
		// 		// 	ModelProyect.setProperty("/razonSocial", "");
		// 		// 	sap.ui.core.BusyIndicator.hide();
		// 		// 	return;	
						
		// 		// 	}	
		// 		// 		jQuery.ajax({
		// 		// 					type: "GET",
		// 		// 					url: "/SUNAT/ruc?numero=" + ruc,

		// 		// 					async: true,
		// 		// 					success: async function (data1, textStatus, jqXHR) {
		// 		// 						console.log(data1)
		// 		// 						var condicion_01 = data1.condicion.toUpperCase(); //convierte de minuscula a mayuscula
		// 		// 						var estado_01 = data1.estado.toUpperCase(); //convierte de minuscula a mayuscula
		// 		// 						var mensajes = "";
		// 		// 						switch (condicion_01) {
		// 		// 						case "NO HALLADO":
		// 		// 							mensajes = "NO HALLADO";
		// 		// 							break;
		// 		// 						case "NO HABIDO":
		// 		// 							mensajes = "NO HABIDO";
		// 		// 							break;

		// 		// 						}

		// 		// 						switch (estado_01) {

		// 		// 						case "BAJA DEFINITIVA":

		// 		// 							if (mensajes.length > 0) {
		// 		// 								mensajes += " y BAJA DEFINITIVA";
		// 		// 							} else {
		// 		// 								mensajes = "BAJA DEFINITIVA";
		// 		// 							}
		// 		// 							break;
		// 		// 						case "BAJA DE OFICIO":

		// 		// 							if (mensajes.length > 0) {
		// 		// 								mensajes += " y BAJA DE OFICIO";
		// 		// 							} else {
		// 		// 								mensajes = "BAJA DE OFICIO";
		// 		// 							}
		// 		// 							break;
		// 		// 						}
		// 		// 						var numeroRuc = "";
		// 		// 						var nuevo_NroCompro = "";
		// 		// 						var antiguo_NroCompro = "";
		// 		// 						var fecha_antigua	="";
		// 		// 						var tipocomprobante_antiguo="";
		// 		// 						var tipodoc	="";
		// 		// 						var antiguo_Ruc	="";

		// 		// 						if (mensajes.length > 0) {
		// 		// 							MessageBox.information("El RUC esta " + mensajes);
		// 		// 							ModelProyect.setProperty("/razonSocial", "");
		// 		// 							sap.ui.core.BusyIndicator.hide();
		// 		// 							return;

		// 		// 						} else if (estado_01 === "ACTIVO" && condicion_01 === "HABIDO") {
		// 		// 							DataComprobanteConfirmacion.forEach(function (ITEMS) {
											
		// 		// 								if (ITEMS.keySeg === seleccion.keySeg) {//21/07/2022
												
		// 		// 									//antiguo_NroCompro = ITEMS.COMPROBANTE;
		// 		// 									//antiguo_Ruc = ITEMS.RUC;                   

												
		// 		// 								if(ITEMS.COMPROBANTE1 !== "" && ITEMS.COMPROBANTE1 !== undefined){
		// 		// 								if(ITEMS.COMPROBANTE_ANTIGUO !== ITEMS.COMPROBANTE1 && ITEMS.DATOS_SAP === true){//nuevo cambio 09/06/2022
		// 		// 								nuevo_NroCompro =DescRegistroComprobante;
		// 		// 								}else{
		// 		// 								nuevo_NroCompro ="";	
		// 		// 								}
		// 		// 								}
												
		// 		// 								if(ITEMS.RUC_PRUEBA !== "" && ITEMS.RUC_PRUEBA !== undefined){
		// 		// 								if (ITEMS.RUC_COPIA !== ITEMS.RUC_PRUEBA && ITEMS.DATOS_SAP === true) {//nuevo cambio 09/06/2022
		// 		// 									numeroRuc = ruc;
		// 		// 								}else{
		// 		// 									numeroRuc = "";
		// 		// 								}
		// 		// 								}
												
		// 		// 								if(ITEMS.FECHA_COMP === ITEMS.FECHA_ANTIGUA ){
		// 		// 									fecha_antigua = ITEMS.FECHA_COMP;
													
		// 		// 								}
												
												
		// 		// 								if(ITEMS.TIPO_COMPRO_ANTIGUO === ITEMS.COD_TIPO_COMP ){
		// 		// 									tipocomprobante_antiguo =ITEMS.COD_TIPO_COMP;
		// 		// 								}
												
		// 		// 								if(ITEMS.TIPODOCI === ITEMS.COPIA_TIPODOC){
		// 		// 									tipodoc = ITEMS.TIPODOCI;
		// 		// 								}
												
		// 		// 								if (ITEMS.keySeg === seleccion.keySeg) {
		// 		// 									ITEMS.NROD0 = datosComprobante01.NROD0;
		// 		// 									ITEMS.DOC_PAGO = datosComprobante01.DOC_PAGO;
		// 		// 									ITEMS.COD_SAP = COD_SAP;
		// 		// 									ITEMS.visibleState = true;
		// 		// 									ITEMS.TIPODOCI = tipoNif;
		// 		// 									ITEMS.COPIA_TIPODOC =tipodoc;
		// 		// 									ITEMS.TIPO_COMP = SelectedTipoDocumento;
		// 		// 									ITEMS.FECHA_COMP = FechaComprobante;
		// 		// 									ITEMS.COMPROBANTE = DescRegistroComprobante;
		// 		// 									//ITEMS.COMPROBANTE_ANTIGUO = antiguo_NroCompro;
		// 		// 									ITEMS.COMPROBANTE_PRUEBA = DescRegistroComprobante;
		// 		// 									ITEMS.COMPROBANTE_EDITADO = nuevo_NroCompro;
		// 		// 									ITEMS.RUC_EDITADO = numeroRuc;//27.06/2022
		// 		// 									ITEMS.RUC_PRUEBA = numeroRuc;
		// 		// 									//ITEMS.RUC_COPIA = antiguo_Ruc;
		// 		// 									ITEMS.FECHA_ANTIGUA =fecha_antigua;
		// 	    // 									ITEMS.TIPO_COMPRO_ANTIGUO=tipocomprobante_antiguo;
		// 		// 									ITEMS.key = ITEMS.keySeg;
		// 		// 									ITEMS.RUC = ruc;
		// 		// 									ITEMS.RAZON_SOCIAL = data1.nombre;
		// 		// 									ITEMS.COD_TIPO_COMP = Key_comprobante;
		// 		// 									ITEMS.validacion_guardado= false;//30062022
		// 		// 									ITEMS.VALIDAR_DATOS = false;//01/09/2022
											
		// 		// 								ITEMS.desglose.map(function (items02) {
		// 		// 								if (DescRegistroComprobante === ITEMS.COMPROBANTE && ITEMS.RUC === ruc) {//21/07/2022
		// 		// 									items02.COMPROBANTE = DescRegistroComprobante;
		// 		// 									}

		// 		// 									});
													
		// 		// 									ModelProyect.setProperty("/COMPROBANTE", DescRegistroComprobante);
		// 		// 									ModelProyect.setProperty("/FECHA_COMP", FechaComprobante);
		// 		// 									ModelProyect.setProperty("/TIPO_COMP", SelectedTipoDocumento);
		// 		// 									ModelProyect.setProperty("/nroPos", seleccion.keySeg);
		// 		// 									validar_tabs = true;
		// 		// 								}
		// 		// 								} 
											
		// 		// 							});
										
		// 		// 							ModelProyect.setProperty("/razonSocial", data1.nombre);
		// 		// 							ModelProyect.setProperty("/visbleCampo", true);
		// 		// 							ModelProyect.setProperty("/editableMonto_compro", false);
		// 		// 							MessageToast.show("RUC existente");
		// 		// 							sap.ui.core.BusyIndicator.hide();
		// 		// 						} else {
		// 		// 							MessageBox.information("El RUC esta " + estado_01 + " y " + condicion_01);
		// 		// 							ModelProyect.setProperty("/razonSocial", "");
		// 		// 							//ModelProyect.setProperty("/Orden_Interna", "");
		// 		// 							//ModelProyect.setProperty("/Numero_viaje", "");
		// 		// 							//ModelProyect.setProperty("/Glosa", "");
		// 		// 							ModelProyect.setProperty("/visbleCampo", false);
		// 		// 							DataComprobanteConfirmacion.forEach(function(te){//24/07/2022
		// 		// 							if (te.keySeg === seleccion.keySeg) {
		// 		// 							te.RUC = "";
		// 		// 							te.RAZON_SOCIAL ="" ;                   
												
		// 		// 							}	
		// 		// 							});
		// 		// 						}
		// 		// 						sap.ui.core.BusyIndicator.hide();
		// 		// 					},

		// 		// 					error: function (er) {
		// 		// 						MessageBox.error("Ruc invalido.");
		// 		// 						ModelProyect.setProperty("/razonSocial", "");
		// 		// 						//ModelProyect.setProperty("/Orden_Interna", "");
		// 		// 						//ModelProyect.setProperty("/Numero_viaje", "");
		// 		// 						//ModelProyect.setProperty("/Glosa", "");
		// 		// 						ModelProyect.setProperty("/visbleCampo", false);
		// 		// 						DataComprobanteConfirmacion.forEach(function(te){//24/07/2022
		// 		// 						if (te.keySeg === seleccion.keySeg) {
		// 		// 						te.RUC = "";
		// 		// 						te.RAZON_SOCIAL ="" ;                   
											
		// 		// 						}	
		// 		// 						});
										
		// 		// 						sap.ui.core.BusyIndicator.hide();
		// 		// 						console.log(er);
		// 		// 					}
		// 		// 				});
						
		// 		// 	}else if(tipoNif === "DEXT"){//24/07/2022
						
		// 		// 		var numeroRuc = "";
		// 		// 		var nuevo_NroCompro = "";
		// 		// 		var antiguo_NroCompro = "";
		// 		// 		var fecha_antigua	="";
		// 		// 		var tipocomprobante_antiguo="";
		// 		// 		var tipodoc	="";
		// 		// 		var antiguo_Ruc	="";
						
		// 		// 			jQuery.ajax({
		// 		// 					type: "GET",
		// 		// 					cache: false,
		// 		// 					headers: {
		// 		// 						"Accept": "application/json"
		// 		// 					},
		// 		// 					contentType: "application/json",
		// 		// 					url: url,
		// 		// 					async: true,
		// 		// 					success: function (data, textStatus, jqXHR) {
		// 		// 					var datos = data.d.results[0].MENSAJE;
									
		// 		// 					if(datos === "Success"){
		// 		// 					var Nombre = data.d.results[0].NAME1;	
										
		// 		// 					DataComprobanteConfirmacion.forEach(function (ITEMS) {
														
		// 		// 						if (ITEMS.keySeg === seleccion.keySeg) {//21/07/2022
											
		// 		// 								//antiguo_NroCompro = ITEMS.COMPROBANTE;
										
		// 		// 							if(ITEMS.COMPROBANTE1 !== "" && ITEMS.COMPROBANTE1 !== undefined){
		// 		// 							if(ITEMS.COMPROBANTE_ANTIGUO !== ITEMS.COMPROBANTE1 && ITEMS.DATOS_SAP === true){//nuevo cambio 09/06/2022
		// 		// 								nuevo_NroCompro =DescRegistroComprobante;
		// 		// 								}else{
		// 		// 								nuevo_NroCompro ="";	
		// 		// 								}
		// 		// 								}
											
		// 		// 							if(ITEMS.RUC_PRUEBA !== "" && ITEMS.RUC_PRUEBA !== undefined){
		// 		// 							if (ITEMS.RUC_COPIA !== ITEMS.RUC_PRUEBA && ITEMS.DATOS_SAP === true) {//nuevo cambio 09/06/2022
		// 		// 								numeroRuc = ruc;
		// 		// 							}else{
		// 		// 								numeroRuc = "";
		// 		// 							}
		// 		// 							}
										
											
		// 		// 							if(ITEMS.FECHA_COMP === ITEMS.FECHA_ANTIGUA){
		// 		// 								fecha_antigua = ITEMS.FECHA_COMP;
		// 		// 							}
											
		// 		// 							if(ITEMS.TIPO_COMPRO_ANTIGUO === ITEMS.COD_TIPO_COMP ){
		// 		// 								tipocomprobante_antiguo =ITEMS.COD_TIPO_COMP;
		// 		// 							}
											
		// 		// 							if(ITEMS.TIPODOCI === ITEMS.COPIA_TIPODOC){
		// 		// 								tipodoc = ITEMS.TIPODOCI;
		// 		// 							}
											
											
		// 		// 							if (ITEMS.keySeg === seleccion.keySeg) {
		// 		// 								ITEMS.NROD0 = datosComprobante01.NROD0;
		// 		// 								ITEMS.DOC_PAGO=datosComprobante01.BELNR;
		// 		// 								ITEMS.COD_REPO = datosComprobante01.COD_REPO;
		// 		// 								ITEMS.COD_SAP = COD_SAP;
		// 		// 								ITEMS.visibleState = true;
		// 		// 								ITEMS.TIPODOCI = tipoNif;
		// 		// 								ITEMS.COPIA_TIPODOC =tipodoc;
		// 		// 								ITEMS.TIPO_COMP = SelectedTipoDocumento;
		// 		// 								ITEMS.FECHA_COMP = FechaComprobante;
		// 		// 								ITEMS.COMPROBANTE = DescRegistroComprobante;
		// 		// 								//ITEMS.COMPROBANTE_ANTIGUO = antiguo_NroCompro;
		// 		// 								ITEMS.COMPROBANTE_PRUEBA = DescRegistroComprobante;
		// 		// 								ITEMS.COMPROBANTE_EDITADO = nuevo_NroCompro;
		// 		// 								ITEMS.RUC_EDITADO = numeroRuc;//27.06/2022
		// 		// 								ITEMS.RUC_PRUEBA = numeroRuc;
		// 		// 								ITEMS.FECHA_ANTIGUA =fecha_antigua;
		// 		// 								ITEMS.TIPO_COMPRO_ANTIGUO=tipocomprobante_antiguo;
		// 		// 								ITEMS.key = ITEMS.keySeg;
		// 		// 								ITEMS.RUC = ruc;
		// 		// 								ITEMS.RAZON_SOCIAL = Nombre;
		// 		// 								ITEMS.COD_TIPO_COMP = Key_comprobante;
		// 		// 								ITEMS.VALIDAR_DATOS = false;//01/09/2022
										
		// 		// 							ITEMS.desglose.map(function (items02) {
		// 		// 								if (DescRegistroComprobante === ITEMS.COMPROBANTE && ITEMS.RUC === ruc) {//21/07/2022
		// 		// 								items02.COMPROBANTE = DescRegistroComprobante;
		// 		// 								}
			
		// 		// 								});
												
		// 		// 								ModelProyect.setProperty("/COMPROBANTE", DescRegistroComprobante);
		// 		// 								ModelProyect.setProperty("/FECHA_COMP", FechaComprobante);
		// 		// 								ModelProyect.setProperty("/TIPO_COMP", SelectedTipoDocumento);
		// 		// 								ModelProyect.setProperty("/nroPos", seleccion.keySeg);
		// 		// 								validar_tabs = true;
		// 		// 							}
		// 		// 							}
														
		// 		// 					});
									
		// 		// 					ModelProyect.setProperty("/visbleCampo", true);
		// 		// 					//ModelProyect.setProperty("/Glosa", "");
		// 		// 					ModelProyect.setProperty("/editableMonto_compro", false);
		// 		// 					ModelProyect.setProperty("/razonSocial", Nombre);
		// 		// 					ModelProyect.setProperty("/editableRazon",false);
		// 		// 					sap.ui.core.BusyIndicator.hide();
									
		// 		// 					}else if(datos === "Proveedor no existe, por favor completar datos"){
									
		// 		// 					DataComprobanteConfirmacion.forEach(function (ITEMS) {
														
		// 		// 						if (ITEMS.keySeg === seleccion.keySeg) {//21/07/2022
											
		// 		// 								//antiguo_NroCompro = ITEMS.COMPROBANTE;
										
		// 		// 							if(ITEMS.COMPROBANTE1 !== "" && ITEMS.COMPROBANTE1 !== undefined){
		// 		// 							if(ITEMS.COMPROBANTE_ANTIGUO !== ITEMS.COMPROBANTE1 && ITEMS.DATOS_SAP === true){//nuevo cambio 09/06/2022
		// 		// 								nuevo_NroCompro =DescRegistroComprobante;
		// 		// 								}else{
		// 		// 								nuevo_NroCompro ="";	
		// 		// 								}
		// 		// 								}
											
		// 		// 							if(ITEMS.RUC_PRUEBA !== "" && ITEMS.RUC_PRUEBA !== undefined){
		// 		// 							if (ITEMS.RUC_COPIA !== ITEMS.RUC_PRUEBA && ITEMS.DATOS_SAP === true) {//nuevo cambio 09/06/2022
		// 		// 								numeroRuc = ruc;
		// 		// 							}else{
		// 		// 								numeroRuc = "";
		// 		// 							}
		// 		// 							}
										
											
		// 		// 							if(ITEMS.FECHA_COMP === ITEMS.FECHA_ANTIGUA){
		// 		// 								fecha_antigua = ITEMS.FECHA_COMP;
		// 		// 							}
											
		// 		// 							if(ITEMS.TIPO_COMPRO_ANTIGUO === ITEMS.COD_TIPO_COMP ){
		// 		// 								tipocomprobante_antiguo =ITEMS.COD_TIPO_COMP;
		// 		// 							}
											
		// 		// 							if(ITEMS.TIPODOCI === ITEMS.COPIA_TIPODOC){
		// 		// 								tipodoc = ITEMS.TIPODOCI;
		// 		// 							}
											
											
		// 		// 							if (ITEMS.keySeg === seleccion.keySeg) {
		// 		// 								ITEMS.NROD0 = datosComprobante01.NROD0;
		// 		// 								ITEMS.DOC_PAGO=datosComprobante01.BELNR;
		// 		// 								ITEMS.COD_REPO = datosComprobante01.COD_REPO;
		// 		// 								ITEMS.COD_SAP = COD_SAP;
		// 		// 								ITEMS.visibleState = true;
		// 		// 								ITEMS.TIPODOCI = tipoNif;
		// 		// 								ITEMS.COPIA_TIPODOC =tipodoc;
		// 		// 								ITEMS.TIPO_COMP = SelectedTipoDocumento;
		// 		// 								ITEMS.FECHA_COMP = FechaComprobante;
		// 		// 								ITEMS.COMPROBANTE = DescRegistroComprobante;
		// 		// 								//ITEMS.COMPROBANTE_ANTIGUO = antiguo_NroCompro;
		// 		// 								ITEMS.COMPROBANTE_PRUEBA = DescRegistroComprobante;
		// 		// 								ITEMS.COMPROBANTE_EDITADO = nuevo_NroCompro;
		// 		// 								ITEMS.RUC_EDITADO = numeroRuc;//27.06/2022
		// 		// 								ITEMS.RUC_PRUEBA = numeroRuc;
		// 		// 								ITEMS.FECHA_ANTIGUA =fecha_antigua;
		// 		// 								ITEMS.TIPO_COMPRO_ANTIGUO=tipocomprobante_antiguo;
		// 		// 								ITEMS.key = ITEMS.keySeg;
		// 		// 								ITEMS.RUC = ruc;
		// 		// 								ITEMS.RAZON_SOCIAL = "";
		// 		// 								ITEMS.COD_TIPO_COMP = Key_comprobante;
		// 		// 								ITEMS.VALIDAR_DATOS = false;//01/09/2022
										
		// 		// 							ITEMS.desglose.map(function (items02) {
		// 		// 								if (DescRegistroComprobante === ITEMS.COMPROBANTE && ITEMS.RUC === ruc) {//21/07/2022
		// 		// 								items02.COMPROBANTE = DescRegistroComprobante;
		// 		// 								}
			
		// 		// 								});
												
		// 		// 								ModelProyect.setProperty("/COMPROBANTE", DescRegistroComprobante);
		// 		// 								ModelProyect.setProperty("/FECHA_COMP", FechaComprobante);
		// 		// 								ModelProyect.setProperty("/TIPO_COMP", SelectedTipoDocumento);
		// 		// 								ModelProyect.setProperty("/nroPos", seleccion.keySeg);
		// 		// 								MessageToast.show("Proveedor no existe, por favor completar datos.");
		// 		// 								validar_tabs = true;
		// 		// 							}
		// 		// 							}
														
		// 		// 					});
									
		// 		// 					ModelProyect.setProperty("/visbleCampo", true);
		// 		// 					//ModelProyect.setProperty("/Glosa", "");
		// 		// 					ModelProyect.setProperty("/editableMonto_compro", true);
		// 		// 					ModelProyect.setProperty("/razonSocial", "");
		// 		// 					ModelProyect.setProperty("/editableRazon",true);
		// 		// 					sap.ui.core.BusyIndicator.hide();
										
		// 		// 					}
		// 		// 					},
		// 		// 					error: function () {
		// 		// 						MessageBox.error("Ocurrio un error al obtener los datos.");
		// 		// 						sap.ui.core.BusyIndicator.hide();
		// 		// 					}
		// 		// 				});
						
						
						
		// 		// 	}else{
		// 		// 			jQuery.ajax({
		// 		// 					type: "GET",
		// 		// 					cache: false,
		// 		// 					headers: {
		// 		// 						"Accept": "application/json"
		// 		// 					},
		// 		// 					contentType: "application/json",
		// 		// 					url: url,
		// 		// 					async: true,
		// 		// 					success: function (data, textStatus, jqXHR) {
		// 		// 						var datos = data.d.results[0].MENSAJE;
								
		// 		// 						if (datos === "Success") {
		// 		// 						if (ruc.length === 8) {
		// 		// 								Nombre = data.d.results[0].NAME1;
												
		// 		// 								var numeroRuc = "";
		// 		// 								var nuevo_NroCompro = "";
		// 		// 								var antiguo_NroCompro = "";
		// 		// 								var fecha_antigua	="";
		// 		// 								var tipocomprobante_antiguo="";
		// 		// 								var tipodoc ="";
		// 		// 								var antiguo_Ruc	="";
												
		// 		// 								DataComprobanteConfirmacion.forEach(function (ITEMS) {
												
		// 		// 								if (ITEMS.keySeg === seleccion.keySeg){
		// 		// 									//antiguo_NroCompro = ITEMS.COMPROBANTE;
		// 		// 									//antiguo_Ruc = ITEMS.RUC;
												
		// 		// 								if(ITEMS.COMPROBANTE1 !== "" && ITEMS.COMPROBANTE1 !== undefined){
		// 		// 								if(ITEMS.COMPROBANTE_ANTIGUO !== ITEMS.COMPROBANTE1 && ITEMS.DATOS_SAP === true){//nuevo cambio 09/06/2022
		// 		// 								nuevo_NroCompro =DescRegistroComprobante;
		// 		// 								}else{
		// 		// 								nuevo_NroCompro ="";	
		// 		// 								}
		// 		// 								}
												
		// 		// 								if(ITEMS.RUC_PRUEBA !== "" && ITEMS.RUC_PRUEBA !== undefined){
		// 		// 								if (ITEMS.RUC_COPIA !== ITEMS.RUC_PRUEBA && ITEMS.DATOS_SAP === true) {//nuevo cambio 09/06/2022
		// 		// 									numeroRuc = ruc;
		// 		// 								}else{
		// 		// 									numeroRuc = "";
		// 		// 								}
		// 		// 								}
												
		// 		// 								if(ITEMS.TIPODOCI === ITEMS.COPIA_TIPODOC){
		// 		// 									tipodoc = ITEMS.TIPODOCI;
		// 		// 								}

												
		// 		// 								if(ITEMS.FECHA_COMP === ITEMS.FECHA_ANTIGUA ){
		// 		// 									fecha_antigua = ITEMS.FECHA_COMP;
		// 		// 								}
											
												
		// 		// 								if(ITEMS.TIPO_COMPRO_ANTIGUO === ITEMS.COD_TIPO_COMP){
		// 		// 									tipocomprobante_antiguo =ITEMS.COD_TIPO_COMP;
		// 		// 								}
											
											
		// 		// 								if (ITEMS.keySeg === seleccion.keySeg) {
		// 		// 									ITEMS.NROD0 = datosComprobante01.NROD0;
		// 		// 									ITEMS.DOC_PAGO = datosComprobante01.DOC_PAGO;
		// 		// 									ITEMS.COD_SAP = COD_SAP;
		// 		// 									ITEMS.visibleState = true;
		// 		// 									ITEMS.TIPODOCI = tipoNif;
		// 		// 									ITEMS.COPIA_TIPODOC =tipodoc;
		// 		// 									ITEMS.TIPO_COMP = SelectedTipoDocumento;
		// 		// 									ITEMS.FECHA_COMP = FechaComprobante;
		// 		// 									ITEMS.COMPROBANTE = DescRegistroComprobante;
		// 		// 									//ITEMS.COMPROBANTE_ANTIGUO = antiguo_NroCompro;
		// 		// 									ITEMS.COMPROBANTE_PRUEBA = DescRegistroComprobante;
		// 		// 									ITEMS.COMPROBANTE_EDITADO = nuevo_NroCompro;
		// 		// 									ITEMS.RUC_EDITADO = numeroRuc;//27.06/2022
		// 		// 									ITEMS.RUC_PRUEBA = numeroRuc;
		// 		// 									//ITEMS.RUC_COPIA = antiguo_Ruc;
		// 		// 									ITEMS.FECHA_ANTIGUA =fecha_antigua;
		// 	    // 									ITEMS.TIPO_COMPRO_ANTIGUO=tipocomprobante_antiguo;
		// 		// 									ITEMS.key = ITEMS.keySeg;
		// 		// 									ITEMS.RUC = ruc;
		// 		// 									ITEMS.RAZON_SOCIAL = Nombre;
		// 		// 									ITEMS.COD_TIPO_COMP = Key_comprobante;
		// 		// 									ITEMS.validacion_guardado= false;//30062022
		// 		// 									ITEMS.VALIDAR_DATOS = false;//01/09/2022
													
		// 		// 									ITEMS.desglose.map(function (items02) {
		// 		// 								if (DescRegistroComprobante === ITEMS.COMPROBANTE && ITEMS.RUC === ruc) {//21/07/2022
		// 		// 									items02.COMPROBANTE = DescRegistroComprobante;
		// 		// 									}
													
		// 		// 									});
													

		// 		// 									ModelProyect.setProperty("/COMPROBANTE", DescRegistroComprobante);
		// 		// 									ModelProyect.setProperty("/FECHA_COMP", FechaComprobante);
		// 		// 									ModelProyect.setProperty("/TIPO_COMP", SelectedTipoDocumento);
		// 		// 									ModelProyect.setProperty("/nroPos", seleccion.keySeg);
		// 		// 									validar_tabs = true;
		// 		// 									sap.ui.core.BusyIndicator.hide();
		// 		// 								}
		// 		// 								}
		// 		// 							});
												
		// 		// 								ModelProyect.setProperty("/visbleCampo", true);
		// 		// 								MessageToast.show("DNI existente: " + Nombre);

		// 		// 								ModelProyect.setProperty("/razonSocial", Nombre);
		// 		// 								ModelProyect.setProperty("/visbleCampo", true);//24/07/2022
												
		// 		// 								//ModelProyect.setProperty("/monedas", "---Seleccionar---");
		// 		// 								//ModelProyect.setProperty("/Glosa", "");
		// 		// 								//ModelProyect.setProperty("/Orden_Interna", "");
		// 		// 								//ModelProyect.setProperty("/Numero_viaje", "");
		// 		// 								sap.ui.core.BusyIndicator.hide();

		// 		// 							}else{
		// 		// 							MessageBox.error("El DNI ingresado no es valido.");
		// 		// 							ModelProyect.setProperty("/razonSocial", "");
		// 		// 							ModelProyect.setProperty("/visbleCampo", true);//24/07/2022
		// 		// 							//ModelProyect.setProperty("/Glosa", "");//24/07/2022
		// 		// 							sap.ui.core.BusyIndicator.hide();
		// 		// 							}

										
		// 		// 							ModelProyect.refresh(true);
		// 		// 							return;
		// 		// 						}else if (datos === "Proveedor no existe, por favor completar datos"){
		// 		// 							MessageBox.warning("El DNI no existe como dato maestro de proveedor.", {
		// 		// 							actions: ["Aceptar"],
		// 		// 							//title: "Llenar los campos faltantes",
		// 		// 							emphasizedAction: "",
		// 		// 							onClose: async function (sAction) {
		// 		// 								if (sAction === "Aceptar") {
												
		// 		// 								}
		// 		// 								ModelProyect.setProperty("/razonSocial", "");
		// 		// 								ModelProyect.setProperty("/visbleCampo", false);//24/07/2022
		// 		// 								ModelProyect.setProperty("/Glosa", "");//24/07/2022
		// 		// 								DataComprobanteConfirmacion.forEach(function(te){//24/07/2022
		// 		// 								if (te.keySeg === seleccion.keySeg) {
		// 		// 								te.RUC = "";
		// 		// 								te.RAZON_SOCIAL ="" ;                   
													
		// 		// 								}	
		// 		// 								});
		// 		// 								sap.ui.core.BusyIndicator.hide();
		// 		// 							}
		// 		// 						});	
									
		// 		// 						}
		// 		// 					},
		// 		// 					error: function () {
		// 		// 						MessageBox.error("Ocurrio un error al obtener los datos de codigo generico");
		// 		// 						sap.ui.core.BusyIndicator.hide();
		// 		// 					}
		// 		// 				});
							
		// 		// 	}	
						
						
		// 		// 	}	
						
					
		// 		// 	});
		// 		// });
					
		// 		// }else{
				
		// 		// if(validacionFecha != true){
		// 		// 	MessageBox.error("Formato Incorrecto , por favor revisar.");
		// 		// 	sap.ui.core.BusyIndicator.hide();	
		// 		// 	return false;	
		// 		// 	}
				
				
		// 		// var nuevo_NroCompro = "";
		// 		// var antiguo_NroCompro = "";
		// 		// var fecha_antigua	="";
		// 		// var tipocomprobante_antiguo="";
		// 		// var tipodoc="";
				
		// 		// DataComprobanteConfirmacion.forEach(function (ITEMS_02) {//27/07/2022
		// 		// 	if(ITEMS_02.COMPROBANTE === DescRegistroComprobante  && ITEMS_02.keySeg !== seleccion.keySeg){
		// 		// 		validacion_comprobant = true;				
							
		// 		// }
		// 		// });
				
		// 		// if(validacion_comprobant){//27/07/2022
					
		// 		// 		MessageBox.warning("Ya existe el número de comprobante.", {
		// 		// 			actions: ["Aceptar"],
		// 		// 			//title: "Llenar los campos faltantes",
		// 		// 			emphasizedAction: "",
		// 		// 			onClose: async function (sAction) {
		// 		// 				if (sAction === "Aceptar") {
								
		// 		// 				}
								
		// 		// 				sap.ui.core.BusyIndicator.hide();
		// 		// 			}
		// 		// 		});
		// 		// 		ModelProyect.setProperty("/razonSocial", "");
		// 		// 		ModelProyect.setProperty("/ruc", "");
		// 		// 		ModelProyect.setProperty("/visbleCampo", false);
		// 		// 		return;
		// 		// 	}
		// 		// var datitos = {
		// 		// 	"FLAG": "X",
		// 		// 	"ZET_VALIDA_COMPROBANTESet": [{
		// 		// 		"COMPROBANTE": DescRegistroComprobante,
		// 		// 		"MENSAJE": "",
		// 		// 		"RUC": "",
		// 		// 		"TIPO_COMP": Key_comprobante,
		// 		// 		"FECHA_COMP": formato_defecha
		// 		// 	}]
		// 		// }
		// 		// $.ajax({
		// 		// 	url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
		// 		// 	type: "GET",
		// 		// 	headers: {
		// 		// 		"x-CSRF-Token": "Fetch"
		// 		// 	}
		// 		// }).always(function (data, status, response) {
		// 		// 	var token = response.getResponseHeader("x-csrf-token");
		// 		// 	$.ajax({
		// 		// 		url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_VALIDA_COMPROBANTE_CABSet",
		// 		// 		method: "POST",
		// 		// 		headers: {
		// 		// 			"x-CSRF-Token": token
		// 		// 		},
		// 		// 		async: true,
		// 		// 		contentType: "application/json",
		// 		// 		dataType: "json",
		// 		// 		data: JSON.stringify(datitos),
		// 		// 	}).always(function (data, status, response) {
		// 		// 	var mensaje_compro = data.d.ZET_VALIDA_COMPROBANTESet.results[0].MENSAJE;
		// 		// 	if (mensaje_compro === "Ya existe el número de comprobante") {
		// 		// 	MessageBox.error("Ya existe el número de comprobante");
		// 		// 	sap.ui.core.BusyIndicator.hide();
		// 		// 	}else{
						
		// 		// 	DataComprobanteConfirmacion.forEach(function (ITEMS) {
					
		// 		// 	if (ITEMS.keySeg === seleccion.keySeg) {
		// 		// 	//antiguo_NroCompro = ITEMS.COMPROBANTE;
	
		// 		// 	if(ITEMS.COMPROBANTE1 !== "" && ITEMS.COMPROBANTE1 !== undefined){
		// 		// 	if(ITEMS.COMPROBANTE_ANTIGUO !== ITEMS.COMPROBANTE1 && ITEMS.DATOS_SAP === true){//nuevo cambio 09/06/2022
		// 		// 	nuevo_NroCompro =DescRegistroComprobante;
		// 		// 	}else{
		// 		// 	nuevo_NroCompro ="";	
		// 		// 	}
		// 		// 	}
					
		// 		// 	if(ITEMS.TIPODOCI === ITEMS.COPIA_TIPODOC){
		// 		// 	tipodoc = ITEMS.TIPODOCI;
		// 		// 	}
						
		// 		// 		if(ITEMS.FECHA_COMP === ITEMS.FECHA_ANTIGUA ){
		// 		// 		fecha_antigua = ITEMS.FECHA_COMP;
		// 		// 		}
					
		// 		// 		if(ITEMS.TIPO_COMPRO_ANTIGUO === ITEMS.COD_TIPO_COMP){
		// 		// 		tipocomprobante_antiguo =ITEMS.TIPO_COMP;
		// 		// 		}
						
	
		// 		// 		if (ITEMS.keySeg === seleccion.keySeg) {
		// 		// 			ITEMS.NROD0 = datosComprobante01.NROD0;
		// 		// 			ITEMS.DOC_PAGO = datosComprobante01.DOC_PAGO;
		// 		// 			ITEMS.COD_SAP = COD_SAP;
		// 		// 			ITEMS.visibleState = true;
		// 		// 			ITEMS.TIPO_COMP = SelectedTipoDocumento;
		// 		// 			ITEMS.FECHA_COMP = FechaComprobante;
		// 		// 			ITEMS.COPIA_TIPODOC =tipodoc;
		// 		// 			ITEMS.COMPROBANTE = DescRegistroComprobante;
		// 		// 			ITEMS.COMPROBANTE_EDITADO = nuevo_NroCompro;
		// 		// 			ITEMS.key = ITEMS.keySeg;
		// 		// 			//ITEMS.COMPROBANTE_ANTIGUO = antiguo_NroCompro;
		// 		// 			ITEMS.COMPROBANTE_PRUEBA = DescRegistroComprobante;
		// 		// 			ITEMS.FECHA_ANTIGUA =fecha_antigua;
		// 		// 			ITEMS.TIPO_COMPRO_ANTIGUO=tipocomprobante_antiguo;
		// 		// 			ITEMS.COD_TIPO_COMP = Key_comprobante;
		// 		// 			ITEMS.validacion_guardado= false;//30062022
		// 		// 			ITEMS.VALIDAR_DATOS = false;//01/09/2022
	
		// 		// 			ModelProyect.setProperty("/COMPROBANTE", DescRegistroComprobante);
		// 		// 			ModelProyect.setProperty("/FECHA_COMP", FechaComprobante);
		// 		// 			ModelProyect.setProperty("/TIPO_COMP", SelectedTipoDocumento);
		// 		// 			ModelProyect.setProperty("/nroPos", seleccion.keySeg);
		// 		// 			validar_tabs = false;
		// 		// 			sap.ui.core.BusyIndicator.hide();
		// 		// 		}
		// 		// 		}
		// 		// 	});
		// 		// 	MessageToast.show(mensaje_compro);
		// 		// 	ModelProyect.setProperty("/visbleCampo", true);
		// 		// 	ModelProyect.setProperty("/razonSocial", "");
		// 		// 	sap.ui.core.BusyIndicator.hide();	
		// 		// 	}
		// 		// 	});
		// 		// });
				
				
					
		// 		// }
		// 		// }
		// 		// else{
		// 		// DataComprobanteConfirmacion.forEach(function (ITEMS) {
					
		// 		// if (ITEMS.keySeg === seleccion.keySeg) {
			
		// 		// 	if(ITEMS.TIPODOCI === ITEMS.COPIA_TIPODOC){
		// 		// 	tipodoc = ITEMS.TIPODOCI;
		// 		// 	}
					
		// 		// 	if(ITEMS.FECHA_COMP === ITEMS.FECHA_ANTIGUA ){
		// 		// 	fecha_antigua = ITEMS.FECHA_COMP;
		// 		// 	}
				
		// 		// 	if(ITEMS.TIPO_COMPRO_ANTIGUO === ITEMS.COD_TIPO_COMP){
		// 		// 	tipocomprobante_antiguo =ITEMS.TIPO_COMP;
		// 		// 	}
					

		// 		// 	if (ITEMS.keySeg === seleccion.keySeg) {
		// 		// 		ITEMS.NROD0 = datosComprobante01.NROD0;
		// 		// 		ITEMS.DOC_PAGO = datosComprobante01.DOC_PAGO;
		// 		// 		ITEMS.COD_SAP = COD_SAP;
		// 		// 		ITEMS.visibleState = true;
		// 		// 		ITEMS.TIPO_COMP = SelectedTipoDocumento;
		// 		// 		ITEMS.FECHA_COMP = FechaComprobante;
		// 		// 		ITEMS.COPIA_TIPODOC =tipodoc;
		// 		// 		ITEMS.key = ITEMS.keySeg;
		// 		// 		ITEMS.FECHA_ANTIGUA =fecha_antigua;
		// 		// 		ITEMS.TIPO_COMPRO_ANTIGUO=tipocomprobante_antiguo;
		// 		// 		ITEMS.COD_TIPO_COMP = Key_comprobante;
		// 		// 		ITEMS.COMPROBANTE = DescRegistroComprobante;
		// 		// 		ITEMS.RUC = ruc;
		// 		// 		ITEMS.validacion_guardado= false;//30062022
		// 		// 		ITEMS.VALIDAR_DATOS = false;//01/09/2022

		// 		// 		ModelProyect.setProperty("/COMPROBANTE", DescRegistroComprobante);
		// 		// 		ModelProyect.setProperty("/FECHA_COMP", FechaComprobante);
		// 		// 		ModelProyect.setProperty("/TIPO_COMP", SelectedTipoDocumento);
		// 		// 		ModelProyect.setProperty("/nroPos", seleccion.keySeg);
		// 		// 		validar_tabs = false;
		// 		// 		sap.ui.core.BusyIndicator.hide();
		// 		// 	}
		// 		// 	}
		// 		// });	
					
		// 		// MessageToast.show("RUC existente");
		// 		// sap.ui.core.BusyIndicator.hide();
		// 		}
		
		// 	//sap.ui.core.BusyIndicator.hide();
		// },

		onPressTab: function (oEvent) {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var selectTab = ModelProyect.getProperty("/selectTab");

			switch (selectTab) {

			case "keyTabDesgloce":
				this.validaTabDesgloce();
				break;
			case "keyTabAdjuntos":
				this.validaTabAdjuntos();
				break;
			case "keyTabObservaciones":
				this.OnPressComentarios();                   
			break;
			}

			
		},
		changeRazon_Social:function(){//24/07/2022
		var oView								= this.getView();
		var ModelProyect						= oView.getModel("Proyect");
		var DataComprobanteConfirmacion 		= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		var seleccion							= ModelProyect.getProperty("/selecPress");
		var razonSocial							=ModelProyect.getProperty("/razonSocial");
		
		DataComprobanteConfirmacion.forEach(function(obj){
		if(obj.keySeg === seleccion.keySeg){
			obj.COPIA_RAZON = obj.RAZON_SOCIAL;
			obj.RAZON_SOCIAL = razonSocial;	
		}	
		});
		
		},
		
		validaTabAdjuntos: function (oEvent) {
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var ruc 						= ModelProyect.getProperty("/ruc");
			var tipoNif 					= ModelProyect.getProperty("/tipoNif");
			var mensajes					= "";
			var mensaje1					= "";
			var that						= this;
			var Nombre						= "";
			var Nombre_boton				= ModelProyect.getProperty("/Nombre_boton");
			var seleccion					= ModelProyect.getProperty("/selecPress");
			var beneficiarios2				= ModelProyect.getProperty("/beneficiarios2");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var DescRegistroComprobante 	= oView.byId("sRegistroComprobante").getValue();
			var FechaComprobante			= oView.byId("sfechaComprobante").getValue();
			var Key_comprobante 			= ModelProyect.getProperty("/Key_comprobante");
			var COD_SAP 					= ModelProyect.getProperty("/COD_SAP");
			var datosComprobante01			= ModelProyect.getProperty("/datosComprobante");
			var SelectedTipoDocumento		= oView.byId("cSelectedTipoDocumento").getSelectedItem().getText();
			var datos_selecciones			= ModelProyect.getProperty("/datos_selecciones");
			var tipoNif 					= ModelProyect.getProperty("/tipoNif");
			var indiceComp					= 0;
			var indiceDesg					= 0;
			var monedas 					= ModelProyect.getProperty("/monedas");
			var Glosa						= ModelProyect.getProperty("/Glosa");
			var razonSocial					= ModelProyect.getProperty("/razonSocial");//24/07/2022

				if ((Nombre_boton === "Validar" && validar_tabs === false) || Nombre_boton === "Validar") {//27/07/2022
				if (DescRegistroComprobante.length < 13 || ruc === undefined || (tipoNif === "RUC" && ruc.length < 11) || (tipoNif === "DNI" &&ruc.length < 8)
				|| (tipoNif === "DEXT"  && (ruc.length < 1 || ruc === "")) || (FechaComprobante === undefined || FechaComprobante === "") || 
				(Key_comprobante === undefined || Key_comprobante ==="0" || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "") || (razonSocial === undefined || razonSocial === "") || (Glosa === undefined || Glosa === "")) {
					var mensajes1 = "Complete corréctamente los campos en rojos";
					// ModelProyect.setProperty("/visbleCampo", false);
					// ModelProyect.setProperty("/razonSocial", "");
					// ModelProyect.setProperty("/Glosa", "")
				//	ModelProyect.setProperty("/monedas", "---Seleccionar---");

					MessageBox.error(mensajes1, {
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (sAction) {}
					});

					if (DescRegistroComprobante.length < 13) {
						ModelProyect.setProperty("/compValState", "Error");
						ModelProyect.setProperty("/compValStateText", "Complete corréctamente los números del comprobante");
					} else {
						ModelProyect.setProperty("/compValState", "None");
						ModelProyect.setProperty("/compValStateText", "");
					}

					if (tipoNif === "RUC" && (ruc === undefined || ruc.length < 11)) {
						ModelProyect.setProperty("/rucValState", "Error");
						ModelProyect.setProperty("/rucValStateText", "Complete corréctamente el RUC");
						ModelProyect.setProperty("/razonSocial", "");
					} else {

						if (tipoNif === "DNI" && (ruc === undefined || ruc.length < 8)) {
							ModelProyect.setProperty("/rucValState", "Error");
							ModelProyect.setProperty("/rucValStateText", "Complete corréctamente el DNI");
						} else {
							ModelProyect.setProperty("/rucValState", "None");
							ModelProyect.setProperty("/rucValStateText", "");
							ModelProyect.setProperty("/razonSocial", "");
						}

					}

					if (FechaComprobante === undefined || FechaComprobante === "") {
						ModelProyect.setProperty("/fecCompValState", "Error");
						ModelProyect.setProperty("/fecCompValStateText", "Completar la fecha del comprobante");
					} else {
						ModelProyect.setProperty("/fecCompValState", "None");
						ModelProyect.setProperty("/fecCompValStateText", "");
					}

					if (Key_comprobante === undefined || Key_comprobante === "0" || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "") {
						ModelProyect.setProperty("/tipCompValState", "Error");
						ModelProyect.setProperty("/tipCompValStateText", "Seleccionar un tipo de comprobante");
					} else {
						ModelProyect.setProperty("/tipCompValState", "None");
						ModelProyect.setProperty("/tipCompValStateText", "");
					}
					
				
					
					

					var selectkeyTab = oView.byId("iconTabDetalle");
					var nombreTab = selectkeyTab.setSelectedKey("idComprobantes");
					that.getOwnerComponent().getRouter().navTo(nombreTab);

					return;
				}
			} else {
				if (DescRegistroComprobante.length < 13 || (FechaComprobante === undefined || FechaComprobante === "") || (Key_comprobante ===
						undefined || Key_comprobante ===
						"0" || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "") || (monedas === "---Seleccionar---" || monedas === undefined) || (Glosa === undefined || Glosa === "")) {
					var mensajes1 = "Complete corréctamente los campos en rojos";
					ModelProyect.setProperty("/visbleCampo", true);
					ModelProyect.setProperty("/Glosa", "")
				//	ModelProyect.setProperty("/monedas", "---Seleccionar---");

					MessageBox.error(mensajes1, {
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (sAction) {}
					});

					if (DescRegistroComprobante.length < 13) {
						ModelProyect.setProperty("/compValState", "Error");
						ModelProyect.setProperty("/compValStateText", "Complete corréctamente los números del comprobante");
					} else {
						ModelProyect.setProperty("/compValState", "None");
						ModelProyect.setProperty("/compValStateText", "");
					}

					if (FechaComprobante === undefined || FechaComprobante === "") {
						ModelProyect.setProperty("/fecCompValState", "Error");
						ModelProyect.setProperty("/fecCompValStateText", "Completar la fecha del comprobante");
					} else {
						ModelProyect.setProperty("/fecCompValState", "None");
						ModelProyect.setProperty("/fecCompValStateText", "");
					}

					if (Key_comprobante === undefined || Key_comprobante === "0" || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "") {
						ModelProyect.setProperty("/tipCompValState", "Error");
						ModelProyect.setProperty("/tipCompValStateText", "Seleccionar un tipo de comprobante");
					} else {
						ModelProyect.setProperty("/tipCompValState", "None");
						ModelProyect.setProperty("/tipCompValStateText", "");
					}
					
					if (monedas === "---Seleccionar---" || monedas === undefined) {
						ModelProyect.setProperty("/estadoMone", "Error");
						ModelProyect.setProperty("/monedaValueSt", "Seleccionar la moneda");
					} else {
						ModelProyect.setProperty("/estadoMone", "None");
						ModelProyect.setProperty("/monedaValueSt", "");
					}

					if (Glosa === undefined || Glosa === "") {
						ModelProyect.setProperty("/estadoglos", "Error");
						ModelProyect.setProperty("/GlosaValueSt", "Completar el motivo");
					} else {
						ModelProyect.setProperty("/estadoglos", "None");
						ModelProyect.setProperty("/GlosaValueSt", "");
					}

					var selectkeyTab = oView.byId("iconTabDetalle");
					var nombreTab = selectkeyTab.setSelectedKey("idComprobantes");
					that.getOwnerComponent().getRouter().navTo(nombreTab);

					return;
				}

			}
			
				var mensajes = "";
			//------------------------CAMBIOS  DE CR-------------------------------------//
			if (Nombre_boton === "Validar") {
				if ((seleccion.COMPROBANTE !== DescRegistroComprobante) || (seleccion.FECHA_COMP !== FechaComprobante) || (seleccion.TIPODOCI !==
						tipoNif) || (seleccion.COD_TIPO_COMP !== Key_comprobante) || (seleccion.RUC !== ruc) || (Glosa  !== seleccion.GLOSA)) {
					validar_tabs = false;
					seleccion.validacion_guardado = false;//30062022
					mensajes = "Validar";
					
				} else {
					validar_tabs = true;
				}

			} else {
				if ((seleccion.COMPROBANTE !== DescRegistroComprobante) || (seleccion.FECHA_COMP !== FechaComprobante) || (seleccion.COD_TIPO_COMP !==
						Key_comprobante)|| (Glosa  !== seleccion.GLOSA)) {
					validar_tabs = false;
					seleccion.validacion_guardado = false;//30062022
					mensajes = "Registrar"
				} else {
					validar_tabs = true;
				}
			}

			if (validar_tabs === false) {
				var selectkeyTab_01 = oView.byId("iconTabDetalle");
				var nombreTab02 = selectkeyTab_01.setSelectedKey("idComprobantes");
				that.getOwnerComponent().getRouter().navTo(nombreTab02);
				MessageToast.show(mensajes + "los datos nuevos.");
				return;
			} else {
				var selectkeyTab = oView.byId("iconTabDetalle");
				var nombreTab01 = selectkeyTab.setSelectedKey("keyTabAdjuntos");
				that.getOwnerComponent().getRouter().navTo(nombreTab01);

				ModelProyect.setProperty("/compValState", "None");
				ModelProyect.setProperty("/compValStateText", "");
				ModelProyect.setProperty("/rucValState", "None");
				ModelProyect.setProperty("/rucValStateText", "");
				ModelProyect.setProperty("/rucValState", "None");
				ModelProyect.setProperty("/rucValStateText", "");
				ModelProyect.setProperty("/tipCompValState", "None");
				ModelProyect.setProperty("/tipCompValStateText", "");
				ModelProyect.setProperty("/estadoMone", "None");
				ModelProyect.setProperty("/estadoglos", "None");

			ModelProyect.setProperty("/compValState", "None");
			ModelProyect.setProperty("/compValStateText", "");
			ModelProyect.setProperty("/rucValState", "None");
			ModelProyect.setProperty("/rucValStateText", "");
			ModelProyect.setProperty("/rucValState", "None");
			ModelProyect.setProperty("/rucValStateText", "");
			ModelProyect.setProperty("/tipCompValState", "None");
			ModelProyect.setProperty("/tipCompValStateText", "");
			}

		},

		masFilas: function () {
			var that = this;
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var datas = ModelProyect.getProperty("/datas");
			var jsonData = ModelProyect.getProperty("/jsonData");
			var selecPress = ModelProyect.getProperty("/selecPress");
			var indice = "";
			var Datitos = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var DatosComprobantes = ModelProyect.getProperty("/DatosComprobantes");
			var indicadores_mov = "";
			var movilidad_0 = false;
			var inafecto = false;
			var base = false;
			var imputaciones = false;
			var indicadores_ = true;
			var vali_Banco = false;
			var vali_Gastos = true;
			var vali_borrar = false;
			var vali_Igv	=true;
			
			Datitos.forEach(function (rs, i) {
				if (rs.COMPROBANTE === selecPress.COMPROBANTE  && rs.RUC === selecPress.RUC) {//21/07/2022
					indice = i;
					if (rs.desglose.length > 0) {
						rs.desglose.forEach(function (items_06) {
							indicadores_mov = items_06.IND_IMP;

							switch (rs.COD_TIPO_COMP) { //cambios de Claudia 
							case "KH":
								indicadores_ = false;
								movilidad_0 = false;
								inafecto = true;
								base = false;
								imputaciones = true;
								vali_Gastos = true;
								vali_Banco = false;
								vali_Igv=false;
								break;
							case "DU": ///CAMBIOS DE CLAUDIA
								indicadores_ = false;
								movilidad_0 = false;
								inafecto = true;
								base = false;
								imputaciones = false;
								vali_Gastos = true;
								vali_Banco = false;
								vali_Igv=false;
								break;
							case "KB": ///CAMBIOS DE CLAUDIA
								indicadores_ = false;
								movilidad_0 = false;
								inafecto = true;
								base = false;
								imputaciones = true;
								vali_Gastos = true;
								vali_Banco = false;
								vali_Igv=false;
								break;
							case "KD": ///CAMBIOS DE CLAUDIA-
								if (items_06.IND_IMP === "C0") { ////////cambios
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = false;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=false;
								} else {
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = true;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=true;
								}
								break;
							case "KI":
								indicadores_ = false;
								movilidad_0 = false;
								inafecto = true;
								base = true;
								imputaciones = true;
								vali_Gastos = true;
								vali_Banco = false;
								vali_Igv=true;
								break;
							case "KG":
								if (items_06.IND_IMP === "C0") { ////////cambios
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = false;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=false;
								} else {
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = true;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=true;
								}
								break;
							case "KH"://----cambioss
								indicadores_ = false;
								movilidad_0 = false;
								inafecto = true;
								base = false;
								imputaciones = true;
								vali_Gastos = true;
								vali_Banco = false;
								vali_Igv=false;
								break;
							case "KM": //----cambioss
								indicadores_ = false;
								movilidad_0 = false;
								inafecto = true;
								base = false;
								imputaciones = true;
								vali_Gastos = true;
								vali_Banco = false;
								vali_Igv=false;
								break;
							case "KP": //----
								if (items_06.IND_IMP === "C0") { ////////cambios
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = false;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=false;
								} else {
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = true;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=true;
								}
								break;
							case "KR": //----
								if (items_06.IND_IMP === "C0") { ////////cambios
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = false;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=false;
								} else {
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = true;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=true;
								}
								break;
							case "KT": //----
								if (items_06.IND_IMP === "C0") { ////////cambios
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = false;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=false;
								} else {
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = true;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=true;
								}
								break;
							case "KV": //----
								if (items_06.IND_IMP === "C0") { ////////cambios
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = false;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=false;
								} else {
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = true;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=true;
								}
								break;
							case "KX": //----actualizar
								indicadores_ = false;
								movilidad_0 = false;
								inafecto = true;
								base = false;
								imputaciones = true;
								vali_Gastos = true;
								vali_Banco = false;
								vali_Igv=false;
								break;
							case "SK": //----
								indicadores_ = false;
								movilidad_0 = false;
								inafecto = true;
								base = false;
								imputaciones = true;
								vali_Gastos = true;
								vali_Banco = false;
								vali_Igv=false;
								break;
							default:
								if (items_06.IND_IMP === "C2" || items_06.IND_IMP === "C4") {
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = true;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=true;
								} else {
									indicadores_ = true;
									movilidad_0 = false;
									inafecto = true;
									base = false;
									imputaciones = true;
									vali_Gastos = true;
									vali_Banco = false;
									vali_Igv=false;
								}
								break;
							}

						});
					}
				}
			});
			if (jsonData.length + 1 !== 1) {
				vali_borrar = true;
			} else {
				vali_borrar = false;
			}

			var gastitos = {
				stateCeco: "Warning",
				iconCeco: "sap-icon://alert",
				COMPROBANTE: selecPress.COMPROBANTE,
				POSIC: jsonData.length + 1,
				COD_CONT: "",
				centro: "",
				BASE_IMP: "0.00",
				IGV: "0.00",
				INAFECTO: "0.00",
				TOTAL: "0.00",
				IND_IMP: indicadores_mov,
				imp: "",
				validacionIndicador: indicadores_,
				validacionBase: base,
				validacionInafecto: inafecto,
				validaciones1: movilidad_0,
				validacionIGV:vali_Igv,
				enableImputa: imputaciones,
				enabledGastos: vali_Gastos,
				enabledBanco: vali_Banco,
				enabledBorrar: vali_borrar,
				movilidad: [],
				imputacion: []
			}

			//jsonData.push(gastitos);	

			Datitos[indice].desglose.push(gastitos);

			// ModelProyect.setProperty("/datosjson", Datitos[indice].desglose);

			ModelProyect.setProperty("/jsonData", Datitos[indice].desglose);
			// if(jsonData[indice].COMPROBANTE===Datitos.COMPROBANTE){
			// }

			//ModelProyect.setProperty("/DataComprobanteConfirmacion",jsonData);

			ModelProyect.refresh(true);
		},

		handleChange: function () {
			var oView = this.getView();
			var that = this;
			var ModelProyect = oView.getModel("Proyect");
			var datosfecha = ModelProyect.getProperty("/datosfecha");
			var ImportePermito = ModelProyect.getProperty("/ImportePermito");
			var Excedentes = ModelProyect.getProperty("/Excedentes");
			var fecha = ModelProyect.getProperty("/fecha");
			var ImportesPermitos = ModelProyect.getProperty("/ImportesPermitos");
			var jsonData = ModelProyect.getProperty("/jsonData");
			var seleccionMov = ModelProyect.getProperty("/seleccionMov");
			var sumatoria = 0;
			var sumatoria1 = 0;
			var validaciones01 = false;
			var valor = false;
			var mensaje = "";
			var contad = 0;
			var excedentes = "";
			var datosMovilidad = ModelProyect.getProperty("/datosMovilidad");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var totalmovilidad = 0;
			var resta = 0;
			var conta02 = 0;
			var formato = fecha.substring(6, 8) + "/" + fecha.substring(4, 6) + "/" + fecha.substring(0, 4);
			// var ImportesP=parseFloat(ImportesPermitos);
			var Importetotal = ModelProyect.getProperty("/Importetotal");
			var DP1 = sap.ui.getCore().byId("DP1").getValue();
			var Importetotal01 = Importetotal.replaceAll(",", "");
			var ImportesP01 = ImportesPermitos.replaceAll(",", "");
			var format01 = DP1.substring(6, 8) + "/" + DP1.substring(4, 6) + "/" + DP1.substring(0, 4);
			var indicedes = 0;
			var indiced = 0

			DataComprobanteConfirmacion.forEach(function (items2, ix) {
				if (items2.COMPROBANTE === seleccionMov.COMPROBANTE) {
					indiced = ix;
					items2.desglose.forEach(function (items, index) {
						if (items.POSIC === seleccionMov.POSIC) {
							indicedes = index;
							items.movilidad.forEach(function (obj) {
								if (obj.FECHA === formato) {
									validaciones01 = true;
								}
							});
						}
					});
				}
			});

			if (validaciones01) {
				mensaje = "Existe una movilidad con la fecha .";
				MessageBox.warning(mensaje, {
					actions: ["OK"],
					onClose: function (sAction) {}
				});
				return;
			}

		},

		masMovilidad: function () {
			var oView = this.getView();
			var that = this;
			var ModelProyect = oView.getModel("Proyect");
			var datosfecha = ModelProyect.getProperty("/datosfecha");
			var ImportePermito = ModelProyect.getProperty("/ImportePermito");
			var Excedentes = ModelProyect.getProperty("/Excedentes");
			var fecha = ModelProyect.getProperty("/fecha");
			var ImportesPermitos = ModelProyect.getProperty("/ImportesPermitos");
			var jsonData = ModelProyect.getProperty("/jsonData");
			var seleccionMov = ModelProyect.getProperty("/seleccionMov");
			var sumatoria = 0;
			var sumatoria1 = 0;
			var validaciones01 = false;
			var valor = false;
			var mensaje = "";
			var contad = 0;
			var excedentes = "";
			var datosMovilidad = ModelProyect.getProperty("/datosMovilidad");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var totalmovilidad				= 0;
			var resta						= 0;
			var conta02 					= 0;
			var Importetotal				= ModelProyect.getProperty("/Importetotal");
			var ImportesP01 				= ImportesPermitos.replaceAll(",", "");
			var indicedes					= 0;
			var indiced 					= 0;
			var datos_mov					= ModelProyect.getProperty("/datos_mov");
			var datos_selecciones			= ModelProyect.getProperty("/datos_selecciones");//21/07/2022
			
			//20220211

			if (datosMovilidad === undefined) {
				datosMovilidad = [];
			}
			
			DataComprobanteConfirmacion.forEach(function (items_01, INDEX) {
				if (items_01.keySeg === datos_selecciones.keySeg) {//21/07/2022
					indiced = INDEX;
					items_01.desglose.forEach(function (obj, inx) {
						if (obj.POSIC === seleccionMov.POSIC) {
							indicedes = inx;
						}
					});

				}
			});
			var datMov = {
				COMPROBANTE: seleccionMov.COMPROBANTE,
				POSICDESGLO: seleccionMov.POSIC,
				POSICMOV: (datosMovilidad.length + 1).toString(),
				FECHA: "",
				IMP_PERM: "0.00",
				IMP_EXED: "0.00",
				impTotalMov: "0.00"
			}

			datosMovilidad.push(datMov);
			// DataComprobanteConfirmacion[indiced].desglose[indicedes].movilidad.push(datMov) ;                                                 

			ModelProyect.setProperty("/datosMovilidad", datosMovilidad);

			ModelProyect.refresh(true);

		},

		// 	//----------------------- Cambios JRodriguez --------------------------------------
		validaTabDesgloce: function (oEvent) {
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var ruc 						= ModelProyect.getProperty("/ruc");
			var tipoNif 					= ModelProyect.getProperty("/tipoNif");
			var mensajes					= "";
			var mensaje1					= "";
			var that						= this;
			var Nombre						= "";
			var seleccion					= ModelProyect.getProperty("/selecPress");
			var Nombre_boton				= ModelProyect.getProperty("/Nombre_boton");
			var beneficiarios2				= ModelProyect.getProperty("/beneficiarios2");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var DescRegistroComprobante 	= oView.byId("sRegistroComprobante").getValue();
			var FechaComprobante			= oView.byId("sfechaComprobante").getValue();
			var Key_comprobante 			= ModelProyect.getProperty("/Key_comprobante");
			var COD_SAP 					= ModelProyect.getProperty("/COD_SAP");
			var datosComprobante01			= ModelProyect.getProperty("/datosComprobante");
			var SelectedTipoDocumento		= oView.byId("cSelectedTipoDocumento").getSelectedItem().getText();
			var datos_selecciones			= ModelProyect.getProperty("/datos_selecciones");
			var tipoNif 					= ModelProyect.getProperty("/tipoNif");
			var contadores					= 0;
			var indiceComp					= 0;
			var indiceDesg					= 0;
			var monedas 					= ModelProyect.getProperty("/monedas");
			var Glosa						= ModelProyect.getProperty("/Glosa");
			var idReferenciaFact			= oView.byId("idFactura").getValue();
			var razonSocial					= ModelProyect.getProperty("/razonSocial");//24/07/2022
			// 	DataComprobanteConfirmacion.forEach(function(objs){
			// 	if(objs.COMPROBANTE === DescRegistroComprobante){
			// objs.desglose.forEach(function(ijs){
			
			// 	ijs.ANTIGUO_GASTO			= ijs.COD_CONT;
			// 	ijs.ANTIGUA_BASE			= ijs.BASE_IMP;
			// 	ijs.ANTIGUO_IGV					= ijs.IGV;
			// 	ijs.ANTIGUO_INAFECTO			= ijs.INAFECTO;
			// 	ijs.ANTIGUO_TOTAL				= ijs.TOTAL;
			// 	ijs.ANTIGUO_IND				= ijs.IND_IMP;
			// 	ijs.ANTIGUO_CUENTA			= ijs.CUENTA_BANC;	
				
			// });                  		
			// 	}
				
			// });	/// realiza el guardado de la data antigua antes de modificar
		
			if ((Nombre_boton === "Validar" && validar_tabs === false) || Nombre_boton === "Validar") {//27/07/2022
				if (DescRegistroComprobante.length < 13 || ruc === undefined || (tipoNif === "RUC" && ruc.length < 11) || (tipoNif === "DNI" &&
				ruc.length < 8) || (tipoNif === "DEXT"  && (ruc.length < 1 || ruc === "")) || (FechaComprobante === undefined || FechaComprobante === "") || (Key_comprobante === undefined || Key_comprobante ===
						"0" || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "") || (razonSocial === undefined || razonSocial === "") || (Glosa === undefined || Glosa === "") ||
						((idReferenciaFact === undefined || idReferenciaFact === "" ) && (Key_comprobante === "KG" || Key_comprobante === "KD"))) {
					var mensajes1 = "Complete corréctamente los campos en rojos y vacios .";//27/07/2022
					//ModelProyect.setProperty("/visbleCampo", false);
					//ModelProyect.setProperty("/razonSocial", "");
					//ModelProyect.setProperty("/Glosa", "")
				//	ModelProyect.setProperty("/monedas", "---Seleccionar---");

					MessageBox.error(mensajes1, {
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (sAction) {}
					});

					if (DescRegistroComprobante.length < 13) {
						ModelProyect.setProperty("/compValState", "Error");
						ModelProyect.setProperty("/compValStateText", "Complete corréctamente los números del comprobante");
					} else {
						ModelProyect.setProperty("/compValState", "None");
						ModelProyect.setProperty("/compValStateText", "");
					}

					if (tipoNif === "RUC" && (ruc === undefined || ruc.length < 11)) {
						ModelProyect.setProperty("/rucValState", "Error");
						ModelProyect.setProperty("/rucValStateText", "Complete corréctamente el RUC");
						ModelProyect.setProperty("/razonSocial", "");
					} else {

						if (tipoNif === "DNI" && (ruc === undefined || ruc.length < 8)) {
							ModelProyect.setProperty("/rucValState", "Error");
							ModelProyect.setProperty("/rucValStateText", "Complete corréctamente el DNI");
							ModelProyect.setProperty("/razonSocial", "");
						} else {
							ModelProyect.setProperty("/rucValState", "None");
							ModelProyect.setProperty("/rucValStateText", "");
						}

					}

					if (FechaComprobante === undefined || FechaComprobante === "") {
						ModelProyect.setProperty("/fecCompValState", "Error");
						ModelProyect.setProperty("/fecCompValStateText", "Completar la fecha del comprobante");
					} else {
						ModelProyect.setProperty("/fecCompValState", "None");
						ModelProyect.setProperty("/fecCompValStateText", "");
					}

					if (Key_comprobante === undefined || Key_comprobante === "0" || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "") {
						ModelProyect.setProperty("/tipCompValState", "Error");
						ModelProyect.setProperty("/tipCompValStateText", "Seleccionar un tipo de comprobante");
					} else {
						ModelProyect.setProperty("/tipCompValState", "None");
						ModelProyect.setProperty("/tipCompValStateText", "");
					}
					
					if (Glosa === undefined || Glosa === "") {
						ModelProyect.setProperty("/estadoglos", "Error");
						ModelProyect.setProperty("/GlosaValueSt", "Completar el motivo");
					} else {
						ModelProyect.setProperty("/estadoglos", "None");
						ModelProyect.setProperty("/GlosaValueSt", "");
					}
					
					if((idReferenciaFact === undefined || idReferenciaFact === "" ) && (Key_comprobante === "KG" || Key_comprobante === "KD")){
						ModelProyect.setProperty("/FactValState", "Error");
						ModelProyect.setProperty("/FactValStateText", "Completar la referencia a factura");
					}
					
					var selectkeyTab = oView.byId("iconTabDetalle");
					var nombreTab = selectkeyTab.setSelectedKey("idComprobantes");
					that.getOwnerComponent().getRouter().navTo(nombreTab);

					return;
				}
			} else {
				if (DescRegistroComprobante.length < 13 || (FechaComprobante === undefined || FechaComprobante === "") || (Key_comprobante ===
						undefined || Key_comprobante ===
						"0" || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "") || (monedas === "---Seleccionar---" || monedas === undefined) || (Glosa === undefined || Glosa === "")) {
					var mensajes1 = "Complete corréctamente los campos en rojos";
					//ModelProyect.setProperty("/visbleCampo", true);
					//ModelProyect.setProperty("/Glosa", "")
				//	ModelProyect.setProperty("/monedas", "---Seleccionar---");

					MessageBox.error(mensajes1, {
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (sAction) {}
					});

					if (DescRegistroComprobante.length < 13) {
						ModelProyect.setProperty("/compValState", "Error");
						ModelProyect.setProperty("/compValStateText", "Complete corréctamente los números del comprobante");
					} else {
						ModelProyect.setProperty("/compValState", "None");
						ModelProyect.setProperty("/compValStateText", "");
					}

					if (FechaComprobante === undefined || FechaComprobante === "") {
						ModelProyect.setProperty("/fecCompValState", "Error");
						ModelProyect.setProperty("/fecCompValStateText", "Completar la fecha del comprobante");
					} else {
						ModelProyect.setProperty("/fecCompValState", "None");
						ModelProyect.setProperty("/fecCompValStateText", "");
					}

					if (Key_comprobante === undefined || Key_comprobante === "0" || Key_comprobante ==="---Seleccionar---" || Key_comprobante === "") {
						ModelProyect.setProperty("/tipCompValState", "Error");
						ModelProyect.setProperty("/tipCompValStateText", "Seleccionar un tipo de comprobante");
					} else {
						ModelProyect.setProperty("/tipCompValState", "None");
						ModelProyect.setProperty("/tipCompValStateText", "");
					}
					
					if (monedas === "---Seleccionar---" || monedas === undefined) {
						ModelProyect.setProperty("/estadoMone", "Error");
						ModelProyect.setProperty("/monedaValueSt", "Seleccionar la moneda");
					} else {
						ModelProyect.setProperty("/estadoMone", "None");
						ModelProyect.setProperty("/monedaValueSt", "");
					}

					if (Glosa === undefined || Glosa === "") {
						ModelProyect.setProperty("/estadoglos", "Error");
						ModelProyect.setProperty("/GlosaValueSt", "Completar el motivo");
					} else {
						ModelProyect.setProperty("/estadoglos", "None");
						ModelProyect.setProperty("/GlosaValueSt", "");
					}

					var selectkeyTab = oView.byId("iconTabDetalle");
					var nombreTab = selectkeyTab.setSelectedKey("idComprobantes");
					that.getOwnerComponent().getRouter().navTo(nombreTab);

					return;
				}

			}
			var mensajes = "";

			//------------------------CAMBIOS  DE CR-------------------------------------//
			if (Nombre_boton === "Validar") {
				if ((seleccion.COMPROBANTE !== DescRegistroComprobante) || (seleccion.FECHA_COMP !== FechaComprobante) || (seleccion.TIPODOCI !==
						tipoNif) || (seleccion.COD_TIPO_COMP !== Key_comprobante ) || (seleccion.RUC !== ruc)|| (Glosa !== seleccion.GLOSA)) {
					validar_tabs = false;
					seleccion.validacion_guardado = false;//30062022
					mensajes = "Validar";
				} else {
					validar_tabs = true;
				}
			} else {
				if ((seleccion.COMPROBANTE !== DescRegistroComprobante) || (seleccion.FECHA_COMP !== FechaComprobante) || (seleccion.COD_TIPO_COMP !==
						Key_comprobante) || (Glosa !== seleccion.GLOSA)) {
					validar_tabs = false;
					seleccion.validacion_guardado = false;//30062022
					mensajes = "Registrar"
				} else {
					validar_tabs = true;
				}
			}

			if (validar_tabs === false) {
				var selectkeyTab_01 = oView.byId("iconTabDetalle");
				var nombreTab02 = selectkeyTab_01.setSelectedKey("idComprobantes");
				that.getOwnerComponent().getRouter().navTo(nombreTab02);
				MessageToast.show(mensajes + " los datos nuevos.");
				return;
			} else {
				var selectkeyTab = oView.byId("iconTabDetalle");
				var nombreTab01 = selectkeyTab.setSelectedKey("keyTabDesgloce");
				that.getOwnerComponent().getRouter().navTo(nombreTab01);

				ModelProyect.setProperty("/compValState", "None");
				ModelProyect.setProperty("/compValStateText", "");
				ModelProyect.setProperty("/rucValState", "None");
				ModelProyect.setProperty("/rucValStateText", "");
				ModelProyect.setProperty("/rucValState", "None");
				ModelProyect.setProperty("/rucValStateText", "");
				ModelProyect.setProperty("/tipCompValState", "None");
				ModelProyect.setProperty("/tipCompValStateText", "");
				ModelProyect.setProperty("/estadoMone", "None");
				ModelProyect.setProperty("/estadoglos", "None");
				ModelProyect.setProperty("/GlosaValueSt", "");
				ModelProyect.setProperty("/FactValState", "None");
				ModelProyect.setProperty("/FactValStateText", "");
				
				///////--------------------------------------------------------------------------
			
				
				if ((seleccion.validaCECO === undefined || seleccion.validaCECO === false) && seleccion.desglose[0].imputacion.length === 0) {
					if (seleccion.desglose.length > 0) {
						var validacionComprobante	= "";
						var validacionRuc = "";

						seleccion.validaCECO = true;
						sap.ui.core.BusyIndicator.show(0);
						
							if((seleccion.COMPROBANTE !== seleccion.COMPROBANTE_ANTIGUO) && seleccion.DATOS_SAP === true){
						validacionComprobante = seleccion.COMPROBANTE_ANTIGUO;	
						}else{
						validacionComprobante = seleccion.COMPROBANTE;	
						}
						
						if((seleccion.RUC !== seleccion.RUC_COPIA) && seleccion.DATOS_SAP === true){
						validacionRuc = seleccion.RUC_COPIA;	
						}else{
						validacionRuc = seleccion.RUC;	
						}
						
						// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_IMP_CECO_DETSet?$filter=COD_SAP eq '" + seleccion.COD_SAP +
						// 	"' and COMPROBANTE eq '" + seleccion.COMPROBANTE + "'";
						// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_IMP_CECO_DETSet?$filter=COD_SAP eq '" + seleccion.COD_SAP +
						// 	"' and COMPROBANTE eq '" + validacionComprobante + "' and RUC eq '"+ validacionRuc +"'";
						// jQuery.ajax({
						// 	type: "GET",
						// 	cache: false,
						// 	headers: {
						// 		"Accept": "application/json"
						// 	},
						// 	contentType: "application/json",
						// 	url: url,
						// 	async: true,
						// 	success: function (data, textStatus, jqXHR) {
						// 		var datos = data.d.results;
						// 		if (datos.length > 0) {
						// 			DataComprobanteConfirmacion.forEach(function (items, inde1) {
						// 				if (items.keySeg === seleccion.keySeg) {//21/07/2022
						// 					indiceComp = inde1;
						// 					items.desglose.forEach(function (rx, inde2) {
						// 						var contadores = 0;
						// 						datos.forEach(function (desgObj, indeDes) {
						// 							if (rx.POSIC === parseFloat(desgObj.ID_CECO).toString()) {
													
						// 								indiceDesg = inde2;
						// 								contadores++;
						// 								rx.stateCeco = "Success";
						// 								rx.iconCeco = "sap-icon://sys-enter-2";
						// 								var imputacion01 = {
						// 									COMPROBANTE: desgObj.COMPROBANTE,
						// 									POSDESGLOSE: parseFloat(desgObj.ID_CECO).toString(),
						// 									POSICION: contadores.toString(),
						// 									WAERS: desgObj.WAERS,
						// 									KOSTL: desgObj.KOSTL,
						// 									IMP: desgObj.IMP.replaceAll(" ", ""),
						// 									IMP_TOTAL: desgObj.IMP_TOTAL.replaceAll(" ", ""),
						// 									porcentajeII: desgObj.PORCENTAJE,
						// 									selectKeyagre: desgObj.KOSTL
						// 								}
						// 								rx.imputacion.push(imputacion01);

						// 							}
						// 						});
						// 					});
						// 				}
						// 			});
						// 		}
						// 		sap.ui.core.BusyIndicator.hide();
						// 		ModelProyect.setProperty("/datos_imp", DataComprobanteConfirmacion[indiceComp].desglose[indiceDesg].imputacion);
						// 	}
						// });
				}
				}
			

				
			}
		},

		onMovilidad: function (oEvent) {// CRomero 03/11/2022
			var that						= this;
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var COD_SAP 					= ModelProyect.getProperty("/COD_SAP");
			var beneficiarios2				= ModelProyect.getProperty("/beneficiarios2");
			var seleccion					= oEvent.getSource().oParent.oBindingContexts.Proyect.sPath;
			var Movilidades01				= ModelProyect.getProperty(seleccion);
			ModelProyect.setProperty("/seleccionMov", Movilidades01);
			var selecPress					= ModelProyect.getProperty("/selecPress");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var datosMov					= [];
			var idMovim 					= 1;
			var acumPermo					= 0;
			var acumExced					= 0;
			var acumTotal_mov				= 0;
			var permitido					= "0.00";
			var excedente					= "0.00";
			var totalimportes_mov			= "0.00";

			// if (selecPress.COD_TIPO_COMP === "PM" && (selecPress.validaMOV === undefined || selecPress.validaMOV === false) &&  selecPress.desglose[0].movilidad.length === 0) {
			// 	selecPress.validaMOV = true;
			// 	// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_MOVILIDAD_DETSet?$filter=COD_SAP eq '" + COD_SAP +
			// 	// 	"' and COMPROBANTE eq '" + selecPress.COMPROBANTE + "'";
				
			// 	var validacionComprobante	= "";
			// 	var validacionRuc = "";
				
			// 	if((selecPress.COMPROBANTE !== selecPress.COMPROBANTE_ANTIGUO) && selecPress.DATOS_SAP === true){
			// 			validacionComprobante = selecPress.COMPROBANTE_ANTIGUO;	
			// 			}else{
			// 			validacionComprobante = selecPress.COMPROBANTE;	
			// 			}
						
			// 			if((selecPress.RUC !== selecPress.RUC_COPIA) && selecPress.DATOS_SAP === true){
			// 			validacionRuc = selecPress.RUC_COPIA;	
			// 			}else{
			// 			validacionRuc = selecPress.RUC;	
			// 			}
				

			// 	var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_MOVILIDAD_DETSet?$filter=COMPROBANTE eq '" + validacionComprobante +
			// 		"' and COD_SAP eq  '" + COD_SAP +
			// 		"' and RUC eq '" + validacionRuc + "'";

			// 	jQuery.ajax({
			// 		type: "GET",
			// 		cache: false,
			// 		headers: {
			// 			"Accept": "application/json"
			// 		},
			// 		contentType: "application/json",
			// 		url: url,
			// 		async: true,
			// 		success: function (data, textStatus, jqXHR) {
			// 			var datos = data.d.results;

			// 			if (datos.length > 0) {

			// 				DataComprobanteConfirmacion.forEach(function (items) {
			// 					if (items.keySeg === selecPress.keySeg) {//21/07/2022
			// 						items.desglose.forEach(function (rx, index) {
			// 							if (rx.POSIC === selecPress.desglose[index].POSIC) {

			// 								datos.forEach(function (rsx) {
			// 								// if(rx.POSIC === parseFloat(rsx.ID_MOVIL).toString()){	
												

			// 									permitido = rsx.IMP_PERM.replaceAll(" ", "");
			// 									permitido = parseFloat(permitido);
			// 									excedente = rsx.IMP_EXED.replaceAll(" ", "");
			// 									excedente = parseFloat(excedente);
			// 									totalimportes_mov = rsx.IMP_TOTAL.replaceAll(" ", "");
			// 									totalimportes_mov = parseFloat(totalimportes_mov);

			// 									if (permitido === "") {
			// 										permitido = "0.00";
			// 									} else {
			// 										permitido = parseFloat(permitido).toFixed(2);
			// 										if (isNaN(permitido) || permitido === "0") {
			// 											permitido = "0.00";
			// 										}
			// 									}
			// 									if (excedente === "") {
			// 										excedente = "0.00";
			// 									} else {
			// 										excedente = parseFloat(excedente).toFixed(2);
			// 										if (isNaN(excedente) || excedente === "0") {
			// 											excedente = "0.00";
			// 										}
			// 									}
			// 									if (totalimportes_mov === "") {
			// 										totalimportes_mov = "0.00";
			// 									} else {
			// 										totalimportes_mov = parseFloat(totalimportes_mov).toFixed(2);
			// 										if (isNaN(totalimportes_mov) || totalimportes_mov === "0") {
			// 											totalimportes_mov = "0.00";
			// 										}
			// 									}

			// 									var fechaFormato = rsx.FECHA.substring(6, 8) + "/" + rsx.FECHA.substring(4, 6) + "/" + rsx.FECHA.substring(0, 4);

			// 									var datosmovilidad = {
			// 										COMPROBANTE: selecPress.desglose[index].COMPROBANTE,
			// 										POSICDESGLO: selecPress.desglose[index].POSIC,
			// 										POSICMOV: idMovim.toString(),
			// 										FECHA: fechaFormato,
			// 										COPIA_MFECHA:fechaFormato,
			// 										IMP_PERM: permitido,
			// 										IMP_EXED: excedente,
			// 										impTotalMov: totalimportes_mov,
			// 										COPIA_IMPTOTAL :totalimportes_mov,
			// 									}

			// 									rx.movilidad.push(datosmovilidad);
			// 									idMovim++;
			// 									// acumPermo += obj.IMP_PERM ;
			// 									// 	acumExced += excedente;
			// 									// 	acumTotal_mov+=totalimportes_mov;
			// 									acumPermo += parseFloat(permitido);//ca,mbios
			// 									acumExced += parseFloat(excedente);
			// 									acumTotal_mov += parseFloat(totalimportes_mov);
			// 								// }	
			// 								});

			// 								// rx.movilidad.forEach(function(obj ,i){
			// 								// 	permitido	= obj.IMP_PERM.replaceAll(" ","");
			// 								// 	excedente	= obj.IMP_EXED.replaceAll(" ","");
			// 								// 	permitido	= parseFloat(permitido);
			// 								// 	excedente	= parseFloat(excedente);
			// 								// 	totalimportes_mov = obj.impTotalMov.replaceAll(" ","");
			// 								// 	totalimportes_mov = parseFloat(totalimportes_mov);	
			// 								// 		acumPermo		+= permitido ;
			// 								// 		acumExced		+= excedente;
			// 								// 		acumTotal_mov	+= totalimportes_mov;
			// 								// 		}); 

			// 								if (isNaN(acumPermo) || acumPermo === 0.00 || acumPermo === 0) {
			// 									acumPermo = "0.00";
			// 								}
			// 								if (isNaN(acumExced) || acumExced === 0.00 || acumExced === 0) {
			// 									acumExced = "0.00";
			// 								}
			// 								if (isNaN(acumTotal_mov) || acumTotal_mov === 0.00 || acumTotal_mov === 0) {
			// 									acumTotal_mov = "0.00";
			// 								}

			// 								ModelProyect.setProperty("/datos_mov", JSON.parse(JSON.stringify(rx.movilidad)));
			// 								ModelProyect.refresh(true);
			// 								var datos_mov = ModelProyect.getProperty("/datos_mov");
			// 								var array_mov01 = [];
			// 								array_mov01.push(...datos_mov);

			// 								ModelProyect.setProperty("/datosMovilidad", array_mov01);
			// 								ModelProyect.setProperty("/ImporteP", parseFloat(acumPermo).toFixed(2));
			// 								ModelProyect.setProperty("/ImporteE", parseFloat(acumExced).toFixed(2));
			// 								ModelProyect.setProperty("/Importe_total", parseFloat(acumTotal_mov).toFixed(2));
											
			// 								ModelProyect.setProperty("/CopiadatosMovilidad", datos_mov);
			// 								ModelProyect.setProperty("/CopiaImporteP", parseFloat(acumPermo).toFixed(2));
			// 								ModelProyect.setProperty("/CopiaImporteE", parseFloat(acumExced).toFixed(2));
			// 								ModelProyect.setProperty("/CopiaImporte_total", parseFloat(acumTotal_mov).toFixed(2));
											
			// 								ModelProyect.refresh(true);
			// 							}
			// 						});
			// 					}
			// 				});

			// 			}else{
			// 			ModelProyect.setProperty("/datosMovilidad", []);/// nuevo cambio de 08/06/2022
			// 			ModelProyect.setProperty("/Importe_total", "0.00");
			// 			}

			// 			if (!that.Movilidades) {
			// 				that.Movilidades = sap.ui.xmlfragment("rendicionER.fragments.Movilidad", that);
			// 				oView.addDependent(that.Movilidades);
			// 			}
			// 			that.Movilidades.open();
			// 		},
			// 		error: function () {
			// 			MessageBox.error("Ocurrio un error al obtener los datos");
			// 		}
			// 	});

			// } else {
			// 	DataComprobanteConfirmacion.forEach(function (items) {
			// 		if (items.keySeg === selecPress.keySeg) {//21/07/2022
			// 			items.desglose.forEach(function (rx, index) {
			// 				if (rx.POSIC === selecPress.desglose[index].POSIC) {
			// 					rx.movilidad.forEach(function (obj, i) {
			// 						for (var i = rx.movilidad.length - 1; i >= 0; i--) {
			// 							if (rx.movilidad[i] === undefined) {
			// 								rx.movilidad.splice(i, 1);
			// 							} else {
			// 								permitido = obj.IMP_PERM.replaceAll(" ", "");
			// 								excedente = obj.IMP_EXED.replaceAll(" ", "");
			// 								permitido = parseFloat(permitido);
			// 								excedente = parseFloat(excedente);
			// 								totalimportes_mov = obj.impTotalMov.replaceAll(" ", "");
			// 								totalimportes_mov = parseFloat(totalimportes_mov);
			// 							}
			// 						}

			// 						// acumPermo += permitido;
			// 						// acumExced += excedente;
			// 						// acumTotal_mov += totalimportes_mov;
									
			// 						acumPermo += parseFloat(permitido);
			// 						acumExced += parseFloat(excedente);
			// 						acumTotal_mov += parseFloat(totalimportes_mov);
			// 					});

			// 					if (isNaN(acumPermo) || acumPermo === 0.00 || acumPermo === 0) {
			// 						acumPermo = "0.00";
			// 					}

			// 					if (isNaN(acumExced) || acumExced === 0.00 || acumExced === 0) {
			// 						acumExced = "0.00";
			// 					}
			// 					if (isNaN(acumTotal_mov) || acumTotal_mov === 0.00 || acumTotal_mov === 0) {
			// 						acumTotal_mov = "0.00";
			// 					}

			// 					ModelProyect.setProperty("/datos_mov", JSON.parse(JSON.stringify(rx.movilidad)));
			// 					ModelProyect.refresh(true);
			// 					var datos_mov = ModelProyect.getProperty("/datos_mov");
			// 					var array_mov01 = [];
			// 					array_mov01.push(...datos_mov);
			// 					ModelProyect.setProperty("/datosMovilidad", array_mov01);
			// 					ModelProyect.setProperty("/ImporteP", parseFloat(acumPermo).toFixed(2));
			// 					ModelProyect.setProperty("/ImporteE", parseFloat(acumExced).toFixed(2));
			// 					ModelProyect.setProperty("/Importe_total", parseFloat(acumTotal_mov).toFixed(2));
								
			// 					ModelProyect.setProperty("/CopiadatosMovilidad", datos_mov);
			// 					ModelProyect.setProperty("/CopiaImporteP", parseFloat(acumPermo).toFixed(2));
			// 					ModelProyect.setProperty("/CopiaImporteE", parseFloat(acumExced).toFixed(2));
			// 					ModelProyect.setProperty("/CopiaImporte_total", parseFloat(acumTotal_mov).toFixed(2));
			// 					ModelProyect.refresh(true);
			// 				}
			// 			});
			// 		}
			// 	});

			// 	if (!that.Movilidades) {
			// 		that.Movilidades = sap.ui.xmlfragment("rendicionER.fragments.Movilidad", that);
			// 		oView.addDependent(that.Movilidades);
			// 	}
			// 	ModelProyect.refresh(true);
			// 	that.Movilidades.open();
			// }

		},

		pressImputacion: function (OVS) {
			var oView						= this.getView();
			var that						= this;
			var ModelProyect				= oView.getModel("Proyect");
			var seleccion					= OVS.getSource().oParent.oBindingContexts.Proyect.sPath;
			var imputaciones				= ModelProyect.getProperty(seleccion);
			var datosTabla					= ModelProyect.getProperty("/jsonData");
			var dataDetSolcER				= ModelProyect.getProperty("/dataDetSolcER/moneda");
			var COD_SAP 					= ModelProyect.getProperty("/COD_SAP");
			var beneficiarios2				= ModelProyect.getProperty("/beneficiarios2");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var monedas 					= ModelProyect.getProperty("/monedas");
			var array3						= [];
			var contadores					= 0;
			var indiceComp					= 0;
			var indiceDesg					= 0;
			var datos_selecciones			=ModelProyect.getProperty("/datos_selecciones");//21/07/2022
			
			ModelProyect.setProperty("/Imputacion_press",imputaciones);// 08/06/2022

			if ((imputaciones.BASE_IMP === "0.00" || imputaciones.BASE_IMP === "") && imputaciones.IND_IMP !== "C0") {//17/07/2022
			
				MessageBox.error("Se requiere tener un importe mayor a 0.00");
				return;
			
			}else if((imputaciones.INAFECTO === "0.00" || imputaciones.INAFECTO === "") && imputaciones.IND_IMP === "C0"){
				MessageBox.error("Se requiere tener un importe mayor a 0.00");
				return;
					
			}
			
			if(imputaciones.IND_IMP === "C0"){
			ModelProyect.setProperty("/ImportesI", imputaciones.INAFECTO);	
			}else{
			ModelProyect.setProperty("/ImportesI", imputaciones.BASE_IMP);	
			}

			ModelProyect.setProperty("/datosPressImp", imputaciones);
			ModelProyect.setProperty("/nroDesglose", imputaciones.POSIC);
			 //ModelProyect.setProperty("/ImportesI", imputaciones.BASE_IMP);
			ModelProyect.setProperty("/seleccionImp", imputaciones);
			ModelProyect.setProperty("/MonedaImput", monedas);

			DataComprobanteConfirmacion.forEach(function (items, inde1) {
				if (items.keySeg === datos_selecciones.keySeg) {//21/07/2022
					indiceComp = inde1;
					items.desglose.forEach(function (rx, inde2) {
						if (rx.POSIC === imputaciones.POSIC) {
							indiceDesg = inde2;
							// rx.imputacion.forEach(function(sx){
							// 	if(datos.length > 0){
							// 		datos.forEach(function(objt){
							// 			if(objt.POSICION === datos.POSICION){
							// 				contadores++;	
							// 				var imputacion01={
							// 					COMPROBANTE: sx.COMPROBANTE,
							// 					POSDESGLOSE:imputaciones.POSIC,
							// 					POSICION: contadores,
							// 					WAERS: sx.WAERS,
							// 					KOSTL: sx.KOSTL,
							// 					IMP: sx.IMP,
							// 					IMP_TOTAL: sx.IMP_TOTAL,
							// 					PORCENTAJE:sx.PORCENTAJE	
							// 				}	

							// 				rx.imputacion.push(imputacion01);	
							// 			}
							// 		});	
							// 	}	
							// });	
						}
					});
				
				}
			});

			ModelProyect.setProperty("/datos_imp", DataComprobanteConfirmacion[indiceComp].desglose[indiceDesg].imputacion);
			ModelProyect.refresh(true);
			var datos_imp = ModelProyect.getProperty("/datos_imp");
			var array_imp01 = [];

			datos_imp.map(function (obj) {
				var obj = {
					COMPROBANTE: obj.COMPROBANTE,
					POSDESGLOSE: obj.POSDESGLOSE,
					POSICION: obj.POSICION,
					WAERS: obj.WAERS,
					KOSTL: obj.KOSTL,
					IMP: obj.IMP,
					IMP_TOTAL: obj.IMP_TOTAL,
					COPIA_TOTAL	: obj.IMP,
					porcentajeII: obj.porcentajeII,
					COPIA_PORCE : obj.porcentajeII,
					COPIA_KOSTL : obj.selectKeyagre,
					selectKeyagre: obj.selectKeyagre,
				}
				array_imp01.push(obj);
			});

			let varAr = array_imp01;
			// array_imp01.push(...datos_imp);
			ModelProyect.setProperty("/datosImputacion", array_imp01);
			ModelProyect.setProperty("/datosImpCopia", varAr);

			if (!that.DATOS1) {
				that.DATOS1 = sap.ui.xmlfragment("rendicionER.fragments.Imputacion", that);
				oView.addDependent(that.DATOS1);
			}

			that.DATOS1.open();

			ModelProyect.setProperty("/selImpImpu", false);
			ModelProyect.setProperty("/selPorcImpu", true);

			ModelProyect.refresh(true);
		},

		changeOrde_Interna: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var seleccion = ModelProyect.getProperty("/selecPress");
			var Orden_Interna = ModelProyect.getProperty("/Orden_Interna");
			var Numero_viaje = ModelProyect.getProperty("/Numero_viaje");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			DataComprobanteConfirmacion.forEach(function (ITEMS) {
				if (ITEMS.keySeg === seleccion.keySeg) {//21/07/2022

					ITEMS.ORDEN_INT = Orden_Interna;
					ITEMS.VIAJES = Numero_viaje;
					ITEMS.validacion_guardado= false;
				}

			});
		},

		changeNumero_Viaje: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var seleccion = ModelProyect.getProperty("/selecPress");
			var Orden_Interna = ModelProyect.getProperty("/Orden_Interna");
			var Numero_viaje = ModelProyect.getProperty("/Numero_viaje");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			DataComprobanteConfirmacion.forEach(function (ITEMS) {
				if (ITEMS.keySeg === seleccion.keySeg) {//21/07/2022
					ITEMS.ORDEN_INT = Orden_Interna;
					ITEMS.VIAJES = Numero_viaje;
					ITEMS.validacion_guardado= false;
				}

			});
		},

		agregarfilas: function (OVS) {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var datosI = ModelProyect.getProperty("/datosImputs");
			var ImportesI = ModelProyect.getProperty("/ImportesI");
			var that = this;
			var ModelProyect = oView.getModel("Proyect");
			var selectKeyCECO = ModelProyect.getProperty("/selectKeyCECO");
			var seleccionImp = ModelProyect.getProperty("/seleccionImp");

			// var seleccion						= OVS.getSource().oParent.oBindingContexts.Proyect.sPath;
			var imputaciones = ModelProyect.getProperty("/seleccionImp");
			var datosTabla = ModelProyect.getProperty("/jsonData");
			var dataDetSolcER = ModelProyect.getProperty("/dataDetSolcER/moneda");
			var COD_SAP = ModelProyect.getProperty("/COD_SAP");
			var beneficiarios2 = ModelProyect.getProperty("/beneficiarios2");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var monedas = ModelProyect.getProperty("/monedas");
			var array3 = [];
			var contadores = 0;
			var indiceComp = 0;
			var indiceDesg = 0;

			// ModelProyect.setProperty("/datosPressImp", imputaciones);
			// 	ModelProyect.setProperty("/nroDesglose", imputaciones.POSIC);
			// 	ModelProyect.setProperty("/ImportesI",imputaciones.TOTAL);
			// 	ModelProyect.setProperty("/seleccionImp",imputaciones);
			// 	ModelProyect.setProperty("/MonedaImput",monedas);

			var jsonData = ModelProyect.getProperty("/jsonData");
			var nroDesglose = ModelProyect.getProperty("/nroDesglose");
			var select_Ceco = ModelProyect.getProperty("/selectCeco");
			var datosPressImp = ModelProyect.getProperty("/datosPressImp");
			var COMPROBANTE = ModelProyect.getProperty("/COMPROBANTE");
			var MonedaImput = ModelProyect.getProperty("/MonedaImput");
			var keySelect = ModelProyect.getProperty("/keySelect");
			var seleccion_prueba = "";

			var datosImputacion = ModelProyect.getProperty("/datosImputacion");
			// var datosImputacion	= ModelProyect.getProperty("/datos_imp");

			if (keySelect !== undefined) {
				seleccion_prueba = keySelect;
			} else {
				seleccion_prueba = select_Ceco;
			}

			var imputacion01 = {
				COMPROBANTE: COMPROBANTE,
				POSDESGLOSE: datosPressImp.POSIC,
				POSICION: (datosImputacion.length + 1).toString(),
				WAERS: MonedaImput,
				KOSTL: seleccion_prueba,
				selectKeyagre: "",
				IMP: "0.00",
				IMP_TOTAL: "0.00",
				porcentajeII: "0%"
			}

			datosImputacion.push(imputacion01);

			// DataComprobanteConfirmacion.forEach(function(items,inde1){
			// 	if(items.COMPROBANTE === imputaciones.COMPROBANTE){
			// 		indiceComp = inde1;
			// 		items.desglose.forEach(function(rx,inde2){
			// 			if(rx.POSIC === imputaciones.POSIC){
			// 				indiceDesg = inde2;
			// 			}	
			// 		});	
			// 	}	
			// });	

			// var imputacion01 = {
			// 	COMPROBANTE: COMPROBANTE,
			// 	POSDESGLOSE: datosPressImp.POSIC,
			// 	POSICION: (jsonData[indiceDesg].imputacion.length + 1).toString(),
			// 	WAERS: MonedaImput,
			// 	KOSTL: seleccion_prueba,
			// 	IMP: "0.00",
			// 	IMP_TOTAL: "0.00",
			// 	PORCENTAJE:"0%"	
			// }

			// DataComprobanteConfirmacion[indiceComp].desglose[indiceDesg].imputacion.push(imputacion01);
			// ModelProyect.setProperty("/datosImputacion", DataComprobanteConfirmacion[indiceComp].desglose[indiceDesg].imputacion);

			ModelProyect.setProperty("/datosImputacion", datosImputacion);

			ModelProyect.refresh(true);
		},

		infoPorcentaje: function (oEvent) {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var porcet = ModelProyect.getProperty("/porcentajeInput");
			var porcentajeII = ModelProyect.getProperty("/porcentajeII");
			var ImportesI = ModelProyect.getProperty("/ImportesI");
			var imporInt = parseFloat(porcentajeII);
			var datosImputacion01 = ModelProyect.getProperty("/datosImputacion");
			var sumaImporte = 0;
			var valorDato = parseFloat(oEvent.mParameters.value);
			var fomatValor = valorDato / 100;
			var seleccion = oEvent.getSource().oParent.oBindingContexts.Proyect.sPath;
			var imputaciones = ModelProyect.getProperty(seleccion);

			datosImputacion01.map(function (items, inde1) {
				if (items.POSICION === imputaciones.POSICION) {
					if (valorDato > 100) {
						items.porcentajeII = 100;
					}

					// var porcen              = (imputaciones.porcentajeII).replaceAll("%","");
					var parsePorcen = valorDato.toString();
					var parseImp = fomatValor * parseFloat(ImportesI);

					items.IMP = parseFloat(parseImp).toFixed(2);
					items.porcentajeII = parseFloat(parsePorcen).toFixed(2) + "%";
					ModelProyect.refresh(true);
				}
			});
			
		},

		onImporteImp: function (oEvent) {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var ImportesI = ModelProyect.getProperty("/ImportesI");
			var datosImputacion01 = ModelProyect.getProperty("/datosImputacion");
			var seleccion = oEvent.getSource().oParent.oBindingContexts.Proyect.sPath;
			var imputaciones = ModelProyect.getProperty(seleccion);
			var valorDato = parseFloat(imputaciones.IMP);

			// if(isNaN(valorDato) || valorDato === 0.00 || valorDato === 0){
			// 	imputaciones.IMP = "0.00";
			// 	imputaciones.porcentajeII =  "0.00%";
			// }else{
			// 	if( valorDato > parseFloat(ImportesI)){
			// 		valorDato = parseFloat(ImportesI);
			// 	}
			// 	var fomatValor          = valorDato / parseFloat(ImportesI);
			// 	var parsePorcen         = fomatValor * 100;
			// 	imputaciones.IMP = parseFloat(valorDato).toFixed(2);
			// 	imputaciones.porcentajeII = parseFloat(parsePorcen).toFixed(2) + "%";
			// }

			datosImputacion01.map(function (items, inde1) {
				if (items.POSICION === imputaciones.POSICION) {
					if (isNaN(valorDato) || valorDato === 0.00 || valorDato === 0) {
						items.IMP = "0.00";
						items.porcentajeII = "0.00%";
					} else {
						if (valorDato > parseFloat(ImportesI)) {
							valorDato = parseFloat(ImportesI);
						}
						var fomatValor = valorDato / parseFloat(ImportesI);
						var parsePorcen = fomatValor * 100;
						items.IMP = parseFloat(valorDato).toFixed(2);
						items.porcentajeII = parseFloat(parsePorcen).toFixed(2) + "%";
						ModelProyect.refresh(true);
					}
				}
			});
			

		},

		pressRadioP: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");

			ModelProyect.setProperty("/deseableporcentaje", false);
			ModelProyect.setProperty("/deseableimporte", true);
			ModelProyect.setProperty("/selImpImpu", true);
			ModelProyect.setProperty("/selPorcImpu", false);
			// ModelProyect.setProperty("/ImportesII","");
		},

		pressRadioI: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");

			ModelProyect.setProperty("/deseableporcentaje", true);
			ModelProyect.setProperty("/deseableimporte", false);
			ModelProyect.setProperty("/selImpImpu", false);
			ModelProyect.setProperty("/selPorcImpu", true);
		},

		guardarImp: function () {//------------------------------cambio 23/09/2022
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var datosPressImp				= ModelProyect.getProperty("/datosPressImp");
			var datosImputacion01			= ModelProyect.getProperty("/datosImputacion");
			var jsonData					= ModelProyect.getProperty("/jsonData");
			var indiceComp					= 0;
			var indiceDesg					= 0;
			var calPorc 					= 0;
			var noDatos 					= false;
			var indexDatos					= 0;
			var pasaPorc					= false;
			var faltaPorc					= false;
			var mensaje 					= "";
			var datosImputacion 			= ModelProyect.getProperty("/datosImputacion");
			var Imputacion_press			= ModelProyect.getProperty("/Imputacion_press");
			var DataComprobanteConfirmacion	=ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var select_ceco					=ModelProyect.getProperty("/select_ceco");
			var contadores  				=0;
			var datos_selecciones			=ModelProyect.getProperty("/datos_selecciones");//21/07/2022
			
			datosImputacion01.map(function (items, inde1) {
				calPorc += parseFloat(items.porcentajeII);
				if (items.selectKeyagre === "" || parseFloat(items.porcentajeII) === 0 || parseFloat(items.IMP) === 0) {
					noDatos = true;
					indexDatos = inde1 + 1;
				}
				if (calPorc > 100.00) {
					pasaPorc = true;
				} else if (calPorc < 100.00) {
					faltaPorc = true;
				} else {
					pasaPorc = false;
					faltaPorc = false;
				}
			});

			if (noDatos || faltaPorc || pasaPorc) {
				if (noDatos) {
					mensaje = "Faltan completar datos en la fila " + indexDatos;
				} else if (faltaPorc) {
					mensaje = "Todos los porcentajes deben sumar 100%";
				} else if (pasaPorc) {
					mensaje = "La suma de los porcentajes no puede pasar el 100%";
				}

				MessageBox.error(mensaje, {
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {}
				});
				return;
			}

	
			DataComprobanteConfirmacion.forEach(function (items, inde1) {
				//items.COMPROBANTE === datosPressImp.COMPROBANTE
				if (items.keySeg === datos_selecciones.keySeg) {//21/07/2022
					 indiceComp = inde1;
					items.desglose.forEach(function (rx, inde2) {
						if (rx.POSIC === datosPressImp.POSIC) {
							
							datosImputacion01.forEach(function(gr,x){
								if(gr.POSICION.toString() === (x +1).toString()){
									if(gr.selectKeyagre === select_ceco){
										contadores++;
										
									}
									
									
								}
									
							});	
								
							if(contadores <= 1){	
						
							rx.imputacion = datosImputacion01;
							
							if (rx.imputacion.length > 0) {
								rx.stateCeco = "Success";
								rx.iconCeco = "sap-icon://sys-enter-2";
							} else {
								rx.stateCeco = "Warning";
								rx.iconCeco = "sap-icon://alert";
							}
							}else{
								rx.stateCeco = "Success";
								rx.iconCeco = "sap-icon://sys-enter-2";	
							}
						}
					});
				}
			});
			
				var mensaje="";
			if(contadores > 1){
				mensaje = "Existe un registro asociado al mismo comprobante y centro de costo.";
				MessageBox.warning(mensaje, {
					actions: ["OK"],
					onClose: function (sAction) {}
				});
				return;      	
			}else{
		
			ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indiceComp].desglose);
			ModelProyect.setProperty("/datosImpCopia", DataComprobanteConfirmacion[indiceComp].desglose);

			MessageToast.show("¡Se guardaron los datos corréctamente!");
			}
			//ModelProyect.refresh(true);
		},

		pressEliminarImpu: function (ovg) {
			var that = this;
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var datitos = ovg.getSource().oPropagatedProperties.oBindingContexts.Proyect.sPath;
			var datosPressImp = ModelProyect.getProperty("/datosPressImp");
			var datitos1 = ModelProyect.getProperty(datitos);
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var datosImputacion = ModelProyect.getProperty("/datosImputacion");
			var indiceComp = 0;
			var indiceDesg = 0;

			for (var i = 0; i < datosImputacion.length; i++) {
				if (datosImputacion[i] === datitos1) {
					datosImputacion.splice(i, 1);
				}
			}

			ModelProyect.refresh(true);

			datosImputacion.forEach(function (objeto, index) {
				if (objeto.POSICION !== index + 1) {
					objeto.POSICION = index + 1;
				}
			});

			ModelProyect.refresh(true);

			// DataComprobanteConfirmacion.forEach(function(items, inde1){
			// 	if(items.COMPROBANTE === datosPressImp.COMPROBANTE){
			// 		indiceComp = inde1;
			// 		items.desglose.forEach(function(rx, inde2){
			// 			if(rx.POSIC === datosPressImp.POSIC){

			// 				indiceDesg = inde2;

			// 				for (var i = 0; i < rx.imputacion.length; i++) {
			// 					if (rx.imputacion[i] === datitos1) {
			// 						rx.imputacion.splice(i, 1);
			// 					}
			// 				}

			// 				ModelProyect.refresh(true);

			// 				rx.imputacion.forEach(function(objeto, index){
			// 					if(objeto.POSICION !== index + 1){
			// 						objeto.POSICION = index + 1;
			// 					}
			// 				});

			// 				ModelProyect.refresh(true);
			// 				// ModelProyect.setProperty("/tablaImputacion",rx.imputacion);	
			// 			}	
			// 		});	
			// 	}	
			// });
		},

		cerrarImp: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var datosImpCopia = ModelProyect.getProperty("/datosImpCopia");
			ModelProyect.setProperty("/datosImputacion", datosImpCopia);
			ModelProyect.refresh(true);
			this.DATOS1.close();
		},
		//----------------------- Cambios JRodriguez --------------------------------------

		changeImporte_mov: function () {
			var that				= this;
			var oView				= this.getView();
			var ModelProyect		= oView.getModel("Proyect");
			var seleccionMov		= ModelProyect.getProperty("/seleccionMov");
			var datosMovilidad		= ModelProyect.getProperty("/datosMovilidad");
			var totalImportes		= 0;
			var ImportesPermitos	= ModelProyect.getProperty("/ImportesPermitos");
			var resta_03			= 0;
			var importe_permi		= 0;
			var validacion_importe	= false;
			var contador_dupliaco	=0;
			var campo_nuevo			=0;
			var datos_selecciones			= ModelProyect.getProperty("/datos_selecciones");//21/07/2022
			var DataComprobanteConfirmacion 		= ModelProyect.getProperty("/DataComprobanteConfirmacion");//24/07/2022
			
			datosMovilidad.forEach(function (items_09, index) {
				var total_imp = items_09.impTotalMov;

				if (total_imp === "") {
					total_imp = "0.00";
				} else {
					total_imp = parseFloat(total_imp).toFixed(2);
					if (isNaN(total_imp) || total_imp === "0") {
						total_imp = "0.00";
					}
				}

				totalImportes += parseFloat(total_imp);
				items_09.impTotalMov = parseFloat(total_imp).toFixed(2);
				
				
				
				if (items_09.POSICMOV === (index + 1).toString()) {
					if (parseFloat(items_09.impTotalMov) > parseFloat(ImportesPermitos)) {
						resta_03 = parseFloat(items_09.impTotalMov) - parseFloat(ImportesPermitos);
						items_09.IMP_PERM = parseFloat(ImportesPermitos).toFixed(2);
						items_09.IMP_EXED = resta_03.toFixed(2);
						//items_09.impTotalMov = campo_nuevo.toFixed(2);
						validacion_importe = true;
						
					} else if (parseFloat(items_09.impTotalMov) <= parseFloat(ImportesPermitos)) {
						importe_permi = items_09.impTotalMov;
						resta_03 = "0.00";
						//items_09.impTotalMov = campo_nuevo.toFixed(2);
						items_09.IMP_PERM = parseFloat(importe_permi).toFixed(2);
						items_09.IMP_EXED = resta_03;
							validacion_importe = false;
					}
				}

			});

			totalImportes = totalImportes.toFixed(2);
			
			
			DataComprobanteConfirmacion.forEach(function(xs){//21/07/2022
			if(xs.keySeg === datos_selecciones.keySeg){//21/07/2022
			xs.desglose.forEach(function(items_09){             	
			if(items_09.imputacion.length > 0){
			items_09.imputacion.forEach(function(obj){
			var formateo_porcentaje	= parseFloat(obj.porcentajeII) / 100;
			obj.IMP= (formateo_porcentaje * totalImportes).toFixed(2);		
				
			});	
				
			}
			});
			}
			});
			
		
			ModelProyect.setProperty("/Validacion_importe", validacion_importe);	// cambio 04/06/2022
			
			ModelProyect.setProperty("/Importe_total", totalImportes);

			//ModelProyect.refresh(true);
		},

		onPressClose: function (oEvent) {
			var that = this;
			var oView = this.getView();

			this.oDialog.close();
		},

		onPressGuardarComprobante: function (oEvent) {
			var oView = this.getView();
			var validacion = this.validaCamposObligatoriosTabla();
			var idFragment = oEvent.getSource().getParent().getId();
			var ModelProyect = oView.getModel("Proyect");
			var selectTipo = ModelProyect.getProperty("/selectTipo");
			var Key_comprobante = ModelProyect.getProperty("/Key_comprobante");
			var fecharegistrada = ModelProyect.getProperty("/fecharegistrada");
			var codigoregistrado = ModelProyect.getProperty("/codigoregistrado");
			var maximo = 0;
			var datosTabla = ModelProyect.getProperty("/datosTablaP");
			var igualdad = false;
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var datosMensaje = "";
			var DatosComprobantes = ModelProyect.getProperty("/DatosComprobantes");
			var that = this;
			var obje = {};
			var solicitud = ModelProyect.getProperty("/solicitud");
			var nroDocPago = ModelProyect.getProperty("/nroDocPago");
			var COD_SAP = ModelProyect.getProperty("/COD_SAP");
			var datosComprobante01 = ModelProyect.getProperty("/datosComprobante");
			var mensajeError = 'Deben llenarse los campos obligatorios marcados con un asterisco';

			// if (validacion === true) {
			// 	MessageBox.information(mensajeError, {
			// 		actions: [MessageBox.Action.OK],
			// 		emphasizedAction: MessageBox.Action.OK,
			// 		onClose: function (sAction) {}
			// 	});
			// 	return;

			// } else {

			// // /sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_VALIDA_COMPROBANTESet?$filter=COMPROBANTE eq '0000-00000001' and DOC_PAGO eq ''
			// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_VALIDA_COMPROBANTESet?$filter=COMPROBANTE eq '" + codigoregistrado +
			// 	"' and DOC_PAGO eq ''";

			// sap.ui.core.BusyIndicator.show(0);

			// jQuery.ajax({
			// 	type: "GET",
			// 	cache: false,
			// 	headers: {
			// 		"Accept": "application/json"
			// 	},
			// 	contentType: "application/json",
			// 	url: url,
			// 	success: function (data, textStatus, jqXHR) {
			// 		datosMensaje = data.d.results[0].MENSAJE;
			// 		var nroComprobante = data.d.results[0].COMPROBANTE;

			// 		if (datosMensaje === "Ya existe el número de comprobante") {
			// 			MessageBox.information(datosMensaje, {
			// 				actions: [MessageBox.Action.OK],
			// 				emphasizedAction: MessageBox.Action.OK,
			// 				onClose: function (sAction) {}
			// 			});
			// 			sap.ui.core.BusyIndicator.hide();
			// 			return;
			// 		} else {
			// 			that.oDialog.close();

			// 			if (Key_comprobante === "PM") {
			// 				obje = {
			// 					NROD0: datosComprobante01.NROD0,
			// 					DOC_PAGO: datosComprobante01.DOC_PAGO,
			// 					COD_SAP: COD_SAP,
			// 					key: DataComprobanteConfirmacion.length + 1,
			// 					COMPROBANTE: codigoregistrado,
			// 					TIPO_COMP: selectTipo,
			// 					FECHA_COMP: fecharegistrada,
			// 					RUC: "",
			// 					RAZON_SOCIAL: "",
			// 					WAERS: "",
			// 					KOSTL: "",
			// 					NROD0: "",
			// 					ESTADO: "",
			// 					GLOSA: "",
			// 					EST_COMP: "COMP. PEND. APR.",
			// 					COD_EST_COMP: "CPA",
			// 					TIPODOCI: "RUC",
			// 					totalImpu: "0.00",
			// 					totalImp: "0.00",
			// 					totalNoGr: "0.00",
			// 					totales: "0.00",
			// 					desglose: [{
			// 						"POSIC": "1",
			// 						"COMPROBANTE": codigoregistrado,
			// 						"COD_CONT": "151",
			// 						"IND_IMP": "C0",
			// 						"validacionIndicador": false,
			// 						"validaciones1": true,
			// 						"validacionBase": false,
			// 						"validacionInafecto": false,
			// 						"enabledBorrar": false,
			// 						"enabledGastos": false,
			// 						"BASE_IMP": "0.00",
			// 						"IGV": "0.00",
			// 						"INAFECTO": "0.00",
			// 						"TOTAL": "0.00",
			// 						"imputacion": [],
			// 						"movilidad": []
			// 					}, {
			// 						"POSIC": "2",
			// 						"COMPROBANTE": codigoregistrado,
			// 						"COD_CONT": "095",
			// 						"IND_IMP": "C0",
			// 						"validacionIndicador": false,
			// 						"validaciones1": false,
			// 						"validacionBase": false,
			// 						"validacionInafecto": false,
			// 						"enabledBorrar": false,
			// 						"enabledGastos": false,
			// 						"BASE_IMP": "0.00",
			// 						"IGV": "0.00",
			// 						"INAFECTO": "0.00",
			// 						"TOTAL": "0.00",
			// 						"imputacion": [],
			// 						"movilidad": []

			// 					}],
			// 					archivoAd: []
			// 				};

			// 			} else {
			// 				obje = {
			// 					NROD0: datosComprobante01.NROD0,
			// 					DOC_PAGO: datosComprobante01.DOC_PAGO,
			// 					COD_SAP: COD_SAP,
			// 					key: DataComprobanteConfirmacion.length + 1,
			// 					COMPROBANTE: codigoregistrado,
			// 					TIPO_COMP: selectTipo,
			// 					FECHA_COMP: fecharegistrada,
			// 					RUC: "",
			// 					RAZON_SOCIAL: "",
			// 					WAERS: "",
			// 					KOSTL: "",
			// 					NROD0: "",
			// 					ESTADO: "",
			// 					GLOSA: "",
			// 					EST_COMP: "COMP. PEND. APR.",
			// 					COD_EST_COMP: "CPA",
			// 					TIPODOCI: "RUC",
			// 					totalImpu: "0.00",
			// 					totalImp: "0.00",
			// 					totalNoGr: "0.00",
			// 					totales: "0.00",
			// 					desglose: [],
			// 					archivoAd: []
			// 				};
			// 			}

			// 			DataComprobanteConfirmacion.push(obje);

			// 			ModelProyect.setProperty("/DataComprobanteConfirmacion", DataComprobanteConfirmacion);
			// 			sap.ui.core.BusyIndicator.hide();
			// 		}

			// 	},
			// 	error: function () {
			// 		MessageBox.error("Ocurrio un error al obtener los datos");
			// 	}
			// });

			// }

		},

		validaCamposObligatoriosTabla: function () {

			var SelectedTipoDocumento = sap.ui.getCore().byId("cSelectedTipoDocumento");
			var DescRegistroComprobante = sap.ui.getCore().byId("sRegistroComprobante");
			var FechaComprobante = sap.ui.getCore().byId("sfechaComprobante");
			var validacion = false;

			//	Valida que los campos de creacion de tabla no esten vacios
			if (SelectedTipoDocumento.getSelectedItem().getKey() === "") {
				SelectedTipoDocumento.setValueState("Error");
				SelectedTipoDocumento.setValueStateText("Campo obligatorio");
				validacion = true;
			} else {
				SelectedTipoDocumento.setValueState("None");
				SelectedTipoDocumento.setValueStateText("");
			}

			if (DescRegistroComprobante.getValue() === "") {
				DescRegistroComprobante.setValueState("Error");
				DescRegistroComprobante.setValueStateText("Campo obligatorio");
				validacion = true;
			} else {
				DescRegistroComprobante.setValueState("None");
				DescRegistroComprobante.setValueStateText("");
			}

			if (FechaComprobante.getValue() === "") {
				FechaComprobante.setValueState("Error");
				FechaComprobante.setValueStateText("Campo obligatorio");
				validacion = true;
			} else {
				FechaComprobante.setValueState("None");
				FechaComprobante.setValueStateText("");
			}

			return validacion;
		},

		fnSelectedTipoDocumento: function (oEvent) {//26/06/2022
			var that						= this;
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var selectedItem				= oEvent.getSource().getSelectedItem();
			var key 						= selectedItem.getKey();
			var text						= selectedItem.getText();
			var Key_comprobante 			= ModelProyect.getProperty("/Key_comprobante");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var sRegistroComprobante		= oView.byId("sRegistroComprobante").getValue();
			var COD_SAP 					= ModelProyect.getProperty("/COD_SAP");
			var datosComprobante01			= ModelProyect.getProperty("/datosComprobante");
			var jsonData					= ModelProyect.getProperty("/jsonData");
			var selecPress					= ModelProyect.getProperty("/selecPress");
			var indice_01					= "";
			var obje						= "";
			var indice_j					= "";
			var datosIndicador				= ModelProyect.getProperty("/datosIndicador");
			var datostipoDoc				= ModelProyect.getProperty("/datostipoDoc");
			var datos_Tipodoc				= "";

			DataComprobanteConfirmacion.forEach(function (rs, i) {
				if (rs.keySeg === selecPress.keySeg) {//21/07/2022
					indice_01 = i;
					rs.TIPO_PRUEBA =Key_comprobante;
					rs.desglose.forEach(function (items_09, index) {
						indice_j = index;

					});

				}
			});
			DataComprobanteConfirmacion[indice_01].desglose = [];
		
			switch (Key_comprobante) { ///agregado por Claudia 
			case "PM":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "PM",
						COD_CONT: "151",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: true,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: false,
						enabledBorrar: false,
						enabledGastos: false,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/tipoNif", "DNI");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/enabledAgregar", false);
				ModelProyect.setProperty("/visible_Campo", true);//
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KI":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KI",
						COD_CONT: "",
						IND_IMP: "C4",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: true,
						validacionIGV:true,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KH":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KH",
						COD_CONT: "",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KD": ////26/07/2022
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KD",
						COD_CONT: "",
						IND_IMP: "C2",
						validacionIndicador: true,
						validaciones1: false,
						validacionBase: true,
						validacionIGV:true,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/HABILI_FACTURA", true); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", true);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KG": //26/07/2022
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KG",
						COD_CONT: "",
						IND_IMP: "C2",
						validacionIndicador: true,
						validaciones1: false,
						validacionBase: true,
						validacionIGV:true,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;

				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/HABILI_FACTURA", true); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", true);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KP"://26/07/2022
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KP",
						COD_CONT: "",
						IND_IMP: "C2",
						validacionIndicador: true,
						validaciones1: false,
						validacionBase: true,
						validacionIGV:true,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;

				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;

			case "KR"://26/07/2022
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KR",
						COD_CONT: "",
						IND_IMP: "C2",
						validacionIndicador: true,
						validaciones1: false,
						validacionBase: true,
						validacionIGV:true,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;

				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KT":

				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KT",
						COD_CONT: "",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;

				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "DU":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "DU",
						COD_CONT: "147",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: false,
						enableImputa: false,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KX":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KX",
						COD_CONT: "",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/tipoNif", "DEXT");//21/07/2022
				ModelProyect.setProperty("/visibleTipo_doc", false);//24/07/2022
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KB":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KB",
						COD_CONT: "",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KM":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KM",
						COD_CONT: "",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "SK":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "SK",
						COD_CONT: "",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/tipoNif", "RUC");//12/08/2022
				ModelProyect.setProperty("/HABILI_FACTURA", false);
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/Editable_Tipo", true);//12/08/2022
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/editableRazon", false);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "KV":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "KV",
						COD_CONT: "",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: true,
						enableImputa: true,
						enabledBanco: false,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;

				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			case "D5":
				obje = [{
						stateCeco: "Warning",
						iconCeco: "sap-icon://alert",
						POSIC: "1",
						COMPROBANTE: sRegistroComprobante,
						COD_TIPO_COMP: "D5",
						COD_CONT: "",
						IND_IMP: "C0",
						validacionIndicador: false,
						validaciones1: false,
						validacionBase: false,
						validacionIGV:false,
						validacionInafecto: true,
						enabledBorrar: false,
						enabledGastos: false,
						enableImputa: false,
						enabledBanco: true,
						BASE_IMP: "0.00",
						IGV: "0.00",
						INAFECTO: "0.00",
						TOTAL: "0.00",
						imputacion: [],
						movilidad: []
					}],

					DataComprobanteConfirmacion[indice_01].desglose = obje;
				ModelProyect.refresh(true);
				ModelProyect.setProperty("/jsonData", DataComprobanteConfirmacion[indice_01].desglose);
				ModelProyect.setProperty("/tipoNif", "---Seleccionar---");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/Nombre_Boton", "Registrar");
				ModelProyect.setProperty("/visbleCampo", true);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/visibleTipo_doc", false);
				ModelProyect.setProperty("/visbleCampoRUC", false);
				ModelProyect.setProperty("/visbleValidar", false);
				ModelProyect.setProperty("/enabledAgregar", false);
				ModelProyect.setProperty("/visible_Campo", false);
				ModelProyect.setProperty("/Campos_Visibles", false);
				ModelProyect.setProperty("/Visible_Btn02", true);
				ModelProyect.refresh(true);
				break;
			default:
				DataComprobanteConfirmacion[indice_01].desglose = [];
				ModelProyect.setProperty("/jsonData", []);
				ModelProyect.setProperty("/tipoNif", "RUC");
				ModelProyect.setProperty("/Glosa", "");
				ModelProyect.setProperty("/ruc", "");
				ModelProyect.setProperty("/HABILI_FACTURA", false); ///nuevo campo
				ModelProyect.setProperty("/VisibleReferencia", false);
				ModelProyect.setProperty("/editableRazon", false);//24/07/2022
				ModelProyect.setProperty("/razonSocial", "");
				ModelProyect.setProperty("/visbleCampo", false);
				ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
				ModelProyect.setProperty("/enabledAgregar", true);
				ModelProyect.setProperty("/visibleTipo_doc", true);
				ModelProyect.setProperty("/visbleCampoRUC", true);
				ModelProyect.setProperty("/visbleValidar", true);
				ModelProyect.setProperty("/Nombre_Boton", "Validar");
				ModelProyect.setProperty("/visible_Campo", true);
				ModelProyect.setProperty("/Campos_Visibles", true);
				ModelProyect.setProperty("/Visible_Btn02", false);
				break;
			}

			datosIndicador.forEach(function(xs){ //05/09/2022
			if(xs.INDICADOR === selecPress.desglose[0].IND_IMP){
			ModelProyect.setProperty("/IGV",xs.PORCENTAJE);
			}	
			});
			ModelProyect.refresh(true);

		},

		onConfirmarEliminarComprobante: function (oEvent) {
			var that = this;
			var oView = this.getView();
			var oList = this.getView().byId("list");

			if (oEvent.getSource().getPressed()) {
				oList.setMode("Delete");
			} else {
				oList.setMode("None");
			}
		},

		// 		// cambios JRodriguez 25/03/2022
		/*fnDeleteComprobantes: function (oEvent) {
			var that				= this;
			var oView				= this.getView();
			var ModelProyect		= oView.getModel("Proyect");
			var selected			= oView.getModel("Proyect").getProperty("/CountComprobante");
			var data				= oView.getModel("Proyect").getProperty("/DataComprobanteConfirmacion");
			var dataSelected		= oEvent.getParameter("listItem").getBindingContext("Proyect").getObject();
			var ImporteRend 		= ModelProyect.getProperty("/ImporteRend");
			var subTotalComp		= ModelProyect.getProperty("/subTotalComp");
			var importe 			= ModelProyect.getProperty("/importe");
			var total_rendido		= 0;
			var total_resta 		= 0;
			var eliminar_compro		= false;
			var Comprobantes_sap	= ModelProyect.getProperty("/Comprobantes_sap");
			var arrayDatos			   =[];
			var contador_ValidaDat    = 0;
			var datos_selecciones		= ModelProyect.getProperty("/datos_selecciones");
			//	var eliminar_compro  =ModelProyect.getProperty("/eliminar_compro");
			
			data.forEach(function(xd){
			if(xd.VALIDAR_DATOS === true){//01/09/2022
			arrayDatos.push(xd.COMPROBANTE);
			contador_ValidaDat++;
			}
				
			});
			
			var numero_prueba1 ="";
			if(contador_ValidaDat > 0){
			if(arrayDatos.join() !== ""){
			const filteredArray = arrayDatos.filter(function(ele , pos){
			 return arrayDatos.indexOf(ele) == pos;
			}) 
			numero_prueba1 =	"Lo(s) comprobate(s) :" + filteredArray.join(" , ");
			}
			
			MessageBox.warning("Debe validar o registrar los comprobante(s) \n " + numero_prueba1 + " de borrar.");
			arrayDatos =[];
			arrSelected = [];
			sap.ui.core.BusyIndicator.hide();
			return;	
			}
			
			for (var i = 0; i < data.length; i++) {
				if (dataSelected.keySeg == data[i].keySeg) {
					var indice = data.indexOf(data[i]);
					if (indice != -1) {
						if(dataSelected.COD_EST_COMP !== "CA" && dataSelected.COD_EST_COMP !== "C" && dataSelected.COD_EST_COMP !== "COM"){//21/07/2022
						
						dataSelected.desglose.forEach(function (items_01) {
						Comprobantes_sap.forEach(function(datos_compro){
							
							if(datos_compro.keySeg === dataSelected.keySeg){//21/07/2022
							arrSelected.push(dataSelected);	
							}
							
							data.forEach(function(xd){
								if (xd.keySeg === dataSelected.keySeg) {//13/09/2022
								
									xd.eliminar_compro = true;
									
								}else{
								xd.eliminar_compro = false;	
								}	
							});	
							
								if (ImporteRend !== undefined || parseFloat(ImporteRend) > 0) {
									total_rendido = parseFloat(ImporteRend) - parseFloat(items_01.TOTAL);
									total_resta = parseFloat(items_01.TOTAL) + parseFloat(ImporteRend);
									ModelProyect.setProperty("/ImporteRend", total_rendido.toFixed(2));
									ModelProyect.setProperty("/subTotalComp", total_resta.toFixed(2));
								}
							
						});
						});
						data.splice(indice, 1);
						
						//arrSelected.push(dataSelected);
						}
					}

				}
				ModelProyect.setProperty("/datos_Eliminar", arrSelected);
				// ModelProyect.setProperty("/eliminar_compro",[]);
			}

			data.forEach(function (objeto, index) {
				if (objeto.keySeg !== index + 1) {
					objeto.keySeg = index + 1;
					if (objeto.key !== "Nuevo Comprobante") {
						objeto.key = objeto.keySeg;
					}
				}
			});

			var resta_saldo = parseFloat(importe) - parseFloat(total_rendido);

			if (parseFloat(importe) < total_rendido) {
				ModelProyect.setProperty("/estado_saldo", "Success");
			} else if(total_rendido === "0.00"){
				ModelProyect.setProperty("/estado_saldo", "None");
			}else{
			ModelProyect.setProperty("/estado_saldo", "Error");
			}
			ModelProyect.setProperty("/Saldo", resta_saldo.toFixed(2));

			ModelProyect.refresh(true);
			ModelProyect.setProperty("/eliminar_compro", []);
			oView.getModel("Proyect").setProperty("/DataComprobantePreeliminar", data);
			oView.getModel("Proyect").setProperty("/DataComprobanteConfirmacion", data);
			oView.byId("list").removeSelections();
			if (data.length == 0) {
				oView.byId("list").setMode("None");
				oView.byId("buttonEliminarComprobante").setPressed(false);
				oView.byId("buttonEliminarComprobante").setEnabled(false);
			} else {
				oView.byId("list").setMode("Delete");
				oView.byId("buttonEliminarComprobante").setPressed(true);
				oView.byId("buttonEliminarComprobante").setEnabled(true);
			}

			var mobile = {
				Android: function () {
					return navigator.userAgent.match(/Android/i);
				},
				BlackBerry: function () {
					return navigator.userAgent.match(/BlackBerry/i);
				},
				iOS: function () {
					return navigator.userAgent.match(/iPhone|iPad|iPod/i);
				},
				Opera: function () {
					return navigator.userAgent.match(/Opera Mini/i);
				},
				Windows: function () {
					return navigator.userAgent.match(/IEMobile/i);
				},
				any: function () {
					return (mobile.Android() || mobile.BlackBerry() || mobile.iOS() || mobile.Opera() || mobile.Windows());
				}
			};

			var oSplitApp = this.getView().byId("SplitAppMatestros");
			if (!mobile.any()) {
				var detalleOK = this.getView().byId("NotFound").getId();
				oSplitApp.toDetail(detalleOK);

			} else {
				var detalleOK = this.getView().byId("master").getId();
				oSplitApp.toDetail(detalleOK);
			}

		},*/
		
		//cambios JRodriguez 21/09/2022
		fnDeleteComprobantes: function (oEvent) {
			var that				= this;
			var oView				= this.getView();
			var ModelProyect		= oView.getModel("Proyect");
			var selected			= oView.getModel("Proyect").getProperty("/CountComprobante");
			var data				= oView.getModel("Proyect").getProperty("/DataComprobanteConfirmacion");
			var dataSelected		= oEvent.getParameter("listItem").getBindingContext("Proyect").getObject();
			var ImporteRend 		= ModelProyect.getProperty("/ImporteRend");
			var subTotalComp		= ModelProyect.getProperty("/subTotalComp");
			var importe 			= ModelProyect.getProperty("/importe");
			var total_rendido		= 0;
			var total_resta 		= 0;
			var totalRendReal       = 0;
			var eliminar_compro		= false;
			var Comprobantes_sap	= ModelProyect.getProperty("/Comprobantes_sap");
			var arrayDatos			   =[];
			var contador_ValidaDat    = 0;
			var datos_selecciones		= ModelProyect.getProperty("/datos_selecciones");
			//	var eliminar_compro  =ModelProyect.getProperty("/eliminar_compro");
			
			data.forEach(function(xd){
				if(xd.VALIDAR_DATOS === true){//01/09/2022
					arrayDatos.push(xd.COMPROBANTE);
					contador_ValidaDat++;
				}
			});
			
			var numero_prueba1 ="";
			if(contador_ValidaDat > 0){
				if(arrayDatos.join() !== ""){
					const filteredArray = arrayDatos.filter(function(ele , pos){
						return arrayDatos.indexOf(ele) == pos;
					}) 
					numero_prueba1 =	"Lo(s) comprobate(s) :" + filteredArray.join(" , ");
				}
				
				MessageBox.warning("Debe validar o registrar los comprobante(s) \n " + numero_prueba1 + " antes de grabar .");
				arrayDatos =[];
				arrSelected = [];
				sap.ui.core.BusyIndicator.hide();
				return;	
			}
			
			for (var i = 0; i < data.length; i++) {
				if (dataSelected.keySeg == data[i].keySeg) {
					var indice = data.indexOf(data[i]);
					if (indice != -1) {
						if(dataSelected.COD_EST_COMP !== "CA" && dataSelected.COD_EST_COMP !== "C" && dataSelected.COD_EST_COMP !== "COM"){//21/07/2022

						if(dataSelected.desglose.length > 0){
							dataSelected.desglose.forEach(function (items_01) {
								Comprobantes_sap.forEach(function(datos_compro){
									
									if(datos_compro.keySeg === dataSelected.keySeg){//21/07/2022
									arrSelected.push(dataSelected);	
									}
									
									data.forEach(function(xd){
										if (xd.keySeg === dataSelected.keySeg) {//13/09/2022
										
											xd.eliminar_compro = true;
											
										}else{
										xd.eliminar_compro = false;	
										}	
									});	
									
										if (ImporteRend !== undefined || parseFloat(ImporteRend) > 0) {
											totalRendReal = parseFloat(ImporteRend) - parseFloat(items_01.TOTAL);
											//total_resta = parseFloat(items_01.TOTAL) + parseFloat(ImporteRend);
											ModelProyect.setProperty("/ImporteRend", totalRendReal.toFixed(2));
											//ModelProyect.setProperty("/subTotalComp", total_resta.toFixed(2));
										}
									
								});
							});
						}

						data.splice(indice, 1);
						
						//arrSelected.push(dataSelected);
						}
					}
				}
				ModelProyect.setProperty("/datos_Eliminar", arrSelected);
			}

			data.forEach(function (objeto, index) {
				if (objeto.keySeg !== index + 1) {
					objeto.keySeg = index + 1;
					if (objeto.key !== "Nuevo Comprobante") {
						objeto.key = objeto.keySeg;
					}
				}
			});
			
			if(dataSelected.desglose.length > 0){
				total_rendido = totalRendReal;
			}else{
				total_rendido = ImporteRend;
			}

			var resta_saldo = parseFloat(total_rendido) - parseFloat(importe) ;
			
			if (parseFloat(importe) < total_rendido) {
				ModelProyect.setProperty("/estado_saldo", "Success");
			} else if(total_rendido === "0.00"){
				ModelProyect.setProperty("/estado_saldo", "None");
			}else{
				ModelProyect.setProperty("/estado_saldo", "Error");
			}
			
			ModelProyect.setProperty("/Saldo", resta_saldo.toFixed(2));

			ModelProyect.refresh(true);
			ModelProyect.setProperty("/eliminar_compro", []);
			oView.getModel("Proyect").setProperty("/DataComprobantePreeliminar", data);
			oView.getModel("Proyect").setProperty("/DataComprobanteConfirmacion", data);
			oView.byId("list").removeSelections();
			
			if (data.length == 0) {
				oView.byId("list").setMode("None");
				oView.byId("buttonEliminarComprobante").setPressed(false);
				oView.byId("buttonEliminarComprobante").setEnabled(false);
			} else {
				oView.byId("list").setMode("Delete");
				oView.byId("buttonEliminarComprobante").setPressed(true);
				oView.byId("buttonEliminarComprobante").setEnabled(true);
			}

			var mobile = {
				Android: function () {
					return navigator.userAgent.match(/Android/i);
				},
				BlackBerry: function () {
					return navigator.userAgent.match(/BlackBerry/i);
				},
				iOS: function () {
					return navigator.userAgent.match(/iPhone|iPad|iPod/i);
				},
				Opera: function () {
					return navigator.userAgent.match(/Opera Mini/i);
				},
				Windows: function () {
					return navigator.userAgent.match(/IEMobile/i);
				},
				any: function () {
					return (mobile.Android() || mobile.BlackBerry() || mobile.iOS() || mobile.Opera() || mobile.Windows());
				}
			};

			var oSplitApp = this.getView().byId("SplitAppMatestros");
			if (!mobile.any()) {
				var detalleOK = this.getView().byId("NotFound").getId();
				oSplitApp.toDetail(detalleOK);
			} else {
				var detalleOK = this.getView().byId("master").getId();
				oSplitApp.toDetail(detalleOK);
			}
		},

		onPress: async function (oEvent) {//17/07/2022
			var pageDetail					= this.getView().byId("SplitAppMatestros");
			pageDetail.setBusy(true);
			var that						= this;
			var oView						= this.getView();
			var objectos					= oEvent.getSource().getBindingContext("Proyect").getObject();
			var Estado						= objectos.ESTADO;
			var oSplitApp					= this.getView().byId("SplitAppMatestros");
			var detalleOK					= this.getView().byId("detail").getId();
			var ModelProyect				= this.getView().getModel("Proyect");
			var miModel 					= this.getView().getModel("midata");
			var selectedTab 				= this.getView().byId("iconTabDetalle").getProperty("selectedKey");
			var datosTabla					= ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var datosComprobante01			= ModelProyect.getProperty("/datosComprobante");
			var jsonData					= ModelProyect.getProperty("/jsonData");
			var TipoDocumento				= ModelProyect.getProperty("/TipoDocumento");
			var Nombre_Boton				=ModelProyect.getProperty("/Nombre_Boton");
			contfilasGlob					= 0;
			var indice						= "";
			var datosjason					= [];
			var comprobantes				= "";
			var selectkeyTab				= "";
			var nombreTab					= "";
			var sumaBase					= 0;
			var sumaimpuesto				= 0;
			var sumaNogra					= 0;
			var sumaTotal					= 0;
			var IGV 						= ModelProyect.getProperty("/IGV");
			var impuesto					= parseFloat(IGV);
			var indice01					= "";
			var importeRen					= 0;
			var contador_compro				=0;
			var numerocomprobante			=oView.byId("sRegistroComprobante").getValue();
			var tipo_usuario				=ModelProyect.getProperty("/tipo_usuario");
			
			ModelProyect.setProperty("/datos_selecciones", objectos);
			// var datosJson=[{"dato":contfilasGlob,"gastos":"asd"}];
			var tipoNif 				= ModelProyect.getProperty("/tipoNif");
			var hoy 					= new Date();
			var fecha					= "";
			var mes 					= hoy.getMonth() + 1;
			
			var hoyp = hoy.getDate().toString();
			if (hoyp < 10) {
				var hoyn = "0" + hoy.getDate().toString();
			} else {
				var hoyn = hoy.getDate().toString();
			}

			if (mes < 10) {
				mes = "0" + mes.toString();
			}

			fecha = hoyn.toString() + "/" + mes.toString() + "/" + hoy.getFullYear().toString();

			//oSplitApp.destroyDetailPages(detalleOK);
			var arraynuevo			=[];
			var boleano_nuevo		 =false;
			var validarDatos		= false;
			var arrayValiDatos      = [];
			var datosIndicador		= ModelProyect.getProperty("/datosIndicador");
			
			if(objectos.DATOS_SAP === true){
			datosTabla.forEach(function (items2){
				
			if(items2.DATOS_SAP !== true){
				boleano_nuevo=true;
				arraynuevo.push(items2.COMPROBANTE);
			}
			
			if(items2.VALIDAR_DATOS === true){
				
				if(items2.COMPROBANTE1 !== items2.COMPROBANTE){	
			  	validarDatos = true;
				arrayValiDatos.push(items2.COMPROBANTE);
				
				}
				
				if(items2.FECHA_PRUEBA !== ""){
				if(items2.FECHA_PRUEBA !== items2.FECHA_COMP){	
				validarDatos = true;	
				arrayValiDatos.push(items2.COMPROBANTE);
				
				}
				}
				
				if(items2.RUC_PRUEBA !== ""){
				if(items2.RUC_PRUEBA !==  items2.RUC){
				validarDatos = true;	
				arrayValiDatos.push(items2.COMPROBANTE);
				
				}
				}
			
			}//01/09/2022
			
			});
			
			var sAdicional01="";
			if(arrayValiDatos.join() != ""){
			const filteredArray = arrayValiDatos.filter(function(ele , pos){
			 return arrayValiDatos.indexOf(ele) == pos;
			}); 	
			sAdicional01 = "Lo(s) comprobate(s) :" +filteredArray.join();	
			}
			if(validarDatos){
			//ModelProyect.setProperty("/ValidaDatos" ,validarDatos);	
			MessageBox.warning("Debes de validar o registrar los comprobantes.\n "  + sAdicional01);
			pageDetail.setBusy(false);
			return;
			}
			
			var sAdicional="";
			if(arraynuevo.join() != ""){
			const filteredArray = arraynuevo.filter(function(ele , pos){
			 return arraynuevo.indexOf(ele) == pos;
			}); 	
			sAdicional = "Nuevo(s) comprobate(s) :" +filteredArray.join();	
			}
			if(boleano_nuevo ){
			MessageBox.warning("Debes de grabar los nuevos registros antes de continuar con la edición.\n "  + sAdicional);
			pageDetail.setBusy(false);
			return;
			}
			}
			else{
			datosTabla.forEach(function (items2){	
			if(items2.VALIDAR_DATOS === true){
				
				if(items2.COMPROBANTE1 !== items2.COMPROBANTE){	
			  	validarDatos = true;
				arrayValiDatos.push(items2.COMPROBANTE);
				
				}
				
				if(items2.FECHA_PRUEBA !== ""){
				if(items2.FECHA_PRUEBA !== items2.FECHA_COMP){	
				validarDatos = true;	
				arrayValiDatos.push(items2.COMPROBANTE);
				
				}
				}
				
				if(items2.RUC_PRUEBA !== ""){
				if(items2.RUC_PRUEBA !==  items2.RUC){
				validarDatos = true;	
				arrayValiDatos.push(items2.COMPROBANTE);
				
				}
				}
			
			}	
			
			});
			
			var sAdicional01="";
			if(arrayValiDatos.join() != ""){
			const filteredArray = arrayValiDatos.filter(function(ele , pos){
			 return arrayValiDatos.indexOf(ele) == pos;
			}); 	
			sAdicional01 = "Lo(s) comprobate(s) :" +filteredArray.join();	
			}
			if(validarDatos){
			//ModelProyect.setProperty("/ValidaDatos" ,validarDatos);	
			MessageBox.warning("Debes de validar o registrar los comprobantes.\n "  + sAdicional01);
			pageDetail.setBusy(false);
			return;
			}
			}
			
			ModelProyect.setProperty("/validacionFecha" ,undefined);//12/08/2022
			oSplitApp.toDetail(detalleOK);
			
			datosTabla.forEach(function (items, i) {
				
				var vista = that.getView();
				if (items.keySeg === objectos.keySeg) {//21/07/2022
					items.NROD0 = datosComprobante01.NROD0;
					
					if (items.HABILI_COMPRO === true) {
						ModelProyect.setProperty("/HABILI_COMPRO", true);
					} else if (items.HABILI_COMPRO === false) {
						ModelProyect.setProperty("/HABILI_COMPRO", false);
					} else {
						ModelProyect.setProperty("/HABILI_COMPRO", true);
					}
				
					 if(items.COD_TIPO_COMP === "KX"){//24/07/2022
						items.TIPODOCI = "DEXT";
					}else
					if (items.RUC.length === 11) { /// cambios de Claudia 
						items.TIPODOCI = "RUC";
						
					} else if (items.RUC.length === 8) {
						items.TIPODOCI = "DNI";
					} else if ((items.RUC.length === 0 || items.RUC.length === undefined || items.RUC.length === "")) {
						items.TIPODOCI = "---Seleccionar---";
					}
					
					items.COPIA_TIPODOC =items.TIPODOCI;
					if (items.RUC !== "") {
						ModelProyect.setProperty("/visbleCampo", true);
					} else {
						ModelProyect.setProperty("/visbleCampo", false);
					}
					if (items.COD_TIPO_COMP === "D5") { ///CAMBIADO POR CLAUDIA
						ModelProyect.setProperty("/Nombre_Boton", "Registrar");
						ModelProyect.setProperty("/visbleCampo", true);
					} else {
						ModelProyect.setProperty("/Nombre_Boton", "Validar");
						ModelProyect.setProperty("/visbleCampo", true);
					}

					TipoDocumento.forEach(function (objc) {
						if (objc.DENOMINACION === items.TIPO_COMP) {
							items.COD_TIPO_COMP = objc.CLASE;
						}
					});

					if (datosTabla[i].desglose.length > 0) {
						datosTabla[i].desglose.map(function (obje, index) {

							sumaBase += parseFloat(obje.BASE_IMP);
							sumaNogra += parseFloat(obje.INAFECTO);
							sumaimpuesto += parseFloat(obje.IGV);
							obje.indComp = i;
							
							datosIndicador.forEach(function(xs){ //05/09/2022
							if(xs.INDICADOR === objectos.desglose[0].IND_IMP){
							ModelProyect.setProperty("/IGV",xs.PORCENTAJE);
							}	
							});

							if (obje.imputacion.length > 0) {
								obje.stateCeco = "Success";
								obje.iconCeco = "sap-icon://sys-enter-2";
							} else {
								obje.stateCeco = "Warning";
								obje.iconCeco = "sap-icon://alert";
							}
							if (obje.IND_IMP === "C0") {
								sumaBase ="0.00";//17/07/2022
								sumaimpuesto = "0.00";
								sumaimpuesto = parseFloat(sumaimpuesto);
								sumaTotal = parseFloat(sumaNogra);

								items.totalImpu = sumaimpuesto.toFixed(2);
								items.totalImp = sumaBase;//17/07/2022
								items.totalNoGr = sumaNogra.toFixed(2);
								items.totales = sumaNogra.toFixed(2);
								obje.validacionBase = false;
							} else {
								
								sumaTotal = parseFloat(sumaBase) + sumaimpuesto + parseFloat(sumaNogra); //--------------nuevo cambio

								if (items.QR) {
									items.desglose[0].INAFECTO = (items.desglose[0].TOTAL - sumaTotal).toFixed(2);
									sumaNogra += (items.desglose[0].TOTAL - sumaTotal);
									sumaimpuesto = parseFloat(sumaBase) * impuesto;
									sumaimpuesto = sumaimpuesto / 100;
									sumaTotal = parseFloat(sumaBase) + sumaimpuesto + parseFloat(sumaNogra);
								}

								items.totalImpu = sumaimpuesto.toFixed(2);
								items.totalImp = sumaBase.toFixed(2);
								items.totalNoGr = sumaNogra.toFixed(2);
								items.totales = sumaTotal.toFixed(2);
								obje.validacionBase = true;
							}
							
							

				if(((items.COD_EST_COMP === "CA" || items.COD_EST_COMP === "C" || items.COD_EST_COMP === "COM" || items.COD_EST_COMP === "O" ||  items.COD_EST_COMP === "CPA" || items.COD_EST_COMP === "CR" ) && tipo_usuario ==="LO") ||
				(items.COD_EST_COMP === "CA" || items.COD_EST_COMP === "C" || items.COD_EST_COMP === "COM")) {//21/07/2022
								
							switch (items.COD_TIPO_COMP) { //cambios nuevos de Claudia 
							case "KD": ////cambios de Claudia 
							obje.validaciones1= false;
							obje.enableImputa= true;
							ModelProyect.setProperty("/VisibleReferencia", true);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
							
							break;
							case "KG": //-----------------------------nuevo Cambios Claudia
							obje.validaciones1= false;
							obje.enableImputa= true;
							ModelProyect.setProperty("/VisibleReferencia", true);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
							break;
							
							case "DU":
									obje.validaciones1 = false;
									obje.enableImputa = false;
							ModelProyect.setProperty("/VisibleReferencia", false);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								
								break;
							case "KB":
									obje.validaciones1 = false;
									obje.enableImputa = true;
							ModelProyect.setProperty("/VisibleReferencia", false);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								break;
								case "KM":
									obje.validaciones1 = false;
									obje.enableImputa = true;
							ModelProyect.setProperty("/VisibleReferencia", false);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								break;
							case "KX":
								
									obje.validaciones1 = false;
									obje.enableImputa = true;
							ModelProyect.setProperty("/VisibleReferencia", false);	
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								break;
								
								case "SK":
									obje.validaciones1 = false;
									obje.enableImputa = true;
							ModelProyect.setProperty("/VisibleReferencia", false);	
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								break;
							case "PM":
								
									obje.validaciones1 = true;
									obje.enableImputa = true;
							ModelProyect.setProperty("/VisibleReferencia", false);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								break;
							case "KH":
								
									obje.validaciones1 = false;
									obje.enableImputa = true;
							ModelProyect.setProperty("/VisibleReferencia", false);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								break;
							case "KI":
								obje.validaciones1 = false;
								obje.enableImputa = true;
							ModelProyect.setProperty("/VisibleReferencia", false);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								break;
							case "D5":

								obje.validaciones1 = false;
								obje.enableImputa = false;
							ModelProyect.setProperty("/VisibleReferencia", false);	
							ModelProyect.setProperty("/Campos_Visibles", false);
							ModelProyect.setProperty("/Visible_Btn02", true);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								break;
							default:
									obje.validaciones1 = false;
									obje.enableImputa = true;
							ModelProyect.setProperty("/VisibleReferencia", false);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								break;
							}	
									obje.validacionBase = false;
									obje.validacionInafecto = false;
									obje.validacionIndicador = false;
									obje.validacionIGV = false;
									obje.enabledGastos = false;
									obje.enabledBanco = false;
									
							ModelProyect.setProperty("/HABILI_COMPRO", false);//18/07/2022
							ModelProyect.setProperty("/visibleBorrarM", false);
							ModelProyect.setProperty("/visibleTipo_doc", false);
							ModelProyect.setProperty("/visbleCampoRUC", false);
							ModelProyect.setProperty("/enabledAgregar", false);
							ModelProyect.setProperty("/editableFechaM", false);
							ModelProyect.setProperty("/editableimporetM", false);
							ModelProyect.setProperty("/visibleGuardarM", false);
							ModelProyect.setProperty("/deseableimporte", false);
							ModelProyect.setProperty("/visibleAgregarM", false);
							ModelProyect.setProperty("/visibleBorrarM", false);
							ModelProyect.setProperty("/editablePorce", false);
							ModelProyect.setProperty("/deseableporcentaje", false);
							ModelProyect.setProperty("/deseableCeco", false);
							ModelProyect.setProperty("/selPorcImpu", false);
							ModelProyect.setProperty("/selImpImpu", false);
							ModelProyect.setProperty("/estadoLink", "None");
							ModelProyect.setProperty("/visibleBtnGuardar", false);
							ModelProyect.setProperty("/visibleBtnAgregar", false);
							ModelProyect.setProperty("/visiblePorcentaje", false);
							ModelProyect.setProperty("/HABILI_CAMPO", false);
							ModelProyect.setProperty("/visble_btnValidar", false);
							ModelProyect.setProperty("/visbleCampo", false);
							ModelProyect.setProperty("/HABILI_FACTURA", false);
							ModelProyect.setProperty("/visible_btnSubida", false);
							ModelProyect.setProperty("/visibleAgregar", false);
							ModelProyect.setProperty("/visibleBorrar", false);
							ModelProyect.setProperty("/editableTipo_Com", false);
							
				}else{
					
							ModelProyect.setProperty("/HABILI_COMPRO", true);//18/07/2022
							ModelProyect.setProperty("/editableRazon", true);//24/07/2022
							ModelProyect.setProperty("/visibleBorrarM", true);//cambios 10/06/2022
							ModelProyect.setProperty("/visibleTipo_doc", false);
							//ModelProyect.setProperty("/visbleCampoRUC", true);
							//ModelProyect.setProperty("/enabledAgregar", true);
							ModelProyect.setProperty("/editableFechaM", true);
							ModelProyect.setProperty("/editableimporetM", true);
							ModelProyect.setProperty("/visibleGuardarM", true);
							ModelProyect.setProperty("/deseableimporte", true);
							ModelProyect.setProperty("/visibleAgregarM", true);
							ModelProyect.setProperty("/visibleBorrarM", true);
							ModelProyect.setProperty("/editablePorce", true);
							ModelProyect.setProperty("/deseableporcentaje", true);
							ModelProyect.setProperty("/deseableCeco", true);
							ModelProyect.setProperty("/selPorcImpu", true);
							ModelProyect.setProperty("/selImpImpu", true);
							ModelProyect.setProperty("/estadoLink", "Delete");
							ModelProyect.setProperty("/visibleBtnGuardar", true);
							ModelProyect.setProperty("/visibleBtnAgregar", true);
							ModelProyect.setProperty("/visiblePorcentaje", true);
							ModelProyect.setProperty("/HABILI_CAMPO", true);
							ModelProyect.setProperty("/visble_btnValidar", true);
							ModelProyect.setProperty("/visbleCampo", true);
							//ModelProyect.setProperty("/HABILI_FACTURA", true);
							ModelProyect.setProperty("/visible_btnSubida", true);
							ModelProyect.setProperty("/visibleAgregar", true);
							ModelProyect.setProperty("/visibleBorrar", true);
							
							if(items.DATOS_SAP === true){
							ModelProyect.setProperty("/editableTipo_Com", false);	
							}else{
							ModelProyect.setProperty("/editableTipo_Com", true);	
							}
							
							
							switch (items.COD_TIPO_COMP) { //cambios nuevos de Claudia 
							case "KD": ////cambios de Claudia
							if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion // VALIDACION NUEVA
							obje.enabledBorrar = true;
							} else {
							obje.enabledBorrar = false;
							}
								obje.validacionIndicador=true;
								obje.validaciones1	= false;//
								obje.validacionInafecto= true;
								obje.enabledGastos	= true;
								obje.validacionIGV = true;
								obje.enabledBanco	= false;
								obje.validacionBase	= true;
								obje.enableImputa	= true;//
							ModelProyect.setProperty("/VisibleReferencia", true);
							ModelProyect.setProperty("/visible_Campo", true);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
							ModelProyect.setProperty("/HABILI_FACTURA", true);
							
							break;
							case "KG": //-----------------------------nuevo Cambios Claudia
							if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion // VALIDACION NUEVA
							obje.enabledBorrar = true;
							} else {
							obje.enabledBorrar = false;
							}
							obje.validacionIndicador= true;
							obje.validaciones1= false;//
							obje.validacionBase= true;
							obje.validacionIGV = true;
							obje.validacionInafecto= true;
							obje.enabledBorrar= false;
							obje.enabledGastos= true;
							obje.enableImputa= true;//
							obje.enabledBanco= false;
								
							ModelProyect.setProperty("/VisibleReferencia", true);
							ModelProyect.setProperty("/visible_Campo", true);
							ModelProyect.setProperty("/Campos_Visibles", true);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/editableRazon", false);//24/07/2022
							ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
							ModelProyect.setProperty("/HABILI_FACTURA", true);
							break;
							case "DU":
								if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion // VALIDACION NUEVA
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = false;
									obje.validacionIGV = false;
									obje.validaciones1 = false;
									obje.validacionInafecto = true;
									obje.validacionIndicador = false;
									// obje.enabledBorrar = true;
									obje.enabledGastos = false;
									obje.enableImputa = false;
									obje.enabledBanco = false;	
							
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", true);
								ModelProyect.setProperty("/visbleCampoRUC", true);
								ModelProyect.setProperty("/enabledAgregar", true);
								ModelProyect.setProperty("/visible_Campo", true);
								ModelProyect.setProperty("/Campos_Visibles", true);
								ModelProyect.setProperty("/Visible_Btn02", false);
								ModelProyect.setProperty("/editableRazon", false);//24/07/2022
								ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);

								break;
							case "KB":
								if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion // VALIDACION NUEVA
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = false;
									obje.validaciones1 = false;
									obje.validacionInafecto = true;
									obje.validacionIndicador = false;
									obje.validacionIGV = false;
									obje.enabledGastos = true;
									obje.enableImputa = true;
									obje.enabledBanco = false;	
							
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", true);
								ModelProyect.setProperty("/visbleCampoRUC", true);
								ModelProyect.setProperty("/enabledAgregar", true);
								ModelProyect.setProperty("/visible_Campo", true);
								ModelProyect.setProperty("/Campos_Visibles", true);
								ModelProyect.setProperty("/Visible_Btn02", false);
								ModelProyect.setProperty("/editableRazon", false);//24/07/2022
								ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);

								break;
								case "KM":
								if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion // VALIDACION NUEVA
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = false;
									obje.validaciones1 = false;
									obje.validacionInafecto = true;
									obje.validacionIGV = false;
									obje.validacionIndicador = false;
									// obje.enabledBorrar = true;
									obje.enabledGastos = true;
									obje.enableImputa = true;
									obje.enabledBanco = false;	
							
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", true);
								ModelProyect.setProperty("/visbleCampoRUC", true);
								ModelProyect.setProperty("/enabledAgregar", true);
								ModelProyect.setProperty("/visible_Campo", true);
								ModelProyect.setProperty("/Campos_Visibles", true);
								ModelProyect.setProperty("/Visible_Btn02", false);
								ModelProyect.setProperty("/editableRazon", false);//24/07/2022
								ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);

								break;
							case "KX":
								if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion // VALIDACION NUEVA
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = false;
									obje.validaciones1 = false;
									obje.validacionIGV = false;
									obje.validacionInafecto = true;
									obje.validacionIndicador = false;
									// obje.enabledBorrar = true;
									obje.enabledGastos = true;
									obje.enableImputa = true;
									obje.enabledBanco = false;	
							
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", false);//24/07/2022
								ModelProyect.setProperty("/visbleCampoRUC", true);
								ModelProyect.setProperty("/enabledAgregar", true);
								ModelProyect.setProperty("/visible_Campo", true);
								ModelProyect.setProperty("/Campos_Visibles", true);
								ModelProyect.setProperty("/Visible_Btn02", false);
								ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);
								
								if(items.RAZON_SOCIAL.length < 1){
								ModelProyect.setProperty("/editableRazon", true);//04/08/2022
								}else{
								ModelProyect.setProperty("/editableRazon", false);//04/07/2022	
								}

								break;
								
								case "SK":
								if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion // VALIDACION NUEVA
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = false;
									obje.validaciones1 = false;
									obje.validacionIGV = false;
									obje.validacionInafecto = true;
									obje.validacionIndicador = false;
									// obje.enabledBorrar = true;
									obje.enabledGastos = true;
									obje.enableImputa = true;
									obje.enabledBanco = false;	
							
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", true);
								ModelProyect.setProperty("/visbleCampoRUC", true);
								ModelProyect.setProperty("/enabledAgregar", true);
								ModelProyect.setProperty("/visible_Campo", true);
								ModelProyect.setProperty("/Campos_Visibles", true);
								ModelProyect.setProperty("/Visible_Btn02", false);
								ModelProyect.setProperty("/editableRazon", false);//24/07/2022
								ModelProyect.setProperty("/Editable_Tipo", true);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);

								break;
							case "PM":
								if (obje.COD_CONT === "151" && obje.IND_IMP === "C0") {
									if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = false;
									obje.validaciones1 = true;
									obje.validacionIGV = false;
									obje.validacionInafecto = false;
									obje.validacionIndicador = false;
									// obje.enabledBorrar = false;
									obje.enabledGastos = false;
									obje.enableImputa = true;
									obje.enabledBanco = false; //agregado por claudia 
								}
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", true);
								ModelProyect.setProperty("/visbleCampoRUC", true);
								ModelProyect.setProperty("/enabledAgregar", false);
								ModelProyect.setProperty("/visible_Campo", true);
								ModelProyect.setProperty("/Campos_Visibles", true);
								ModelProyect.setProperty("/Visible_Btn02", false);
								ModelProyect.setProperty("/editableRazon", false);//24/07/2022
								ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);

								break;
							case "KH":
								if (obje.IND_IMP === "C0") {
									if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = false;
									obje.validacionIGV = false;
									obje.validaciones1 = false;
									obje.validacionInafecto = true;
									obje.validacionIndicador = false;
									// obje.enabledBorrar = true;
									obje.enabledGastos = true;
									obje.enableImputa = true;
									obje.enabledBanco = false;
								}
								
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", true);
								ModelProyect.setProperty("/visbleCampoRUC", true);
								ModelProyect.setProperty("/enabledAgregar", true);
								ModelProyect.setProperty("/visible_Campo", true);
								ModelProyect.setProperty("/Campos_Visibles", true);
								ModelProyect.setProperty("/Visible_Btn02", false);
								ModelProyect.setProperty("/editableRazon", false);//24/07/2022
								ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);

								break;
							case "KI":
								if (obje.IND_IMP !== "C0") { //agregado por claudia
									if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = true;
									obje.validacionInafecto = true;
									obje.validacionIndicador = false;
									obje.validacionIGV = true;
									// obje.enabledBorrar = true;
									obje.enabledGastos = true;
									obje.validaciones1 = false;
									obje.enableImputa = true;
									obje.enabledBanco = false;

								}
								
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", true);
								ModelProyect.setProperty("/visbleCampoRUC", true);
								ModelProyect.setProperty("/enabledAgregar", true);
								ModelProyect.setProperty("/visible_Campo", true);
								ModelProyect.setProperty("/Visible_Btn02", false);
								ModelProyect.setProperty("/Campos_Visibles", true);
								ModelProyect.setProperty("/editableRazon", false);//24/07/2022
								ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);

								break;
							case "D5":

								if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion
									obje.enabledBorrar = true;
								} else {
									obje.enabledBorrar = false;
								}
								obje.validacionBase = false;
								obje.validacionIGV = false;
								obje.validacionInafecto = true;
								obje.validacionIndicador = false;
								// obje.enabledBorrar = false;
								obje.enabledGastos = false;
								obje.validaciones1 = false;
								obje.enableImputa = false;
								obje.enabledBanco = true;
								items.TIPODOCI ="---Seleccionar---";
								
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", false);
								ModelProyect.setProperty("/visbleCampoRUC", false);
								ModelProyect.setProperty("/Visible_Btn02", true);
								ModelProyect.setProperty("/enabledAgregar", false);
								ModelProyect.setProperty("/visible_Campo", false);
								ModelProyect.setProperty("/Campos_Visibles", false);
								ModelProyect.setProperty("/editableRazon", false);//24/07/2022
								ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);

								break;
							default:
								if (obje.IND_IMP !== "C0") {

									if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = true;
									obje.validacionInafecto = true;
									obje.validacionIGV =true;
									obje.validacionIndicador = true;
									// obje.enabledBorrar = true;
									obje.enabledGastos = true;
									obje.validaciones1 = false;
									obje.enableImputa = true;
									obje.enabledBanco = false;
								}else{
									if (parseFloat(obje.POSIC) !== 1) { //deshabilitar el boton de eliminar segun la posicion
										obje.enabledBorrar = true;
									} else {
										obje.enabledBorrar = false;
									}
									obje.validacionBase = false;//----------------cambio nuevo
									obje.validacionInafecto = true;
									obje.validacionIndicador = true;
									obje.validacionIGV =false;
									// obje.enabledBorrar = true;
									obje.enabledGastos = true;
									obje.validaciones1 = false;
									obje.enableImputa = true;
									obje.enabledBanco = false;	
								}
								ModelProyect.refresh(true);
								ModelProyect.setProperty("/VisibleReferencia", false);
								ModelProyect.setProperty("/visibleTipo_doc", true);
								ModelProyect.setProperty("/visbleCampoRUC", true);
								ModelProyect.setProperty("/Visible_Btn02", false);
								ModelProyect.setProperty("/enabledAgregar", true);
								ModelProyect.setProperty("/visible_Campo", true);
								ModelProyect.setProperty("/Campos_Visibles", true);
								ModelProyect.setProperty("/editableRazon", false);//24/07/2022
								ModelProyect.setProperty("/Editable_Tipo", false);//12/08/2022
								ModelProyect.setProperty("/HABILI_FACTURA", false);
								break;
							}

							ModelProyect.setProperty("/visibleTipo_doc", false);
						
							}

				});

					} else {
						if (items.COD_TIPO_COMP === "PM") {

							ModelProyect.setProperty("/enabledAgregar", false);
							ModelProyect.setProperty("/Visible_Btn02", false);
							ModelProyect.setProperty("/Campos_Visibles", true);

						} else {
						ModelProyect.setProperty("/visibleTipo_doc", false);	
						ModelProyect.setProperty("/HABILI_COMPRO", true);//18/07/2022
						ModelProyect.setProperty("/editableRazon", false);//24/07/2022
						ModelProyect.setProperty("/enabledAgregar", true);
						ModelProyect.setProperty("/visibleBorrarM", true);
						ModelProyect.setProperty("/editableFechaM", true);
						ModelProyect.setProperty("/editableimporetM", true);
						ModelProyect.setProperty("/visibleGuardarM", true);
						ModelProyect.setProperty("/deseableimporte", true);
						ModelProyect.setProperty("/visibleAgregarM", true);
						ModelProyect.setProperty("/editablePorce", true);
						ModelProyect.setProperty("/deseableporcentaje", true);
						ModelProyect.setProperty("/deseableCeco", true);
						ModelProyect.setProperty("/selPorcImpu", true);
						ModelProyect.setProperty("/selImpImpu", true);
						ModelProyect.setProperty("/estadoLink", "Delete");
						ModelProyect.setProperty("/visibleBtnGuardar", true);
						ModelProyect.setProperty("/visibleBtnAgregar", true);
						ModelProyect.setProperty("/visiblePorcentaje", true);
						ModelProyect.setProperty("/HABILI_CAMPO", true);
						ModelProyect.setProperty("/visble_btnValidar", true);
						ModelProyect.setProperty("/visbleCampo", true);
						ModelProyect.setProperty("/visible_btnSubida", true);
						ModelProyect.setProperty("/visibleAgregar", true);
						ModelProyect.setProperty("/visibleBorrar", true);
						ModelProyect.setProperty("/Visible_Btn02", false);
						ModelProyect.setProperty("/Campos_Visibles", true);
						if(items.DATOS_SAP === true){
						ModelProyect.setProperty("/editableTipo_Com", false);	
						}else{
						ModelProyect.setProperty("/editableTipo_Com", true);	
						}
						
						}

					}
					
					ModelProyect.setProperty("/Posicion", JSON.parse(JSON.stringify(datosTabla[i].archivoAd)));
					
					ModelProyect.setProperty("/CompChange", JSON.parse(JSON.stringify(items)));
					ModelProyect.setProperty("/jsonData", datosTabla[i].desglose);
					ModelProyect.setProperty("/COMPROBANTE", items.COMPROBANTE);
					ModelProyect.setProperty("/FECHA_COMP", items.FECHA_COMP);
					vista.byId("sRegistroComprobante").setValue(items.COMPROBANTE);
					// oView.byId("sfechaComprobante").setValue(items.FECHA_COMP);
					ModelProyect.setProperty("/fecha_Comprobante", items.FECHA_COMP);
					ModelProyect.setProperty("/Key_comprobante", items.COD_TIPO_COMP);
					ModelProyect.setProperty("/TIPO_COMP", items.TIPO_COMP);
					ModelProyect.setProperty("/razonSocial", items.RAZON_SOCIAL);
					ModelProyect.setProperty("/ruc", items.RUC);
					ModelProyect.setProperty("/impueDet", items.totalImpu);
					ModelProyect.setProperty("/subTotal", items.totalImp);
					ModelProyect.setProperty("/noGrabada", items.totalNoGr);
					ModelProyect.setProperty("/subTotalComp", items.totales);
					ModelProyect.setProperty("/nroPos", items.key);
					ModelProyect.setProperty("/monedas", items.WAERS);
					ModelProyect.setProperty("/Glosa", items.GLOSA);
					ModelProyect.setProperty("/tipoNif", items.TIPODOCI);
					ModelProyect.setProperty("/Orden_Interna", items.ORDEN_INT);
					ModelProyect.setProperty("/Numero_viaje", items.VIAJES);
					vista.byId("idFactura").setValue(items.REF_FACTURA);

					// ModelProyect.setProperty("/Saldo");
					selectkeyTab = oView.byId("iconTabDetalle");
					nombreTab = selectkeyTab.setSelectedKey("idComprobantes");
					ModelProyect.refresh(true);
					that.getOwnerComponent().getRouter().navTo(nombreTab);
					pageDetail.setBusy(false);

				}

			});
			ModelProyect.setProperty("/visibleTipo_doc", false);
			
			
			//validacion de los nuevos registros 
		
					 //if(items.DATOS_SAP === true && datosTabla.length > 1){
					 //	contador_compro++;
					
					 //}
		
			
			
			ModelProyect.setProperty("/selecPress", objectos);
			ModelProyect.setProperty("/btnEliminarTabla", true);

		},

		// ObtenerDocumentos: async function (ruta) {
		// 	return new Promise(function (resolve, reject) {
		// 		jQuery.ajax({
		// 			url: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/" + ruta,
		// 			cache: false,
		// 			processData: false,
		// 			contentType: false,
		// 			dataType: "json",
		// 			type: "GET",
		// 			success: function (data) {
		// 				resolve(data.objects);
		// 			},
		// 			error: function (err) {
		// 				if (err.responseJSON && err.responseJSON.exception === "objectNotFound") {
		// 					resolve([]);
		// 				} else {
		// 					sap.m.MessageBox.error("Hubo un Error, por favor comuníquese con el administrador del sistema");
		// 					reject(err);
		// 				}
		// 			}
		// 		});
		// 	});

		// },

		// -------------- Cambios JRodriguez 23/03/2022 -----------
		seleccionComp: function (oEvent) {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var objectos = oEvent.getSource().getSelectedItem().getBindingContext("Proyect").getObject();

			ModelProyect.setProperty("/selectComp", objectos);
		},

		onPressAprObs: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var selectComp = ModelProyect.getProperty("/selectComp");

			// if(EST_COMP !== "OBSERVADO"){
			// 	MessageBox.error("No puedes aprobar comprobantes con estado distinto a " + '"OBSERVADO"');
			// 	return;
			// }
			if(selectComp.COD_EST_COMP !== "CA" && selectComp.COD_EST_COMP !== "C" && selectComp.COD_EST_COMP !== "COM"){//12/07/2022
			
			selectComp.EST_COMP = "COMP. PEND. APR.";
			selectComp.iconComp = "sap-icon://pending";
			selectComp.stateComp = "Warning";

			MessageToast.show("¡El comprobante se aprobó exitósamente!");
			ModelProyect.refresh(true);
			}else{
			MessageBox.warning("No se puede cambiar el estado al comprobante seleccionado .");
			 return;	
			}
			

		},

		onPressRechObs: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var selectComp = ModelProyect.getProperty("/selectComp");

			// if(EST_COMP !== "OBSERVADO"){
			// 	MessageBox.error("No puedes aprobar comprobantes con estado distinto a " + '"OBSERVADO"');
			// 	return;
			// }
			if(selectComp.COD_EST_COMP !== "CA" && selectComp.COD_EST_COMP !== "C" && selectComp.COD_EST_COMP !== "COM"){//12/07/2022
			selectComp.EST_COMP = "EN REVISIÓN";
			selectComp.iconComp = "sap-icon://decline";
			selectComp.stateComp = "Error";

			MessageToast.show("¡El comprobante se encuentra en revisión!");

			ModelProyect.refresh(true);
			}else{
			MessageBox.warning("No se puede cambiar el estado al comprobante seleccionado .");
			 return;		
			}
		},

		// onPressEnvObs: async function (oEvent) {
		// 	sap.ui.core.BusyIndicator.show(0);
		// 	var oView					= this.getView();
		// 	var ModelProyect			= oView.getModel("Proyect");
		// 	var selectComp				= ModelProyect.getProperty("/selectComp");
		// 	var that					= this;
		// 	var oView					= this.getView();
		// 	var ModelProyect			= oView.getModel("Proyect");
		// 	var dataComprobante 		= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var hoy 					= new Date();
		// 	var fecha					= "";
		// 	var mes 					= hoy.getMonth() + 1;
		// 	var hoyp					= hoy.getDate().toString();
		// 	var nro_solic				= ModelProyect.getProperty("/solicitud");
		// 	var ImporteRend 			= ModelProyect.getProperty("/ImporteRend");
		// 	var moneda					= ModelProyect.getProperty("/monedas");
		// 	var Glosa					= ModelProyect.getProperty("/Glosa");
		// 	var contadores01			= 0;
		// 	var selectkeyTab			= "";
		// 	var nombreTab				= "";
		// 	var estado_Comp 			= "";
		// 	var importe 				= ModelProyect.getProperty("/importe");
		// 	var estado_sol				= "";
		// 	var estado_comp 			= "";
		// 	var nivel_apro				= "";
		// 	var contadores_solic		= 0;
		// 	var validar_solic			= false;
		// 	var validacion_estado		= false;
		// 	var codigoDComp 			= "";
		// 	var arrayaprobacion 		= [];
		// 	var TipoNif 				= "";
		// 	var validacion_glose		=	 false;
		// 	var nombrevalidacion		= "";
		// 	var codigo_clase			= "";
		// 	var monstrar_estadoCp		= "";
		// 	var monstrar_estadoRuc		= "";
		// 	var monstrar_condDomiRuc	= "";
		// 	var RUC_BENE				= ModelProyect.getProperty("/RUC_BENE");
		// 	var data4					= "";
		// 	var arrayestructura 		= [];
		// 	var arrayTabla				= [];
		// 	var validarCeco 			= false;
		// 	var validarArchivo			= false;
		// 	var validarCeco 			= false;
		// 	var desglose_Validar		= "";
		// 	var ceco_validar			= "";
		// 	var adjunto_validar 		= "";
		// 	var cont_desglose			= 0;
		// 	var cont_ceco				= 0;
		// 	var cont_adjunto			= 0;
		// 	var cont_mov				=0;
		// 	var mov_validar				="";
		// 	var errores					="";
		// 	var correouser				=ModelProyect.getProperty("/correouser");
		// 	var FECHA_ABON				= ModelProyect.getProperty("/FECHA_ABON");
		// 	var nroDocPago				= ModelProyect.getProperty("/nroDocPago");
		// 	var valida_flag				="";
		// 	if (hoyp < 10) {
		// 		var hoyn = "0" + hoy.getDate().toString();
		// 	} else {
		// 		var hoyn = hoy.getDate().toString();
		// 	}

		// 	if (mes < 10) {
		// 		mes = "0" + mes.toString();
		// 	}

		// 	fecha = hoy.getFullYear().toString() + mes.toString() + hoyn.toString();

		// 	var switchComp = false;
		// 	var numeroComp = "";
		// 	var verifCompRec = false;

		// 	dataComprobante.every(items => {
		// 		if (items.EST_COMP === "OBSERVADO") {
		// 			switchComp = true;
		// 			numeroComp = items.COMPROBANTE;
		// 			return false;
		// 		}

		// 		if (items.EST_COMP === "EN REVISIÓN") {
		// 			verifCompRec = true;
		// 		}

		// 		return true;
		// 	});

		// 	if (switchComp) {
		// 		MessageBox.error("El comprobante " + numeroComp + " tiene el estado " + '"OBSERVADO"' +
		// 			" no se puede enviar comprobantes con ese estado");
		// 			sap.ui.core.BusyIndicator.hide();
		// 		return;
		// 	}
		
		// 	if (verifCompRec) {
		// 		MessageBox.information("Se enviarán todos los comprobantes.\n ¿Desea Continuar?.", {
		// 			actions: ["Aceptar", "Cancelar"],
		// 			onClose: function (sAction) {
		// 				if (sAction == "Aceptar") {

		// 						dataComprobante.forEach(function (items, i) {
									
		// 						 if(items.NIVEL_AP !== "3"){
								 		
		// 							let CopyComprobantes= JSON.parse(JSON.stringify(dataComprobante));
		// 							CopyComprobantes.sort(function(a,b){
		// 							let obj2= b.ID_DOC_SRV === undefined ? "" : b.ID_DOC_SRV *1 ;
		// 							let obj1= a.ID_DOC_SRV === undefined ? "" : a.ID_DOC_SRV *1 ;
		// 							return  obj2 - obj1;
		// 						}); 
		// 							let idDocMax = CopyComprobantes[0].ID_DOC_SRV === undefined ? "": CopyComprobantes[0].ID_DOC_SRV;
		// 							if(items.ID_DOC_SRV === undefined || items.ID_DOC_SRV === "" ){
		// 						items.ID_DOC_SRV = idDocMax === ""  ?  1 : (idDocMax*1) +1 ;
		// 						}
		// 							var validarcompro=false;
		// 							items.desglose.forEach(function (items2) {//01/08/2022

		// 								if (items.EST_COMP === "EN REVISIÓN") {//01/08/2022
		// 									estado_sol = "PA";
		// 									estado_comp = "CPA";
		// 									nivel_apro = "1";
		// 									valida_flag ="X";
		// 									validacion_estado = true;
		// 								}else if(items.EST_COMP === "COMP. APROBADO"){
		// 										estado_comp = "CA";
		// 										nivel_apro = items.NIVEL_AP;
		// 										valida_flag ="";
		// 										//validarcompro =true;
										
		// 								}else if(items.EST_COMP === "COMPENSADO"){
		// 										estado_comp = "COM";
		// 										nivel_apro = items.NIVEL_AP;
		// 										valida_flag ="";
		// 										//validarcompro =true;
		// 								}else if(items.EST_COMP === "CONTABILIZADO"){
		// 										estado_comp = "C";
		// 										nivel_apro = items.NIVEL_AP;
		// 										valida_flag ="";
		// 										//validarcompro =true;
		// 								}else {
		// 									estado_sol = "PA";
		// 									estado_comp = "CPA";
		// 									nivel_apro = "1";
		// 									valida_flag ="";
		// 								}

		// 								if (items.COD_COMP === undefined || items.COD_COMP.length > 7) {
		// 									codigoDComp = items.COD_TIPO_COMP;
		// 								} else {
		// 									codigoDComp = items.COD_COMP;
		// 								}

		// 								if(items.COD_TIPO_COMP === "KX"){//24/07/2022
		// 							  	  TipoNif ="0";
		// 								}else 
		// 								if (items.RUC.length === 8) {
		// 									TipoNif = "1";
		// 								} else if (items.RUC.length === 11) {
		// 									TipoNif = "6";
		// 								}
									
		// 								var correo_electronico ="";
										
		// 								if(items.EMAIL_AD_USOL !== "" && items.EMAIL_AD_USOL !== undefined){//04/07/2022
		// 									correo_electronico = items.EMAIL_AD_USOL;
		// 								}else{
		// 									correo_electronico = correouser;
		// 								}

		// 								var FECHA_COMP = items.FECHA_COMP.replaceAll("/", "");
		// 								var formato = FECHA_COMP.substring(8, 4) + FECHA_COMP.substring(4, 2) + FECHA_COMP.substring(2, 0);
		// 								if(items2.imputacion.length >0){
		// 								items2.imputacion.forEach(function (items_09) {
		// 									var desglose = {
		// 										"COMPROBANTE": items.COMPROBANTE,
		// 										"POSIC": items2.POSIC.toString(), //desglose
		// 										"TIPO_COMP": codigoDComp,
		// 										"FECHA_COMP": formato,
		// 										"RUC": items.RUC,
		// 										"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 										"WAERS": items.WAERS,
		// 										"IND_IMP": items2.IND_IMP,
		// 										"TIPO_GASTO": "",
		// 										"KOSTL": items_09.selectKeyagre,
		// 										"BASE_IMP": items2.BASE_IMP,
		// 										"IGV": items2.IGV,
		// 										"INAFECTO": items2.INAFECTO,
		// 										"TOTAL": items2.TOTAL,
		// 										"EST_COMP": estado_comp, //comprobante , dejarlo asi
		// 										"EST_SOLI": estado_sol, //solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 										"ADJUNTO": "",
		// 										"GLOSA": items.GLOSA,
		// 										"NROD0": items.NROD0,
		// 										"DOC_PAGO": "",
		// 										"COD_SAP": items.COD_SAP,
		// 										"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 										"NIVEL_AP": nivel_apro, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 										"COD_CONT": items2.COD_CONT,
		// 										"FECHA_APR": "", //VACIO 
		// 										"IMP_RENDIDO": ImporteRend,
		// 										"COD_REPO": "",
		// 										"COD_REEM": "",
		// 										"ORDEN_INT": items.ORDEN_INT,
		// 										"VIAJES": items.VIAJES,
		// 										"TIPO_NIF": TipoNif,
		// 										"CUENTA_BANC": items2.CUENTA_BANC,
		// 										"FECHA_ENV": fecha,//poner la fecha 04/06/2022
		// 										"REF_FACTURA": items.REF_FACTURA,
		// 										"ID_CECO": "",
		// 										"TIPO_REND": "ER",
		// 										"LIBERADOR1": "",
		// 										"LIBERADOR2": "",
		// 										"EDIT_COMP": "",
		// 										"EDIT_RUC": "",
		// 										"FECHA_APRO1": "",
    	// 										"FECHA_APRO2": "",
		// 										"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		// 										"COD_CONT2":items2.COD_CONT2,
		// 										"EMAIL_AD_USOL":correo_electronico,
		// 										"FECHA_ABON":FECHA_ABON,
		// 										"IND_EST_REV":valida_flag,
		// 										"COD_SAP_LIB2"	:items.COD_SAP_LIB2,
		// 										"DOC_COMP"	:items.DOC_COMP,
		// 	    			    				"DOC_CONT"	:items.DOC_CONT,
		// 	    			    				"DOC_PAGO_SOLICITUD" : nroDocPago,
		// 	    			    				"FECHA_CONT":items.FECHA_CONT,
		// 										"FECHA_COMPENSA":items.FECHA_COMPENSA,
		// 									}

		// 									arrayaprobacion.push(desglose);

		// 								});
		// 								}else{
		// 									var desglose1 = {
		// 										"COMPROBANTE": items.COMPROBANTE,
		// 										"POSIC": items2.POSIC.toString(), //desglose
		// 										"TIPO_COMP": codigoDComp,
		// 										"FECHA_COMP": formato,
		// 										"RUC": items.RUC,
		// 										"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 										"WAERS": items.WAERS,
		// 										"IND_IMP": items2.IND_IMP,
		// 										"TIPO_GASTO": "",
		// 										"KOSTL": "",
		// 										"BASE_IMP": items2.BASE_IMP,
		// 										"IGV": items2.IGV,
		// 										"INAFECTO": items2.INAFECTO,
		// 										"TOTAL": items2.TOTAL,
		// 										"EST_COMP": estado_comp, //comprobante , dejarlo asi
		// 										"EST_SOLI": estado_sol, //solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 										"ADJUNTO": "",
		// 										"GLOSA": items.GLOSA,
		// 										"NROD0": items.NROD0,
		// 										"DOC_PAGO": "",
		// 										"COD_SAP": items.COD_SAP,
		// 										"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 										"NIVEL_AP": nivel_apro, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 										"COD_CONT": items2.COD_CONT,
		// 										"FECHA_APR": "", //VACIO 
		// 										"IMP_RENDIDO": ImporteRend,
		// 										"COD_REPO": "",
		// 										"COD_REEM": "",
		// 										"ORDEN_INT": items.ORDEN_INT,
		// 										"VIAJES": items.VIAJES,
		// 										"TIPO_NIF": TipoNif,
		// 										"CUENTA_BANC": items2.CUENTA_BANC,
		// 										"FECHA_ENV": fecha,//cambio de 04/06/2022
		// 										"REF_FACTURA": items.REF_FACTURA,
		// 										"ID_CECO": "",
		// 										"TIPO_REND": "ER",
		// 										"LIBERADOR1": "",
		// 										"LIBERADOR2": "",
		// 										"EDIT_COMP": "",
		// 										"EDIT_RUC": "",
		// 										"FECHA_APRO1": "",
    	// 										"FECHA_APRO2": "",
		// 										"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		// 										"COD_CONT2":items2.COD_CONT2,
		// 										"EMAIL_AD_USOL":correo_electronico,
		// 										"FECHA_ABON":FECHA_ABON,
		// 										"IND_EST_REV":valida_flag,
		// 										"COD_SAP_LIB2"	:items.COD_SAP_LIB2,
		// 										"DOC_COMP"	:items.DOC_COMP,
		// 	    			    				"DOC_CONT"	:items.DOC_CONT,
		// 	    			    				"DOC_PAGO_SOLICITUD" : nroDocPago,
		// 	    			    				"FECHA_CONT":items.FECHA_CONT,
		// 										"FECHA_COMPENSA":items.FECHA_COMPENSA,
		// 									}

		// 									arrayaprobacion.push(desglose1);	
											
		// 								}
		// 							});
									
		// 						 }	
									
		// 						});
								
		// 						if (validacion_estado === true) { //01/08/2022
		// 							arrayaprobacion.forEach(function (items_06) {
		// 								if(items_06.EST_COMP !== "CA" && items_06.EST_COMP !== "C" && items_06.EST_COMP !== "COM"){///cambios de 04/06/2022
		// 								items_06.NIVEL_AP = "1";
		// 								items_06.EST_SOLI = "PA";
		// 								}else{
		// 								items_06.EST_SOLI = "PA";	
		// 								}
		// 							});
		// 						} else {
		// 							arrayaprobacion.forEach(function (items_06) {
		// 								if(items_06.EST_COMP !== "CA" && items_06.EST_COMP !== "C" && items_06.EST_COMP !== "COM"){
		// 								items_06.NIVEL_AP = "1";
		// 								items_06.EST_SOLI = "PA";
		// 								}else{
		// 								items_06.EST_SOLI = "PA";	
		// 								}
		// 							});
		// 						}
								
		// 						// if(validarcompro === true){
		// 						// arrayaprobacion.forEach(function (items_06) {
		// 						// 		items_06.NIVEL_AP = "0";
		// 						// });	
		// 						// }

		// 						var datos = {
		// 							"MENSAJE": "X",
		// 							"ZET_UPD_COMPROSet": arrayaprobacion
		// 						}

		// 						$.ajax({
		// 							url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
		// 							type: "GET",
		// 							headers: {
		// 								"x-CSRF-Token": "Fetch"
		// 							}
		// 						}).always(function (data, status, response) {
		// 							var token = response.getResponseHeader("x-csrf-token");
		// 							$.ajax({
		// 								url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_UPD_COMPRO_CABSet",
		// 								method: "POST",
		// 								headers: {
		// 									"x-CSRF-Token": token
		// 								},
		// 								async: false,
		// 								contentType: "application/json",
		// 								dataType: "json",
		// 								data: JSON.stringify(datos),
		// 							}).always(function (data, status, response) {
		// 								ModelProyect.refresh(true);
										
		// 								MessageBox.information("La solicitud " + nro_solic + " fue enviado .", {
		// 									actions: ["Aceptar"],
		// 									onClose: function (sAction) {
		// 										if (sAction === "Aceptar") {

		// 											that.oRouter.navTo("RendicionConER");
		// 										}
		// 									}
		// 								});
		// 							});
		// 						});
		// 				}
		// 			}
		// 		});
		// 		sap.ui.core.BusyIndicator.hide();			
		// 	} else {
		// 		MessageBox.information("Se enviarán todos los comprobantes.\n ¿Desea Continuar?.", {
		// 			actions: ["Aceptar", "Cancelar"],
		// 			onClose: function (sAction) {
		// 				if (sAction == "Aceptar") {
		// 					dataComprobante.forEach(function (items, i) {
								
		// 					  if(items.NIVEL_AP !== "3"){
								
		// 						let CopyComprobantes= JSON.parse(JSON.stringify(dataComprobante));
		// 						CopyComprobantes.sort(function(a,b){
		// 							let obj2= b.ID_DOC_SRV === undefined ? "" : b.ID_DOC_SRV *1 ;
		// 							let obj1= a.ID_DOC_SRV === undefined ? "" : a.ID_DOC_SRV *1 ;
		// 							return  obj2 - obj1;
		// 						}); 
		// 						let idDocMax = CopyComprobantes[0].ID_DOC_SRV === undefined ? "": CopyComprobantes[0].ID_DOC_SRV;
		// 						if(items.ID_DOC_SRV === undefined || items.ID_DOC_SRV === "" ){
		// 						items.ID_DOC_SRV = idDocMax === ""  ?  1 : (idDocMax*1) +1 ;
		// 						}
								
		// 						var validarcompro=false;
		// 						items.desglose.forEach(function (items2) {//01/08/2022

		// 							if (items.EST_COMP === "EN REVISIÓN") {//01/08/2022
		// 								estado_sol = "PA";
		// 								estado_comp = "CPA";
		// 								nivel_apro = "1";
		// 								valida_flag ="X";
		// 								validacion_estado = true;
		// 							}else if(items.EST_COMP === "COMP. APROBADO"){
		// 								estado_comp = "CA";
		// 								nivel_apro = items.NIVEL_AP;
		// 								valida_flag ="";
		// 								// validarcompro =true;
		// 							}else if(items.EST_COMP === "COMPENSADO"){
		// 								estado_comp = "COM";
		// 								nivel_apro = items.NIVEL_AP;
		// 								valida_flag ="";
		// 								//validarcompro =true;
		// 							}else if(items.EST_COMP === "CONTABILIZADO"){
		// 								estado_comp = "C";
		// 								nivel_apro = items.NIVEL_AP;
		// 								valida_flag ="";
		// 								//validarcompro =true;
		// 							}
									
		// 							else {
		// 								estado_sol = "PA";
		// 								estado_comp = "CPA";
		// 								nivel_apro = "1";
		// 								valida_flag ="";
		// 							}

		// 							if (items.COD_COMP === undefined || items.COD_COMP.length > 7) {
		// 								codigoDComp = items.COD_TIPO_COMP;
		// 							} else {
		// 								codigoDComp = items.COD_COMP;
		// 							}
									
		// 							if(items.COD_TIPO_COMP === "KX"){//24/07/2022
		// 							  TipoNif ="0";
		// 							}
		// 							else if (items.RUC.length === 8) {
		// 								TipoNif = "1";
		// 							} else if (items.RUC.length === 11) {
		// 								TipoNif = "6";
		// 							}

								
		// 								var correo_electronico ="";
										
		// 							if(items.EMAIL_AD_USOL !== "" && items.EMAIL_AD_USOL !== undefined){//04/07/2022
		// 								correo_electronico = items.EMAIL_AD_USOL;
		// 							}else{
		// 								correo_electronico = correouser;
		// 							}	
									
		// 							var FECHA_COMP = items.FECHA_COMP.replaceAll("/", "");
		// 							var formato = FECHA_COMP.substring(8, 4) + FECHA_COMP.substring(4, 2) + FECHA_COMP.substring(2, 0);
		// 							if(items2.imputacion.length >0){
		// 							items2.imputacion.forEach(function (items_09) {
		// 								var desglose = {
		// 									"COMPROBANTE": items.COMPROBANTE,
		// 									"POSIC": items2.POSIC.toString(), //desglose
		// 									"TIPO_COMP": codigoDComp,
		// 									"FECHA_COMP": formato,
		// 									"RUC": items.RUC,
		// 									"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 									"WAERS": items.WAERS,
		// 									"IND_IMP": items2.IND_IMP,
		// 									"TIPO_GASTO": "",
		// 									"KOSTL": items_09.selectKeyagre,
		// 									"BASE_IMP": items2.BASE_IMP,
		// 									"IGV": items2.IGV,
		// 									"INAFECTO": items2.INAFECTO,
		// 									"TOTAL": items2.TOTAL,
		// 									"EST_COMP": estado_comp, //comprobante , dejarlo asi
		// 									"EST_SOLI": estado_sol, //solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 									"ADJUNTO": "",
		// 									"GLOSA": items.GLOSA,
		// 									"NROD0": items.NROD0,
		// 									"DOC_PAGO": "",
		// 									"COD_SAP": items.COD_SAP,
		// 									"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 									"NIVEL_AP": nivel_apro, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 									"COD_CONT": items2.COD_CONT,
		// 									"FECHA_APR": "", //VACIO 
		// 									"IMP_RENDIDO": ImporteRend,
		// 									"COD_REPO": "",
		// 									"COD_REEM": "",
		// 									"ORDEN_INT": items2.ORDEN_INT,
		// 									"VIAJES": items2.VIAJES,
		// 									"TIPO_NIF": TipoNif,
		// 									"CUENTA_BANC": items2.CUENTA_BANC,
		// 									"FECHA_ENV": fecha,/// cambio 04/06/2022
		// 									"REF_FACTURA": items.REF_FACTURA,
		// 									"ID_CECO": "",
		// 									"TIPO_REND": "ER",
		// 									"LIBERADOR1": "",
		// 									"LIBERADOR2": "",
		// 									"EDIT_COMP": "",
		// 									"EDIT_RUC": "",
		// 									"FECHA_APRO1": "",
    	// 									"FECHA_APRO2": "",
		// 									"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		// 									"COD_CONT2":items2.COD_CONT2,
		// 									"EMAIL_AD_USOL":correo_electronico,
		// 									"FECHA_ABON":FECHA_ABON,
		// 									"IND_EST_REV":valida_flag,
		// 									"COD_SAP_LIB2"	:items.COD_SAP_LIB2,
		// 									"DOC_COMP"	:items.DOC_COMP,
		// 	    			    			"DOC_CONT"	:items.DOC_CONT,
		// 	    			    			"DOC_PAGO_SOLICITUD" : nroDocPago,
		// 	    			    			"FECHA_CONT":items.FECHA_CONT,
		// 									"FECHA_COMPENSA":items.FECHA_COMPENSA,
		// 								}

		// 								arrayaprobacion.push(desglose);
		// 							});
		// 							}else{
		// 								var desglose = {
		// 									"COMPROBANTE": items.COMPROBANTE,
		// 									"POSIC": items2.POSIC.toString(), //desglose
		// 									"TIPO_COMP": codigoDComp,
		// 									"FECHA_COMP": formato,
		// 									"RUC": items.RUC,
		// 									"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 									"WAERS": items.WAERS,
		// 									"IND_IMP": items2.IND_IMP,
		// 									"TIPO_GASTO": "",
		// 									"KOSTL": "",
		// 									"BASE_IMP": items2.BASE_IMP,
		// 									"IGV": items2.IGV,
		// 									"INAFECTO": items2.INAFECTO,
		// 									"TOTAL": items2.TOTAL,
		// 									"EST_COMP": estado_comp, //comprobante , dejarlo asi
		// 									"EST_SOLI": estado_sol, //solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 									"ADJUNTO": "",
		// 									"GLOSA": items.GLOSA,
		// 									"NROD0": items.NROD0,
		// 									"DOC_PAGO": "",
		// 									"COD_SAP": items.COD_SAP,
		// 									"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 									"NIVEL_AP": nivel_apro, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 									"COD_CONT": items2.COD_CONT,
		// 									"FECHA_APR": "", //VACIO 
		// 									"IMP_RENDIDO": ImporteRend,
		// 									"COD_REPO": "",
		// 									"COD_REEM": "",
		// 									"ORDEN_INT": items2.ORDEN_INT,
		// 									"VIAJES": items2.VIAJES,
		// 									"TIPO_NIF": TipoNif,
		// 									"CUENTA_BANC": items2.CUENTA_BANC,
		// 									"FECHA_ENV": fecha,// cambio 04/06/2022
		// 									"REF_FACTURA": items.REF_FACTURA,
		// 									"ID_CECO": "",
		// 									"TIPO_REND": "ER",
		// 									"LIBERADOR1": "",
		// 									"LIBERADOR2": "",
		// 									"EDIT_COMP": "",
		// 									"EDIT_RUC": "",
		// 									"FECHA_APRO1": "",
    	// 									"FECHA_APRO2": "",
		// 									"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		// 									"COD_CONT2":items2.COD_CONT2,
		// 									"EMAIL_AD_USOL":correo_electronico,
		// 									"FECHA_ABON":FECHA_ABON,
		// 									"IND_EST_REV":valida_flag,
		// 									"COD_SAP_LIB2"	:items.COD_SAP_LIB2,
		// 									"DOC_COMP"	:items.DOC_COMP,
		// 	    			    			"DOC_CONT"	:items.DOC_CONT,
		// 	    			    			"DOC_PAGO_SOLICITUD" : nroDocPago,
		// 	    			    			"FECHA_CONT":items.FECHA_CONT,
		// 									"FECHA_COMPENSA":items.FECHA_COMPENSA,
		// 								}

		// 								arrayaprobacion.push(desglose);	
										
		// 							}
		// 						});
								
		// 					  }
		// 					});

		// 					if (validacion_estado === true) { //01/08/2022
		// 						arrayaprobacion.forEach(function (items_06) {
		// 							if(items_06.EST_COMP !== "CA" && items_06.EST_COMP !== "C" && items_06.EST_COMP !== "COM"){
		// 							items_06.NIVEL_AP = "1";
		// 							items_06.EST_SOLI = "PA";
		// 							}else{
		// 							items_06.EST_SOLI = "PA";	
		// 							}
		// 						});
		// 					}else {
		// 						arrayaprobacion.forEach(function (items_06) {
		// 							if(items_06.EST_COMP !== "CA" && items_06.EST_COMP !== "C" && items_06.EST_COMP !== "COM"){
		// 							items_06.NIVEL_AP = "1";
		// 							items_06.EST_SOLI = "PA";
		// 							}else{
		// 							items_06.EST_SOLI = "PA";	
		// 							}
		// 						});
		// 					}

		// 					var datos = {
		// 						"MENSAJE": "X",
		// 						"ZET_UPD_COMPROSet": arrayaprobacion
		// 					}

		// 					$.ajax({
		// 						url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
		// 						type: "GET",
		// 						headers: {
		// 							"x-CSRF-Token": "Fetch"
		// 						}
		// 					}).always(function (data, status, response) {
		// 						var token = response.getResponseHeader("x-csrf-token");
		// 						$.ajax({
		// 							url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_UPD_COMPRO_CABSet",
		// 							method: "POST",
		// 							headers: {
		// 								"x-CSRF-Token": token
		// 							},
		// 							async: false,
		// 							contentType: "application/json",
		// 							dataType: "json",
		// 							data: JSON.stringify(datos),
		// 						}).always(async function (data, status, response) {
		// 							ModelProyect.refresh(true);
									
		// 							var COD_SAP = ModelProyect.getProperty("/COD_SAP");

		// 							// let EliminarComp = [];
		// 							// dataComprobante.map(function (obj) {
		// 							// 	obj.DeleteArchivo.map(function (obj2) {
		// 							// 		var form = new FormData();
		// 							// 		form.append("cmisaction", "delete");
		// 							// 		EliminarComp.push({
		// 							// 			URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/" + obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] +"." + obj.ID_DOC_SRV.toString()+"/" + obj2.Name,
		// 							// 			data: form
		// 							// 		});
		// 							// 	});
		// 							// 	obj.DeleteArchivo = [];

		// 							// });

		// 							// await that.EliminacionFolder(EliminarComp);

		// 							// // let  Comprobantes	= dataComprobante.map((obj,index)=> obj.NROD0 + "." +obj.COMPROBANTE)
		// 							// // let	 Folders		= await that.BuscarFolder(Comprobantes);

		// 							// // let ComprobantesNoCreados  = Folders.filter(obj=> obj.exception ).map(function(obj){

		// 							// let ComprobantesNoCreados = dataComprobante.map(function (obj) {

		// 							// 	var form = new FormData();
		// 							// 	form.append("cmisaction", "createFolder");
		// 							// 	form.append("propertyId[0]", "cmis:objectTypeId");
		// 							// 	form.append("propertyValue[0]", "cmis:folder");
		// 							// 	form.append("propertyId[1]", "cmis:name");
		// 							// 	form.append("propertyValue[1]",  obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] +"." + obj.ID_DOC_SRV.toString());
		// 							// 	// obj.message.replace("/QAS/AdjuntosER/","")
		// 							// 	return {
		// 							// 		URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER",
		// 							// 		data: form
		// 							// 	};
		// 							// });

		// 							// await that.CreacionDocumento_Folder(ComprobantesNoCreados);
		// 							// // let a = dataComprobante.filter(obj=> Folders.findIndex(obj1=> obj.NROD0 + "." +obj.COMPROBANTE === obj1.message.replace("/QAS/AdjuntosER/","") ) !== -1 );

		// 							// let ArchivosAdjuntos = [];
		// 							// dataComprobante.map(function (obj) {
		// 							// 	obj.archivoAd.map(function (obj2) {
		// 							// 		if (obj2.File !== undefined) {
		// 							// 			var form = new FormData();
		// 							// 			form.append("cmisaction", "createDocument");
		// 							// 			form.append("propertyId[0]", "cmis:objectTypeId");
		// 							// 			form.append("propertyValue[0]", "cmis:document");
		// 							// 			form.append("propertyId[1]", "cmis:name");
		// 							// 			form.append("propertyValue[1]", obj2.Name);
		// 							// 			form.append("datafile", obj2.File);
		// 							// 		}
		// 							// 		ArchivosAdjuntos.push({
		// 							// 			URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/" + obj.COD_SAP+"."+ obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] +"." + obj.ID_DOC_SRV.toString(),
		// 							// 			data: form
		// 							// 		});
		// 							// 		obj2.Service = true;
		// 							// 		obj2.Base64 = "";
		// 							// 	});
		// 							// });
		// 							// await that.CreacionDocumento_Folder(ArchivosAdjuntos);
									
		// 							MessageBox.information("La solicitud " + nro_solic + " se ha enviado a aprobar.", {
		// 								actions: ["Aceptar"],
		// 								onClose: function (sAction) {
		// 									if (sAction === "Aceptar") {
		// 										that.oRouter.navTo("RendicionConER");
												
		// 									}
		// 								}
		// 							});
		// 						});
		// 					});
		// 				}
							
		// 				//sap.ui.core.BusyIndicator.hide();//12/07/2022	
						
		// 			}
		// 		});
		// 		sap.ui.core.BusyIndicator.hide();
		// 	}

		// },
		

		onSalir_PantGrabar: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");

			this.tabla_observacion.close();
			ModelProyect.setProperty("/datosTablaG", []);
			arrayTabla = [];
			sap.ui.core.BusyIndicator.hide();
		},
		tabla_consultaG: function (arrayTabla) {
			var that			= this;
			var oView			= this.getView();
			var ModelProyect	= oView.getModel("Proyect");

			if (!this.tabla_observacion) {
				this.tabla_observacion = sap.ui.xmlfragment("rendicionER.fragments.tablitaObservacionG", this);
				oView.addDependent(this.tabla_observacion);
			}

			ModelProyect.setProperty("/datosTablaG", arrayTabla);
			this.tabla_observacion.open();
		},
		
		_groupBy: function (array, param) {
			return array.reduce(function (groups, item) {
				const val = item[param]
				groups[val] = groups[val] || []
				groups[val].push(item)
				return groups
			}, {});
		},
		
		// onPressEnviarLiquidacion: async function () {
		// 	sap.ui.core.BusyIndicator.show(0);
		// 	var that					= this;
		// 	var oView					= this.getView();
		// 	var ModelProyect			= oView.getModel("Proyect");
		// 	var dataComprobante 		= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var hoy 					= new Date();
		// 	var fecha					= "";
		// 	var mes 					= hoy.getMonth() + 1;
		// 	var hoyp					= hoy.getDate().toString();
		// 	var nro_solic				= ModelProyect.getProperty("/solicitud");
		// 	var ImporteRend 			= ModelProyect.getProperty("/ImporteRend");
		// 	var moneda					= ModelProyect.getProperty("/monedas");
		// 	var Glosa					= ModelProyect.getProperty("/Glosa");
		// 	var contadores01			= 0;
		// 	var selectkeyTab			= "";
		// 	var nombreTab				= "";
		// 	var estado_Comp 			= "";
		// 	var importe 				= ModelProyect.getProperty("/importe");
		// 	var estado_sol				= "";
		// 	var nivelApro				= "1";
		// 	var contadores_solic		= 0;
		// 	var validar_solic			= false;
		// 	var arrayaprobacion 		= [];
		// 	var datos_Eliminar			=ModelProyect.getProperty("/datos_Eliminar");
		// 	var validacion_glose		 =false;
		// 	var RUC_BENE				=ModelProyect.getProperty("/RUC_BENE");
		// 	var nombrevalidacion		="";
		// 	var codigo_clase			="";	
		// 	var monstrar_estadoCp		="";
		// 	var monstrar_estadoRuc		="";
		// 	var monstrar_condDomiRuc    ="";
		// 	var arrayestructura			=[];
		// 	var data4					="";
		// 	var arrayTabla				=[];
		// 	var validacion_glose		=false;
		// 	var validarCeco				= false;
		// 	var TipoNif					= "";
		// 	var desglose_Validar		= "";
		// 	var ceco_validar			="";
		// 	var adjunto_validar			="";
		// 	var cont_desglose			=0;
		// 	var cont_ceco				=0;
		// 	var cont_adjunto			=0;
		// 	var validarArchivo			= false;
		// 	var cont_mov				=0;
		// 	var mov_validar				="";
		// 	var errores					="";
		// 	var array_estado			=[];
		// 	var nivel_aprob				="";
		// 	var estado_igual			=false;
		// 	var contador_validacion		=0;
		// 	var correouser				=ModelProyect.getProperty("/correouser");
		// 	var FECHA_ABON				= ModelProyect.getProperty("/FECHA_ABON");
		// 	var valida_grabar			= false;
		// 	var nroDocPago				= ModelProyect.getProperty("/nroDocPago");
			
		// 	if (hoyp < 10) {
		// 		var hoyn = "0" + hoy.getDate().toString();
		// 	} else {
		// 		var hoyn = hoy.getDate().toString();
		// 	}

		// 	if (mes < 10) {
		// 		mes = "0" + mes.toString();
		// 	}

		// 	fecha						= hoy.getFullYear().toString() + mes.toString() + hoyn.toString();

		// 	// var selectedDetalle = ModelProyect.getProperty("/SelectedDetalle");
		// 	// var ReporteHistoricoTable = ModelProyect.getProperty("/ReporteHistoricoTable");
		// 	if (dataComprobante === undefined || dataComprobante.length < 1) {
		// 		MessageBox.warning("Debe crear almenos 1 comprobante", {
		// 			actions: ["OK"],
		// 			onClose: function (sAction) {
		// 				if (sAction == "OK") {	
					
		// 			}	
		// 			sap.ui.core.BusyIndicator.hide();
		// 			}
						
		// 		});
				
		// 		return;
		// 	} else {
			
		// 	var aprobado					=false;
		// 	var aprobado3					=false;
		// 	var contabilizado				=false;
		// 	var compenzado					=false;
		// 	var ValidacionAprobador 		= false;
		// 	var ValidacionContabilizados    = false;
		// 	var ValidacionNivel3			=true;
			
			
		// 	for (let items of dataComprobante) {
			
		// 	if(!items.VALIDA_GRABADO){ //27/07/2022
		// 		contador_validacion++;	
		// 	}
			
		// 	if(items.NIVEL_AP !== "3"){
				
		// 		ValidacionNivel3 = false;	
					
		// 	}else{
					
		// 		if(items.COD_EST_COMP === "CA"){
		// 			ValidacionAprobador = true;
					
		// 		}else if(items.COD_EST_COMP === "C"){
		// 			ValidacionContabilizados = true;
		// 		}
					
		// 	}
		
		// 		if(items.COMPROBANTE1 !== "" && items.COMPROBANTE1 !== undefined){
		// 		if(items.COMPROBANTE_ANTIGUO !== items.COMPROBANTE){	
		// 		contador_validacion++;
				
		// 		}else if(items.COMPROBANTE1 !== items.COMPROBANTE){
		// 		contador_validacion++;	
		// 		}
		// 		}
		// 		// ojo ver 01/07/2022
		// 		if(items.FECHA_PRUEBA !== "" && items.FECHA_PRUEBA !== undefined){
		// 		if(items.FECHA_ANTIGUA !== items.FECHA_COMP){	
		// 		contador_validacion++;
		// 		}else if (items.FECHA_PRUEBA !== items.FECHA_COMP){
		// 		contador_validacion++;	
		// 		}
		// 		}
				
				
		// 		if(items.TIPO_PRUEBA !== "" && items.TIPO_PRUEBA !== undefined){
		// 		if(items.COPIA_COD_TIPO !== items.COD_TIPO_COMP){	
		// 		contador_validacion++;
			
		// 		}
		// 		}
		// 		if(items.RUC_COPIA1 !== "" && items.RUC_COPIA1 !== undefined){
		// 		if(items.RUC_COPIA1 !==  items.RUC){	
		// 		contador_validacion++;
				
		// 		}
		// 		}
				
		// 		if(items.COPIA_RAZON !== "" && items.COPIA_RAZON !== undefined){//24/07/2022
		// 		if(items.COPIA_RAZON !==  items.RAZON_SOCIAL){	
		// 		contador_validacion++;
		// 		//return;
		// 		}	
		// 		}
				
		// 		if(items.COPIA_GLOSA !== "" && items.COPIA_GLOSA !== undefined){//cambio 09/06/2022
		// 		if(items.COPIA_GLOSA !== items.GLOSA){	
		// 		contador_validacion++;
				
		// 		}
		// 		}
		// 		if(items.COPIA_REFERENCIA !== ""  &&  items.COPIA_REFERENCIA !== undefined){
		// 		if(items.COPIA_REFERENCIA !== items.REF_FACTURA){
		// 		contador_validacion++;	
		// 		}	
		// 		}
			
			    				
		// 		if(items.COPIA_ORDEN !== "" && items.COPIA_ORDEN !== undefined){
		// 		if(items.COPIA_ORDEN !==  items.ORDEN_INT){
		// 		contador_validacion++;	
		// 		}
		// 		}
		// 		if(items.COPIA_VIAJES !== ""  && items.COPIA_VIAJES !== undefined){
		// 		if(items.VIAJES !==  items.COPIA_VIAJES){
		// 		contador_validacion++;	
		// 		}	
		// 		}
				
			
		// 		items.desglose.forEach(function(rx){ //cambio 01072022
				
		// 		if(rx.NUEVO_GASTOS !== "" && rx.NUEVO_GASTOS !== undefined){
		// 		if(rx.ANTIGUO_GASTO !== rx.COD_CONT){	
		// 			contador_validacion++;
				
		// 		}
		// 		}
				
		// 		if(rx.ANTIGUO_CUENTA !== ""){//04/07/2022
		// 		if(rx.ANTIGUO_CUENTA !==rx.CUENTA_BANC){
		// 		contador_validacion++;		
		// 		}	
		// 		}

				
		// 		if(rx.NUEVO_IND !== "" && rx.NUEVO_IND !== undefined ){
		// 		if(rx.ANTIGUO_IND !== rx.IND_IMP){	
		// 		contador_validacion++;
				
		// 		}
		// 		}
				
		// 		if(rx.ANTIGUA_BASE !== ""){
		// 		if(rx.ANTIGUA_BASE	!== rx.BASE_IMP){
				
		// 		contador_validacion++;
			 	
		// 		}
		// 		}
				
		// 		if(rx.ANTIGUO_IGV !== ""){//04/07/2022
		// 		if(rx.ANTIGUO_IGV	!== rx.IGV){
		// 			contador_validacion++;	
			 	
		// 		}	
		// 		}
			
		// 		if(rx.ANTIGUO_INAFECTO  !== ""){
		// 		if(rx.ANTIGUO_INAFECTO	!== rx.INAFECTO){
				
		// 	 	contador_validacion++;
			 	
		// 		}
		// 		}
				
		// 	if(rx.imputacion !== undefined){
		// 	rx.imputacion.forEach(function(ys){
				
		// 	if(ys.COPIA_KOSTL !== "" &&  ys.COPIA_KOSTL !== undefined ){		
		// 	if(ys.selectKeyagre !== ys.COPIA_KOSTL){//
		// 		contador_validacion++;
			 
		// 	}
		// 	}
			
			
		// 	if(ys.COPIA_PORCE !== "" &&  ys.COPIA_PORCE !== undefined){
		// 	if(ys.COPIA_PORCE !== ys.porcentajeII ){
		// 		contador_validacion++;
			 		
		// 	}
		// 	}
			
		// 	if(ys.COPIA_TOTAL !== "" && ys.COPIA_TOTAL !== undefined){
		// 	if(ys.IMP !== ys.COPIA_TOTAL ){/// corregir aqui 
		// 		contador_validacion++;
			 	
		// 	}
		// 	}
				
		// 	});
		// 	}
		// 	if(rx.movilidad !== undefined){
		// 	rx.movilidad.forEach(function(gh){
		// 	if(gh.COPIA_MFECHA !== "" && gh.COPIA_MFECHA !== undefined){	
		// 	if(gh.COPIA_MFECHA !== gh.FECHA){
		// 		contador_validacion++;
			 		
		// 	}
		// 	}
			
		// 	if(gh.COPIA_IMPTOTAL !== ""  && gh.COPIA_IMPTOTAL !== undefined){
		// 	if(gh.COPIA_IMPTOTAL !== gh.impTotalMov){
		// 		contador_validacion++;
			 	
		// 	}	
				
		// 	}	
		// 	});
		// 	}
			
		// 	}); 
			
		
		// 		$.each(that._groupBy(dataComprobante,'COD_EST_COMP'), function (x, y) {//14/06/2022
		// 		if(x === "CA"){
		// 		if(y.length === dataComprobante.length)	{
		// 		estado_igual= true;	
		// 		}else{
		// 		aprobado = true;	
		// 		}
		// 		}else if(x === "C"){
		// 		if(y.length === dataComprobante.length)	{
		// 		estado_igual= true;	
		// 		}else{
		// 		contabilizado= true;	
		// 		}
		// 		}else if(x === "COM"){
		// 		if(y.length === dataComprobante.length)	{
		// 		estado_igual= true;	
		// 		}else{
		// 		compenzado= true;	
		// 		}
		// 		}	
					
		// 		});
				
		// 		if(items.COD_EST_COMP === "CR"){
		// 			array_estado.push(items);
		// 		}
				
			
			
		// 	}
			
		// 	}
			
		// 		if(contador_validacion > 0){//30062022
		// 		MessageBox.warning("Debe grabar los comprobante(s) antes de enviar .", {
		// 			actions: ["Aceptar"],
		// 			onClose: function (sAction) {
		// 				if (sAction == "Aceptar") {	
					
		// 			}	
		// 			sap.ui.core.BusyIndicator.hide();
		// 			}
						
		// 		});
				
		// 		return;	
		// 	}
			
			
		// 		if (parseFloat(ImporteRend) <= 0) {
		// 			MessageBox.warning("El importe total de las rendiciones debe ser mayor 0", {
		// 				actions: ["Aceptar"],
		// 				title: "Adventencia",
		// 				emphasizedAction: "",
		// 				onClose: function (sAction) {
		// 					if (sAction == "Aceptar") {	
					
		// 			}
		// 			sap.ui.core.BusyIndicator.hide();
		// 				}
					
		// 			});
		// 			return;
		// 		}
				
		// 		if(estado_igual === false){
		// 		if (parseFloat(ImporteRend) < parseFloat(importe)) {
		// 			MessageBox.warning("El importe rendido no puede ser menor al solicitado.", {
		// 				actions: ["Aceptar"],
		// 				title: "Adventencia",
		// 				emphasizedAction: "",
		// 				onClose: function (sAction) {
		// 				if (sAction == "Aceptar") {	
					
		// 			}
		// 				sap.ui.core.BusyIndicator.hide();	
		// 				}
						
		// 			});
		// 			return;
		// 		}
		// 		}
				
		// 		if(array_estado.length >0){
		// 			MessageBox.warning("No se puede  enviar comprobantes en estado rechazado.",{
		// 			actions: ["Aceptar"],
		// 			onClose:  function (sAction) {	
		// 			if (sAction == "Aceptar") {	
					
		// 			}
		// 				sap.ui.core.BusyIndicator.hide();
		// 			}
		// 			});
					
		// 			return;
		// 		}

		// 		MessageBox.information("Se enviará los comprobantes para aprobación.\n ¿Desea Continuar?.", {
		// 			actions: ["Aceptar", "Cancelar"],
		// 			onClose: async function (sAction) {
		// 				if (sAction == "Aceptar") {
							
		// 					sap.ui.core.BusyIndicator.show(0);
							
		// 					if(dataComprobante.length > 0){
		// 					let OnlyDolarComp = that.TransformDolarComps(dataComprobante);	
		// 					//scastillo	- Conversion Dolares	
		// 					dataComprobante.forEach(function (items, i) {
								
		// 						if(!ValidacionNivel3){	
								
		// 						let CopyComprobantes= JSON.parse(JSON.stringify(dataComprobante));
		// 						CopyComprobantes.sort(function(a,b){
		// 							let obj2= b.ID_DOC_SRV === undefined ? "" : b.ID_DOC_SRV *1 ;
		// 							let obj1= a.ID_DOC_SRV === undefined ? "" : a.ID_DOC_SRV *1 ;
		// 							return  obj2 - obj1;
		// 						}); 
		// 						let idDocMax = CopyComprobantes[0].ID_DOC_SRV === undefined ? "": CopyComprobantes[0].ID_DOC_SRV;
		// 						if(items.ID_DOC_SRV === undefined || items.ID_DOC_SRV === "" ){
		// 						items.ID_DOC_SRV = idDocMax === ""  ?  1 : (idDocMax*1) +1 ;
		// 						}	
								
		// 						let TotalReal = OnlyDolarComp.find(obj=> obj.COMPROBANTE === items.COMPROBANTE && obj.RUC === items.RUC);//21/07/2022
		// 						items.totales1 = TotalReal === undefined ? items.totales : TotalReal.totales;

		// 						validacion_glose =false;
		// 						if(items.desglose.length > 0){	

		// 						items.desglose.forEach(function (items2) {
		// 						validacion_glose = true;	

		// 						if(items.COD_EST_COMP !== "CA" &&  items.COD_EST_COMP !== "C" && items.COD_EST_COMP !== "COM"){
		// 							switch(items.COD_TIPO_COMP){
		// 							case "KH":
									
		// 								estado_Comp = "O";
		// 							    items.EST_COMP = "OBSERVADO";
		// 								items.iconComp = "sap-icon://vds-file";
		// 								items.stateComp = "Information";
		// 							break;
		// 							case "KR"://cambios de 05/06/2022
												
		// 							if (parseFloat(items.totales1) > 700) {
		// 								estado_Comp = "O";
		// 								items.EST_COMP = "OBSERVADO";
		// 								items.iconComp = "sap-icon://vds-file";
		// 								items.stateComp = "Information";
		// 								ModelProyect.refresh(true);
										
		// 							}else if (parseFloat(items.totales1) > 400) {
										
		// 								if (items2.COD_CONT === "013") {
		// 									estado_Comp = "O";
		// 									items.EST_COMP = "OBSERVADO";
		// 									items.iconComp = "sap-icon://vds-file";
		// 									items.stateComp = "Information";
		// 									ModelProyect.refresh(true);
											
		// 								}else{
											
		// 								estado_Comp = "CPA";
		// 								items.EST_COMP = "COMP. PEND. APR.";
		// 								items.iconComp = "sap-icon://pending";
		// 								items.stateComp = "Warning";
		// 								ModelProyect.refresh(true);	
		// 								}
											
		// 							}else{
		// 								estado_Comp = "CPA";
		// 								items.EST_COMP = "COMP. PEND. APR.";
		// 								items.iconComp = "sap-icon://pending";
		// 								items.stateComp = "Warning";
		// 								ModelProyect.refresh(true);
		// 							}
	
		// 							break;
		// 							case "KD":
		// 								if(parseFloat(items.totales1) > 700){
		// 											estado_Comp = "O";
		// 											items.EST_COMP = "OBSERVADO";
		// 											items.iconComp = "sap-icon://vds-file";
		// 											items.stateComp = "Information";
		// 											ModelProyect.refresh(true);	
		// 								}else{
		// 								estado_Comp = "CPA";
		// 								items.EST_COMP = "COMP. PEND. APR.";
		// 								items.iconComp = "sap-icon://pending";
		// 								items.stateComp = "Warning";
		// 								ModelProyect.refresh(true);
		// 								}	
		// 							break;
		// 							case "KG":
		// 								if(parseFloat(items.totales1) > 700){
		// 											estado_Comp = "O";
		// 											items.EST_COMP = "OBSERVADO";
		// 											items.iconComp = "sap-icon://vds-file";
		// 											items.stateComp = "Information";
		// 											ModelProyect.refresh(true);	
		// 								}else{
		// 								estado_Comp = "CPA";
		// 								items.EST_COMP = "COMP. PEND. APR.";
		// 								items.iconComp = "sap-icon://pending";
		// 								items.stateComp = "Warning";
		// 								ModelProyect.refresh(true);
		// 								}		
		// 							break;
		// 							case "KT":
		// 								if(parseFloat(items.totales1) > 700){
		// 											estado_Comp = "O";
		// 											items.EST_COMP = "OBSERVADO";
		// 											items.iconComp = "sap-icon://vds-file";
		// 											items.stateComp = "Information";
		// 											ModelProyect.refresh(true);	
		// 								}else{
		// 								estado_Comp = "CPA";
		// 								items.EST_COMP = "COMP. PEND. APR.";
		// 								items.iconComp = "sap-icon://pending";
		// 								items.stateComp = "Warning";
		// 								ModelProyect.refresh(true);
		// 								}			
		// 							break;
		// 							case "KV":
		// 							if(parseFloat(items.totales1) > 700){
		// 								estado_Comp = "O";
		// 								items.EST_COMP = "OBSERVADO";
		// 								items.iconComp = "sap-icon://vds-file";
		// 								items.stateComp = "Information";
		// 								ModelProyect.refresh(true);	
		// 								}else{
		// 								estado_Comp = "CPA";
		// 								items.EST_COMP = "COMP. PEND. APR.";
		// 								items.iconComp = "sap-icon://pending";
		// 								items.stateComp = "Warning";
		// 								ModelProyect.refresh(true);
		// 								}
		// 								break;
		// 							 default:
		// 								estado_Comp = "CPA";
		// 								items.EST_COMP = "COMP. PEND. APR.";
		// 								items.iconComp = "sap-icon://pending";
		// 								items.stateComp = "Warning";
		// 								ModelProyect.refresh(true);
		// 								break;
		// 							}	
		// 						}else if(items.COD_EST_COMP === "CA"){
		// 							estado_Comp = "CA";
		// 							items.EST_COMP = "COMP. APROBADO";
		// 							items.iconComp = "sap-icon://accept";
		// 							items.stateComp = "Success";
									
		// 							ModelProyect.refresh(true);
		// 						}else if(items.COD_EST_COMP === "C"){
		// 							estado_Comp = "C";
		// 							items.EST_COMP = "CONTABILIZADO";
		// 							ModelProyect.refresh(true);
		// 						}else if(items.COD_EST_COMP === "COM"){
		// 							estado_Comp = "COM";
		// 							items.EST_COMP = "COMPENSADO";
		// 							ModelProyect.refresh(true);
		// 						}
									
		// 							if(items.COD_TIPO_COMP === "KX"){//24/07/2022
		// 								TipoNif ="0";
		// 							}else 
		// 							 if(items.RUC.length  === 8){
		// 								TipoNif ="1";
		// 							  }else if(items.RUC.length  === 11){
		// 							  		TipoNif ="6";
		// 							  } 
	
		// 								if (estado_igual === true){
											
		// 								if (estado_Comp === "CA" && items.NIVEL_AP === "3"){
		// 									estado_sol ="A";
		// 								}
		// 								else if (estado_Comp === "C"){
		// 									estado_sol ="C";
		// 								}else if(estado_Comp === "COM"){
		// 								estado_sol ="COM";	
		// 								}else{
		// 								estado_sol = "PA";	
		// 								}
											
		// 								}else{
									
		// 								if(contabilizado === true && aprobado === true && items.NIVEL_AP === "3"){
		// 								estado_sol ="CP";
		// 								}else if (compenzado === true && aprobado === true && items.NIVEL_AP === "3"){
		// 								 	estado_sol ="COP";
		// 								 }else if(contabilizado === true && aprobado=== true && items.NIVEL_AP === "1"){
		// 									estado_sol ="PA";	
		// 								}else if(compenzado === true && aprobado=== true && items.NIVEL_AP === "1"){
		// 									estado_sol ="PA";	
		// 								}else{
		// 								estado_sol ="PA";	
		// 								}
										
		// 								}
										
										
		// 								 if (estado_Comp === "O") {
		// 									validar_solic = true;
		// 									nivelApro = "0";
		// 									estado_sol = "O";
											
		// 								}else if(estado_Comp === "CA"){
											
		// 								 nivelApro = items.NIVEL_AP;//cambio de 04/06/2022	
		// 								}else if(estado_Comp === "C"){
											
		// 								 nivelApro = items.NIVEL_AP;//cambio de 04/06/2022	
		// 								}else if(estado_Comp === "COM"){
											
		// 								 nivelApro = items.NIVEL_AP;//cambio de 04/06/2022	
		// 								}else{
											
		// 								nivelApro = "1";//cambio de 04/06/2022		
		// 								}
		// 								ModelProyect.refresh(true);
		// 								var FECHA_COMP = items.FECHA_COMP.replaceAll("/", "");
		// 								var formato = FECHA_COMP.substring(8, 4) + FECHA_COMP.substring(4, 2) + FECHA_COMP.substring(2, 0);
		// 								var correo_electronico ="";
										
		// 								if(items.EMAIL_AD_USOL !== "" && items.EMAIL_AD_USOL !== undefined){//04/07/2022
		// 									correo_electronico = items.EMAIL_AD_USOL;
		// 								}else{
		// 									correo_electronico = correouser;
		// 								}
										
		// 								if(items2.imputacion.length >0){
		// 								items2.imputacion.forEach(function(items_09){
		// 								var desglose = {
	
		// 									"COMPROBANTE": items.COMPROBANTE,
		// 									"POSIC": items2.POSIC.toString(), //desglose
		// 									"TIPO_COMP": items.COD_TIPO_COMP,
		// 									"FECHA_COMP": formato,
		// 									"RUC": items.RUC,
		// 									"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 									"WAERS": items.WAERS,
		// 									"IND_IMP": items2.IND_IMP,
		// 									"TIPO_GASTO": "",
		// 									"KOSTL": items_09.selectKeyagre,
		// 									"BASE_IMP": items2.BASE_IMP,
		// 									"IGV": items2.IGV,
		// 									"INAFECTO": items2.INAFECTO,
		// 									"TOTAL": items2.TOTAL,
		// 									"EST_COMP": estado_Comp, //comprobante , dejarlo asi
		// 									"EST_SOLI": estado_sol, // solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 									"ADJUNTO": "",//items_06.Name
		// 									"GLOSA": items.GLOSA,
		// 									"NROD0": items.NROD0,
		// 									"DOC_PAGO": "",
		// 									"COD_SAP": items.COD_SAP,
		// 									"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 									"NIVEL_AP": nivelApro, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 									"COD_CONT": items2.COD_CONT,
		// 									"FECHA_APR": "", //VACIO 
		// 									"IMP_RENDIDO": ImporteRend,
		// 									"COD_REPO": "",
		// 							        "COD_REEM": "",
		// 							        "ORDEN_INT": items.ORDEN_INT,
		// 							        "VIAJES": items.VIAJES,
		// 									"TIPO_NIF": TipoNif,
		// 	 								"CUENTA_BANC": items2.CUENTA_BANC,
		// 									"FECHA_ENV": fecha,
		//  									"REF_FACTURA": items.REF_FACTURA,
		//  									"ID_CECO": "",
		//  									"TIPO_REND": "ER",
		//  									"LIBERADOR1": "",
		//  									"LIBERADOR2": "",
		//  									"EDIT_COMP": "",
		//  									"EDIT_RUC": "",
		//  									"FECHA_APRO1": "",
	    // 									"FECHA_APRO2": "",
		//  									"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		//  									"COD_CONT2":items2.COD_CONT2,
		//  									"EMAIL_AD_USOL":correo_electronico,
		//  									"FECHA_ABON":FECHA_ABON,
		//  									"COD_SAP_LIB2"	:items.COD_SAP_LIB2,
		//  									"DOC_COMP"	:items.DOC_COMP,
		// 		    			    		"DOC_CONT"	:items.DOC_CONT,
		// 		    			    		"DOC_PAGO_SOLICITUD" : nroDocPago,
		// 		    			    		"FECHA_CONT":items.FECHA_CONT,
		// 									"FECHA_COMPENSA":items.FECHA_COMPENSA,
	
		// 								}
	
		// 								arrayaprobacion.push(desglose);
	
		// 								});
		// 								}else{
		// 								var desglose1 = {
	
		// 									"COMPROBANTE": items.COMPROBANTE,
		// 									"POSIC": items2.POSIC.toString(), //desglose
		// 									"TIPO_COMP": items.COD_TIPO_COMP,
		// 									"FECHA_COMP": formato,
		// 									"RUC": items.RUC,
		// 									"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 									"WAERS": items.WAERS,
		// 									"IND_IMP": items2.IND_IMP,
		// 									"TIPO_GASTO": "",
		// 									"KOSTL": "",
		// 									"BASE_IMP": items2.BASE_IMP,
		// 									"IGV": items2.IGV,
		// 									"INAFECTO": items2.INAFECTO,
		// 									"TOTAL": items2.TOTAL,
		// 									"EST_COMP": estado_Comp, //comprobante , dejarlo asi
		// 									"EST_SOLI": estado_sol, // solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 									"ADJUNTO": "",//items_06.Name
		// 									"GLOSA": items.GLOSA,
		// 									"NROD0": items.NROD0,
		// 									"DOC_PAGO": "",
		// 									"COD_SAP": items.COD_SAP,
		// 									"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 									"NIVEL_AP": nivelApro, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 									"COD_CONT": items2.COD_CONT,
		// 									"FECHA_APR": "", //VACIO 
		// 									"IMP_RENDIDO": ImporteRend,
		// 									"COD_REPO": "",
		// 							        "COD_REEM": "",
		// 							        "ORDEN_INT": items.ORDEN_INT,
		// 							        "VIAJES": items.VIAJES,
		// 									"TIPO_NIF": TipoNif,
		// 	 								"CUENTA_BANC": items2.CUENTA_BANC,
		// 									"FECHA_ENV": fecha,
		//  									"REF_FACTURA": items.REF_FACTURA,
		//  									"ID_CECO": "",
		//  									"TIPO_REND": "ER",
		//  									"LIBERADOR1": "",
		//  									"LIBERADOR2": "",
		//  									"EDIT_COMP": "",
		//  									"EDIT_RUC": "",
		//  									"FECHA_APRO1": "",
	    // 									"FECHA_APRO2": "",
		//  									"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		//  									"COD_CONT2":items2.COD_CONT2,
		//  									"EMAIL_AD_USOL":correo_electronico,
		//  									"FECHA_ABON":FECHA_ABON,
		// 									"COD_SAP_LIB2"	:items.COD_SAP_LIB2,
		// 									"DOC_COMP"	:items.DOC_COMP,
		// 		    			    		"DOC_CONT"	:items.DOC_CONT,
		// 		    			    		"DOC_PAGO_SOLICITUD" : nroDocPago,
		// 		    			    		"FECHA_CONT":items.FECHA_CONT,
		// 									"FECHA_COMPENSA":items.FECHA_COMPENSA,
		// 								}
	
		// 								arrayaprobacion.push(desglose1);	
										
		// 								}
		// 					});
		// 						}
							
							
		// 					  }
		// 						else{
									  	
		// 						  	if(ValidacionAprobador){
		// 				  				estado_sol ="A";
						  		
		// 							}else if(!ValidacionAprobador && ValidacionContabilizados){
		// 				  				estado_sol ="C";
						  		
		// 				  			}else{
		// 				  				estado_sol ="COM";
						  		
		// 				  			}
							  	
		// 					  	if(items.desglose.length > 0){	
							  		
		// 							items.desglose.forEach(function (items2) {
		// 							validacion_glose = true;
								
		// 	 						if(items.COD_EST_COMP === "CA"){
			 						 	
		// 							estado_Comp = "CA";
		// 							items.EST_COMP = "COMP. APROBADO";
		// 							items.iconComp = "sap-icon://accept";
		// 							items.stateComp = "Success";
		// 							ModelProyect.refresh(true);
									
		// 							}else if(items.COD_EST_COMP === "C"){
										
		// 								estado_Comp = "C";
		// 								items.EST_COMP = "CONTABILIZADO";
		// 								ModelProyect.refresh(true);
										
		// 							}else if(items.COD_EST_COMP === "COM"){
										
		// 								estado_Comp = "COM";
		// 								items.EST_COMP = "COMPENSADO";
		// 								ModelProyect.refresh(true);
		// 							}	
								
		// 							if(items.COD_TIPO_COMP === "KX"){//24/07/2022
		// 							  	TipoNif ="0";
									  	
		// 							}else if(items.RUC.length  === 8){
										
		// 								TipoNif ="1";
		// 							}else if(items.RUC.length  === 11){
									  	
		// 							  		TipoNif ="6";
		// 							}
									
		// 							ModelProyect.refresh(true);
		// 							var FECHA_COMP = items.FECHA_COMP.replaceAll("/", "");
		// 							var formato = FECHA_COMP.substring(8, 4) + FECHA_COMP.substring(4, 2) + FECHA_COMP.substring(2, 0);
									
										
		// 							var correo_electronico ="";
									
		// 							if(items.EMAIL_AD_USOL !== "" && items.EMAIL_AD_USOL !== undefined){//04/07/2022
		// 								correo_electronico = items.EMAIL_AD_USOL;
		// 							}else{
		// 								correo_electronico = correouser;
		// 							}
										
										
		// 							if(items2.imputacion.length > 0){	
		// 							items2.imputacion.forEach(function(items_09){
		// 							var desglose = {
		// 								"COMPROBANTE": items.COMPROBANTE,
		// 								"POSIC": items2.POSIC.toString(), //desglose
		// 								"TIPO_COMP": items.COD_TIPO_COMP,
		// 								"FECHA_COMP": formato,
		// 								"RUC": items.RUC,
		// 								"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 								"WAERS": items.WAERS,
		// 								"IND_IMP": items2.IND_IMP,
		// 								"TIPO_GASTO": "",
		// 								"KOSTL": items_09.selectKeyagre,
		// 								"BASE_IMP": items2.BASE_IMP,
		// 								"IGV": items2.IGV,
		// 								"INAFECTO": items2.INAFECTO,
		// 								"TOTAL": items2.TOTAL,
		// 								"EST_COMP": estado_Comp, //comprobante , dejarlo asi
		// 								"EST_SOLI": estado_sol, // solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 								"ADJUNTO": "",//items_06.Name
		// 								"GLOSA": items.GLOSA,
		// 								"NROD0": items.NROD0,
		// 								"DOC_PAGO": items.DOC_PAGO,
		// 								"COD_SAP": items.COD_SAP,
		// 								"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 								"NIVEL_AP": nivelApro, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 								"COD_CONT": items2.COD_CONT,
		// 								"FECHA_APR": "", //VACIO 
		// 								"IMP_RENDIDO": ImporteRend,
		// 								"COD_REPO": "",
		// 						        "COD_REEM": items.COD_REEM,
		// 						        "ORDEN_INT": items.ORDEN_INT,
		// 						        "VIAJES": items.VIAJES,
		// 								"TIPO_NIF": TipoNif,
    	// 								"CUENTA_BANC": items2.CUENTA_BANC,
    	// 								"FECHA_ENV": fecha,
    	// 								"REF_FACTURA": items.REF_FACTURA,
    	// 								"ID_CECO": "",
		// 							    "TIPO_REND": "RG",
		// 							    "LIBERADOR1": "",
		// 							    "LIBERADOR2": "",
		// 						        "EDIT_COMP": "",
		// 								"EDIT_RUC": "",
		// 								"FECHA_APRO1": "",
    	// 								"FECHA_APRO2": "",
		// 								"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		// 								"COD_CONT2":items2.COD_CONT2,
		// 								"EMAIL_AD_USOL":correo_electronico,
		// 								"COD_SAP_LIB2"	:items.COD_SAP_LIB2,
		// 								"DOC_COMP"	:items.DOC_COMP,
		// 	    			    		"DOC_CONT"	:items.DOC_CONT,
		// 	    			    		"FECHA_CONT":items.FECHA_CONT,
		// 								"FECHA_COMPENSA":items.FECHA_COMPENSA,

		// 							}

		// 							arrayaprobacion.push(desglose);
 		// 						});
		// 							}else{
										
		// 							var desglose1 = {
		// 								"COMPROBANTE": items.COMPROBANTE,
		// 								"POSIC": items2.POSIC.toString(), //desglose
		// 								"TIPO_COMP": items.COD_TIPO_COMP,
		// 								"FECHA_COMP": formato,
		// 								"RUC": items.RUC,
		// 								"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 								"WAERS": items.WAERS,
		// 								"IND_IMP": items2.IND_IMP,
		// 								"TIPO_GASTO": "",
		// 								"KOSTL": "",
		// 								"BASE_IMP": items2.BASE_IMP,
		// 								"IGV": items2.IGV,
		// 								"INAFECTO": items2.INAFECTO,
		// 								"TOTAL": items2.TOTAL,
		// 								"EST_COMP": estado_Comp, //comprobante , dejarlo asi
		// 								"EST_SOLI": estado_sol, // solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 								"ADJUNTO": "",//items_06.Name
		// 								"GLOSA": items.GLOSA,
		// 								"NROD0": items.NROD0,
		// 								"DOC_PAGO": items.DOC_PAGO,
		// 								"COD_SAP": items.COD_SAP,
		// 								"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 								"NIVEL_AP": nivelApro, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 								"COD_CONT": items2.COD_CONT,
		// 								"FECHA_APR": "", //VACIO 
		// 								"IMP_RENDIDO": ImporteRend,
		// 								"COD_REPO": "",
		// 						        "COD_REEM": items.COD_REEM,
		// 						        "ORDEN_INT": items.ORDEN_INT,
		// 						        "VIAJES": items.VIAJES,
		// 								"TIPO_NIF": TipoNif,
    	// 								"CUENTA_BANC": items2.CUENTA_BANC,
    	// 								"FECHA_ENV": fecha,
    	// 								"REF_FACTURA": items.REF_FACTURA,
    	// 								"ID_CECO": "",
		// 							    "TIPO_REND": "RG",
		// 							    "LIBERADOR1": "",
		// 							    "LIBERADOR2": "",
		// 						        "EDIT_COMP": "",
		// 								"EDIT_RUC": "",
		// 								"FECHA_APRO1": "",
    	// 								"FECHA_APRO2": "",
		// 								"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		// 								"COD_CONT2":items2.COD_CONT2,
		// 								"EMAIL_AD_USOL":correo_electronico,
		// 								"COD_SAP_LIB2"	:items.COD_SAP_LIB2,
		// 								"DOC_COMP"	:items.DOC_COMP,
		// 	    			    		"DOC_CONT"	:items.DOC_CONT,
		// 	    			    		"FECHA_CONT":items.FECHA_CONT,
		// 								"FECHA_COMPENSA":items.FECHA_COMPENSA,

		// 							}

		// 							arrayaprobacion.push(desglose1);	
								
		// 					}
		// 					});
		// 					}
									  	
		// 							  }
								
		// 					});

						
		// 					if (validar_solic) {
		// 						arrayaprobacion.forEach(function (xs) {
		// 						if(xs.EST_COMP !== "CA" && xs.EST_COMP !== "C" && xs.EST_COMP !== "COM"){	
		// 							xs.EST_SOLI = "O";
		// 							xs.NIVEL_AP = "0";
		// 						}else{//13/07/2022
		// 							xs.EST_SOLI = "O";
		// 						}
		// 						});
		// 					}
		// 					ModelProyect.refresh(true);

		// 					var datos = {
		// 						"MENSAJE": "X",
		// 						"ZET_UPD_COMPROSet": arrayaprobacion
		// 					}
		// 					$.ajax({
		// 						url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
		// 						type: "GET",
		// 						headers: {
		// 							"x-CSRF-Token": "Fetch"
		// 						}
		// 					}).always(function (data, status, response) {
		// 						var token = response.getResponseHeader("x-csrf-token");
		// 						$.ajax({
		// 							url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_UPD_COMPRO_CABSet",
		// 							method: "POST",
		// 							headers: {
		// 								"x-CSRF-Token": token
		// 							},
		// 							async: false,
		// 							contentType: "application/json",
		// 							dataType: "json",
		// 							data: JSON.stringify(datos),
		// 						}).always(function (data, status, response) {
		// 							var datos = data.d.MENSAJE;
		// 							ModelProyect.setProperty("/estado_enviar",datos);
		// 							ModelProyect.refresh(true);
									
		// 							sap.ui.core.BusyIndicator.hide();
		// 							MessageToast.show("La solicitud " + datos + " se ha enviado a aprobar." + " Estado de envio :" + datos);
		// 							that.oRouter.navTo("RendicionConER");
								

		// 						});

		// 					});
		// 				}


		// 				}
		// 				//sap.ui.core.BusyIndicator.hide();
						
		// 			}
		// 		});
		// 		sap.ui.core.BusyIndicator.hide();
		// 	//}
		// },
		
		
		changeIgv:function(oEvent){// CAMBIOS DE 24/06/2022
		var vista						= this.getView();
		var ModelProyect				= vista.getModel("Proyect");
		var jsonData					= ModelProyect.getProperty("/jsonData");
		var seleccion					= oEvent.getSource().oParent.oBindingContexts.Proyect.sPath;
		var seleBaseImp 				= ModelProyect.getProperty(seleccion);
		var totalFixed					=0;
		var baseImp						=0;
		var impuestoC					=0;
		var inafecto					=0;
		var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
		var acumulador                  = 0;
		var ImporteSolic				= ModelProyect.getProperty("/importe");
		var datos_selecciones			=ModelProyect.getProperty("/datos_selecciones");//21/07/2022	
		
			
		jsonData.forEach(function (items, index) {
			
		if (items.POSIC === seleBaseImp.POSIC) {
			items.TOTAL= (parseFloat(seleBaseImp.BASE_IMP) +  parseFloat(seleBaseImp.IGV) + parseFloat(seleBaseImp.INAFECTO)).toFixed(2);
			items.IGV = parseFloat(seleBaseImp.IGV).toFixed(2);
		}	
		});
		
		jsonData.forEach(function (items1, index) {
		baseImp+= parseFloat(items1.BASE_IMP);
		impuestoC+= parseFloat(items1.IGV);
		inafecto+= parseFloat(items1.INAFECTO);
		totalFixed += parseFloat(items1.TOTAL);
		
		});
			DataComprobanteConfirmacion.forEach(function (items2) {
				if (items2.keySeg === datos_selecciones.keySeg) {//21/07/2022
					items2.totalImpu = parseFloat(impuestoC).toFixed(2);
					items2.totalImp = parseFloat(baseImp).toFixed(2);
					items2.totalNoGr = parseFloat(inafecto).toFixed(2);
					items2.totales = totalFixed.toFixed(2);
					
					
				}
				ModelProyect.refresh(true);
		
			});
			DataComprobanteConfirmacion.forEach(function (items2) {
				acumulador += parseFloat(items2.totales);
				
			});
			

			var resta_saldo = parseFloat(acumulador) - parseFloat(ImporteSolic);

			ModelProyect.setProperty("/ImporteRend", acumulador.toFixed(2));
			if (parseFloat(ImporteSolic) < acumulador) {
			ModelProyect.setProperty("/estado_saldo", "Success");
			} else {
			ModelProyect.setProperty("/estado_saldo", "Error");
			}
			
			ModelProyect.setProperty("/subTotalComp", totalFixed.toFixed(2));
			ModelProyect.setProperty("/subTotal", baseImp.toFixed(2));
			ModelProyect.setProperty("/impueDet", impuestoC.toFixed(2));
			ModelProyect.setProperty("/noGrabada", inafecto.toFixed(2));
			ModelProyect.setProperty("/ImporteRend", acumulador.toFixed(2));
			ModelProyect.setProperty("/Saldo", parseFloat(resta_saldo).toFixed(2));
			
		},
		
		pressBaseImponibleyInafecto: function (oEvent) {//17/07/2022
			var datos						= "";
			var vista						= this.getView();
			var suma						= 0;
			var calculo 					= "";
			var ModelProyect				= vista.getModel("Proyect");
			var IGV 						= ModelProyect.getProperty("/IGV");
			var Igvprueba					= parseFloat(IGV);
			var idBaseImp					= oEvent.mParameters.value;
			var impuesto					= "";
			var jsonData					= ModelProyect.getProperty("/jsonData");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var seleccion					= oEvent.getSource().oParent.oBindingContexts.Proyect.sPath;
			var seleBaseImp 				= ModelProyect.getProperty(seleccion);
			var subTotal					= ModelProyect.getProperty("/subTotal");
			var ImporteSolic				= ModelProyect.getProperty("/importe");
			var calculoimp					= "";
			var sumaBase					= 0;
			var sumatotal					= 0;
			var impuestoC					= 0;
			var sumafinal					= 0;
			var totalbaseImp				= 0;
			var sumatoria					= 0;
			var sumaTodoTotal				= 0;
			var sumaTotal					= 0;
			var baseImp 					= 0;
			var calculototal				= 0;
			var condicion					= false;
			var acumulador					= 0;
			var totalFixed					= 0;
			var datos_selecciones			=ModelProyect.getProperty("/datos_selecciones");//21/07/2022
			
			// DataComprobanteConfirmacion.forEach(function(items2){
			jsonData.forEach(function (items, index) {
				condicion = false;

				if (items.POSIC === seleBaseImp.POSIC) {
					
					
					// si el indicador es diferente a c0 , que realize la suma de base imponible,igv y inafecto.
					if (items.BASE_IMP === "") {
						items.BASE_IMP = "0.00";
					} else {
						items.BASE_IMP = parseFloat(items.BASE_IMP).toFixed(2);
						if (isNaN(items.BASE_IMP) || items.BASE_IMP === "0") {
							items.BASE_IMP = "0.00";
						}
					}
					if (items.IGV === "") {
						items.IGV = "0.00";
					} else {
						items.IGV = parseFloat(items.IGV).toFixed(2);
						if (isNaN(items.IGV) || items.IGV === "0") {
							items.IGV = "0.00";
						}
					}
					if (items.INAFECTO === "") {
						items.INAFECTO = "0.00";
					} else {
						items.INAFECTO = parseFloat(items.INAFECTO).toFixed(2);
						if (isNaN(items.INAFECTO) || items.INAFECTO === "0") {
							items.IGV = "0.00";
						}
					}

					if (seleBaseImp.IND_IMP !== "C0") {
						if(seleBaseImp.IND_IMP === "C2"){//05/09/2022
						items.BASE_IMP = parseFloat(seleBaseImp.BASE_IMP).toFixed(2);
						impuesto = parseFloat(seleBaseImp.BASE_IMP) * Igvprueba;
						calculoimp = impuesto / 100;
						}else{
						items.BASE_IMP = parseFloat(seleBaseImp.BASE_IMP).toFixed(2);
						impuesto = parseFloat(seleBaseImp.BASE_IMP) * Igvprueba;
						calculoimp = impuesto / 100;	
							
						}
						items.IGV = calculoimp.toString();
						items.INAFECTO = parseFloat(seleBaseImp.INAFECTO).toFixed(2);

						calculototal += parseFloat(seleBaseImp.BASE_IMP); //importe
						calculototal += parseFloat(seleBaseImp.IGV);
						calculototal += parseFloat(seleBaseImp.INAFECTO);
						items.TOTAL = calculototal.toFixed(2);

						var calculo_totalF = "";
						if (seleBaseImp.INAFECTO !== "0.00") {
							calculo_totalF = (parseFloat(items.TOTAL) - parseFloat(seleBaseImp.INAFECTO));
						} else {
							calculo_totalF = parseFloat(items.TOTAL);
						}
						items.IGV = (calculo_totalF - parseFloat(items.BASE_IMP)).toFixed(2);

						if (parseFloat(seleBaseImp.INAFECTO).toFixed(2) === "0.00") {
							sumatotal += parseFloat(seleBaseImp.BASE_IMP);
							sumatotal += parseFloat(seleBaseImp.IGV);
							items.TOTAL = parseFloat(sumatotal).toFixed(2);
						}

						items.BASE_IMP = parseFloat(seleBaseImp.BASE_IMP).toFixed(2);

						baseImp += parseFloat(items.BASE_IMP);
						condicion = true;
					} else if (seleBaseImp.IND_IMP === "C0") {
						condicion = true;
						items.INAFECTO = parseFloat(seleBaseImp.INAFECTO).toFixed(2);
						//parseFloat(seleBaseImp.INAFECTO).toFixed(2);
						items.BASE_IMP = "0.00";
						items.IGV = "0.00";
						items.TOTAL = parseFloat(seleBaseImp.INAFECTO).toFixed(2);

						baseImp += parseFloat(items.BASE_IMP);
						impuestoC = "0.00";
					}
				
				}

				if (!condicion) {
					baseImp += parseFloat(items.BASE_IMP);

				}
				if (impuestoC === "0.00") {
					impuestoC = "0.00";
					sumatoria += parseFloat(items.INAFECTO);
				} else {

					impuestoC += parseFloat(items.IGV); //((baseImp * Igvprueba)/100);
					sumatoria += parseFloat(items.INAFECTO);
					sumaTotal = sumatoria;

				}

			});

			ModelProyect.refresh(true);

			if (impuestoC === "0.00") {
				sumaTodoTotal = sumatoria;
			} else {
				sumaTodoTotal = parseFloat(baseImp) + parseFloat(impuestoC) + parseFloat(sumatoria);
				var calculo_Totales = "";
				if (parseFloat(sumatoria) !== "0.00") {
					calculo_Totales = sumaTodoTotal - parseFloat(sumatoria);
				} else {
					calculo_Totales = sumaTodoTotal;
				}
				impuestoC = (calculo_Totales - parseFloat(baseImp)).toFixed(2);
			}

			totalFixed = parseFloat(sumaTodoTotal).toFixed(2);
			DataComprobanteConfirmacion.forEach(function (items2) {
				if (items2.keySeg === datos_selecciones.keySeg) {//21/07/2022
					items2.validacion_guardado= false;
					items2.totalImpu = parseFloat(impuestoC).toFixed(2);
					items2.totalImp = parseFloat(baseImp).toFixed(2);
					items2.totalNoGr = parseFloat(sumatoria).toFixed(2);
					items2.totales = totalFixed;
					
					
				}
				ModelProyect.refresh(true);
				// acumulador += parseFloat(totalFixed);
				//	acumulador += parseFloat(items2.total);

			});
			DataComprobanteConfirmacion.forEach(function (items_02) { //agregado por claudia//18/07/2022
			if(items_02.keySeg === datos_selecciones.keySeg){//21/07/2022
				items_02.desglose.forEach(function (items_03) {
				
				if(items_03.POSIC === seleBaseImp.POSIC){
				if(items_03.IND_IMP !== "C0"){
				if(items_03.imputacion.length > 0){
				items_03.imputacion.forEach(function(obj){
				var formateo_porcentaje	= parseFloat(obj.porcentajeII) / 100;
					obj.IMP= (formateo_porcentaje * items_03.BASE_IMP).toFixed(2) ;	
					obj.IMP_TOTAL = items_03.BASE_IMP;
					
				});	
					
				}
				}else{
				if(items_03.imputacion.length > 0){
				items_03.imputacion.forEach(function(obj){
				var formateo_porcentaje	= parseFloat(obj.porcentajeII) / 100;
					obj.IMP= (formateo_porcentaje * items_03.INAFECTO).toFixed(2) ;	
					obj.IMP_TOTAL =  items_03.INAFECTO;
					
				});	
					
				}	
				}	
				}	
					
				});
			}
			});
			
			DataComprobanteConfirmacion.forEach(function (items_021) {//21/07/2022
			items_021.desglose.forEach(function (items_032) {
			acumulador += parseFloat(items_032.TOTAL);	
			});
			});
			
			var resta_saldo = parseFloat(acumulador) - parseFloat(ImporteSolic) ;// cambio 04/06/2022
		
			ModelProyect.setProperty("/ImporteRend", acumulador.toFixed(2));
			if (parseFloat(ImporteSolic) < acumulador) {   // cambio de 04/06/2022
				ModelProyect.setProperty("/estado_saldo", "Success");
			} else {
				ModelProyect.setProperty("/estado_saldo", "Error");
			}
			ModelProyect.setProperty("/subTotalComp", totalFixed);
			ModelProyect.setProperty("/subTotal", baseImp.toFixed(2));
			ModelProyect.setProperty("/impueDet", impuestoC);

			// ModelProyect.setProperty("/impueDet",impuesto.toFixed(2));
			ModelProyect.setProperty("/noGrabada", sumatoria.toFixed(2));
			ModelProyect.setProperty("/Saldo", parseFloat(resta_saldo).toFixed(2));

			// ModelProyect.setProperty("/subTotalComp",sumafinal.toFixed(2));

		},
		setNoEditable: function () {
			var miModel = this.getView().getModel("midata");
			miModel.setProperty("/setEditableView", true);
			miModel.setProperty("/setEditableEdit", false);
			miModel.setProperty("/btnGuardarVisible", false);
			miModel.setProperty("/btnGuardarVisible", false);
			miModel.setProperty("/botonesTablaPropiedades/btnEdit", true);
		},
		onSelect: function (oEvent) {
			var that = this;
			var oView = this.getView();
			var selectedItems = this.getView().byId("list").getSelectedItems();
			if (selectedItems.length > 0) {
				oView.byId("buttonEliminarComprobante").setEnabled(true);
			} else {
				oView.byId("buttonEliminarComprobante").setEnabled(false);
			}
			// console.log("hola")
		},
		onChangeFiltros: function () {
			var that = this;
			var oView = this.getView();
			this.getDataReporteHistoricos();
		},
		handleSelectionChange: function () {
			// console.log("hola")
		},
		fnPressDelete: function () {
			var that = this;
			var oView = this.getView();
			var tablaItems = oView.byId("tableFacturacion");
			var index = tablaItems.getSelectedIndices();
			if (tablaItems.getSelectedIndices().length == 1) {
				MessageBox.confirm("¿Seguro que desea eliminar? ", {
					actions: ["Confirmar", "Cancelar"],
					emphasizedAction: "Manage Products",
					onClose: function (sAction) {
						if (sAction == "Confirmar") {
							that.fnDeleteItems();
						}
					}
				});
			} else {
				utilUI.onMessageErrorDialogPress2("No se ha seleccionado ningun item");
			}
		},
		fnDeleteItems: function () {
			var that = this;
			var oView = this.getView();

			var table = oView.byId("tableFacturacion");
			var index = oView.byId("tableFacturacion").getSelectedIndices()[0];
			var sPath = "/DataComprobantePreeliminar/" + (index).toString();
			var objTabla = oView.getModel("Proyect").getProperty("/DataComprobantePreeliminar");
			var objSelected = oView.getModel("Proyect").getProperty(sPath);
			var arrmoment = [];

			for (var i = 0; i < objTabla.length; i++) {
				var indice = objTabla.indexOf(objSelected);
				if (indice != -1)
					objTabla.splice(indice, 1);
			}

			table.removeSelectionInterval(index, index);

			if (objTabla.length == 0) {
				oView.byId("idGrabarSolicitudDetalleER").setEnabled(false);
				oView.byId("idEnviarLiquidacionSolicitudDetalleER").setEnabled(false);
			}

			oView.getModel("Proyect").setProperty("/DataComprobantePreeliminar", objTabla);

			MessageBox.success("Eliminado Correctamente.");

			var ModelProyect = oView.getModel("Proyect");
			var SelectedCabecera = ModelProyect.getProperty("/SelectedDetalle");
			var dataTabla = ModelProyect.getProperty("/DataComprobantePreeliminar");
			var importeER = 0;
			var total = 0;
			for (var i = 0; i < dataTabla.length; i++) {
				importeER += parseFloat(dataTabla[i].importeBase);

				total += parseFloat(dataTabla[i].importeBase);
				total += parseFloat(dataTabla[i].igv);
				total += parseFloat(dataTabla[i].parteInafecta);
			}
			SelectedCabecera.importeR = parseFloat(total).toFixed(2).toString();
			SelectedCabecera.saldo = (parseFloat(SelectedCabecera.importe) - parseFloat(total)).toFixed(2).toString();

			oView.getModel("Proyect").setProperty("/SelectedDetalle", SelectedCabecera);
		},
		onSuggestionItemSelected: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var oText = oItem ? oItem.getKey() : "";
			this.byId("selectedKeyIndicator").setText(oText);
		},
		onValueHelpDialogSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);

			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		onValueHelpDialogClose: function (oEvent) {
			var that = this;
			var oView = this.getView();
			var sDescription,
				oSelectedItem = oEvent.getParameter("selectedItem");
			oEvent.getSource().getBinding("items").filter([]);

			if (!oSelectedItem) {
				return;
			}

			sDescription = oSelectedItem.getDescription();

			// this.byId("matchRendirCosto").setSelectedKey(sDescription);
			var rowPath = oView.getModel("Proyect").getProperty("/DataComprobanteSelectedPath");
			var rowData = oView.getModel("Proyect").getProperty("/DataComprobanteSelectedData");
			if (rowData.rendicionCosto == "") {
				rowData.rendicionCosto = oSelectedItem.getTitle();
			} else if (rowData.ruc == "") {
				rowData.ruc = oSelectedItem.getTitle();
			}

			oView.getModel("Proyect").setProperty(rowPath, rowData);
		},

		changeMonedaC: function (oEvent) {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var datosMoneda = oEvent.getParameters().selectedItem.mProperties.key;
			var seleccion = ModelProyect.getProperty("/selecPress");
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			DataComprobanteConfirmacion.forEach(function (ITEMS) {
				if (ITEMS.keySeg === seleccion.keySeg) {//21/07/2022
					ITEMS.WAERS = datosMoneda;
				}
			});

		},
		changeIndicador: function (args) {//05/09/2022
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var selectInd					= args.getSource().oParent.oBindingContexts.Proyect.sPath;
			var selecIndicador				= ModelProyect.getProperty(selectInd);
			var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var subTotal					= ModelProyect.getProperty("/subTotal");
			var impueDet					= ModelProyect.getProperty("/impueDet");
			var subTotalComp				= ModelProyect.getProperty("/subTotalComp");
			var noGrabada					= ModelProyect.getProperty("/noGrabada");
			var impuesto01					= 0;
			var IGV 						= ModelProyect.getProperty("/IGV");
			var igv0						= parseFloat(IGV);
			var importe_Solic				= ModelProyect.getProperty("/importe");
			var calcular_Saldo				= 0;
			var contador_calculado			= 0;
			var datos_selecciones			=ModelProyect.getProperty("/datos_selecciones");//26/07/2022
			var datosIndicador				= ModelProyect.getProperty("/datosIndicador");
			
			DataComprobanteConfirmacion.forEach(function (items2) {
				if (items2.keySeg === datos_selecciones.keySeg) {//26/07/2022
					items2.validacion_guardado= false;
					items2.desglose.forEach(function (items, index) {
					datosIndicador.forEach(function(clñ){
					if(clñ.INDICADOR === selecIndicador.IND_IMP){
						
						ModelProyect.setProperty("/IGV",clñ.PORCENTAJE);		
						}	
					});		
						
						items.IND_IMP = selecIndicador.IND_IMP;
						items.NUEVO_IND= items.IND_IMP;
						

						if (selecIndicador.IND_IMP === "C0") {

							items2.totalImp 			= "0.00";//17/07/2022
							impuesto01					= "0.00";
							// impuesto01					=	impuesto01/100;
							items2.totalImpu			= parseFloat(impuesto01).toFixed(2);
							items2.totalNoGr			= "0.00";
							items2.totales				= "0.00";
							items2.SaldoTotal			= "0.00";
							items2.ImporteRendido		= "0.00";
							items.validacionBase		= false;
							items.validacionIGV			=false;
							items.validacionInafecto	= true;
							items.validacionIndicador	= true;
							items.enableImputa			= true;
							items.BASE_IMP				= "0.00";
							items.IGV					= "0.00";
							items.INAFECTO				= "0.00";
							items.TOTAL 				= "0.00";
							ModelProyect.refresh(true);
						} else {

							items2.totalImp 				= "0.00";
							impuesto01						= "0.00";
							items2.totalImpu				= parseFloat(impuesto01).toFixed(2);
							items2.totalNoGr				 = "0.00";
							items2.totales					= "0.00";
							items2.SaldoTotal				= "0.00";
							items2.ImporteRendido			= "0.00";
							items.validacionBase			= true;
							items.validacionInafecto		= true;
							items.validacionIndicador		= true;
							items.validacionIGV				=true;
							items.enableImputa				= true;
							items.BASE_IMP					= "0.00";
							items.IGV						= "0.00";
							items.INAFECTO					= "0.00";
							items.TOTAL 					= "0.00";
						}

					});
					ModelProyect.setProperty("/subTotal", items2.totalImp);
					ModelProyect.setProperty("/impueDet", items2.totalImpu);
					ModelProyect.setProperty("/subTotalComp", items2.totales);
					ModelProyect.setProperty("/noGrabada", items2.totalNoGr);

				}

				//-------Calculando el importe rendido al cambiar el indicador.

				contador_calculado += parseFloat(items2.totales);

			});
			calcular_Saldo = contador_calculado  - parseFloat(importe_Solic); 

			if (parseFloat(importe_Solic) < contador_calculado) {
				ModelProyect.setProperty("/estado_saldo", "Success");
			} else if (contador_calculado.toFixed(2) === "0.00") {
				ModelProyect.setProperty("/estado_saldo", "None");
			} else {
				ModelProyect.setProperty("/estado_saldo", "Error");
			}

			ModelProyect.setProperty("/ImporteRend", contador_calculado.toFixed(2));
			ModelProyect.setProperty("/Saldo", calcular_Saldo.toFixed(2));
			ModelProyect.refresh(true);
		},
		onPressRefresh: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");

			ModelProyect.refresh(true);
		},
		
		
		
		fnChangeFechaComprobante:function(oEvent){// cambio de 04/06/2022
		var that						= this;
		var oView						= this.getView();
		var ModelProyect				= oView.getModel("Proyect");
		var dataComprobante 			= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		var seleccion					= ModelProyect.getProperty("/selecPress");
		var fecha						= oView.byId("sfechaComprobante").getValue();
		var validacion                  = false;
		var hoy 						= new Date();
		var mes 						= hoy.getMonth() + 1;
		var hoyp						= hoy.getDate().toString();
		if (hoyp < 10) {
			var hoyn = "0" + hoy.getDate().toString();
		} else {
			var hoyn = hoy.getDate().toString();
		}

		if (mes < 10) {
			mes = "0" + mes.toString();
		}
			
		var fechaRegistrada				= fecha.substring(10, 6) + fecha.substring(5, 3) + fecha.substring(2, 0);
		var fechaActual					= hoy.getFullYear().toString() + mes.toString() +hoyn.toString();
		var validacionRango				= false;
		
		var RegExPattern = /^(?:(?:(?:0?[1-9]|1\d|2[0-8])[/](?:0?[1-9]|1[0-2])|(?:29|30)[/](?:0?[13-9]|1[0-2])|31[/](?:0?[13578]|1[02]))[/](?:0{2,3}[1-9]|0{1,2}[1-9]\d|0?[1-9]\d{2}|[1-9]\d{3})|29[/]0?2[/](?:\d{1,2}(?:0[48]|[2468][048]|[13579][26])|(?:0?[48]|[13579][26]|[2468][048])00))$/;
			if ((fecha.match(RegExPattern)) && (fecha != '')) {
			validacion = true ;
			var añoActual	= hoy.getFullYear().toString();
			var añoMinimo	= (añoActual *1) -1;
			var mesActual	= mes.toString();
			var diaActual	= hoyn.toString();	
			
			var RangoMaximo = añoActual + mesActual + diaActual ;
			var RangoMinimo	= añoMinimo + mesActual + diaActual ;
				
			if(fechaRegistrada *1 <  RangoMinimo *1 || fechaRegistrada *1 > RangoMaximo *1){
			validacionRango = true;	
			MessageBox.error("La fecha de comprobante no debe ser mayor a la fecha actual ni menor a un año de la fecha actual");
			ModelProyect.setProperty("/validacionRango" ,validacionRango);
			return;	
			}
			
			ModelProyect.setProperty("/validacionRango" ,validacionRango);
			
			ModelProyect.setProperty("/validacionFecha" ,validacion);
		
			} else {
			MessageBox.error("Formato de fecha incorrecta, el formato debe ser DD/MM/YYYY.");
				ModelProyect.setProperty("/validacionFecha" ,validacion);
				return false;
			}

			if(validacion === true){
			dataComprobante.forEach(function(xs){
			if(xs.COMPROBANTE === seleccion.COMPROBANTE){
				xs.FECHA_PRUEBA = fecha;
				xs.VALIDAR_DATOS = true;//01/09/2022
				
			}	
			});
				
			}

		},	
		
		// validacion_sunat: async function(items, indexFor, contadores01){
		// var oView			= this.getView();
		// var ModelProyect	= oView.getModel("Proyect");	
		// var dataComprobante = ModelProyect.getProperty("/DataComprobanteConfirmacion");	
		// var RUC_BENE		= ModelProyect.getProperty("/RUC_BENE");
		// var errores			= "";
		// var arrayestructura = [];
		// var data4			= "";
		// var that			= this;
		// var data2			= "";
		// var data			= "grant_type=client_credentials&scope=https%3A%2F%2Fapi.sunat.gob.pe%2Fv1%2Fcontribuyente%2Fcontribuyentes&client_id=f0104b35-c03e-4cfa-885f-8b83ef9475d3&client_secret=jWeyXNvvvWSE6orDN5hMRg==";
		// var datos			= "";
		// var codigo_clase	= "";
		// var serie			= items.COMPROBANTE.substring(1, 5);
		// var comprobante 	= items.COMPROBANTE.split("-")[1];
		// var monstrar_estadoCp		="";
		
		
		// 	// if (items.COMPROBANTE.substring(1, 5) === serie && isNaN(serie) === true) {
		
		// 		switch (items.COD_TIPO_COMP) {
		// 			case "KR":
		// 				codigo_clase = "01";
		// 				break;
		// 			case "KB":
		// 				codigo_clase = "03";
		// 				break;
		// 			case "KG":
		// 				codigo_clase = "07";
		// 				break;
		// 			case "KD":
		// 				codigo_clase = "08";
		// 				break;
		// 			case "KH":
		// 				codigo_clase = "R1";
		// 				break;
		// 		}
			
		// 		await jQuery.ajax({
		// 			type: "POST",
		// 			crossDomain: true,
		// 			headers: {
		// 				"content-type": "application/x-www-form-urlencoded",
		// 				"cache-control": "no-cache"
		// 			},
		// 			data: data,
		// 			url: "/SUNAT_COMPROBANTE/f0104b35-c03e-4cfa-885f-8b83ef9475d3/oauth2/token/",
		// 			success: function (data1, textStatus, jqXHR) {
		// 				console.log(data1);
	
		// 				data2 = data1.access_token;
	
		// 				// datos = {
		// 				// 	"numRuc": "20100103738",
		// 				// 	"codComp": "01",
		// 				// 	"numeroSerie": "FH02",
		// 				// 	"numero": "0048226",
		// 				// 	"fechaEmision": "13/01/2022",
		// 				// 	"monto": "114.00"
		// 				// };
						
		// 				datos = {
		// 					"numRuc": items.RUC,
		// 					"codComp": codigo_clase,
		// 					"numeroSerie": serie,
		// 					"numero": comprobante,
		// 					"fechaEmision": items.FECHA_COMP,
		// 					"monto": items.totales
		// 				};
	
		// 			},
		// 			error: function (er) {
		// 				MessageBox.error("Ocurrio un error al obtener el token");
		// 				sap.ui.core.BusyIndicator.hide();
		// 				console.log(er);
		// 			}
		// 		});
	
		// 		await jQuery.ajax({
		// 				type: "POST",
		// 				crossDomain: true,
		// 				headers: {
		// 					"content-type": "application/json",
		// 					"cache-control": "no-cache",
		// 					"Authorization": "Bearer " + data2
		// 				},
		// 				data: JSON.stringify(datos),
		// 				url: "/SUNAT_SERIE/" + RUC_BENE + "/validarcomprobante",
		// 				async: true,
		// 				success: async function (data1, textStatus, jqXHR) {
		// 					console.log(data1)
		// 					data4 = data1.data;
						
		// 					switch (data4.estadoCp) {
		// 						case "0":
		// 							monstrar_estadoCp = "No existe en los registros de la sunat.";
		// 							break;
		// 						case "2":
		// 							monstrar_estadoCp = "Anulado en los registros de la sunat.";
		// 							break;
		// 						case "4":
		// 							monstrar_estadoCp = "No autorizado en los registros de la sunat.";
		// 							break;
		// 					}
		
		// 					if (data4.estadoCp === "0" || data4.estadoCp === "2" || data4.estadoCp === "4") {
		// 						arrayestructura.push(datos);
		// 					}
							
		// 					if (arrayestructura.length > 0) {
		// 						arrayestructura.forEach(function (items03) {
		// 						var mostrar = {
		// 								monstrar_estadoCp: monstrar_estadoCp,
		// 								comprobante: items03.numeroSerie + "-" + items03.numero,
		// 							};
		// 							arrayTabla.push(mostrar);
		// 						});
		// 					}

		// 					if(contadorValidSunat > 0){
		// 						await that.onPressGrabar(indexFor, contadores01);
		// 						contadorValidSunat = 0;
		// 					}
							
		// 				},
		// 				error: async function (er) {
		// 					if(contadorValidSunat > 50){
		// 						MessageBox.error("Hubo un error en el servicio de SUNAT, intente más tarde");
		// 						contadorValidSunat = 0;
		// 						sap.ui.core.BusyIndicator.hide();
		// 						console.log(er); 
		// 					}else if(er.responseJSON === undefined){
		// 						if(er.cod === "405" || er.cod === "504"){
		// 							contadorValidSunat = 45;
		// 							await that.validacion_sunat(items, indexFor, contadores01);
		// 						}
									
		// 					}else if(er.responseJSON.status === 404 || er.responseJSON.status === 405 || er.responseJSON.status === 504 || er.responseJSON.status === 502 ){
		// 						contadorValidSunat++;
		// 						await that.validacion_sunat(items, indexFor, contadores01);	
		// 					}
		// 					else{
		// 						MessageBox.error("El comprobante no existe en la SUNAT, revise los datos ingresados");
		// 						contadorValidSunat = 0;
		// 						sap.ui.core.BusyIndicator.hide();
		// 						console.log(er);
		// 					}
		// 				}
		// 			});
		// 	// }
		// },
		
		// onPressGrabar: async function (indiceComp, contadores01) {
		// 	sap.ui.core.BusyIndicator.show(0);
		// 	var that						= this;
		// 	var oView						= this.getView();
		// 	var ModelProyect				= oView.getModel("Proyect");
		// 	//var seleccion					= oEvent.getSource();
		// 	var dataComprobante 			= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var selectCeco					= ModelProyect.getProperty("/selectCeco");
		// 	var moneda						= ModelProyect.getProperty("/monedas");
		// 	var Glosa						= ModelProyect.getProperty("/Glosa");
		// 	var ImporteRend					=ModelProyect.getProperty("/ImporteRend");
		// 	var arraygrabar 				= [];
		// 	var suma_total_Comp 			= 0;
		// 	var hoy 						= new Date();
		// 	var fecha						= "";
		// 	var mes 						= hoy.getMonth() + 1;
		// 	var hoyp						= hoy.getDate().toString();
		// 	var importe_Solic				= ModelProyect.getProperty("/importe");
		// 	var conta_solic 				= 0;
		// 	var datos_Eliminar				= ModelProyect.getProperty("/datos_Eliminar");
		// 	var validacion_aprobado			= false;
		
		// 	if (hoyp < 10) {
		// 		var hoyn = "0" + hoy.getDate().toString();
		// 	} else {
		// 		var hoyn = hoy.getDate().toString();
		// 	}

		// 	if (mes < 10) {
		// 		mes = "0" + mes.toString();
		// 	}

		// 	fecha = hoy.getFullYear().toString() + mes.toString() + hoyn.toString();
		// 	var baseimponible				= "";
		// 	var datoIgv 					= "";
		// 	var selectkeyTab				= "";
		// 	var inafecto					= "";
		// 	var totales 					= "";
		// 	var nombreTab					= "";
		// 	var comprobantes				= "";
		// 	//var contadores01				= 0;
		// 	var estado_Comp 				= "";
		// 	var resta_Comp					= 0;
		// 	var estadosoli					= "";
		// 	var importe 					= ModelProyect.getProperty("/importe");
		// 	var estado_sol					= "";
		// 	var validar_solic				= false;
		// 	var TipoNif 					= "";
		// 	var array_Eliminar				= [];
		// 	var numero						= "";
		// 	var validacion_glose			= false;
		// 	var nombrevalidacion			= "";
		// 	var codigo_clase				= "";
		// 	var monstrar_estadoCp			= "";
		// 	var monstrar_estadoRuc			= "";
		// 	var monstrar_condDomiRuc		= "";
		// 	var RUC_BENE					= ModelProyect.getProperty("/RUC_BENE");
		// 	var data4						= "";
		// 	var arrayestructura 			= [];
		// 	//var arrayTabla					= [];
		// 	var validarArchivo				= false;
		// 	var validarCeco 				= false;
		// 	var desglose_Validar			= "";
		// 	var ceco_validar				= "";
		// 	var adjunto_validar 			= "";
		// 	var cont_desglose				= 0;
		// 	var cont_ceco					= 0;
		// 	var cont_adjunto				= 0;
		// 	var cont_mov					=0;
		// 	var mov_validar					="";
		// 	var errores						="";
		// 	var nivel_aprob					="";
		// 	var datosImputacion				= ModelProyect.getProperty("/datosImputacion");
		// 	var datosMovilidad				= ModelProyect.getProperty("/datosMovilidad");
		// 	var correouser					=ModelProyect.getProperty("/correouser");
		// 	var consultaTrue				= false;
		// 	var datoscomprobantes			= [];
		// 	var validacion_campos			=[];
		// 	var FECHA_ABON					= ModelProyect.getProperty("/FECHA_ABON");
		// 	var nroDocPago					= ModelProyect.getProperty("/nroDocPago");
		// 	var contador_ValidaDat		   = 0;
		// 	var arrayValiDatos			   =[];
		
		// 	dataComprobante.forEach(function(obj){ //---------------------- nuevos cambios de 04/06/2022
		// 	var datos_comprobantes = false;
		// 	let CopyComprobantes= JSON.parse(JSON.stringify(dataComprobante));
		// 						CopyComprobantes.sort(function(a,b){
		// 							let obj2= b.ID_DOC_SRV === undefined ? 0 : b.ID_DOC_SRV *1 ;
		// 							let obj1= a.ID_DOC_SRV === undefined ? 0 : a.ID_DOC_SRV *1 ;
		// 							return  obj2 - obj1;
		// 						}); 
		// 						let idDocMax = CopyComprobantes[0].ID_DOC_SRV === undefined ? "": CopyComprobantes[0].ID_DOC_SRV;
		// 						if(obj.ID_DOC_SRV === undefined || obj.ID_DOC_SRV === "" ){
		// 						obj.ID_DOC_SRV = idDocMax === ""  ?  1 : (idDocMax*1) +1 ;
		// 						}
		// 		if(obj.DATOS_SAP !== true){
		// 		datoscomprobantes.push(obj);
				
		// 		if(obj.VALIDAR_DATOS === true){
		// 		if(obj.COMPROBANTE1 !== obj.COMPROBANTE){	
		// 		arrayValiDatos.push(obj.COMPROBANTE);
		// 		contador_ValidaDat++;
		// 		}
				
		// 		if(obj.FECHA_PRUEBA !== ""){
		// 		if(obj.FECHA_PRUEBA !== obj.FECHA_COMP){	
		// 		arrayValiDatos.push(obj.COMPROBANTE);
		// 		contador_ValidaDat++;
		// 		}
		// 		}
			
		// 		if(obj.RUC_PRUEBA !== ""){
		// 		if(obj.RUC_PRUEBA !==  obj.RUC){	
		// 		arrayValiDatos.push(obj.COMPROBANTE);
		// 		contador_ValidaDat++;
				
		// 		}
		// 		}
					
		// 		}//01/09/2022
		// 		}
				
				
		// 		 if(obj.eliminar_compro !== true && obj.eliminar_compro !== undefined){
		// 		 	datos_comprobantes= true;	
		// 		 }
				
		// 		if(obj.DATOS_SAP === true){
					
		// 		if(obj.COD_EST_COMP === "CR" || obj.COD_EST_COMP === "CER"){// CAMBIO DE 17/06/2022
		// 			datos_comprobantes= true;
		// 		//return;
		// 		}	
					
		// 		if(obj.VALIDAR_DATOS === true){
		// 		if(obj.COMPROBANTE1 !== obj.COMPROBANTE){	
		// 		arrayValiDatos.push(obj.COMPROBANTE);
		// 		contador_ValidaDat++;
		// 		}
				
		// 		if(obj.FECHA_PRUEBA !== ""){
		// 		if(obj.FECHA_PRUEBA !== obj.FECHA_COMP){	
		// 		arrayValiDatos.push(obj.COMPROBANTE);
		// 		contador_ValidaDat++;
		// 		}
		// 		}
			
		// 		if(obj.RUC_PRUEBA !== ""){
		// 		if(obj.RUC_PRUEBA !==  obj.RUC){	
		// 		arrayValiDatos.push(obj.COMPROBANTE);
		// 		contador_ValidaDat++;
				
		// 		}
		// 		}
					
		// 		}//01/09/2022	
				
		// 		if(obj.COMPROBANTE_PRUEBA !== "" && obj.COMPROBANTE_PRUEBA !== undefined){
		// 		if(obj.COMPROBANTE_ANTIGUO !== obj.COMPROBANTE){	
		// 		datos_comprobantes= true;
		// 		//return;
		// 		}
		// 		}
				
		// 		if(obj.FECHA_PRUEBA !== "" && obj.FECHA_PRUEBA !== undefined ){
		// 		if(obj.FECHA_ANTIGUA !== obj.FECHA_COMP){	
		// 			datos_comprobantes= true;
		// 		}
		// 		//return;
		// 		}
				
		// 		if(obj.TIPO_PRUEBA !== "" && obj.TIPO_PRUEBA !== undefined){
		// 		if(obj.COPIA_COD_TIPO !== obj.COD_TIPO_COMP){	
		// 			datos_comprobantes= true;
		// 		//return;
		// 		}
		// 		}
				
		// 		if(obj.RUC_COPIA1 !== "" && obj.RUC_COPIA1 !== undefined){
		// 		if(obj.RUC_COPIA1 !==  obj.RUC){	
		// 			datos_comprobantes= true;
		// 		//return;
		// 		}
		// 		}
				
		// 		if(obj.COPIA_RAZON !== "" && obj.COPIA_RAZON !== undefined){//24/07/2022
		// 		if(obj.COPIA_RAZON !==  obj.RAZON_SOCIAL){	
		// 		datos_comprobantes= true;
		// 		//return;
		// 		}	
		// 		}
				
		// 		if(obj.COPIA_GLOSA !== "" && obj.COPIA_GLOSA !== undefined){//cambio 09/06/2022
		// 		if(obj.COPIA_GLOSA !== obj.GLOSA){	
		// 			datos_comprobantes= true;
		// 		//return;
		// 		}
		// 		}
				
		// 		if(obj.COPIA_REFERENCIA !== ""  &&  obj.COPIA_REFERENCIA !== undefined){
		// 		if(obj.COPIA_REFERENCIA !== obj.REF_FACTURA){
		// 		datos_comprobantes= true;	
		// 		}	
		// 		}
							
		// 		if(obj.COPIA_ORDEN !== "" && obj.COPIA_ORDEN !== undefined){
		// 		if(obj.COPIA_ORDEN !==  obj.ORDEN_INT){
		// 		datos_comprobantes= true;	
		// 		}
		// 		}
				
		// 		if(obj.COPIA_VIAJES !== ""  && obj.COPIA_VIAJES !== undefined){
		// 		if(obj.VIAJES !==  obj.COPIA_VIAJES){
		// 			datos_comprobantes= true;	
		// 		}	
		// 		}
				
			
		// 		obj.desglose.forEach(function(rx){ 
				
		// 		if(rx.NUEVO_GASTOS !== "" && rx.NUEVO_GASTOS !== undefined){
		// 		if(rx.ANTIGUO_GASTO !== rx.COD_CONT){	
		// 			datos_comprobantes= true;
		// 			//return;
		// 		}
		// 		}
				
		// 		if(rx.ANTIGUO_CUENTA !== ""){//04/07/2022
		// 		if(rx.ANTIGUO_CUENTA !==rx.CUENTA_BANC){
		// 		datos_comprobantes= true;	
		// 		}	
		// 		}
				
		// 		if(rx.NUEVO_IND !== "" && rx.NUEVO_IND !== undefined ){
		// 		if(rx.ANTIGUO_IND !== rx.IND_IMP){	
		// 		datos_comprobantes= true;
		// 			//return;
		// 		}
		// 		}
				
		// 		if(rx.ANTIGUA_BASE !== ""){
		// 		if(rx.ANTIGUA_BASE	!== rx.BASE_IMP){
		// 			datos_comprobantes= true;
		// 	 	//return;
		// 		}
		// 		}
				
		// 		if(rx.ANTIGUO_IGV !== ""){//04/07/2022
		// 		if(rx.ANTIGUO_IGV	!== rx.IGV){
		// 			datos_comprobantes= true;
		// 	 	//return;
		// 		}	
		// 		}
				
				
		// 		if(rx.ANTIGUO_INAFECTO  !== ""){
		// 		if(rx.ANTIGUO_INAFECTO	!== rx.INAFECTO){
				
		// 	 	datos_comprobantes= true;
		// 	 	//return;
		// 		}
		// 		}
				
		// 	if(rx.imputacion !== undefined){
		// 	rx.imputacion.forEach(function(ys){
		// 	// for(var ob of ys.imputacion){	
		// 	if(ys.COPIA_KOSTL !== "" &&  ys.COPIA_KOSTL !== undefined ){		
		// 	if(ys.selectKeyagre !== ys.COPIA_KOSTL){//
		// 		datos_comprobantes= true;
		// 	 	//return;
		// 	}
		// 	}
			
			
		// 	if(ys.COPIA_PORCE !== "" &&  ys.COPIA_PORCE !== undefined){
		// 	if(ys.COPIA_PORCE !== ys.porcentajeII ){
		// 		datos_comprobantes= true;
		// 	 	//return;	
		// 	}
		// 	}
			
		// 	if(ys.COPIA_TOTAL !== "" && ys.COPIA_TOTAL !== undefined){
		// 	if(ys.IMP !== ys.COPIA_TOTAL ){/// corregir aqui 
		// 		datos_comprobantes= true;
		// 	 	//return;	
		// 	}
		// 	}
		// 	// }	
		// 	});
		// 	}
		// 	if(rx.movilidad !== undefined){
		// 	rx.movilidad.forEach(function(gh){
		// 	if(gh.COPIA_MFECHA !== "" && gh.COPIA_MFECHA !== undefined){	
		// 	if(gh.COPIA_MFECHA !== gh.FECHA){
		// 		datos_comprobantes= true;
		// 	 	//return;	
		// 	}
		// 	}
			
		// 	if(gh.COPIA_IMPTOTAL !== ""  && gh.COPIA_IMPTOTAL !== undefined){
		// 	if(gh.COPIA_IMPTOTAL !== gh.impTotalMov){
		// 		datos_comprobantes= true;
		// 	 	//return;	
		// 	}	
				
		// 	}	
		// 	});
		// 	}
			
		// 	}); 
		// 		if(datos_comprobantes){
		// 		datoscomprobantes.push(obj);	
		// 		}
		// 		}
		// 	});
			
		// 	var numero_prueba1 ="";
		// 	if(contador_ValidaDat > 0){
		// 	if(arrayValiDatos.join() !== ""){
		// 	const filteredArray = arrayValiDatos.filter(function(ele , pos){
		// 	 return arrayValiDatos.indexOf(ele) == pos;
		// 	}) 
		// 	numero_prueba1 =	"Lo(s) comprobate(s) :" + filteredArray.join(" , ");
		// 	}
			
		// 	MessageBox.warning("Debe validar o registrar los comprobante(s) \n " + numero_prueba1 + " antes de grabar .");
		// 	arrayValiDatos =[];
		// 	sap.ui.core.BusyIndicator.hide();
		// 	return;	
		// 	}
			
				
		// 	dataComprobante = datoscomprobantes ;
		// 	ModelProyect.setProperty("/datos_envio" , dataComprobante);
				
		// 	for (let items of dataComprobante) {
				
		// 		if(indiceComp.sId){
		// 			consultaTrue = true;
		// 			indiceComp = 0;
		// 			contadores01 = 0;
		// 		}
				
		// 		var serie = dataComprobante[indiceComp].COMPROBANTE.substring(1, 5);
		// 		var comprobante = dataComprobante[indiceComp].COMPROBANTE.split("-")[1];

		// 		if (dataComprobante[indiceComp].COD_TIPO_COMP !== "D5") {

		// 			if (dataComprobante[indiceComp].COMPROBANTE === undefined || dataComprobante[indiceComp].COMPROBANTE === "" || dataComprobante[indiceComp].COMPROBANTE === "---Seleccionar---") {
		// 				ModelProyect.setProperty("/compValState", "Error");
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 			} else {
		// 				ModelProyect.setProperty("/compValState", "None");
		// 			}

		// 			if (dataComprobante[indiceComp].TIPO_COMP === undefined || dataComprobante[indiceComp].TIPO_COMP === "") {
		// 				ModelProyect.setProperty("/tipCompValState", "Error");
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 			} else {
		// 				ModelProyect.setProperty("/tipCompValState", "None");
		// 			}
		// 			if (dataComprobante[indiceComp].FECHA_COMP === undefined || dataComprobante[indiceComp].FECHA_COMP === "") {
		// 				ModelProyect.setProperty("/fecCompValState", "Error");
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 			} else {
		// 				ModelProyect.setProperty("/fecCompValState", "None");
		// 			}

		// 			if (dataComprobante[indiceComp].RUC === "" || dataComprobante[indiceComp].RUC === undefined) {
		// 				ModelProyect.setProperty("/rucValState", "Error");
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 			} else {
		// 				ModelProyect.setProperty("/rucValState", "None");
		// 			}
					
		// 			if (dataComprobante[indiceComp].RAZON_SOCIAL === "" || dataComprobante[indiceComp].RAZON_SOCIAL === undefined) {//27/07/2022
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 			} 
					
		// 			if (dataComprobante[indiceComp].WAERS === "" || dataComprobante[indiceComp].WAERS === undefined) {
		// 				ModelProyect.setProperty("/estadoMone", "Error");
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 			} else {
		// 				ModelProyect.setProperty("/estadoMone", "None");
		// 			}

		// 			if (dataComprobante[indiceComp].GLOSA === "" || dataComprobante[indiceComp].GLOSA === undefined) {
		// 				ModelProyect.setProperty("/estadoglos", "Error");
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 			} else {
		// 				ModelProyect.setProperty("/estadoglos", "None");
		// 			}
					
		// 			if(dataComprobante[indiceComp].COD_TIPO_COMP === "KG" || dataComprobante[indiceComp].COD_TIPO_COMP === "KD"){
		// 				if(dataComprobante[indiceComp].REF_FACTURA === "" || dataComprobante[indiceComp].REF_FACTURA === undefined){
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);	
		// 				}
		// 			}
					
		// 			for (var xs of dataComprobante[indiceComp].desglose) {	
		// 			if (xs.COD_CONT === "" || xs.COD_CONT === undefined){
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 				sap.ui.core.BusyIndicator.hide();
						
		// 			}
					
		// 			if(xs.IND_IMP === "C2" || xs.IND_IMP === "C5"){//05/09/2022
		// 			if(xs.BASE_IMP === "" || xs.BASE_IMP === undefined || xs.BASE_IMP === "0.00"){
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 				sap.ui.core.BusyIndicator.hide();
						
		// 			}
		// 			}else{
		// 			if(xs.INAFECTO === "" || xs.INAFECTO === undefined || xs.INAFECTO === "0.00"){//25/07/2022
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 				sap.ui.core.BusyIndicator.hide();
						
		// 			}	
		// 			}
					
		// 			}
					
		// 		} else {

		// 			if (dataComprobante[indiceComp].WAERS === "" || dataComprobante[indiceComp].WAERS === undefined) {
		// 				ModelProyect.setProperty("/estadoMone", "Error");
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 			} else {
		// 				ModelProyect.setProperty("/estadoMone", "None");
		// 			}

		// 			if (dataComprobante[indiceComp].GLOSA === "" || dataComprobante[indiceComp].GLOSA === undefined) {
		// 				ModelProyect.setProperty("/estadoglos", "Error");
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 			} else {
		// 				ModelProyect.setProperty("/estadoglos", "None");
		// 			}
					
		// 			for (var xs of dataComprobante[indiceComp].desglose) {	//03/08/2022
		// 			if (xs.CUENTA_BANC === "" || xs.CUENTA_BANC === undefined){
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 				sap.ui.core.BusyIndicator.hide();
						
		// 			}
					
		// 			if(xs.IND_IMP === "C2" || xs.IND_IMP === "C5"){//05/09/2022
		// 			if(xs.BASE_IMP === "" || xs.BASE_IMP === undefined || xs.BASE_IMP === "0.00"){
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 				sap.ui.core.BusyIndicator.hide();
						
		// 			}
		// 			}else{
		// 			if(xs.INAFECTO === "" || xs.INAFECTO === undefined || xs.INAFECTO === "0.00"){//25/07/2022
		// 				contadores01++;
		// 				validacion_campos.push(items.COMPROBANTE);
		// 				sap.ui.core.BusyIndicator.hide();
						
		// 			}	
		// 			}
					
		// 			}
					
		// 		}
				 
		// 		if(consultaTrue){
		// 		  if (dataComprobante[indiceComp].COMPROBANTE.substring(1, 5) === serie && isNaN(serie) === true) {
		// 			if(dataComprobante[indiceComp].COD_TIPO_COMP === "KB" || dataComprobante[indiceComp].COD_TIPO_COMP === "KR"){//21/07/2022				
								
		// 		await that.validacion_sunat(items, indiceComp, contadores01);
								
		// 		   }			
		// 		 }
		// 		}
				
		// 		validacion_glose = false; ///nuevos cambios
		// 		if (dataComprobante[indiceComp].desglose.length > 0 && dataComprobante[indiceComp].DATOS_SAP === true) {
		// 			for (let items6 of dataComprobante[indiceComp].desglose) {
		// 				validacion_glose = true;
		// 				// dataComprobante[indiceComp].desglose.forEach(async function(items6){
		// 				if(items6.movilidad.length === 0 &&  dataComprobante[indiceComp].COD_TIPO_COMP ==="PM"){
							
		// 				var validacionComprobante	= "";
		// 				var validacionRuc = "";
						
		// 				if((dataComprobante[indiceComp].COMPROBANTE !== dataComprobante[indiceComp].COMPROBANTE_ANTIGUO) && dataComprobante[indiceComp].DATOS_SAP === true){
		// 				validacionComprobante = dataComprobante[indiceComp].COMPROBANTE_ANTIGUO;	
		// 				}else{
		// 				validacionComprobante = dataComprobante[indiceComp].COMPROBANTE;	
		// 				}
						
		// 				if((dataComprobante[indiceComp].RUC !== dataComprobante[indiceComp].RUC_COPIA) && dataComprobante[indiceComp].DATOS_SAP === true){
		// 				validacionRuc = dataComprobante[indiceComp].RUC_COPIA;	
		// 				}else{
		// 				validacionRuc = dataComprobante[indiceComp].RUC;	
		// 				}
						 
						 
		// 					var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_MOVILIDAD_DETSet?$filter=COMPROBANTE eq '" + validacionComprobante +
		// 					"' and COD_SAP eq  '" + dataComprobante[indiceComp].COD_SAP + "' and RUC eq '" + validacionRuc + "'";
		
		// 					jQuery.ajax({
		// 					type: "GET",
		// 					cache: false,
		// 					headers: {
		// 						"Accept": "application/json"
		// 					},
		// 					contentType: "application/json",
		// 					url: url,
		// 					async: true,
		// 					success: async function (data, textStatus, jqXHR) {
		// 						var datosM = data.d.results;
		// 						if (datosM.length > 0) {
		// 							//mov_validar="";
		// 						datosM.forEach(async function(mov){
								
		// 							var datosmovilidad = {
		// 								COMPROBANTE: mov.COMPROBANTE,
		// 								POSICDESGLO: parseFloat(mov.ID_MOVIL).toString(),
		// 								POSICMOV: mov.POSIC,
		// 								FECHA: mov.FECHA,
		// 								IMP_PERM: mov.IMP_PERM,
		// 								IMP_EXED: mov.IMP_EXED,
		// 								impTotalMov: mov.IMP_TOTAL
		// 							}
		
		// 							items6.movilidad.push(datosmovilidad);
		// 						});						
		// 						}else{
		// 						mov_validar +=dataComprobante[indiceComp].COMPROBANTE + " , ";
		// 						cont_mov++;	
		// 						}
					
		// 					},
		// 					error: function () {
		// 						MessageBox.error("Ocurrio un error al obtener los datos");
		// 						sap.ui.core.BusyIndicator.hide();
		// 					}
		// 				});	
		// 				}
						
		// 				if (items6.imputacion.length === 0 && dataComprobante[indiceComp].COD_TIPO_COMP !== "D5" && dataComprobante[indiceComp].COD_TIPO_COMP !== "DU") {
		// 					// validarCeco = false;
		// 					// ceco_validar += dataComprobante[indiceComp].COMPROBANTE + " , ";
		// 					// cont_ceco++;
		// 				var validacionComprobante	= "";
		// 				var validacionRuc = "";
		// 				if((dataComprobante[indiceComp].COMPROBANTE !== dataComprobante[indiceComp].COMPROBANTE_ANTIGUO) && dataComprobante[indiceComp].DATOS_SAP === true){
		// 				validacionComprobante = dataComprobante[indiceComp].COMPROBANTE_ANTIGUO;	
		// 				}else{
		// 				validacionComprobante = dataComprobante[indiceComp].COMPROBANTE;	
		// 				}
						
		// 				if((dataComprobante[indiceComp].RUC !== dataComprobante[indiceComp].RUC_COPIA) && dataComprobante[indiceComp].DATOS_SAP === true){
		// 				validacionRuc = dataComprobante[indiceComp].RUC_COPIA;	
		// 				}else{
		// 				validacionRuc = dataComprobante[indiceComp].RUC;	
		// 				}
							
		// 					var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_IMP_CECO_DETSet?$filter=COD_SAP eq '" + dataComprobante[indiceComp].COD_SAP +
		// 						"' and COMPROBANTE eq '" + validacionComprobante + "' and RUC eq '" + validacionRuc + "'";
		// 					await jQuery.ajax({
		// 						type: "GET",
		// 						cache: false,
		// 						headers: {
		// 							"Accept": "application/json"
		// 						},
		// 						contentType: "application/json",
		// 						url: url,
		// 						async: true,
		// 						success: async function (data, textStatus, jqXHR) {
		// 							var datos = data.d.results;
		// 							if (datos.length > 0) {
		// 								validarCeco = true;
		// 								//ceco_validar = "";
		// 								datos.forEach(async function (rs) {

		// 									var datitos = {
		// 										COMPROBANTE: rs.COMPROBANTE,
		// 										POSDESGLOSE: parseFloat(rs.ID_CECO).toString(),
		// 										//rx.POSIC,
		// 										POSICION: rs.POSICION,
		// 										WAERS: rs.WAERS,
		// 										KOSTL: rs.KOSTL,
		// 										IMP: rs.IMP.replaceAll(" ", ""),
		// 										IMP_TOTAL: rs.IMP_TOTAL.replaceAll(" ", ""),
		// 										porcentajeII: rs.PORCENTAJE,
		// 										selectKeyagre: rs.KOSTL

		// 									}
		// 									items6.imputacion.push(datitos);
		// 								});
		// 							validacion_centro = true;
		// 							}else{
		// 							ceco_validar += dataComprobante[indiceComp].COMPROBANTE + " , ";
		// 							cont_ceco++;
		// 							validarCeco = false;
		// 							}
										
									
		// 						},
		// 						error: function (er) {
		// 							MessageBox.error("Ocurrio un error al obtener el token");
		// 							sap.ui.core.BusyIndicator.hide();
		// 							console.log(er);
		// 						}
		// 					});
		// 				} else {
		// 					validarCeco = true;
		// 					validacion_centro = false;
		// 				}
		// 			}
		// 		} else {
		// 			if(dataComprobante[indiceComp].desglose.length < 1){
						
		// 			desglose_Validar += dataComprobante[indiceComp].COMPROBANTE + " , ";
		// 			validacion_glose = false; 
		// 			cont_desglose++;
		// 			}else if(dataComprobante[indiceComp].desglose.length > 0){//09/09/2022
					
		// 			for (let items9 of dataComprobante[indiceComp].desglose) {
		// 			if(items9.movilidad.length === 0 &&  dataComprobante[indiceComp].COD_TIPO_COMP ==="PM"){
		// 				mov_validar +=dataComprobante[indiceComp].COMPROBANTE + " , ";
		// 				cont_mov++;
		// 			}
				
		// 			if(items9.imputacion.length === 0 && dataComprobante[indiceComp].COD_TIPO_COMP !== "D5" && dataComprobante[indiceComp].COD_TIPO_COMP !== "DU"){
		// 				ceco_validar += dataComprobante[indiceComp].COMPROBANTE + " , ";
		// 				cont_ceco++;
		// 				validarCeco = false;
		// 			}else{
		// 			validacion_centro = false;	
		// 			}
				
		// 			}
		// 		}
		// 		}
		// 		if (dataComprobante[indiceComp].archivoAd.length > 0) {
		// 			validarArchivo = true
		// 		} else {
		// 			adjunto_validar += dataComprobante[indiceComp].COMPROBANTE + " , ";
		// 			cont_adjunto++;
		// 		}
				
		// 		indiceComp++;
				
		// 	}
			
		// 	var numero_prueba="";
		// 	if(contadores01 > 0){
		// 	if(validacion_campos.join() !== ""){
		// 	const filteredArray = validacion_campos.filter(function(ele , pos){
		// 	 return validacion_campos.indexOf(ele) == pos;
		// 	}) 
		// 	numero_prueba =	"Lo(s) comprobate(s) :" + filteredArray.join(" , ");
		// 	}
			
		// 	MessageBox.warning("Debes de llenar los campos faltantes .\n " + numero_prueba);
		// 	arrayTabla = [];
		// 	sap.ui.core.BusyIndicator.hide();
		// 	return;	
		// 	}

		// 	if (validacion_glose === false && dataComprobante.length > 0 && cont_desglose > 0) {
		// 		MessageBox.warning("Los comprobantes " + desglose_Validar + " deben de tener un  desglose antes de guardar . ", {
		// 			actions: ["Aceptar"],
		// 			title: "Advertencia",
		// 			emphasizedAction: "",
		// 			onClose: function (sAction) {
		// 				if (sAction === "Aceptar") {
		// 					desglose_Validar = "";
		// 					arrayTabla = [];
						
		// 				}
		// 					sap.ui.core.BusyIndicator.hide();
		// 			}
		// 		});
		// 		return;
		// 	}
			
		// 		if (cont_mov > 0 && mov_validar.length > 0) {
		// 		MessageBox.warning("Los comprobantes " + mov_validar + " deben tener movilidad", {
		// 			actions: ["Aceptar"],
		// 			emphasizedAction: "",
		// 			onClose: async function (sAction) {
		// 				if (sAction === "Aceptar") {
		// 					mov_validar = "";
		// 					arrayTabla = [];
							
		// 				}
		// 				sap.ui.core.BusyIndicator.hide();
		// 			}
		// 		});
		// 		return;
		// 	}

		// 	if (cont_ceco > 0 && ceco_validar.length > 0) {
		// 		MessageBox.warning("Los comprobantes " + ceco_validar + " deben tener centro de costo", {
		// 			actions: ["Aceptar"],
		// 			emphasizedAction: "",
		// 			onClose: async function (sAction) {
		// 				if (sAction === "Aceptar") {
		// 					ceco_validar = "";
		// 					arrayTabla = [];
							
		// 				}
		// 				sap.ui.core.BusyIndicator.hide();
		// 			}
		// 		});
		// 		return;
		// 	}
			
		
		// 	if (cont_adjunto > 0 && adjunto_validar.length > 0) {
		// 		MessageBox.warning("Los comprobantes " + adjunto_validar + " deben tener adjuntos.", {
		// 			actions: ["Aceptar"],
		// 			emphasizedAction: "",
		// 			onClose: async function (sAction) {
		// 				if (sAction === "Aceptar") {
		// 					adjunto_validar = "";
		// 					arrayTabla = [];
							
		// 				}
		// 				sap.ui.core.BusyIndicator.hide();
		// 			}
		// 		});
		// 		return;

		// 	}

		// 	// if (arrayestructura.length > 0) {
		// 	// 	arrayestructura.forEach(function (items03) {
		// 	// 		if (data4.estadoCp === "0" || data4.estadoCp === "2" || data4.estadoCp === "4") {
		// 	// 			var mostrar = {
		// 	// 				monstrar_estadoCp: monstrar_estadoCp,
		// 	// 				comprobante: items03.numeroSerie + "-" + items03.numero,
		// 	// 			};
		// 	// 			arrayTabla.push(mostrar);
		// 	// 		}
		// 	// 	});
		// 	// }

		// 	if (arrayTabla.length > 0) {
		// 		that.tabla_consultaG(arrayTabla);
		// 		return;
		// 	}
		
			
		// 	MessageBox.information("Se guardarán los datos .\n ¿Desea Continuar?.", {
		// 		actions: ["Guardar", "Cancelar"],
		// 		onClose: async function (sAction) {
		// 			if (sAction === "Guardar") {
						
		// 				if (datos_Eliminar !== undefined && datos_Eliminar.length > 0) { 
		// 					await that.eliminar_comprobantes(datos_Eliminar);
		// 				}

		// 				if (dataComprobante.length > 0) {

		// 					//scastillo	- Conversion Dolares
		// 					let OnlyDolarComp = that.TransformDolarComps(dataComprobante);
		// 					//scastillo	- Conversion Dolares

		// 					dataComprobante.forEach(function (items, i) {
							
		// 						items.validacion_guardado = true;	//30062022
		// 						//scastillo	- Conversion Dolares	
		// 						let TotalReal = OnlyDolarComp.find(obj => obj.COMPROBANTE === items.COMPROBANTE && obj.RUC === items.RUC);//21/07/2022
		// 						items.totales1 = TotalReal === undefined ? items.totales : TotalReal.totales;
		// 						//scastillo	- Conversion Dolares

		// 						var FECHA_COMP = items.FECHA_COMP.replaceAll("/", "");
		// 						var formato = FECHA_COMP.substring(8, 4) + FECHA_COMP.substring(4, 2) + FECHA_COMP.substring(2, 0);
								
		// 						//-----------------------------validando el comprobante electronico-------
		// 						var serie = items.COMPROBANTE.substring(0, 4);
		// 						var comprobante = items.COMPROBANTE.split("-")[1];
								
		// 						validacion_glose = false;
		// 						if (items.desglose.length > 0) {

		// 							items.desglose.forEach(async function (items2) {
		// 								validacion_glose = true;

		// 								if (items.COD_EST_COMP !== "CA" && items.COD_EST_COMP !== "C" && items.COD_EST_COMP !== "COM") {
		// 									switch (items.COD_TIPO_COMP) {
		// 									case "KH":
												
		// 											items.COD_EST_COMP = "O";
		// 											items.EST_COMP = "OBSERVADO"; 
		// 											items.iconComp = "sap-icon://vds-file";
		// 											items.stateComp = "Information";
		// 										break;
		// 									case "KR"://cambio de 04/06/2022
												
		// 										if (parseFloat(items.totales1) > 700) {
		// 											items.COD_EST_COMP = "O";
		// 											items.EST_COMP = "OBSERVADO";
		// 											items.iconComp = "sap-icon://vds-file";
		// 											items.stateComp = "Information";
		// 											ModelProyect.refresh(true);
		// 										}else if (parseFloat(items.totales1) > 400) {
		// 											if (items2.COD_CONT === "013") {
		// 												items.COD_EST_COMP = "O";
		// 												items.EST_COMP = "OBSERVADO";
		// 												items.iconComp = "sap-icon://vds-file";
		// 												items.stateComp = "Information";
		// 												ModelProyect.refresh(true);
		// 											}else{
		// 											items.COD_EST_COMP = "CPA";
		// 											items.EST_COMP = "COMP. PEND. APR.";
		// 											items.iconComp = "sap-icon://pending";
		// 											items.stateComp = "Warning";
		// 											ModelProyect.refresh(true);	
		// 											}
														
		// 										}else{
		// 											items.COD_EST_COMP = "CPA";
		// 											items.EST_COMP = "COMP. PEND. APR.";
		// 											items.iconComp = "sap-icon://pending";
		// 											items.stateComp = "Warning";
		// 											ModelProyect.refresh(true);
		// 										}

		// 										break;
		// 									case "KD":
		// 										if (parseFloat(items.totales1) > 700) {
		// 											items.COD_EST_COMP = "O";
		// 											items.EST_COMP = "OBSERVADO";
		// 											items.iconComp = "sap-icon://vds-file";
		// 											items.stateComp = "Information";
		// 											ModelProyect.refresh(true);
		// 										} else {
		// 											items.COD_EST_COMP = "CPA";
		// 											items.EST_COMP = "COMP. PEND. APR.";
		// 											items.iconComp = "sap-icon://pending";
		// 											items.stateComp = "Warning";
		// 											ModelProyect.refresh(true);
		// 										}
		// 										break;
		// 									case "KG":
		// 										if (parseFloat(items.totales1) > 700) {
		// 											items.COD_EST_COMP = "O";
		// 											items.EST_COMP = "OBSERVADO";
		// 											items.iconComp = "sap-icon://vds-file";
		// 											items.stateComp = "Information";
		// 											ModelProyect.refresh(true);
		// 										} else {
		// 											items.COD_EST_COMP = "CPA";
		// 											items.EST_COMP = "COMP. PEND. APR.";
		// 											items.iconComp = "sap-icon://pending";
		// 											items.stateComp = "Warning";
		// 											ModelProyect.refresh(true);
		// 										}
		// 										break;
		// 									case "KT":
		// 										if (parseFloat(items.totales1) > 700) {
		// 											items.COD_EST_COMP = "O";
		// 											items.EST_COMP = "OBSERVADO";
		// 											items.iconComp = "sap-icon://vds-file";
		// 											items.stateComp = "Information";
		// 											ModelProyect.refresh(true);
		// 										} else {
		// 											items.COD_EST_COMP = "CPA";
		// 											items.EST_COMP = "COMP. PEND. APR.";
		// 											items.iconComp = "sap-icon://pending";
		// 											items.stateComp = "Warning";
		// 											ModelProyect.refresh(true);
		// 										}
		// 										break;
		// 									case "KV":
		// 										if (parseFloat(items.totales1) > 700) {
		// 											items.COD_EST_COMP = "O";// nuevo campo 07/06/2022
		// 											items.EST_COMP = "OBSERVADO";
		// 											items.iconComp = "sap-icon://vds-file";
		// 											items.stateComp = "Information";
		// 											ModelProyect.refresh(true);
		// 										} else {
		// 											items.COD_EST_COMP = "CPA";
		// 											items.EST_COMP = "COMP. PEND. APR.";
		// 											items.iconComp = "sap-icon://pending";
		// 											items.stateComp = "Warning";
		// 											ModelProyect.refresh(true);
		// 										}
		// 										break;
		// 									default:
		// 										items.COD_EST_COMP = "CPA";
		// 										items.EST_COMP = "COMP. PEND. APR.";
		// 										items.iconComp = "sap-icon://pending";
		// 										items.stateComp = "Warning";
		// 										ModelProyect.refresh(true);
		// 										break;
		// 									}
		// 								}else if(items.COD_EST_COMP === "CA"){
		// 										items.COD_EST_COMP = "CA";
		// 										items.EST_COMP = "COMP. APROBADO";
		// 										items.iconComp = "sap-icon://accept";
		// 										items.stateComp = "Success";
		// 										 nivel_aprob = items.NIVEL_AP;//cambio de 04/06/2022
		// 										 validacion_aprobado = true ;
		// 										ModelProyect.refresh(true);
		// 								}else if(items.COD_EST_COMP === "C"){
		// 										items.COD_EST_COMP = "C";
		// 										items.EST_COMP = "CONTABILIZADO";
		// 										 nivel_aprob = items.NIVEL_AP;//cambio de 04/06/2022
		// 										 validacion_aprobado = true ;
		// 										ModelProyect.refresh(true);
		// 								}else if(items.COD_EST_COMP === "COM"){
		// 										items.COD_EST_COMP = "COM";
		// 										items.EST_COMP = "COMPENSADO";
		// 										nivel_aprob = items.NIVEL_AP;//cambio de 04/06/2022
		// 										validacion_aprobado = true ;
		// 										ModelProyect.refresh(true);
		// 								}
										
		// 								if(items.COD_TIPO_COMP === "KX"){//24/07/2022
		// 							  		TipoNif ="0";
		// 								}else 
		// 								if (items.RUC.length === 8) {
		// 									TipoNif = "1";
		// 								} else if (items.RUC.length === 11) {
		// 									TipoNif = "6";
		// 								}

		// 								if (parseFloat(ImporteRend) >= parseFloat(importe)) {
		// 									estado_sol = "R";

		// 								} else {
		// 									estado_sol = "PAR";

		// 								}
									
		// 								var nuevocomprobante = "";
		// 								var nuevoruc ="";
		// 								var correo_electronico ="";

		// 								if (items.COMPROBANTE_ANTIGUO !== "" && items.COMPROBANTE_ANTIGUO !== undefined && items.DATOS_SAP === true) {
		// 									nuevocomprobante = items.COMPROBANTE_ANTIGUO;
		// 								} else {
		// 									nuevocomprobante = items.COMPROBANTE;
		// 								}
										
		// 								if(items.RUC_COPIA !==  "" && items.RUC_COPIA !== undefined && items.DATOS_SAP === true){
		// 									nuevoruc = items.RUC_COPIA;
		// 								}else{
		// 									nuevoruc = items.RUC;
		// 								}
										
		// 								if(items.EMAIL_AD_USOL !== "" && items.EMAIL_AD_USOL !== undefined){//04/07/2022
		// 									correo_electronico = items.EMAIL_AD_USOL;
		// 								}else{
		// 									correo_electronico = correouser;
		// 								}
										

		// 								ModelProyect.refresh(true);
		// 								if(items2.imputacion.length > 0){
		// 								items2.imputacion.forEach(function (items_09) {
										  
		// 									var desglose = {

		// 										"COMPROBANTE": nuevocomprobante,
		// 										"POSIC": items2.POSIC.toString(), //desglose
		// 										"TIPO_COMP": items.COD_TIPO_COMP,
		// 										"FECHA_COMP": formato,
		// 										"RUC": nuevoruc,
		// 										"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 										"WAERS": items.WAERS,
		// 										"IND_IMP": items2.IND_IMP,
		// 										"TIPO_GASTO": "",
		// 										"KOSTL": items_09.selectKeyagre,
		// 										"BASE_IMP": items2.BASE_IMP,
		// 										"IGV": items2.IGV,
		// 										"INAFECTO": items2.INAFECTO,
		// 										"TOTAL": items2.TOTAL,
		// 										"EST_COMP": items.COD_EST_COMP, //comprobante , dejarlo asi
		// 										"EST_SOLI": estado_sol, // solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 										"ADJUNTO": "",
		// 										"GLOSA": items.GLOSA,
		// 										"NROD0": items.NROD0,
		// 										"DOC_PAGO": "",
		// 										"COD_SAP": items.COD_SAP,
		// 										"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 										"NIVEL_AP": nivel_aprob, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 										"COD_CONT": items2.COD_CONT,
		// 										"FECHA_APR": "", //VACIO 
		// 										"IMP_RENDIDO": ImporteRend,
		// 										"COD_REPO": items.COD_REPO,
		// 										"COD_REEM": "",
		// 										"ORDEN_INT": items.ORDEN_INT,
		// 										"VIAJES": items.VIAJES,
		// 										"TIPO_NIF": TipoNif,
		// 										"CUENTA_BANC": items2.CUENTA_BANC,
		// 										"FECHA_ENV": "",
		// 										"REF_FACTURA": items.REF_FACTURA,
		// 										"ID_CECO": "",
		// 										"TIPO_REND": "ER",
		// 										"LIBERADOR1": "",
		// 										"LIBERADOR2": "",
		// 										"EDIT_COMP": items.COMPROBANTE_EDITADO,
		// 										"EDIT_RUC": items.RUC_EDITADO,
		// 										"FECHA_APRO1": "",
		// 										"FECHA_APRO2": "",
		// 										"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		// 										"COD_CONT2": items2.COD_CONT2,
		// 										"EMAIL_AD_USOL":correo_electronico,
		// 										"FECHA_ABON" : FECHA_ABON,
		// 										"COD_SAP_LIB2":items.COD_SAP_LIB2,
		// 										"DOC_COMP"	:items.DOC_COMP,
		// 	    			    				"DOC_CONT"	:items.DOC_CONT,
		// 	    			    				"DOC_PAGO_SOLICITUD" : nroDocPago,
		// 	    			    				"FECHA_CONT":items.FECHA_CONT,
		// 										"FECHA_COMPENSA":items.FECHA_COMPENSA,
												 
		// 									}

		// 									arraygrabar.push(desglose);

		// 								});
		// 								}else{
										
		// 								var desglose1 = {

		// 										"COMPROBANTE": nuevocomprobante,
		// 										"POSIC": items2.POSIC.toString(), //desglose
		// 										"TIPO_COMP": items.COD_TIPO_COMP,
		// 										"FECHA_COMP": formato,
		// 										"RUC": nuevoruc,
		// 										"RAZON_SOCIAL": items.RAZON_SOCIAL,
		// 										"WAERS": items.WAERS,
		// 										"IND_IMP": items2.IND_IMP,
		// 										"TIPO_GASTO": "",
		// 										"KOSTL": "",
		// 										"BASE_IMP": items2.BASE_IMP,
		// 										"IGV": items2.IGV,
		// 										"INAFECTO": items2.INAFECTO,
		// 										"TOTAL": items2.TOTAL,
		// 										"EST_COMP": items.COD_EST_COMP, //comprobante , dejarlo asi
		// 										"EST_SOLI": estado_sol, // solo para enviar aprobar poner PA. , GUARDO  SOLICITUD GRABADA
		// 										"ADJUNTO": "",
		// 										"GLOSA": items.GLOSA,
		// 										"NROD0": items.NROD0,
		// 										"DOC_PAGO": "",
		// 										"COD_SAP": items.COD_SAP,
		// 										"FECHA_REG": fecha, //FECHA DEL SISTEMA.
		// 										"NIVEL_AP": nivel_aprob, //PARA ENVIO 1 , Y PARA GRABAR 0 
		// 										"COD_CONT": items2.COD_CONT,
		// 										"FECHA_APR": "", //VACIO 
		// 										"IMP_RENDIDO": ImporteRend,
		// 										"COD_REPO": items.COD_REPO,
		// 										"COD_REEM": "",
		// 										"ORDEN_INT": items.ORDEN_INT,
		// 										"VIAJES": items.VIAJES,
		// 										"TIPO_NIF": TipoNif,
		// 										"CUENTA_BANC": items2.CUENTA_BANC,
		// 										"FECHA_ENV": "",
		// 										"REF_FACTURA": items.REF_FACTURA,
		// 										"ID_CECO": "",
		// 										"TIPO_REND": "ER",
		// 										"LIBERADOR1": "",
		// 										"LIBERADOR2": "",
		// 										"EDIT_COMP": items.COMPROBANTE_EDITADO,
		// 										"EDIT_RUC": items.RUC_EDITADO,
		// 										"FECHA_APRO1": "",
		// 										"FECHA_APRO2": "",
		// 										"ID_DOC_SRV": items.ID_DOC_SRV.toString(),
		// 										"COD_CONT2": items2.COD_CONT2,
		// 										"EMAIL_AD_USOL":correo_electronico,
		// 										"FECHA_ABON" : FECHA_ABON,
		// 										"COD_SAP_LIB2"	:items.COD_SAP_LIB2,
		// 										"DOC_COMP"	:items.DOC_COMP,
		// 	    			    				"DOC_CONT"	:items.DOC_CONT,
		// 	    			    				"DOC_PAGO_SOLICITUD" : nroDocPago,
		// 	    			    				"FECHA_CONT":items.FECHA_CONT,
		// 										"FECHA_COMPENSA":items.FECHA_COMPENSA,
		// 									}	
											
		// 									arraygrabar.push(desglose1);
											
											
		// 								}
										
		// 							});
		// 						}

		// 					});
						
		// 					ModelProyect.refresh(true);
		// 					sap.ui.core.BusyIndicator.show(0);
							
		// 					if(validacion_aprobado === false){
		// 						arraygrabar.forEach(function(xs){
		// 						if(xs.COD_EST_COMP !== "CA" || xs.COD_EST_COMP !== "C" || xs.COD_EST_COMP !== "COM"){
		// 							xs.NIVEL_AP ="0";	
		// 						}
		// 						});
									
		// 					}
		// 					ModelProyect.refresh(true);

		// 					var datos = {
		// 						"MENSAJE": "X",
		// 						"ZET_UPD_COMPROSet": arraygrabar
		// 					}

		// 					$.ajax({
		// 						url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
		// 						type: "GET",
		// 						headers: {
		// 							"x-CSRF-Token": "Fetch"
		// 						}
		// 					}).always(function (data, status, response) {
		// 						var token = response.getResponseHeader("x-csrf-token");
		// 						$.ajax({
		// 							url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_UPD_COMPRO_CABSet",
		// 							method: "POST",
		// 							headers: {
		// 								"x-CSRF-Token": token
		// 							},
		// 							async: false,
		// 							contentType: "application/json",
		// 							dataType: "json",
		// 							data: JSON.stringify(datos),
		// 						}).always(function (data, status, response) {
		// 							arrSelected = [];
		// 							var datos = data.d.MENSAJE;
		// 							ModelProyect.setProperty("/mensaje_sap" ,datos);
		// 							ModelProyect.refresh(true);
		// 							//that.fnGuardar();
		// 							that.guardarImputacion("");

		// 						});

		// 					});
		// 				} else {
							
		// 					// sap.ui.core.BusyIndicator.show(0);
		// 					let dataComprobante1 = ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 					let EliminarComp = []
		// 					dataComprobante1.map(function (obj) {
		// 						obj.DeleteArchivo.map(function (obj2) {
		// 							var form = new FormData();
		// 							form.append("cmisaction", "delete");
		// 							EliminarComp.push({
		// 								URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/" + obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] +"." + obj.ID_DOC_SRV.toString()+"/" + obj2.Name,
		// 								data: form
		// 							});
		
		// 						});
									
								
		// 						obj.DeleteArchivo = [];
		// 					});
							
		// 					await that.EliminacionFolder(EliminarComp);
		
		// 					// let  Comprobantes	= dataComprobante.map((obj,index)=> obj.NROD0 + "." +obj.COMPROBANTE)
		// 					// let	 Folders		= await that.BuscarFolder(Comprobantes);
		
		// 					// let ComprobantesNoCreados  = Folders.filter(obj=> obj.exception ).map(function(obj){
		
		// 					let ComprobantesNoCreados = dataComprobante1.map(function (obj) {
		
		
		// 						var form = new FormData();
		// 						form.append("cmisaction", "createFolder");
		// 						form.append("propertyId[0]", "cmis:objectTypeId");
		// 						form.append("propertyValue[0]", "cmis:folder");
		// 						form.append("propertyId[1]", "cmis:name");
		// 						form.append("propertyValue[1]", obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] + "." + obj.ID_DOC_SRV.toString() );
		// 						// obj.message.replace("/QAS/AdjuntosER/","")
		// 						return {
		// 							URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER",
		// 							data: form
		// 						};
		// 					});
		
		// 					await that.CreacionDocumento_Folder(ComprobantesNoCreados);
		// 					// let a = dataComprobante.filter(obj=> Folders.findIndex(obj1=> obj.NROD0 + "." +obj.COMPROBANTE === obj1.message.replace("/QAS/AdjuntosER/","") ) !== -1 );
		
		// 					let ArchivosAdjuntos = [];
		// 					dataComprobante1.map(function (obj) {
		// 						obj.archivoAd.map(function (obj2) {
		// 							if (obj2.File !== undefined) {
		// 								var form = new FormData();
		// 								form.append("cmisaction", "createDocument");
		// 								form.append("propertyId[0]", "cmis:objectTypeId");
		// 								form.append("propertyValue[0]", "cmis:document");
		// 								form.append("propertyId[1]", "cmis:name");
		// 								form.append("propertyValue[1]", obj2.Name);
		// 								form.append("datafile", obj2.File);
		// 							}
		// 							// return {URL:"/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/"+ obj.NROD0 + "." +obj.COMPROBANTE , data: form};
		// 							ArchivosAdjuntos.push({
		// 								URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/" + obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] + "." + obj.ID_DOC_SRV.toString(),
		// 								data: form
		// 							});
		// 							obj2.Service = true;
		// 							obj2.Base64 = "";
		// 						});
		// 					});
		
		// 					await that.CreacionDocumento_Folder(ArchivosAdjuntos);
							
		// 					sap.ui.core.BusyIndicator.hide();
		// 					MessageToast.show("¡Registro guardado exitósamente!");
							
		// 				dataComprobante1.map(function(xs){
		// 				xs.VALIDA_GRABADO = true;//27/07/2022	
		// 				});
		// 				ModelProyect.refresh(true);
		// 				}
		// 			}
		// 		}
		// 	});
		// 	sap.ui.core.BusyIndicator.hide();
		// 	//}
		// },

		TransformDolarComps: function (dataComprobante) {
			const that = this;
			const oView = this.getView();
			var ModelProyect		= oView.getModel("Proyect");
			const TipoCambio		= ModelProyect.getProperty("/TipoCambio");
			let ComprobantesDolares = JSON.parse(JSON.stringify(dataComprobante.filter(obj => obj.WAERS !== "PEN")));

			ComprobantesDolares.map(function (obj) {

				TipoCambio.sort(function (a, b) {
					let distancea = Math.abs(that.FormatDate(obj.FECHA_COMP, "/") - that.FormatDate(a.GDATU, "."));
					let distanceb = Math.abs(that.FormatDate(obj.FECHA_COMP, "/") - that.FormatDate(b.GDATU, "."));
					return distancea - distanceb;
				});

				let beforedates = TipoCambio.filter(function (d) {
					return that.FormatDate(d.GDATU, ".") - that.FormatDate(obj.FECHA_COMP, "/") <= 0;
				});

				let TipoDeCambio = parseFloat(beforedates[0].UKURS);
				obj.totales = obj.totales * TipoDeCambio;
				// TipoCambio.filter(obj1=> this.FormatDate(obj1.GDATU) )
			});

			return ComprobantesDolares;
		},
		FormatDate: function (date, separador) {
			let Dia = date.split(separador)[0];
			let Mes = date.split(separador)[1];
			let Año = date.split(separador)[2];
			return new Date(Año + "." + Mes + "." + Dia);
		},

		// eliminar_comprobantes: async function (datos_Eliminar) {
		// 	var oView = this.getView();
		// 	var that = this;
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	var array_Eliminar = [];
		// 	var dataComprobante = ModelProyect.getProperty("/DataComprobanteConfirmacion");

		// 	datos_Eliminar.forEach(function (items_09) {
		// 		items_09.desglose.forEach(function (items_06) {

		// 			var datitos = {

		// 				"COD_REPO": "",
		// 				"DOC_PAGO": "",
		// 				"COD_REEM": "",
		// 				"NROD0": items_09.NROD0,
		// 				"COD_SAP": items_09.COD_SAP,
		// 				"COMPROBANTE": items_09.COMPROBANTE,
		// 				"POSIC": items_06.POSIC.toString(),//cambio
		// 				"TIPO_COMP": items_09.COD_TIPO_COMP,
		// 				"RUC": items_09.RUC,
		// 				"MENSAJE": ""

		// 			}
		// 			array_Eliminar.push(datitos);

		// 		});

		// 	});

		// 	var datos = {
		// 		"FLAG": "X",
		// 		"ZET_DEL_COMPROBANTESSet": array_Eliminar
		// 	};
			
		// 	$.ajax({
		// 		url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
		// 		type: "GET",
		// 		headers: {
		// 			"x-CSRF-Token": "Fetch"
		// 		}
		// 	}).always(function (data, status, response) {
		// 		var token = response.getResponseHeader("x-csrf-token");
		// 		$.ajax({
		// 			url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_DEL_COMPROBANTES_CABSet",
		// 			method: "POST",
		// 			headers: {
		// 				"x-CSRF-Token": token
		// 			},
		// 			async: true,
		// 			contentType: "application/json",
		// 			dataType: "json",
		// 			data: JSON.stringify(datos),
		// 		}).always(async function (data, status, response) {
		// 			var COD_SAP = ModelProyect.getProperty("/COD_SAP");
					
		// 			let EliminarComp = datos_Eliminar.map(function (obj) {
		// 				var form = new FormData();
		// 				form.append("cmisaction", "deleteTree");
		// 				return {
		// 					URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/" + obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] + "." + obj.ID_DOC_SRV,
		// 					data: form
		// 				}
		// 			});

		// 			await that.EliminacionFolder(EliminarComp);
		// 			ModelProyect.setProperty("/datos_Eliminar", []);
		// 			dataComprobante.map(function(xs){
		// 			xs.VALIDA_GRABADO = true;//27/07/2022	
		// 			});
		// 			ModelProyect.refresh(true);
		// 		});
		// 	});

		// },

		// guardarImputacion: function (env) {
		// 	var oView				= this.getView();
		// 	var ModelProyect		= oView.getModel("Proyect");
		// 	var beneficiarios2		= ModelProyect.getProperty("/beneficiarios2");
		// 	var Nombre_Beneficiario = ModelProyect.getProperty("/Nombre_Beneficiario"); //NOMBRE DEL BENEFICIARIO
		// 	var COD_SAP 			= ModelProyect.getProperty("/COD_SAP");
		// 	var dataComprobante 	= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var that				= this;
		// 	var array6				= [];
		// 	var validacionComprobante	= "";
		// 	var validacionRuc			= "";
		// 	var BaseImp               = "";
		// 	var Porcentaje            = ""; 
		// 	var Calculo               = "";
		// 	var calculoImp            = "";
		// 	var Inafecto			  ="";
		
		// 	if(validacion_centro !== true){
			
		// 	dataComprobante.forEach(function (items2) {
		// 			var contador_impu = 0;
		// 		items2.desglose.forEach(function (items1) {
				
		// 			items1.imputacion.forEach(function (rs) {
				
		// 			if((items2.COMPROBANTE !== items2.COMPROBANTE_ANTIGUO) && items2.DATOS_SAP === true){ // 09/09/2022
		// 				validacionComprobante = items2.COMPROBANTE;	
		// 			}else{
		// 				validacionComprobante = items2.COMPROBANTE;	
		// 			}
					
		// 			if((items2.RUC !== items2.RUC_COPIA) && items2.DATOS_SAP === true){
		// 				validacionRuc = items2.RUC;	
		// 			}else{
		// 				validacionRuc = items2.RUC;	
		// 			}	
					
		// 			if(items1.IND_IMP !== "C0"){
		// 				BaseImp = items1.BASE_IMP;
		// 				Porcentaje = (rs.porcentajeII.replaceAll("%","") /100);
		// 				Calculo  = (parseFloat(BaseImp) * parseFloat(Porcentaje)).toFixed(2);
		// 				if(Calculo !== rs.IMP){
		// 				calculoImp = Calculo;
							
		// 				}else {
		// 				calculoImp = rs.IMP;	
							
		// 				}
						
		// 			}else {
		// 				Inafecto = items1.INAFECTO;
		// 				Porcentaje = (rs.porcentajeII.replaceAll("%","") /100);
		// 				Calculo  = (parseFloat(Inafecto) * parseFloat(Porcentaje)).toFixed(2);
		// 				if(Calculo !== rs.IMP){
		// 				calculoImp = Calculo;
							
		// 				}else{
		// 				calculoImp	= rs.IMP;
		// 				}
		// 			}	
				
						
		// 				contador_impu++;
		// 				var infoimputa = {
		// 					"COMPROBANTE": validacionComprobante,
		// 					"BENEFICIARIO": Nombre_Beneficiario,
		// 					"PROVEEDOR": COD_SAP,
		// 					"POSICION": contador_impu.toString(),
		// 					"WAERS": rs.WAERS,
		// 					"KOSTL": rs.selectKeyagre,
		// 					"IMP": calculoImp,
		// 					"IMP_TOTAL": rs.IMP_TOTAL,
		// 					"PORCENTAJE": (parseFloat(rs.porcentajeII) + "%").toString(),
		// 					"RUC": validacionRuc,
		// 					"ID_CECO": rs.POSDESGLOSE.toString(),
		// 				}
		// 				array6.push(infoimputa);
		// 			});
				
		// 		});
		// 	});

		// 	var datos = { // falta 
		// 		"MENSAJE": "X",
		// 		"ZET_UPD_IMP_CECOSet": array6

		// 	}
		// 	try{
		// 		$.ajax({
		// 			url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
		// 			type: "GET",
		// 			headers: {
		// 				"x-CSRF-Token": "Fetch"
		// 			}
		// 		}).always(function (data, status, response) {
		// 			var token = response.getResponseHeader("x-csrf-token");
					
		// 			try{
		// 				$.ajax({
		// 					url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_UPD_IMP_CECO_CABSet",
		// 					method: "POST",
		// 					headers: {
		// 						"x-CSRF-Token": token
		// 					},
		// 					async: false,
		// 					contentType: "application/json",
		// 					dataType: "json",
		// 					data: JSON.stringify(datos),
		// 				}).always(function (data, status, response) {
		// 					//sap.ui.core.BusyIndicator.hide()
		// 					that.guardarmovilidad(env);
		// 				});
		// 			}catch(ex){
		// 				MessageBox.error("errror al guardar los centros de costos servicio /sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_UPD_IMP_CECO_CABSet");
		// 				console.log(ex);
		// 			}
	
		// 		});
		// 	}catch(e){
		// 		MessageBox.error("errror al obtener el token para guardar ceco del servicio /sap/opu/odata/sap/ZOD_RENDICIONES_SRV");
		// 		console.log(e);
		// 	}
			
		// }else{
		// 	dataComprobante.forEach(function (items2) {
		// 			//var contador_impu = 0;
		// 		items2.desglose.forEach(function (items1) {
				
		// 			items1.imputacion = [];
				
		// 		});
		// 	});	
		// 	that.guardarmovilidad(env);
		// 	///sap.ui.core.BusyIndicator.hide();
		// }
			
		
		
		// },

		// CreacionFolder: async function (NombreFolder) {

		// 	var form = new FormData();
		// 	form.append("cmisaction", "createFolder");
		// 	form.append("propertyId[0]", "cmis:objectTypeId");
		// 	form.append("propertyValue[0]", "cmis:folder");
		// 	form.append("propertyId[1]", "cmis:name");
		// 	form.append("propertyValue[1]", NombreFolder);

		// 	await $.ajax({
		// 		type: "POST",
		// 		url: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER",
		// 		data: form,
		// 		cache: false,
		// 		processData: false,
		// 		contentType: false,
		// 		async: true,
		// 		success: function (response) {

		// 		},
		// 		error: function (error) {

		// 		}
		// 	});

		// },

		// CreacionDocumento_Folder: async function (Sends) {
		// 	try {
				
		// 		Sends.map(function(send){
		// 		// send.URL = (location.hostname.includes("n8pid6w2h2") ? : "/cmis/0586704171cab1ea3b1f93d5/root/PRD/AdjuntosER/");	
		// 		if(!location.hostname.includes("n8pid6w2h2")){
		// 		send.URL =	send.URL.replace("QAS","PRD")
		// 		}
		// 		})
				
		// 		const results = await Promise.all(Sends.map(send =>
		// 			// "/sap/fiori/irequestbvregistrodocliq"+
		// 			// send.URL = send.URL.includes("n8pid6w2h2") ? "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER": "/cmis/0586704171cab1ea3b1f93d5/root/PRD/AdjuntosER"	
					
		// 			fetch(HostName+send.URL, {
		// 				method: "POST",
		// 				body: send.data,
		// 				processData: false,
		// 				contentType: false,
		// 			})
		// 		))
		// 		const finalData = await Promise.all(results.map(result =>
		// 			result.json()));
		// 		return finalData;
		// 		console.log(finalData);
		// 	} catch (err) {
		// 		console.log(err);
		// 	}

		// },

		// BuscarFolder: async function (Sends) {
		// 	try {
		// 		const AmbienteRepository = location.hostname.includes("n8pid6w2h2") ? "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/": "/cmis/0586704171cab1ea3b1f93d5/root/PRD/AdjuntosER/"	
		// 		const results = await Promise.all(Sends.map(url =>
		// 			// "/sap/fiori/irequestbvregistrodocliq"+
		// 			fetch(HostName+AmbienteRepository + url, {
		// 				method: "GET",
		// 				processData: false,
		// 				contentType: false,
		// 				dataType: "json",
		// 			})
		// 		))
		// 		const finalData = await Promise.all(results.map(result =>
		// 			result.json()));
		// 		return finalData;
		// 		console.log(finalData);
		// 	} catch (err) {
		// 		console.log(err);
		// 	}

		// },

		// EliminacionFolder: async function (Sends) {
		// 	try {
		// 		Sends.map(function(send){
		// 		// send.URL = (location.hostname.includes("n8pid6w2h2") ? : "/cmis/0586704171cab1ea3b1f93d5/root/PRD/AdjuntosER/");	
		// 		if(!location.hostname.includes("n8pid6w2h2")){
		// 		send.URL =	send.URL.replace("QAS","PRD")
		// 		}
		// 		})
		// 		const results = await Promise.all(Sends.map(send =>
		// 			// send.URL = send.URL.includes("n8pid6w2h2") ? "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/": "/cmis/0586704171cab1ea3b1f93d5/root/PRD/AdjuntosER/"	
		// 			// "/sap/fiori/irequestbvregistrodocliq"+
		// 			fetch(HostName+send.URL, {
		// 				method: "POST",
		// 				body: send.data,
		// 				processData: false,
		// 				contentType: false,
		// 			})
		// 		))
		// 		const finalData = await Promise.all(results.map(result =>
		// 			result.json()));
		// 		return finalData;
		// 		console.log(finalData);
		// 	} catch (err) {
		// 		console.log(err);
		// 	}

		// },

		ChangePress: function (oEvent) {
			var that = this;
			var oView = this.getView();
			var oBindingContext = oEvent.getSource().getBindingContext("Proyect");
			var sPath = oBindingContext.getPath();
			var model = oBindingContext.getModel();
			//get the selected  data from the model 
			var data = model.getProperty(sPath);
			var ModelProyect = oView.getModel("Proyect");
			var COMPROBANTE = ModelProyect.getProperty("/COMPROBANTE");
			var dataComprobante = ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var CompChange = ModelProyect.getProperty("/CompChange");
			var COD_SAP = ModelProyect.getProperty("/COD_SAP");
			const AmbienteRepository = location.hostname.includes("n8pid6w2h2") ? "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/": "/cmis/0586704171cab1ea3b1f93d5/root/PRD/AdjuntosER/"	
			if (data.Base64 !== undefined && data.Base64 !== "") {

				let NombreArchivo = data.Name;
				let Base64 = data.Base64;
				const typeFile = "data:" + data.Type.toLowerCase() + ";base64,"
				const downloadLink = document.createElement("a");
				const fileName = NombreArchivo;
				downloadLink.href = typeFile + Base64;
				downloadLink.download = fileName;
				downloadLink.click();
			} else {
				CompChange = dataComprobante.filter(obj=> obj.keySeg === CompChange.keySeg);
				window.open(AmbienteRepository +CompChange[0].COD_SAP+"." +CompChange[0].NROD0 + "."+ CompChange[0].FECHA_COMP.split("/")[2]+ "." + CompChange[0].ID_DOC_SRV + "/" + data.Name);

				//var Document = await that.BuscarFolder([dataComprobante[0].NROD0+"."+ COMPROBANTE+"/"+data.Name ]);
				//   $.ajax({
				// type: "GET",
				// url: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/"+dataComprobante[0].NROD0+"."+ COMPROBANTE+"/"+data.Name,
				// cache: false,
				// processData:false,
				// contentType:false,
				// success: function (response) {
				// console.log(response);
				// Window.open(response);
				//	window.open(response);
				// 	},error: function(error){
				// 	}
				// });
			}

			// var Document = await that.BuscarFolder([dataComprobante[0].NROD0+"."+ COMPROBANTE+"/"+data.Name ]);
			// await  $.ajax({
			// 	type: "GET",
			// 	url: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/"+dataComprobante[0].NROD0+"."+ COMPROBANTE+"/"+data.Name,
			// 	cache: false,
			// 	processData:false,
			// 	contentType:false,
			// 	success: function (response) {
			// 	// console.log(response);
			// 	// Window.open(response);
			// 	window.open(response);
			// 	},error: function(error){
			// 	}
			// });

		},

		guardarmovilidad: function (env) {
			//sap.ui.core.BusyIndicator.hide()
			var oView				= this.getView();
			var ModelProyect		= oView.getModel("Proyect");
			var beneficiarios2		= ModelProyect.getProperty("/beneficiarios2");
			var COD_SAP 			= ModelProyect.getProperty("/COD_SAP");
			var Nombre_Beneficiario = ModelProyect.getProperty("/Nombre_Beneficiario");
			var dataComprobante 	= ModelProyect.getProperty("/DataComprobanteConfirmacion");
			var that				= this;
			var arrayMov			= [];
			var mensaje_sap 		=ModelProyect.getProperty("/mensaje_sap");
			var estado_enviar		=ModelProyect.getProperty("/estado_enviar");
			var  formatoMov         ="";
			var validacionComprobante	= "";
			var validacionRuc			= "";
			
			dataComprobante.forEach(function (its) {
				var contador_movili = 0;
				
				its.desglose.forEach(function (rs) {
					rs.movilidad.forEach(function (ob) {
						var fechaMov = ob.FECHA.replaceAll("/", "");
						
					if((its.COMPROBANTE !== its.COMPROBANTE_ANTIGUO) && its.DATOS_SAP === true){ // 09/09/2022
						validacionComprobante = its.COMPROBANTE;	
					}else{
						validacionComprobante = its.COMPROBANTE;	
					}
					
					if((its.RUC !== its.RUC_COPIA) && its.DATOS_SAP === true){
						validacionRuc = its.RUC;	
					}else{
						validacionRuc = its.RUC;	
					}
					
						if(fechaMov.substring(4,5) > "2"){
						formatoMov = fechaMov.substring(4, 8) + fechaMov.substring(2, 4) + fechaMov.substring(0, 2);	
						}else{
						//formatoMov = fechaMov;	
						formatoMov =fechaMov.substring(4,8)+fechaMov.substring(4,2)+fechaMov.substring(2,0);
							
						}
						
						var totalMov = parseFloat(ob.IMP_PERM) + parseFloat(ob.IMP_EXED)
						contador_movili++;
						var infoMov = {

							"COMPROBANTE": validacionComprobante,
							"POSIC": contador_movili.toString(),
							"COD_SAP": COD_SAP,
							"BENEFICIARIO": Nombre_Beneficiario,
							"FECHA": formatoMov,
							"IMP_PERM": ob.IMP_PERM,
							"IMP_EXED": ob.IMP_EXED,
							"IMP_TOTAL": parseFloat(totalMov).toFixed(2),
							"RUC": validacionRuc,
							"ID_MOVIL": ob.POSICDESGLO.toString(),
						}

						arrayMov.push(infoMov);
					});
			
				});
			});
			var datos = {
				"MENSAJE": "",
				"ZET_UPD_MOVILIDADSet": arrayMov
			}
			try{
			$.ajax({
				url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV",
				type: "GET",
				headers: {
					"x-CSRF-Token": "Fetch"
				}
			}).always(function (data, status, response) {
				var token = response.getResponseHeader("x-csrf-token");
				try{
				$.ajax({
					url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_UPD_MOVILIDAD_CABSet",
					method: "POST",
					headers: {
						"x-CSRF-Token": token
					},
					async: true,
					contentType: "application/json",
					dataType: "json",
					data: JSON.stringify(datos),
				}).always(async function (data, status, response) {
					
				var DataComprobanteConfirmacion =ModelProyect.getProperty("/DataComprobanteConfirmacion");
				var datos_envio =ModelProyect.getProperty("/datos_envio");
				
				
					DataComprobanteConfirmacion.forEach(function(items_09){
					if(datos_envio !== undefined){	
					datos_envio.forEach(function(gy){
						if(gy.keySeg === items_09.keySeg){
							if(gy.COMPROBANTE_PRUEBA !== undefined  && gy.COMPROBANTE_PRUEBA !== ""){
							items_09.COMPROBANTE_ANTIGUO = gy.COMPROBANTE_PRUEBA;
							gy.COMPROBANTE_PRUEBA="";
							}
							if(gy.FECHA_PRUEBA !== undefined  && gy.FECHA_PRUEBA !== ""){
							items_09.FECHA_ANTIGUA = gy.FECHA_PRUEBA;
							gy.FECHA_PRUEBA ="";	
							}
							
							if(gy.TIPO_PRUEBA !== undefined  && gy.TIPO_PRUEBA !== ""){
							items_09.COPIA_COD_TIPO =gy.TIPO_PRUEBA;
							gy.TIPO_PRUEBA ="";	
							}
							
							gy.COMPROBANTE_EDITADO = "";
							gy.RUC_EDITADO = "";
							items_09.RUC_COPIA1=gy.RUC;
							items_09.RUC_COPIA = gy.RUC;
							items_09.COPIA_RAZON =  gy.RAZON_SOCIAL;
							
							if(gy.PRUEBA_GLOSA !== undefined && gy.PRUEBA_GLOSA !== ""){
							items_09.COPIA_GLOSA= gy.PRUEBA_GLOSA;
							}
							
							items_09.COPIA_REFERENCIA = gy.REF_FACTURA;// nuevo 16/06/2022
							items_09.COPIA_ORDEN =  gy.ORDEN_INT;
							items_09.VIAJES =  gy.COPIA_VIAJES;
							
							items_09.desglose= gy.desglose;
						
						
						items_09.desglose.forEach(function(items3){
						 items3.ANTIGUO_GASTO =items3.COD_CONT;
						//items3.NUEVO_GASTOS="";
						 items3.ANTIGUO_CUENTA =items3.CUENTA_BANC;	//04/07/2022
						items3.ANTIGUO_IND=items3.IND_IMP;
						
						
						items3.ANTIGUA_BASE=items3.BASE_IMP;
						items3.ANTIGUO_INAFECTO=items3.INAFECTO;
						
						items3.ANTIGUO_IGV= items3.IGV;//04/07/2022
						
						items3.imputacion.forEach(function(items_07){
						items_07.COPIA_KOSTL=items_07.selectKeyagre;
						items_07.COPIA_PORCE=items_07.porcentajeII;
						items_07.COPIA_TOTAL=items_07.IMP;	
						
						}); 
						
						items3.movilidad.forEach(function(items_01){
						items_01.COPIA_MFECHA = items_01.FECHA;
						items_01.COPIA_IMPTOTAL = items_01.impTotalMov;	
						});	
						
					
						if(items_09.DATOS_SAP === false){// cambio de 05/06/2022
						 	items_09.DATOS_SAP = true;
						 }
						
						});	
							
					
						
						}
						});
					}	
					
						
						
					});
					ModelProyect.setProperty("/datos_envio" , []);
					ModelProyect.setProperty("/Comprobantes_sap",DataComprobanteConfirmacion);
					ModelProyect.refresh(true);
					
					let EliminarComp = []
					dataComprobante.map(function (obj) {
						obj.DeleteArchivo.map(function (obj2) {
							var form = new FormData();
							form.append("cmisaction", "delete");
							EliminarComp.push({
								URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/" + obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] +"." + obj.ID_DOC_SRV.toString()+"/" + obj2.Name,
								data: form
							});

						});
							
						
						obj.DeleteArchivo = [];
					});
					
					await that.EliminacionFolder(EliminarComp);

					// let  Comprobantes	= dataComprobante.map((obj,index)=> obj.NROD0 + "." +obj.COMPROBANTE)
					// let	 Folders		= await that.BuscarFolder(Comprobantes);

					// let ComprobantesNoCreados  = Folders.filter(obj=> obj.exception ).map(function(obj){

					let ComprobantesNoCreados = dataComprobante.map(function (obj) {


						var form = new FormData();
						form.append("cmisaction", "createFolder");
						form.append("propertyId[0]", "cmis:objectTypeId");
						form.append("propertyValue[0]", "cmis:folder");
						form.append("propertyId[1]", "cmis:name");
						form.append("propertyValue[1]", obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] + "." + obj.ID_DOC_SRV.toString() );
						// obj.message.replace("/QAS/AdjuntosER/","")
						return {
							URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER",
							data: form
						};
					});

					await that.CreacionDocumento_Folder(ComprobantesNoCreados);
					// let a = dataComprobante.filter(obj=> Folders.findIndex(obj1=> obj.NROD0 + "." +obj.COMPROBANTE === obj1.message.replace("/QAS/AdjuntosER/","") ) !== -1 );

					let ArchivosAdjuntos = [];
					dataComprobante.map(function (obj) {
						obj.archivoAd.map(function (obj2) {
							if (obj2.File !== undefined) {
								var form = new FormData();
								form.append("cmisaction", "createDocument");
								form.append("propertyId[0]", "cmis:objectTypeId");
								form.append("propertyValue[0]", "cmis:document");
								form.append("propertyId[1]", "cmis:name");
								form.append("propertyValue[1]", obj2.Name);
								form.append("datafile", obj2.File);
							}
							// return {URL:"/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/"+ obj.NROD0 + "." +obj.COMPROBANTE , data: form};
							ArchivosAdjuntos.push({
								URL: "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/" + obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] + "." + obj.ID_DOC_SRV.toString(),
								data: form
							});
							obj2.Service = true;
							obj2.Base64 = "";
						});
					});

					await that.CreacionDocumento_Folder(ArchivosAdjuntos);

					if (env.length > 0) {
						sap.ui.core.BusyIndicator.hide();
						MessageToast.show("La solicitud " + env + " se ha enviado a aprobar." + " Estado de envio :"+ estado_enviar);
						that.oRouter.navTo("RendicionConER");
					} else {
						sap.ui.core.BusyIndicator.hide();
						MessageToast.show("¡Registro guardado exitósamente!" + " Estado de guardado :"+ mensaje_sap);
						
						dataComprobante.map(function(xs){
						xs.VALIDA_GRABADO = true;//27/07/2022	
						});
						ModelProyect.refresh(true);
						
					}

				});
				}catch(ex){
				MessageBox.error("error al guardar los centros de costos servicio /sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_UPD_MOVILIDAD_CABSet");
				console.log(ex);	
				}
			});
			}catch(e){
			MessageBox.error("errror al obtener el token para guardar ceco del servicio /sap/opu/odata/sap/ZOD_RENDICIONES_SRV");
				console.log(e);	
			}

		},
		
		
		
		formatNumber: function (num) {
			if (!num || num == 'NaN') return '-';
			if (num == 'Infinity') return '&#x221e;';
			num = num.toString().replace(/\$|\,/g, '');
			if (isNaN(num))
				num = "0";
			var sign = (num == (num = Math.abs(num)));
			num = Math.floor(num * 100 + 0.50000000001);
			var cents = num % 100;
			num = Math.floor(num / 100).toString();
			if (cents < 10)
				cents = "0" + cents;
			for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
				num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
			return (((sign) ? '' : '-') + num + '' + cents);
		},
		handleUploadComplete: function (oEvent) {
			var sResponse = oEvent.getParameter("response"),
				iHttpStatusCode = "200",
				sMessage;

			if (sResponse) {
				sMessage = iHttpStatusCode === 200 ? sResponse + " (Upload Success)" : sResponse + " (Upload Error)";
				MessageToast.show(sMessage);
			}
		},

		reemLetrasCant: function (oEvent) {
			var that = this;
			var Objeto = oEvent.getSource();
			var val = Objeto.getValue();
			val = val.replace(/[^0-9,.]/g, '').replace(/,/g, '.');
			val = parseFloat(val).toFixed(2);
			val = val.toString();
			// val.indexOf();
			if (val === "NaN") {
				val = "0.00";
			}

			val = parseFloat(val);

			if (isNaN(val) || val === 0) {
				val = parseFloat(0).toFixed(2);
			} else {
				val = val.toFixed(2);

				var val_parts = val.split('.'),
					regexp = /(\d+)(\d{3})/;

				while (regexp.test(val_parts[0]))
					val_parts[0] = val_parts[0].replace(regexp, '$1' + ',' + '$2');

				val = val_parts.join('.');
			}

			Objeto.setValue(val);
			//that.pressBaseImponible(val);

		},
		changeImportePermt: function (oEvent) {
			var that = this;
			var vista = this.getView();
			var ModelProyect = vista.getModel("Proyect");
			var Objetos = oEvent.getSource();
			var valor = Objetos.getValue();
			var ImportesPermitos = ModelProyect.getProperty("/ImportesPermitos");
			var ImportesP = parseFloat(ImportesPermitos);
			var mensaje = "";

			var val = valor.toString();

			// var val = Objeto.getValue();
			val = val.replaceAll(/[^0-9,.]/g, '').replaceAll(/,/g, '.');
			val = parseFloat(val);
			val = val.toString();
			// val.indexOf();
			if (val === "NaN") {
				val = "0.00";
			}

			val = parseFloat(val);

			if (isNaN(val) || val === 0) {
				val = "0.00";
			} else {
				val = val.toFixed(2);
				var val_parts = val.split('.'),
					regexp = /(\d+)(\d{3})/;
				while (regexp.test(val_parts[0]))
					val_parts[0] = val_parts[0].replace(regexp, '$1' + ',' + '$2');
				val = val_parts.join('.');
			}
			Objetos.setValue(val)
			ModelProyect.setProperty("/Importetotal", val);
			// var valores=parseFloat(val);

			// if(valores  > ImportesP){
			// ModelProyect.setProperty("/visbleExcedente",false);
			// mensaje="Se excedio importe permitido";
			// MessageBox.warning(mensaje, {
			// actions: ["OK"],
			// onClose: function (sAction) {}
			// });
			// }else if(valores  === ImportesP){
			// ModelProyect.setProperty("/visbleExcedente",true);	
			// }else{
			// ModelProyect.setProperty("/visbleExcedente",false);	
			// }

		},
		limpiarcampos: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");

			ModelProyect.setProperty("/porcentajeII", "");
			ModelProyect.setProperty("/ImportesII", "");
			// ModelProyect.setProperty("/selectKeyagre", "");
		},
		// handleUploadComplete2: function (oEvent) {
		// 	var file			= oEvent.getParameter("files") && oEvent.getParameter("files")[0];
		// 	let that			= this;
		// 	var vista			= this.getView();
		// 	// var OrdenIternas = vista.getModel("OrdenIternas");
		// 	var FileUpExcel 	= vista.byId("fileUploader");
		// 	// var Prioridad = OrdenIternas.getProperty("/selectedKeyPrioridad");
		// 	let excelData		= {};
		// 	var headers 		= [];
		// 	var ModelProyect	= vista.getModel("Proyect");
		// 	var data2			= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var comprobanteDatos = [];
		// 	var contDatos        = 0;
			
		// 	if(data2.length > 0){
		// 	data2.forEach(function (js) {
			
		// 	if(js.DATOS_SAP === true){  //01/09/2022
				
		// 	if(js.VALIDAR_DATOS === true){
		// 		if(js.COMPROBANTE1 !== js.COMPROBANTE){	
		// 	  	comprobanteDatos.push(js.COMPROBANTE);
		// 		contDatos++;
				
		// 		}
				
		// 		if(js.FECHA_PRUEBA !== ""){
		// 		if(js.FECHA_PRUEBA !== js.FECHA_COMP){	
		// 		comprobanteDatos.push(js.COMPROBANTE);
		// 		contDatos++;
				
		// 		}
		// 		}
				
		// 		if(js.RUC_PRUEBA !== ""){
		// 		if(js.RUC_PRUEBA !==  js.RUC){
		// 		comprobanteDatos.push(js.COMPROBANTE);
		// 		contDatos++;
				
		// 		}
		// 		}	
				
				
		// 	}
		// 	}else{
				
		// 	if(js.DATOS_SAP === false){//01/09/2022
		// 	if(js.VALIDAR_DATOS === true){
		// 		if(js.COMPROBANTE1 !== js.COMPROBANTE){	
		// 	  	comprobanteDatos.push(js.COMPROBANTE);
		// 		contDatos++;
				
		// 		}
				
		// 		if(js.FECHA_PRUEBA !== ""){
		// 		if(js.FECHA_PRUEBA !== js.FECHA_COMP){	
		// 		comprobanteDatos.push(js.COMPROBANTE);
		// 		contDatos++;
				
		// 		}
		// 		}
				
		// 		if(js.RUC_PRUEBA !== ""){
		// 		if(js.RUC_PRUEBA !==  js.RUC){
		// 		comprobanteDatos.push(js.COMPROBANTE);
		// 		contDatos++;
				
		// 		}
		// 		}	
			
		// 	}	
				
		// 	}	
				
		// 	}
		// 	});
		// 	}
			
		// 	var numero_prueba1 ="";
		// 	if(contDatos > 0){
		// 	if(comprobanteDatos.join() !== ""){
		// 	const filteredArray = comprobanteDatos.filter(function(ele , pos){
		// 	 return comprobanteDatos.indexOf(ele) == pos;
		// 	}) 
		// 	numero_prueba1 ="Lo(s) comprobate(s) :" + filteredArray.join(" , ");
		// 	}
			
		// 	MessageBox.warning("Debe validar o registrar los comprobante(s) \n " + numero_prueba1 + " antes de grabar .");
		// 	comprobanteDatos =[];
		// 	sap.ui.core.BusyIndicator.hide();
		// 	return;	
		// 	}
			
		// 	if (file && window.FileReader) {
		// 		let reader = new FileReader();
		// 		const rABS = !!reader.readAsBinaryString
		// 		reader.readAsBinaryString(file);
		// 		reader.onload = async function (e) {
		// 			var data = e.target.result;

		// 			var result; // se guarda la informacion del excel
		// 			var workbook = XLSX.read(data, {
		// 				type: 'binary'
		// 			});

		// 			var sheet_name_list = workbook.SheetNames;
		// 			sheet_name_list.forEach(function (y) {
		// 				if (y === "Hoja1") {
		// 					var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
		// 					if (roa.length > 0) {
		// 						result = roa;
		// 					}
		// 				}
		// 			});
		// 			//se esstructura la informacion para las vistas correspondientes.
		// 			await that.Estructuracion(result);

		// 		};
		// 	}
		// },

		// Estructuracion: async function (dataExcel) {
		// 	var that				= this;
		// 	var oView				= this.getView();
		// 	var ModelProyect		= oView.getModel("Proyect");
		// 	var datas				= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var comprobAnt			= "";
		// 	var RucAnt				="";//21/07/2022
		// 	var keyComp 			= 1;
		// 	var keyDesg 			= 1;
		// 	var nombreRuc			= "ABC Consultores";
		// 	var estadoSolic 		= ModelProyect.getProperty("/estadoSolic");
		// 	var importe 			= ModelProyect.getProperty("/importe");
		// 	var solicitud			= ModelProyect.getProperty("/solicitud");
		// 	var COD_SAP 			= ModelProyect.getProperty("/COD_SAP");
		// 	var importe_rendido 	= ModelProyect.getProperty("/ImporteRend");
		// 	var moneda				= ModelProyect.getProperty("/moneda");
		// 	var validar_ruc 		= false;
		// 	var array_estructura	= [];
		// 	let Array               =[];
		// 	var hoy 			    = new Date();
		// 	var mes 				= hoy.getMonth() + 1;
		// 	var hoyp				= hoy.getDate().toString();
		// 	var array_CamposVacios	=[];
			
			
		// 	if (hoyp < 10) {
		// 		var hoyn = "0" + hoy.getDate().toString();
		// 	} else {
		// 		var hoyn = hoy.getDate().toString();
		// 	}
	
		// 	if (mes < 10) {
		// 		mes = "0" + mes.toString();
		// 	}
			
		// 	var fechaActual			= hoy.getFullYear().toString() + mes.toString() +hoyn.toString();
			
		// 	if (datas.length > 0) {
		// 		keyComp = datas.length + 1;
		// 	}

		// 	try {

		// 			for (var i = dataExcel.length - 1; i >= 0; i--) {
						
		// 				dataExcel[i].filaExcel = i+2;
						
		// 				if (Object.keys(dataExcel[i]).length < 4) {
		// 					dataExcel.splice(i, 1);
							
		// 				}else if(Object.keys(dataExcel[i]).length < 13 && Object.keys(dataExcel[i]).length > 3){
		// 					array_CamposVacios.push(dataExcel[i].filaExcel);
		// 					dataExcel.splice(i, 1);
							
		// 				}else{
		// 				dataExcel[i]["__EMPTY_3"].toString().padStart(5, "0")  + "-" + dataExcel[i]["__EMPTY_4"].toString().padStart(9, "0");	
		// 				Array.push(dataExcel[i]);	
		// 				}
		// 			}
					
		// 			//Validacion de campos vacios en el excel 
		// 		if(array_CamposVacios.length > 0){
		// 		   sap.m.MessageBox.warning("Las filas " + array_CamposVacios.join(" , ") + " del excel cargado contienen campos vacios, porfavor verificar su documento.");
		// 		   return;
		// 		}	
				
		// 		let array_estru = dataExcel.map(obj => obj["__EMPTY_3"].toString().padStart(5, "0") +"-"+ obj["__EMPTY_4"].toString().padStart(9, "0") + " "+ obj["__EMPTY_5"].toString());//21/07/2022
		// 		let isDuplicate = array_estru.some((item, index) => index !== array_estru.indexOf(item))

				
		// 		if (isDuplicate) {
		// 			sap.m.MessageBox.warning("Existen Comprobantes duplicados en el adjunto");
		// 			return;
		// 		}

		// 		let isDuplicateListaExcel = Array.filter((item, index) => datas.findIndex(obj1 => obj1.COMPROBANTE === item["__EMPTY_3"].toString().padStart(5, "0")  + "-" + item["__EMPTY_4"].toString().padStart(9, "0") && obj1.RUC === item["__EMPTY_5"].toString()) !== -1)

		// 		if (isDuplicateListaExcel.length !== 0) {
		// 			sap.m.MessageBox.warning("Existen Comprobantes duplicados en la lista con el adjunto");
		// 			return;
		// 		}
				
		// 		dataExcel = Array ;
				
		// 		dataExcel.forEach(function (comp, index) {

		// 			if (comp.__EMPTY_1 === "Tipo de comprobante") {
		// 				return;
		// 			}
					
		// 			var fechaCambio = comp["__EMPTY_2"].replaceAll("/", "").replaceAll(".", "");
		// 			var fechaFormato = fechaCambio.substr(0, 2) + "/" + fechaCambio.substr(2, 2) + "/" + fechaCambio.substr(4, 4);
		// 			var baseImp = comp["__EMPTY_9"];
		// 			var glosa = comp["__EMPTY_8"];
		// 			var IGV = comp["__EMPTY_10"];
		// 			var INAFECTO = comp["__EMPTY_11"];
		// 			var TOTAL = comp["__EMPTY_12"];
		// 			var Ceco = comp["__EMPTY_13"].toString();
		// 			var indImp = comp["__EMPTY_6"].split(" - ")[0];
		// 			// var Moneda = comp["__EMPTY_6"];
		// 			var Serie = comp["__EMPTY_3"].toString().padStart(5, "0");//cambio de 15/06/2022;
		// 			var numComp = comp["__EMPTY_4"].toString().padStart(9, "0");
		// 			// var razSoc			= comp["Razon social"];
		// 			var Ruc = comp["__EMPTY_5"];
		// 			var tipComp = comp["__EMPTY_1"];
		// 			var CodComp = comp["__EMPTY_1"].split(" - ")[0];
		// 			var tipGasto = comp["__EMPTY_7"].split(" - ")[0];

		// 			if (baseImp === "") {
		// 				baseImp = "0.00";
		// 			} else {
		// 				baseImp = parseFloat(baseImp).toFixed(2);
		// 				if (isNaN(baseImp) || baseImp === "0") {
		// 					baseImp = "0.00";
		// 				}
		// 			}

		// 			if (IGV === "") {
		// 				IGV = "0.00";
		// 			} else {
		// 				IGV = parseFloat(IGV).toFixed(2);
		// 				if (isNaN(IGV) || IGV === "0") {
		// 					IGV = "0.00";
		// 				}
		// 			}

		// 			if (INAFECTO === "") {
		// 				INAFECTO = "0.00";
		// 			} else {
		// 				INAFECTO = parseFloat(INAFECTO).toFixed(2);
		// 				if (isNaN(INAFECTO) || INAFECTO === "0") {
		// 					INAFECTO = "0.00";
		// 				}
		// 			}

		// 			if (TOTAL === "") {
		// 				TOTAL = "0.00";
		// 			} else {
		// 				TOTAL = parseFloat(TOTAL).toFixed(2);
		// 				if (isNaN(TOTAL) || TOTAL === "0") {
		// 					TOTAL = "0.00";
		// 				}
		// 			}

		// 			if (comprobAnt !== Serie + numComp && (RucAnt !== Ruc.toString() || RucAnt === Ruc.toString())) {//21/07/2022
		// 				// keyDesg = 1;
						
		// 				var estructura = {
		// 					//SCastillo
		// 					NROD0     : solicitud,
		// 					DOC_PAGO  : "",
		// 					COD_SAP		: COD_SAP,
		// 					//SCastillo
		// 					keySeg		: keyComp,
		// 					key			: keyComp,
		// 					COMPROBANTE	: Serie + "-" + numComp,
		// 					TIPO_COMP	: tipComp,
		// 					COD_TIPO_COMP: CodComp,
		// 					TIPO_PRUEBA	: CodComp,//16/08/2022
		// 					//SCastillo
		// 					TIPODOCI	: Ruc.toString().length > 8 ? "RUC" : "DNI",
		// 					//SCastillo
		// 					FECHA_COMP	: fechaFormato,
		// 					FECHA_PRUEBA :fechaFormato,//16/08/2022
		// 					RUC			: Ruc.toString(),
		// 					RAZON_SOCIAL: "",
		// 					WAERS		: moneda,
		// 					KOSTL		: "",
		// 					ESTADO		: "",
		// 					//SCastillo
		// 					GLOSA		: glosa,
		// 					PRUEBA_GLOSA : glosa,//16/08/2022
		// 					DATOS_SAP	:false ,
		// 					iconComp	: "sap-icon://pending",
		// 					EST_COMP	: "COMP. PEND. APR.",
		// 					COD_EST_COMP: "CPA",
		// 					stateComp	: "Warning",
		// 					VALIDA_GRABADO:false,
		// 					COMPROBANTE_ANTIGUO	:Serie + "-" + numComp,
		// 					COMPROBANTE_PRUEBA  :Serie + "-" + numComp,//16/08/2022
		// 					RUC_COPIA		: Ruc.toString(),
		// 					VALIDAR_DATOS	:false,//01/09/2022
		// 					//SCastillo
		// 					//COMP. PEND. APR
		// 					desglose: [{
		// 						stateCeco: "Success",
		// 						iconCeco: "sap-icon://sys-enter-2",
		// 						POSIC: keyDesg,
		// 						COMPROBANTE: Serie + "-" + numComp,
		// 						COD_CONT: tipGasto,
		// 						// TIPO			: tipGasto,
		// 						centro: Ceco === undefined ? "" : Ceco,
		// 						BASE_IMP: baseImp,
		// 						IGV: IGV,
		// 						INAFECTO: INAFECTO,
		// 						TOTAL: TOTAL,
		// 						IND_IMP: indImp,
		// 						imp: "",
		// 						validaciones1: false,
		// 						validacionBase: false,
		// 						validacionInafecto: true,
		// 						validacionIndicador: true,
		// 						movilidad: [],
		// 						imputacion: [{
		// 							COMPROBANTE: Serie + "-" + numComp,
		// 							POSDESGLOSE: keyDesg,
		// 							POSICION: 1,
		// 							WAERS: moneda,
		// 							KOSTL: Ceco === undefined ? "" : Ceco,
		// 							IMP: baseImp,
		// 							IMP_TOTAL: baseImp,
		// 							porcentajeII: "100%",
		// 							selectKeyagre: Ceco

		// 						}]
		// 					}],
		// 					archivoAd: [],
		// 					DeleteArchivo : []
		// 				};

		// 				array_estructura.push(JSON.parse(JSON.stringify(estructura)));
						
		// 				array_estructura.map(function(items_o){//27/07/2022
							
		// 				if(items_o.COD_TIPO_COMP === "KX"){
		// 				items_o.TIPODOCI = "DEXT";	
						
		// 				}else if((items_o.COD_TIPO_COMP  === "SK" || items_o.COD_TIPO_COMP  === "PM")){
							
		// 				items_o.TIPODOCI = "DNI";	
		// 				}else{
							
		// 				items_o.TIPODOCI = "RUC";	
		// 				}
						
		// 				items_o.desglose.map(function(xs){
		// 					if(xs.IND_IMP === "C0"){
								
		// 					xs.BASE_IMP ="0.00";
		// 					xs.IGV ="0.00";		
		// 					xs.imputacion.map(function(rz){
		// 					rz.IMP = xs.INAFECTO;
		// 					rz.IMP_TOTAL = xs.INAFECTO;
						
		// 				});	
							
		// 					}	
		// 				});
						
		// 				});

		// 				// keyComp++

		// 			}

		// 			comprobAnt = Serie + numComp;
		// 			RucAnt =Ruc.toString();//21/07/2022
		// 		});

		// 		let SendValidCompERP = array_estructura.map(function (items_01) {
		// 			var info_compro = {
		// 				"COMPROBANTE": items_01.COMPROBANTE,
		// 				"MENSAJE": "",
		// 				"RUC": items_01.RUC,
		// 				"TIPO_COMP": items_01.COD_TIPO_COMP,
		// 				"FECHA_COMP": items_01.FECHA_COMP
		// 			};
		// 			return info_compro;
		// 		});

		// 		let SendErp = {
		// 			"FLAG": "X",
		// 			"ZET_VALIDA_COMPROBANTESet": SendValidCompERP
		// 		};
		// 		sap.ui.core.BusyIndicator.show(0);

		// 		const Mensajes = await that.ValidacionRucExistente(SendErp);
		// 		let CompExistentesERP = array_estructura.filter(obj => Mensajes.findIndex(obj1 => obj1.MENSAJE ===
		// 			"Ya existe el número de comprobante" && obj1.COMPROBANTE === obj.COMPROBANTE && obj1.RUC === obj.RUC) !== -1);//21/07/2022
			
		// 		array_estructura.map(function (items_01) { /// ojo 
		// 			Mensajes.map(function (items2) {
						
		// 				if (items_01.COMPROBANTE === items2.COMPROBANTE &&  items_01.RUC === items2.RUC  && items2.MENSAJE === "Ya existe el número de comprobante") {//21/07/2022
		// 					items_01.MENSAJE = items2.MENSAJE;
		// 				}
		// 			});

		// 		});
		// 		let CompNoExistentesERP = array_estructura.filter(obj => Mensajes.findIndex(obj1 => obj1.MENSAJE !==
		// 			"Ya existe el número de comprobante" && obj1.COMPROBANTE === obj.COMPROBANTE && obj1.RUC === obj.RUC) !== -1);//21/07/2022

				
		// 		var ProveedoresNoVálidos = [];
		// 		if (CompNoExistentesERP.length !== 0) {

		// 			let Proveedores = [];
		// 			for (const obj of CompNoExistentesERP) {
					
		// 			var fechaRegistrada	= obj.FECHA_COMP.substring(10, 6) + obj.FECHA_COMP.substring(5, 3) + obj.FECHA_COMP.substring(2, 0);
					
		// 			var RegExPattern	= /^(?:(?:(?:0?[1-9]|1\d|2[0-8])[/](?:0?[1-9]|1[0-2])|(?:29|30)[/](?:0?[13-9]|1[0-2])|31[/](?:0?[13578]|1[02]))[/](?:0{2,3}[1-9]|0{1,2}[1-9]\d|0?[1-9]\d{2}|[1-9]\d{3})|29[/]0?2[/](?:\d{1,2}(?:0[48]|[2468][048]|[13579][26])|(?:0?[48]|[13579][26]|[2468][048])00))$/;	
						
						
		// 			if(obj.COD_TIPO_COMP === "KH" || obj.COD_TIPO_COMP === "KT" || obj.COD_TIPO_COMP === "KX" || obj.COD_TIPO_COMP === "KB" || obj.COD_TIPO_COMP === "KM" || obj.COD_TIPO_COMP === "SK" || obj.COD_TIPO_COMP === "KV"){//09/09/2022
					
		// 			if ((obj.FECHA_COMP.match(RegExPattern)) && (obj.FECHA_COMP != '')) {
					
		// 			var añoActual	= hoy.getFullYear().toString();
		// 			var añoMinimo	= (añoActual *1) -1;
		// 			var mesActual	= mes.toString();
		// 			var diaActual	= hoyn.toString();	
					
		// 			var RangoMaximo = añoActual + mesActual + diaActual ;
		// 			var RangoMinimo	= añoMinimo + mesActual + diaActual ;
						
		// 			if(fechaRegistrada *1 <  RangoMinimo *1 || fechaRegistrada *1 > RangoMaximo *1){
					
		// 			obj.MENSAJE = "La fecha de comprobante no debe ser mayor a la fecha actual ni menor a un año de la fecha actual";
		// 			Proveedores.push(obj);
		// 			}else{
						
		// 			if(obj.desglose[0].IND_IMP !== "C0"){
							
		// 				obj.MENSAJE = "El indicador de IGV asignado no es correcto, por favor verifique y actualice.";
		// 				Proveedores.push(obj);
						
		// 			}else{
							
		// 				if(obj.TIPODOCI === "DEXT"){ //27/07/2022
							
		// 					let proveedorDext = await that.validar_Dni(obj);
		// 					Proveedores.push(obj);
		// 				}else if (obj.RUC.length === 11) {
							
		// 					let Proveedor = await that.validar_sunat2(obj);
		// 					"/SUNAT/ruc?numero=" + obj.RUC ///Cromero
		// 					Proveedores.push(Proveedor);
		// 				} else if (obj.RUC.length === 8) {
							
		// 					let proveedorDni = await that.validar_Dni(obj);
		// 					Proveedores.push(obj);
	
		// 				}else if (obj.RUC.length < 8 || obj.RUC.length < 11){//05/08/2022
						
		// 				  obj.MENSAJE = "Esta incorrecto el registro del campo Ruc/Dni , por favor verificar.";		
		// 				  Proveedores.push(obj);	
		// 				}	
							
		// 				}	
		// 			}
					
		// 			} else {
		// 			obj.MENSAJE = "Formato de fecha incorrecta, el formato debe ser DD.MM.YYYY.";
		// 			Proveedores.push(obj);
		// 			}
					
		// 			}else{
						
		// 			if ((obj.FECHA_COMP.match(RegExPattern)) && (obj.FECHA_COMP != '')) {
					
		// 			var añoActual	= hoy.getFullYear().toString();
		// 			var añoMinimo	= (añoActual *1) -1;
		// 			var mesActual	= mes.toString();
		// 			var diaActual	= hoyn.toString();	
					
		// 			var RangoMaximo = añoActual + mesActual + diaActual ;
		// 			var RangoMinimo	= añoMinimo + mesActual + diaActual ;
						
		// 			if(fechaRegistrada *1 <  RangoMinimo *1 || fechaRegistrada *1 > RangoMaximo *1){
					
		// 			obj.MENSAJE = "La fecha de comprobante no debe ser mayor a la fecha actual ni menor a un año de la fecha actual";
		// 			Proveedores.push(obj);
		// 			}else{
						
		// 				if(obj.TIPODOCI === "DEXT"){ 
							
		// 					let proveedorDext = await that.validar_Dni(obj);
		// 					Proveedores.push(obj);
		// 				}else if (obj.RUC.length === 11) {
							
		// 					let Proveedor = await that.validar_sunat2(obj);
		// 					"/SUNAT/ruc?numero=" + obj.RUC 
		// 					Proveedores.push(Proveedor);
		// 				} else if (obj.RUC.length === 8) {
							
		// 					let proveedorDni = await that.validar_Dni(obj);
		// 					Proveedores.push(obj);
	
		// 				}else if (obj.RUC.length < 8 || obj.RUC.length < 11){
						
		// 				  obj.MENSAJE = "Esta incorrecto el registro del campo Ruc/Dni , por favor verificar.";		
		// 				  Proveedores.push(obj);	
		// 				}	
							
							
		// 			}
					
		// 			} else {
		// 			obj.MENSAJE = "Formato de fecha incorrecta, el formato debe ser DD.MM.YYYY.";
		// 			Proveedores.push(obj);
		// 			}	
					
					
		// 			}	
					
		// 			}
		// 			// let Proveedores = CompNoExistentesERP.map( function (obj){
		// 			// return	await that.validar_sunat2(ValidarProveedor); "/SUNAT/ruc?numero=" + obj.RUC
		// 			// });

		// 			// var Proveedores = await that.validar_sunat2(ValidarProveedor);
		// 			 ProveedoresNoVálidos = Proveedores.filter(obj => obj.MENSAJE.length !== 0);
		// 			var ProveedoresVálidos = Proveedores.filter(obj => obj.MENSAJE.length === 0);

		// 			ProveedoresVálidos.map(function (obj) {
		// 				obj.RAZON_SOCIAL = obj.Nombre;
		// 				obj.keySeg = keyComp;
		// 				obj.key = keyComp;
		// 				keyComp++
		// 				return obj;
		// 			});

		// 			if (datas === undefined || datas === []) {
		// 				ModelProyect.setProperty("/DataComprobanteConfirmacion", ProveedoresVálidos);
		// 			} else {
		// 				const Comprobantes = datas.concat(ProveedoresVálidos);
		// 				ModelProyect.setProperty("/DataComprobanteConfirmacion", Comprobantes);
		// 			}
				

		// 		}
				
		// 		that.sumatoria_estructuracion();
					
		// 		const Errors = CompExistentesERP.concat(ProveedoresNoVálidos);
					
		// 			// Errors = Errors.concat(ProveedoresERPNoVálidos);
		// 			if (Errors.length > 0) {
		// 				that.CallFragmentErrorExcel(Errors);
		// 			}
				
		// 		sap.ui.core.BusyIndicator.hide();
		// 		ModelProyect.refresh(true);
		// 		// }

		// 	} catch (e) {
		// 		sap.ui.core.BusyIndicator.hide();
		// 		sap.m.MessageBox.error("Error en el formato vuelva a intentarlo");
		// 	}

		// },

		// sumatoria_estructuracion: function () {
		// 	var oView						= this.getView();
		// 	var ModelProyect				= oView.getModel("Proyect");
		// 	var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var contadores					= 0;
		// 	var importe_fijo				= ModelProyect.getProperty("/importe");
		// 	var TOTAL_FORMAT				="";
		// 	//suma 
		// 	DataComprobanteConfirmacion.forEach(function (items_06) {
		// 		items_06.desglose.forEach(function (desg) {
		// 			//desg.TOTAL_FORMAT = desg.TOTAL.replaceAll(",", "");
		// 			TOTAL_FORMAT = desg.TOTAL.replaceAll(",", "");
		// 			items_06.totales= desg.TOTAL;
		// 			//contadores += parseFloat(desg.TOTAL_FORMAT);
		// 		});
		// 			contadores += parseFloat(TOTAL_FORMAT);
		// 	});

		// 	var resta = parseFloat(contadores) - parseFloat(importe_fijo);
		// 	ModelProyect.setProperty("/ImporteRend", contadores.toFixed(2));

		// 	if (parseFloat(importe_fijo) < contadores) {
		// 		ModelProyect.setProperty("/estado_saldo", "Success");
		// 	} else if (contadores === "0.00"){
		// 	   ModelProyect.setProperty("/estado_saldo", "None");	
		// 	}else {
		// 		ModelProyect.setProperty("/estado_saldo", "Error");
		// 	}

		// 	ModelProyect.setProperty("/Saldo", resta.toFixed(2));

		// },
		// CallFragmentErrorExcel: function (Errors) {
		// 	const that = this;
		// 	const oView = this.getView();
		// 	const ModelProyect = oView.getModel("Proyect");
		// 	const datas = ModelProyect.getProperty("/ErrorsCompExcel");

		// 	if (!that.tabla_informativa) {
		// 		that.tabla_informativa = sap.ui.xmlfragment("rendicionER.fragments.tabla_informativa", that);
		// 		oView.addDependent(that.tabla_informativa);
		// 	}

		// 	ModelProyect.setProperty("/ErrorsCompExcel", Errors);
		// 	that.tabla_informativa.open();

		// },

		// onSalir_Pantalla: function () {
		// 	var oView = this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	this.tabla_informativa.close();
		// 	ModelProyect.setProperty("/ErrorsCompExcel", []);

		// },

	
		// selectDocIden: function () {
		// 	var oView = this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_TIPO_DOC_IDSet";
		// 	jQuery.ajax({
		// 		type: "GET",
		// 		cache: false,
		// 		headers: {
		// 			"Accept": "application/json"
		// 		},
		// 		contentType: "application/json",
		// 		url: url,
		// 		async: true,
		// 		success: function (data, textStatus, jqXHR) {
		// 			var datos = data.d.results;
		// 			var seleccion = {
		// 				TIPO: "---Seleccionar---",
		// 				DESCRIPCION: "---Seleccionar---"
		// 			};
		// 			// , PERNR: "09837884"
		// 			datos.unshift(seleccion);
		// 			ModelProyect.setProperty("/datostipoDoc", datos);

		// 		},
		// 		error: function () {
		// 			MessageBox.error("Ocurrio un error al obtener los datos");
		// 		}
		// 	});
		// },
		// selectMoneda: function () {
		// 	var oView = this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_MONEDASet";

		// 	jQuery.ajax({
		// 		type: "GET",
		// 		cache: false,
		// 		headers: {
		// 			"Accept": "application/json"
		// 		},
		// 		contentType: "application/json",
		// 		url: url,
		// 		async: true,
		// 		success: function (data, textStatus, jqXHR) {
		// 			var datos = data.d.results;
		// 			var seleccion = {
		// 				MONEDA: "---Seleccionar---",
		// 				DESCRIPCION: "---Seleccionar---"
		// 			};
		// 			// , PERNR: "09837884"
		// 			datos.unshift(seleccion);
		// 			ModelProyect.setProperty("/datosmoneda", datos);

		// 		},
		// 		error: function () {
		// 			MessageBox.error("Ocurrio un error al obtener los datos");
		// 		}
		// 	});

		// },
		// handleUploadAdjuntos: async function (oEvent) {
		// 	var oView				= this.getView();
		// 	var ModelProyect		= oView.getModel("Proyect");
		// 	var selected			= oView.getModel("Proyect").getProperty("/CountComprobante");
		// 	var data				= ModelProyect.getProperty("/DataComprobantePreeliminar");
		// 	var dataCompr			= ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var dataDetSolcER		= ModelProyect.getProperty("/dataDetSolcER");
		// 	var texto				= oEvent.getParameters().newValue;
		// 	var Pos 				= ModelProyect.getProperty("/Posicion");
		// 	var datos_selecciones	= ModelProyect.getProperty("/datos_selecciones");//21/07/2022
		// 	var COMPROBANTE 		= ModelProyect.getProperty("/COMPROBANTE");
		// 	var oFileUploader		= oView.byId("fileUploader2");
		// 	var Documento			= await this.ImportarDoc(oFileUploader);

		// 	dataCompr.forEach(function (obj) {
		// 		if ( obj.keySeg === datos_selecciones.keySeg) {//21/07/2022
		// 			obj.archivoAd.push(Documento);
		// 		}
		// 	});

		// 	// dataCompr[0].archivoAd.push(Documento);

		// 	if (Pos)
		// 		Pos.push(Documento);
		// 	else
		// 		ModelProyect.setProperty("/Posicion", [Documento]);

		// 	ModelProyect.refresh(true);
		// },

		// ImportarDoc: async function (oFileUploader) {
		// 	var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
		// 	var base64_marker = "data:" + file.type + ";base64,";
		// 	debugger;
		// 	return new Promise((resolve, reject) => {
		// 		var Document;
		// 		var reader = new FileReader();
		// 		reader.onload = async function (evt) {

		// 			try {
		// 				var base64Index = base64_marker.length;
		// 				var base64 = evt.target.result.substring(base64Index);
		// 				// .substring(base64Index);

		// 				Document = {
		// 					"Type": file.type,
		// 					"Name": file.name,
		// 					"File": file,
		// 					"Base64": base64
		// 				};

		// 				resolve(Document);

		// 			} catch (err) {

		// 				reject(err);

		// 			}
		// 		}

		// 		reader.readAsDataURL(file);

		// 	});

		// },

		// DeleteDocumentoLinks: function (oArg) {
		// 	var oView = this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	var deleteRecord = oArg.getParameters().listItem.getBindingContext("Proyect").getPath();
		// 	var seleccionar = ModelProyect.getProperty(deleteRecord);
		// 	var dataCompr = ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var posic = ModelProyect.getProperty("/Posicion");
		// 	var datos_selecciones			= ModelProyect.getProperty("/datos_selecciones");//21/07/2022
		// 	for (var i = 0; i < posic.length; i++) {
		// 		if (posic[i] === seleccionar) {
		// 			posic.splice(i, 1);
		// 		}

		// 	}
		// 	var COMPROBANTE = ModelProyect.getProperty("/COMPROBANTE");

		// 	dataCompr.forEach(function (obj) {
		// 		if (datos_selecciones.keySeg === obj.keySeg) {//21/07/2022
		// 			const Index = obj.archivoAd.findIndex(obj1 => obj1.Name === seleccionar.Name);
		// 			let ArchivoService = obj.archivoAd.filter(obj1 => obj1.Name === seleccionar.Name && obj1.Service !== undefined)
		// 			obj.archivoAd.splice(Index, 1);
					
		// 			if(ArchivoService.length !== 0){
		// 			obj.DeleteArchivo.push(ArchivoService[0]);
		// 			}
					
		// 		}

		// 	});

		// 	// dataComprs.splice(Index,1)

		// 	ModelProyect.refresh(true);

		// },
		// handleUploadPress: function () {
		// 	var oFileUploader = this.byId("fileUploader");
		// 	oFileUploader.checkFileReadable().then(function () {
		// 		oFileUploader.upload();
		// 	}, function (error) {
		// 		MessageToast.show("The file cannot be read. It may have changed.");
		// 	}).then(function () {
		// 		oFileUploader.clear();
		// 	});
		// },
		// cerrarImputacion: function () {
		// 	this.agregarImputacion.close();
		// },
		// aceptarImputacion: function () {
		// 	var oView = this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	var porcentajeII01 = ModelProyect.getProperty("/porcentajeII");
		// 	var ImportesII01 = ModelProyect.getProperty("/ImportesII");
		// 	var datosImputacion02 = ModelProyect.getProperty("/datosImputacion");
		// 	var keyCosto = ModelProyect.getProperty("/select");
		// 	var keySelect = ModelProyect.getProperty("/keySelect");
		// 	var tablaImputacion = ModelProyect.getProperty("/tablaImputacion");
		// 	var MonedaImput = ModelProyect.getProperty("/MonedaImput");
		// 	var ImportesI = ModelProyect.getProperty("/ImportesI");
		// 	var formatoIm = parseFloat(ImportesII01).toFixed(2);
		// 	var COMPROBANTE = ModelProyect.getProperty("/COMPROBANTE");
		// 	var jsonData = ModelProyect.getProperty("/jsonData");
		// 	var nroDesglose = ModelProyect.getProperty("/nroDesglose");
		// 	var select_Ceco = ModelProyect.getProperty("/selectCeco");
		// 	var datosPressImp = ModelProyect.getProperty("/datosPressImp");
		// 	var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");
		// 	var indiceComp = 0;
		// 	var indiceDesg = 0;
		// 	var seleccion_prueba = "";
		// 	DataComprobanteConfirmacion.forEach(function (items, inde1) {
		// 		if (items.COMPROBANTE === datosPressImp.COMPROBANTE) {
		// 			indiceComp = inde1;
		// 			items.desglose.forEach(function (rx, inde2) {
		// 				if (rx.POSIC === datosPressImp.POSIC) {
		// 					indiceDesg = inde2;
		// 					// ModelProyect.setProperty("/tablaImputacion",rx.imputacion);	
		// 				}
		// 			});
		// 		}
		// 	});
		// 	if (keySelect !== undefined) {
		// 		seleccion_prueba = keySelect;
		// 	} else {
		// 		seleccion_prueba = select_Ceco;
		// 	}

		// 	var imputacion01 = {
		// 		COMPROBANTE: COMPROBANTE,
		// 		POSDESGLOSE: datosPressImp.POSIC,
		// 		POSICION: (jsonData[indiceDesg].imputacion.length + 1).toString(),
		// 		WAERS: MonedaImput,
		// 		KOSTL: seleccion_prueba,
		// 		IMP: formatoIm,
		// 		IMP_TOTAL: ImportesI,
		// 		PORCENTAJE: porcentajeII01 + "%"
		// 	}
		// 	DataComprobanteConfirmacion[indiceComp].desglose[indiceDesg].imputacion.push(imputacion01);
		// 	ModelProyect.setProperty("/datosImputacion", DataComprobanteConfirmacion[indiceComp].desglose[indiceDesg].imputacion);
		// 	ModelProyect.refresh(true);

		// 	this.agregarImputacion.close();
		// 	// ModelProyect.refresh(true);
		// },
		// deleteRow: function (oArg) {
		// 	var that = this;
		// 	var oView = this.getView();
		// 	var ModelProyect = oView.getModel("Proyect");
		// 	var jsonData = ModelProyect.getProperty("/jsonData");
		// 	// var deleteRecord = oArg.getSource().oPropagatedProperties.oBindingContexts.Proyect.sPath;
		// 	var deleteRecord = oArg.getSource().getBindingContext("Proyect").getObject();
		// 	var subTotal = ModelProyect.getProperty("/subTotal");
		// 	var noGrabada = ModelProyect.getProperty("/noGrabada");
		// 	var datosAlmacenados = ModelProyect.getProperty("/datosAlmacenados");
		// 	var arrayInf = ModelProyect.getProperty("/arrayInf");
		// 	var impueDet = ModelProyect.getProperty("/impueDet");
		// 	var subTotalComp = ModelProyect.getProperty("/subTotalComp");
		// 	var DataComprobanteConfirmacion = ModelProyect.getProperty("/DataComprobanteConfirmacion");

		// 	DataComprobanteConfirmacion.forEach(function (items_de) {
		// 		if (items_de.keySeg === deleteRecord.keySeg) {//21/07/2022
		// 			items_de.desglose.forEach(function (obj) {

		// 				if (obj.POSIC === deleteRecord.POSIC) {
		// 					for (var i = 0; i < jsonData.length; i++) {
		// 						if (jsonData[i] === deleteRecord) {

		// 							jsonData.splice(i, 1);

		// 							if (datosAlmacenados !== undefined) {
		// 								datosAlmacenados.splice(i, 1);
		// 							}

		// 							if (arrayInf !== undefined) {
		// 								arrayInf.splice(i, 1);
		// 							}

		// 							if (subTotal !== undefined) {
		// 								var BASE_IMP = parseFloat(subTotal) - parseFloat(deleteRecord.BASE_IMP);
		// 								var impuesto = BASE_IMP * 0.18;

		// 								var totales_prueba = "";
		// 								var inafecto_prueba = "";
		// 								var calculos_final = "";

		// 								items_de.totalImp = parseFloat(BASE_IMP).toFixed(2);
		// 								items_de.totalImpu = parseFloat(impuesto).toFixed(2);

		// 								if (noGrabada !== "0.00") { //-------------------------por consultar
		// 									totales_prueba = parseFloat(subTotalComp) - parseFloat(deleteRecord.TOTAL);
		// 									inafecto_prueba = parseFloat(noGrabada) - parseFloat(deleteRecord.INAFECTO);
		// 									calculos_final = totales_prueba - inafecto_prueba;
		// 								} else {
		// 									totales_prueba = parseFloat(subTotalComp) - parseFloat(deleteRecord.TOTAL);
		// 									calculos_final = parseFloat(totales_prueba);
		// 								}
		// 								impuesto = calculos_final - BASE_IMP;
		// 								items_de.totalImpu = impuesto.toFixed(2);

		// 								ModelProyect.setProperty("/subTotal", items_de.totalImp);
		// 								ModelProyect.setProperty("/impueDet", items_de.totalImpu);
		// 							}

		// 							if (noGrabada !== undefined) {
		// 								var INAFECTO = parseFloat(noGrabada) - parseFloat(deleteRecord.INAFECTO);
		// 								var total = parseFloat(subTotalComp) - parseFloat(deleteRecord.TOTAL);
		// 								items_de.totalNoGr = parseFloat(INAFECTO).toFixed(2);
		// 								// var total =  parseFloat(items_de.totalImp) -  parseFloat(items_de.totalImpu)-  parseFloat(items_de.totalNoGr);

		// 								items_de.totales = parseFloat(total).toFixed(2);
		// 								ModelProyect.setProperty("/subTotalComp", items_de.totales);
		// 								ModelProyect.setProperty("/ImportesI", items_de.totales);
		// 								ModelProyect.setProperty("/noGrabada", items_de.totalNoGr);
		// 							}

		// 						}
		// 					}

		// 				}
		// 			});
		// 		}

		// 	});

		// 	jsonData.forEach(function (objeto, index) {
		// 		if (objeto.POSIC !== index + 1) {
		// 			objeto.POSIC = index + 1
		// 		}
		// 	});

		// 	ModelProyect.refresh(true);
		// },
		// onFileSizeExceed : function (oEvent){
		// 	MessageToast.show("El archivo no debe exceder más de 5mb");	
		// }

	});
});