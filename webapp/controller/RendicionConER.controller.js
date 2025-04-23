sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"rendicionER/model/models",
	"rendicionER/libs/xlsx",
	"sap/ui/model/json/JSONModel",
	'sap/ui/core/BusyIndicator'
], function (Controller, BaseController, Filter, FilterOperator, MessageBox,models,xlsxjs,JSONModel,BusyIndicator) {
	"use strict";
	var arraydatos=[];
	var arraysolic=[];
	var tipoUsr = "";
	var consBusc = false;
	var parametroApp ="";
	//var validacion_guardado =false;//30062022
	const HostName	= location.hostname.includes("webide") ? "" : "/sap/fiori/rendicioner" ;
	// var arrayTablas=[];
	var urlPage = "";
	var ValidacionlevObs= false;
	var ValidacionRendiEr= false;
	var arrayguardar_comp	 =[];

	return BaseController.extend("rendicionER.controller.RendicionConER", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("RendicionConER").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			// const querystring	= location.hostname;
			// console.log(querystring)
		},
		
		handleRouteMatched: function () {
			// this.userLoged();
			var oFilter = this.getView().byId("filter"),
				that = this;
			var vista = this.getView();
			var ModelProyect = vista.getModel("Proyect");
				
			oFilter.addEventDelegate({
				"onAfterRendering": function (oEvent) {
					var oResourceBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();

					var oButton = oEvent.srcControl._oSearchButton;
					oButton.setText(oResourceBundle.getText("goButton"));
					oButton.setIcon("sap-icon://search");
				}
			});
		},
		
		onGoHome: function (er) {
			MessageBox.warning("¿Deseas volver al menú de aplicaciones?", {
				actions: ["Aceptar", "Cancelar"],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "Aceptar") {
						window.open(urlPage, "_self");
						//sap.ui.core.BusyIndicator.show(0);
					}
				}
			});
		},
		
		onAfterRendering:function(){
			var vista = this.getView();
			var ModelProyect = vista.getModel("Proyect");
			var contadorGlobal = vista.getModel("contadorGlobal").getProperty("/contador");	
			var data2			="";
			var that			=this;
			var queryString 	= window.location.host;

			
			
			if(contadorGlobal === 0){
				// parametroApp    = vista.getModel("parametroApp").getProperty("/parametro");
				this.getOwnerComponent().getRouter().navTo("DetalleSolcitudConER");
				
				
				if(queryString.includes("n8pid6w2h2")){
					urlPage = "https://flpnwc-n8pid6w2h2.dispatcher.us2.hana.ondemand.com/sites?siteId=9a6f515e-eb45-4d6a-9a51-932c1dba144a&appState=lean#Shell-home";
				}else{
					urlPage = "https://flpnwc-dwc4zd7e0s.dispatcher.us2.hana.ondemand.com/sites?siteId=cd08e08d-5ca9-4e8b-a352-374cb609125d&appState=lean#Shell-home";
				}
				
					try {

		            if (sap.ushell && sap.ushell.cpv2 && sap.ushell.cpv2.services && sap.ushell.cpv2.services.cloudServices && sap.ushell.cpv2.services.cloudServices.SiteService) {
		                var oLocalSiteService = sap.ushell.cpv2.services.cloudServices.SiteService();
		                var oRoles = oLocalSiteService.siteModel.getProperty("/roles");
		                var oProperty;
		
		                for (oProperty in oRoles) {
		                    if (oRoles.hasOwnProperty(oProperty)) {
		                    	
								if(oProperty.toString() === "rendiciones" || oProperty.toString() === "empleadoER"){
									
									ValidacionRendiEr = true;
								}else if(oProperty.toString() === "levantarObs" || oProperty.toString() ===  "levObsER" ){
									
								    ValidacionlevObs = true;
								}
								
		                    }
		                }
	
		            }
			        } catch (oException) {
						
			        }
			        
				that.limpiar();
				that.servicioIgv();
				that.selectSociedad();
				that.userlog();
				that.selecTipo_Comprobante();
				that.filtroceco();
				that.tipoGasto();
				that.ListaGastosCr();
				that.listaIndicador();
				that.ValidacionTipoCambio();
				ModelProyect.setProperty("/DatosComprobantes",[]);
				ModelProyect.setProperty("/KeySociedad","300");
				ModelProyect.setProperty("/seleccion_CECO","id1");
				ModelProyect.setProperty("/enableCeco",false);
				ModelProyect.setProperty("/enableEditar", false);
				ModelProyect.setProperty("/enableElim", false);
				ModelProyect.setProperty("/btnEliminarTabla",false);
				ModelProyect.setSizeLimit(9999999999999999999999);//nuevo 22/06/2022
				vista.getModel("contadorGlobal").setProperty("/contador", 1);
				
				that.oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				that.oRouter.getTarget("RendicionConER").attachDisplay(jQuery.proxy(that.userlog, that));
				
				consBusc = true;
			
			}
			
				
		},

		cerrarImputacion:function(){
			this.AgregarComprobante.close();
		},

		cerrardetalle:function(){//17/04/2025
			this.AbrirDeta.close();
		},


		pressDetalle:function(oEvent){//17/04/2025
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var detalle = oEvent.getSource().oParent.oBindingContexts.Proyect.sPath;
			var detalleSelec  = ModelProyect.getProperty(detalle).desglose;
			ModelProyect.setProperty("/DetalleGlosa", detalleSelec);

			if (!this.AbrirDeta) {
				this.AbrirDeta = sap.ui.xmlfragment("rendicionER.fragments.DetalleCompro", this);
				oView.addDependent(this.AbrirDeta);
			}
			
			this.AbrirDeta.open();	
		},

		pressBaseImponibleyInafecto: function (oEvent) {//17/04/2025
			var datos						= "";
			var vista						= this.getView();
			var suma						= 0;
			var calculo 					= "";
			var ModelProyect				= vista.getModel("Proyect");
			var Igvprueba					= parseFloat("18");
			var idBaseImp					= oEvent.mParameters.value;
			var impuesto					= "";		
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
			var DataGlosa					= ModelProyect.getProperty("/DataGlosa");
			
			// DataComprobanteConfirmacion.forEach(function(items2){
				DataGlosa.forEach(function (items, index) {
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
			// DataComprobanteConfirmacion.forEach(function (items2) {
			// 	if (items2.keySeg === datos_selecciones.keySeg) {//21/07/2022
			// 		items2.validacion_guardado= false;
			// 		items2.totalImpu = parseFloat(impuestoC).toFixed(2);
			// 		items2.totalImp = parseFloat(baseImp).toFixed(2);
			// 		items2.totalNoGr = parseFloat(sumatoria).toFixed(2);
			// 		items2.totales = totalFixed;
					
					
			// 	}
			// 	ModelProyect.refresh(true);
			// 	// acumulador += parseFloat(totalFixed);
			// 	//	acumulador += parseFloat(items2.total);

			// });
			// DataComprobanteConfirmacion.forEach(function (items_02) { //agregado por claudia//18/07/2022
			// if(items_02.keySeg === datos_selecciones.keySeg){//21/07/2022
			// 	items_02.desglose.forEach(function (items_03) {
				
			// 	if(items_03.POSIC === seleBaseImp.POSIC){
			// 	if(items_03.IND_IMP !== "C0"){
			// 	if(items_03.imputacion.length > 0){
			// 	items_03.imputacion.forEach(function(obj){
			// 	var formateo_porcentaje	= parseFloat(obj.porcentajeII) / 100;
			// 		obj.IMP= (formateo_porcentaje * items_03.BASE_IMP).toFixed(2) ;	
			// 		obj.IMP_TOTAL = items_03.BASE_IMP;
					
			// 	});	
					
			// 	}
			// 	}else{
			// 	if(items_03.imputacion.length > 0){
			// 	items_03.imputacion.forEach(function(obj){
			// 	var formateo_porcentaje	= parseFloat(obj.porcentajeII) / 100;
			// 		obj.IMP= (formateo_porcentaje * items_03.INAFECTO).toFixed(2) ;	
			// 		obj.IMP_TOTAL =  items_03.INAFECTO;
					
			// 	});	
					
			// 	}	
			// 	}	
			// 	}	
					
			// 	});
			// }
			// });
			
			// DataComprobanteConfirmacion.forEach(function (items_021) {//21/07/2022
			// items_021.desglose.forEach(function (items_032) {
			// acumulador += parseFloat(items_032.TOTAL);	
			// });
			// });
			
			// var resta_saldo = parseFloat(acumulador) - parseFloat(ImporteSolic) ;// cambio 04/06/2022
		
			// ModelProyect.setProperty("/ImporteRend", acumulador.toFixed(2));
			// if (parseFloat(ImporteSolic) < acumulador) {   // cambio de 04/06/2022
			// 	ModelProyect.setProperty("/estado_saldo", "Success");
			// } else {
			// 	ModelProyect.setProperty("/estado_saldo", "Error");
			// }
			// ModelProyect.setProperty("/subTotalComp", totalFixed);
			// ModelProyect.setProperty("/subTotal", baseImp.toFixed(2));
			// ModelProyect.setProperty("/impueDet", impuestoC);

			// // ModelProyect.setProperty("/impueDet",impuesto.toFixed(2));
			// ModelProyect.setProperty("/noGrabada", sumatoria.toFixed(2));
			// ModelProyect.setProperty("/Saldo", parseFloat(resta_saldo).toFixed(2));

			// ModelProyect.setProperty("/subTotalComp",sumafinal.toFixed(2));

		},

		seleccionComp: function (oEvent) { // 22/04/2025
			var vista  = this.getView();	
			var Proyect = vista.getModel("Proyect");
			var selectSolicitudER	= vista.byId("idProductsTable");
			var selecciones   =       selectSolicitudER.getSelectedItems();
			if (selecciones.length > 0) {
				Proyect.setProperty("/enableElim", true);
				Proyect.setProperty("/enableEditar", true);
			} else {
				Proyect.setProperty("/enableElim", false);
				Proyect.setProperty("/enableEditar", false);
			}
		},

		changeIndicador: function (args) {//17/04/2025
			var oView						= this.getView();
			var ModelProyect				= oView.getModel("Proyect");
			var selectInd					= args.getSource().oParent.oBindingContexts.Proyect.sPath;
			var selecIndicador				= ModelProyect.getProperty(selectInd);
			var AgregarComprobantes = ModelProyect.getProperty("/AgregarComprobantes");
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
			
			// AgregarComprobantes.forEach(function (items2) {
			// 	if (items2.keySeg === selecIndicador.POSIC.toString()) {//26/07/2022
			// 		items2.validacion_guardado= false;
			// 		items2.desglose.forEach(function (items, index) {
			// 		datosIndicador.forEach(function(clñ){
			// 		if(clñ.INDICADOR === selecIndicador.IND_IMP){
						
			// 			ModelProyect.setProperty("/IGV",clñ.PORCENTAJE);		
			// 			}	
			// 		});		
						
			// 			items.IND_IMP = selecIndicador.IND_IMP;
			// 			items.NUEVO_IND= items.IND_IMP;
						

			// 			if (selecIndicador.IND_IMP === "C0") {

			// 				items2.totalImp 			= "0.00";//17/07/2022
			// 				impuesto01					= "0.00";
			// 				// impuesto01					=	impuesto01/100;
			// 				items2.totalImpu			= parseFloat(impuesto01).toFixed(2);
			// 				items2.totalNoGr			= "0.00";
			// 				items2.totales				= "0.00";
			// 				items2.SaldoTotal			= "0.00";
			// 				items2.ImporteRendido		= "0.00";
			// 				items.validacionBase		= false;
			// 				items.validacionIGV			=false;
			// 				items.validacionInafecto	= true;
			// 				items.validacionIndicador	= true;
			// 				items.enableImputa			= true;
			// 				items.BASE_IMP				= "0.00";
			// 				items.IGV					= "0.00";
			// 				items.INAFECTO				= "0.00";
			// 				items.TOTAL 				= "0.00";
			// 				ModelProyect.refresh(true);
			// 			} else {

			// 				items2.totalImp 				= "0.00";
			// 				impuesto01						= "0.00";
			// 				items2.totalImpu				= parseFloat(impuesto01).toFixed(2);
			// 				items2.totalNoGr				 = "0.00";
			// 				items2.totales					= "0.00";
			// 				items2.SaldoTotal				= "0.00";
			// 				items2.ImporteRendido			= "0.00";
			// 				items.validacionBase			= true;
			// 				items.validacionInafecto		= true;
			// 				items.validacionIndicador		= true;
			// 				items.validacionIGV				=true;
			// 				items.enableImputa				= true;
			// 				items.BASE_IMP					= "0.00";
			// 				items.IGV						= "0.00";
			// 				items.INAFECTO					= "0.00";
			// 				items.TOTAL 					= "0.00";
			// 			}

			// 		});
			// 		ModelProyect.setProperty("/subTotal", items2.totalImp);
			// 		ModelProyect.setProperty("/impueDet", items2.totalImpu);
			// 		ModelProyect.setProperty("/subTotalComp", items2.totales);
			// 		ModelProyect.setProperty("/noGrabada", items2.totalNoGr);

			// 	}

			// 	//-------Calculando el importe rendido al cambiar el indicador.

			// 	contador_calculado += parseFloat(items2.totales);

			// });
			// calcular_Saldo = contador_calculado  - parseFloat(importe_Solic); 

			// if (parseFloat(importe_Solic) < contador_calculado) {
			// 	ModelProyect.setProperty("/estado_saldo", "Success");
			// } else if (contador_calculado.toFixed(2) === "0.00") {
			// 	ModelProyect.setProperty("/estado_saldo", "None");
			// } else {
			// 	ModelProyect.setProperty("/estado_saldo", "Error");
			// }
			if(selecIndicador.IND_IMP === "C0"){
				selecIndicador.BASE_IMP="0.00";
				selecIndicador.IGV="0.00";
				selecIndicador.INAFECTO="0.00";
				selecIndicador.TOTAL="0.00";
				ModelProyect.setProperty("/editableBaseI",false);
				ModelProyect.setProperty("/editableBaseIGV",false);
				ModelProyect.setProperty("/editableInafecto",true);

			}else{
				selecIndicador.BASE_IMP="0.00";
				selecIndicador.IGV="0.00";
				selecIndicador.INAFECTO="0.00";
				selecIndicador.TOTAL="0.00";
				ModelProyect.setProperty("/editableBaseI",true);
				ModelProyect.setProperty("/editableBaseIGV",true);
				ModelProyect.setProperty("/editableInafecto",true);
			}

			// ModelProyect.setProperty("/ImporteRend", contador_calculado.toFixed(2));
			// ModelProyect.setProperty("/Saldo", calcular_Saldo.toFixed(2));
			ModelProyect.refresh(true);
		},

		ListaGastosCr:function(){ //17.04.2025
			var vista = this.getView();
			var Proyect = vista.getModel("Proyect");
			var that= this;
			Proyect.setProperty("/datosGastosCr",models.oDataGastos());	
			sap.ui.core.BusyIndicator.hide();
		},
		
		listaIndicador:function(){ //17.04.2025
			var vista = this.getView();
			var Proyect = vista.getModel("Proyect");
			var that= this;
			Proyect.setProperty("/datosIndicador",models.oDataIndicador());	
			sap.ui.core.BusyIndicator.hide();
		},
		
		EliminacionFolder : async function (Sends){
			try {
			const results = await Promise.all(Sends.map(send=> 
			// "/sap/fiori/irequestbvregistrodocliq"+
				fetch(HostName  + send.URL,
					{
						method		:"POST",
						body		:send.data,
						processData	:false,
						contentType	:false,
					}
				)
			)) 
			const finalData	   = await Promise.all(results.map(result => 
					result.json()));
				return 	finalData ;
				console.log(finalData);
			}
			catch(err) {
				console.log(err);
			}
			
		},
		CreacionDocumento_Folder : async function (Sends){
			try {
			const results = await Promise.all(Sends.map(send=> 
			// "/sap/fiori/irequestbvregistrodocliq"+
				fetch(HostName+send.URL,
				{
				method		:"POST",
				body		:send.data,
				processData	:false,
				contentType	:false,
				}
				)
			)) 
			const finalData	   = await Promise.all(results.map(result => 
					result.json()));
				return 	finalData ;
				console.log(finalData);
			}
			catch(err) {
				console.log(err);
			}
			
		},

		Editar_Compro:function(){ // 22.04.2025
			sap.ui.core.BusyIndicator.show(0);
			var vista   = this.getView();	
			var Proyect = vista.getModel("Proyect");
			var selectSolicitudER = vista.byId("idProductsTable");
			var selecciones   =       selectSolicitudER.getSelectedItems();
			var ProductCollection = Proyect.getProperty("/ProductCollection");
			var prueba    ="";
			
			var posiciones			= selecciones.map(function (objeto) {
				var path = objeto.getBindingContext("Proyect").getPath();
				var objetos = Proyect.getProperty(path);
				return objetos;
			});

		   posiciones.forEach(function (objeto) {			
			 prueba = objeto;
	   		});
			
			if (!this.EditarDeta) {
				this.EditarDeta = sap.ui.xmlfragment("rendicionER.fragments.EditarComprobante", this);
				vista.addDependent(this.EditarDeta);
			}

			Proyect.setProperty("/sRegistroComprobantes",posiciones[0].COMPROBANTE);
			 Proyect.setProperty("/fecha_Comprobante1",posiciones[0].FECHA_COMP);
			 Proyect.setProperty("/Key_comprobante", posiciones[0].COD_TIPO_COMP);
			 Proyect.setProperty("/tipoNif", posiciones[0].TIPODOCI);
			 Proyect.setProperty("/ruc", posiciones[0].RUC);
			 Proyect.setProperty("/razonSocial", posiciones[0].RAZON_SOCIAL);
			 Proyect.setProperty("/monedas", posiciones[0].WAERS);
			 Proyect.setProperty("/Glosa", posiciones[0].GLOSA);
			 Proyect.setProperty("/DataGlosa1",posiciones[0].desglose);
			 Proyect.setProperty("/Selección_edi", prueba);
			
			this.EditarDeta.open();
			sap.ui.core.BusyIndicator.hide(0);		
		},

		cerrarEditar:function(){//26/02/2025
			this.EditarDeta.close();
		},

		GuardarComprobanteCrEdit:function(){//22.04.2025

			sap.ui.core.BusyIndicator.show(0);
			var vista   = this.getView();	
			var Proyect = vista.getModel("Proyect");
			var selectSolicitudER = vista.byId("idProductsTable");
			var selecciones   =       selectSolicitudER.getSelectedItems();
			var ProductCollection = Proyect.getProperty("/ProductCollection");
			var fecha_Comprobante  	 = Proyect.getProperty("/fecha_Comprobante1");
			var Key_comprobante 	 = Proyect.getProperty("/Key_comprobante");
			var tipoNif 			 = Proyect.getProperty("/tipoNif");
			var datostipoDoc         = Proyect.getProperty("/datostipoDoc");
			var Ruc 				 = Proyect.getProperty("/ruc");
			var Razon_Social		 = Proyect.getProperty("/razonSocial");
			var Monedas				 = Proyect.getProperty("/monedas");
			var Glosa                =Proyect.getProperty("/Glosa");
			var sRegistroComprobante = Proyect.getProperty("/sRegistroComprobantes");
			var prueba   			 ="";
			var Selección_edi = Proyect.getProperty("/Selección_edi");

			ProductCollection.forEach(function (objeto) {
				if (Selección_edi === objeto) {
					objeto.COMPROBANTE		= sRegistroComprobante;
					objeto.FECHA_COMP = fecha_Comprobante;
					objeto.COD_TIPO_COMP = Key_comprobante;
					objeto.COD_TIPO_COMP= tipoNif;
					objeto.RUC= Ruc;
					objeto.RAZON_SOCIAL= Razon_Social;
					objeto.WAERS= Monedas;
					objeto.GLOSA= Glosa;
					objeto.desglose= Selección_edi.desglose;
													
				}
					
		   });
		   sap.ui.core.BusyIndicator.hide(0);
		   Proyect.setProperty("/sRegistroComprobantes","");
			Proyect.setProperty("/fecha_Comprobante1","");
			Proyect.setProperty("/Key_comprobante","");
			Proyect.setProperty("/tipoNif","");
			Proyect.setProperty("/ruc","");
			Proyect.setProperty("/razonSocial","");
			Proyect.setProperty("/monedas","");
			Proyect.setProperty("/Glosa","");	
			this.EditarDeta.close();

		},

		livechangeIden:function(){ // 17/04/2025

			var oView = this.getView();
			var Proyect = oView.getModel("Proyect");
			var ruc = Proyect.getProperty("/ruc");
			var tipoNif = Proyect.getProperty("/tipoNif");
	
			if(tipoNif == "DNI"){

				if (ruc == undefined || ruc ==""){

					MessageBox.warning("Registrar el N° de DNI");
					Proyect.setProperty("/ruc", "");
					Proyect.setProperty("/razonSocial", "")

				}else if(ruc.length == "8"){
					
					Proyect.setProperty("/razonSocial", "Claudia Romero")
					
				}else{
					Proyect.setProperty("/ruc", "")
					MessageBox.warning("Son max. 8 digitos");
				
				}
			}else if(tipoNif == "RUC"){

				if (ruc == undefined || ruc ==""){

					MessageBox.warning("Registrar el N° de RUC");
					Proyect.setProperty("/ruc", "")
					Proyect.setProperty("/razonSocial", "")

				}else if(ruc.length == "11"){
					
					Proyect.setProperty("/razonSocial", "CENTRO COMERCIAL PLAZA NORTE S.A.C.")
					
				}else{
					MessageBox.warning("Son max. 11 digitos");
					Proyect.setProperty("/ruc", "");
				}
				
			}else{
				MessageBox.warning("Seleccionar el tipo de documento");
				Proyect.setProperty("/ruc", "")
				Proyect.setProperty("/razonSocial", "")
			}	
	
			},
			
			changeTipoDoc:function(){ //17/04/2025
				var oView						= this.getView();
				var Proyect				= oView.getModel("Proyect")
				var tipoNif 					= Proyect.getProperty("/tipoNif");
	
				if(tipoNif == "DNI"){
					Proyect.setProperty("/ruc", "");
					Proyect.setProperty("/razonSocial", "")

				}else{
					Proyect.setProperty("/ruc", "");
					Proyect.setProperty("/razonSocial", "")

				}
				
			} ,

		Validarcampos:function(){//28/08/2024
			var vista 			= this.getView();
			var Proyect 		= vista.getModel("Proyect");
			var arrayguardar_comp	=[];
			var sRegistroComprobante = 	Proyect.getProperty("/sRegistroComprobantes");
			var fecha_Comprobante  	=	 Proyect.getProperty("/fecha_Comprobante1");
			var Key_comprobante 	= Proyect.getProperty("/Key_comprobante");
			var tipoNif 			= Proyect.getProperty("/tipoNif");
			var Ruc 				= Proyect.getProperty("/ruc");
			var Razon_Social		= Proyect.getProperty("/razonSocial");
			var Monedas				= Proyect.getProperty("/monedas");
			var Glosa               =Proyect.getProperty("/Glosa");
			var contador			=0;
			var camposVacios        = false;

			
			if(sRegistroComprobante == "" || sRegistroComprobante == undefined){
				camposVacios=true;
			}
			if(fecha_Comprobante == "" || fecha_Comprobante == undefined){
				camposVacios=true;
			}
			
			if(Key_comprobante == "" || Key_comprobante == undefined){
				camposVacios=true;
			}
			if(tipoNif == "" || tipoNif == undefined){
				camposVacios=true;
			}
			if(Ruc == "" || Ruc == undefined){
				camposVacios=true;
			}
			if(Razon_Social ==""){
				camposVacios=true;
			}

			if(Monedas == "" || Monedas == undefined){
				camposVacios=true;
			}

			if(Glosa == "" || Glosa == undefined){
				camposVacios=true;
			}

			return camposVacios;

		},

		handleUploadComplete2: function (oEvent) {
			var file			= oEvent.getParameter("files") && oEvent.getParameter("files")[0];
			let that			= this;
			var vista			= this.getView();
			var FileUpExcel 	= vista.byId("fileUploader");
			let excelData		= {};
			var headers 		= [];
			var ModelProyect	= vista.getModel("Proyect");
			var data2			= ModelProyect.getProperty("/ProductCollection");
			var comprobanteDatos = [];
			var contDatos        = 0;
			
	
			
			if (file && window.FileReader) {
				let reader = new FileReader();
				const rABS = !!reader.readAsBinaryString
				reader.readAsBinaryString(file);
				reader.onload = async function (e) {
					var data = e.target.result;

					var result; // se guarda la informacion del excel
					var workbook = XLSX.read(data, {
						type: 'binary'
					});

					var sheet_name_list = workbook.SheetNames;
					sheet_name_list.forEach(function (y) {
						if (y === "Hoja1") {
							var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
							if (roa.length > 0) {
								result = roa;
							}
						}
					});
					//se esstructura la informacion para las vistas correspondientes.
					await that.Estructuracion(result);

				};
			}
		},

		Estructuracion: async function (dataExcel) {
			var that				= this;
			var oView				= this.getView();
			var Proyect		        = oView.getModel("Proyect");
			var datas				= Proyect.getProperty("/ProductCollection");
			var comprobAnt			= "";
			var RucAnt				="";//21/07/2022
			var keyComp 			= 1;
			var keyDesg 			= 1;
			var nombreRuc			= "ABC Consultores";
			var estadoSolic 		= Proyect.getProperty("/estadoSolic");
			var importe 			= Proyect.getProperty("/importe");
			var solicitud			= Proyect.getProperty("/solicitud");
			var COD_SAP 			= Proyect.getProperty("/COD_SAP");
			var importe_rendido 	= Proyect.getProperty("/ImporteRend");
			var moneda				= Proyect.getProperty("/moneda");
			var validar_ruc 		= false;
			var array_estructura	= [];
			let Array               =[];
			var hoy 			    = new Date();
			var mes 				= hoy.getMonth() + 1;
			var hoyp				= hoy.getDate().toString();
			var array_CamposVacios	=[];
			
			
			if (hoyp < 10) {
				var hoyn = "0" + hoy.getDate().toString();
			} else {
				var hoyn = hoy.getDate().toString();
			}
	
			if (mes < 10) {
				mes = "0" + mes.toString();
			}
			
			var fechaActual			= hoy.getFullYear().toString() + mes.toString() +hoyn.toString();
			
			if (datas == 0 || datas == undefined){
				
				keyComp;

				try {

					for (var i = dataExcel.length - 1; i >= 0; i--) {
						
						dataExcel[i].filaExcel = i+2;
						
						if (Object.keys(dataExcel[i]).length < 4) {
							dataExcel.splice(i, 1);
							
						}else if(Object.keys(dataExcel[i]).length < 13 && Object.keys(dataExcel[i]).length > 3){
							array_CamposVacios.push(dataExcel[i].filaExcel);
							dataExcel.splice(i, 1);
							
						}else{
						dataExcel[i]["__EMPTY_3"].toString().padStart(5, "0")  + "-" + dataExcel[i]["__EMPTY_4"].toString().padStart(9, "0");	
						Array.push(dataExcel[i]);	
						}
					}
					
					//Validacion de campos vacios en el excel 
				if(array_CamposVacios.length > 0){
				   sap.m.MessageBox.warning("Las filas " + array_CamposVacios.join(" , ") + " del excel cargado contienen campos vacios, porfavor verificar su documento.");
				   return;
				}	
				
				let array_estru = dataExcel.map(obj => obj["__EMPTY_3"].toString().padStart(5, "0") +"-"+ obj["__EMPTY_4"].toString().padStart(9, "0") + " "+ obj["__EMPTY_5"].toString());//21/07/2022
				let isDuplicate = array_estru.some((item, index) => index !== array_estru.indexOf(item))

				
				if (isDuplicate) {
					sap.m.MessageBox.warning("Existen Comprobantes duplicados en el adjunto");
					return;
				}

				// let isDuplicateListaExcel = Array.filter((item, index) => datas.findIndex(obj1 => obj1.COMPROBANTE === item["__EMPTY_3"].toString().padStart(5, "0")  + "-" + item["__EMPTY_4"].toString().padStart(9, "0") && obj1.RUC === item["__EMPTY_5"].toString()) !== -1)

				// if (isDuplicateListaExcel.length !== 0) {
				// 	sap.m.MessageBox.warning("Existen Comprobantes duplicados en la lista con el adjunto");
				// 	return;
				// }
				
				dataExcel = Array ;
				
				dataExcel.forEach(function (comp, index) {

					if (comp.__EMPTY_1 === "Tipo de comprobante") {
						return;
					}
					
					var fechaCambio = comp["__EMPTY_2"].replaceAll("/", "").replaceAll(".", "");
					var fechaFormato = fechaCambio.substr(0, 2) + "/" + fechaCambio.substr(2, 2) + "/" + fechaCambio.substr(4, 4);
					var baseImp = comp["__EMPTY_9"];
					var glosa = comp["__EMPTY_8"];
					var IGV = comp["__EMPTY_10"];
					var INAFECTO = comp["__EMPTY_11"];
					var TOTAL = comp["__EMPTY_12"];
					var Ceco = comp["__EMPTY_13"].toString();
					var indImp = comp["__EMPTY_6"].split(" - ")[0];
					// var Moneda = comp["__EMPTY_6"];
					var Serie = comp["__EMPTY_3"].toString().padStart(5, "0");//cambio de 15/06/2022;
					var numComp = comp["__EMPTY_4"].toString().padStart(9, "0");
					// var razSoc			= comp["Razon social"];
					var Ruc = comp["__EMPTY_5"];
					var tipComp = comp["__EMPTY_1"];
					var CodComp = comp["__EMPTY_1"].split(" - ")[0];
					var tipGasto = comp["__EMPTY_7"].split(" - ")[0];

					if (baseImp === "") {
						baseImp = "0.00";
					} else {
						baseImp = parseFloat(baseImp).toFixed(2);
						if (isNaN(baseImp) || baseImp === "0") {
							baseImp = "0.00";
						}
					}

					if (IGV === "") {
						IGV = "0.00";
					} else {
						IGV = parseFloat(IGV).toFixed(2);
						if (isNaN(IGV) || IGV === "0") {
							IGV = "0.00";
						}
					}

					if (INAFECTO === "") {
						INAFECTO = "0.00";
					} else {
						INAFECTO = parseFloat(INAFECTO).toFixed(2);
						if (isNaN(INAFECTO) || INAFECTO === "0") {
							INAFECTO = "0.00";
						}
					}

					if (TOTAL === "") {
						TOTAL = "0.00";
					} else {
						TOTAL = parseFloat(TOTAL).toFixed(2);
						if (isNaN(TOTAL) || TOTAL === "0") {
							TOTAL = "0.00";
						}
					}

					if (comprobAnt !== Serie + numComp && (RucAnt !== Ruc.toString() || RucAnt === Ruc.toString())) {//21/07/2022
						// keyDesg = 1;
						
						var estructura = {
							//SCastillo
							NROD0     : solicitud,
							DOC_PAGO  : "",
							COD_SAP		: COD_SAP,
							//SCastillo
							keySeg		: keyComp,
							key			: keyComp,
							COMPROBANTE	: Serie + "-" + numComp,
							TIPO_COMP	: tipComp,
							COD_TIPO_COMP: CodComp,
							TIPO_PRUEBA	: CodComp,//16/08/2022
							//SCastillo
							TIPODOCI	: Ruc.toString().length > 8 ? "RUC" : "DNI",
							//SCastillo
							FECHA_COMP	: fechaFormato,
							FECHA_PRUEBA :fechaFormato,//16/08/2022
							RUC			: Ruc.toString(),
							RAZON_SOCIAL: "",
							WAERS		: moneda,
							KOSTL		: "",
							ESTADO		: "",
							//SCastillo
							GLOSA		: glosa,
							PRUEBA_GLOSA : glosa,//16/08/2022
							DATOS_SAP	:false ,
							iconComp	: "sap-icon://pending",
							EST_COMP	: "COMP. PEND. APR.",
							COD_EST_COMP: "CPA",
							stateComp	: "Warning",
							VALIDA_GRABADO:false,
							COMPROBANTE_ANTIGUO	:Serie + "-" + numComp,
							COMPROBANTE_PRUEBA  :Serie + "-" + numComp,//16/08/2022
							RUC_COPIA		: Ruc.toString(),
							VALIDAR_DATOS	:false,//01/09/2022
							//SCastillo
							//COMP. PEND. APR
							desglose: [{
								stateCeco: "Success",
								iconCeco: "sap-icon://sys-enter-2",
								POSIC: keyDesg,
								COMPROBANTE: Serie + "-" + numComp,
								COD_CONT: tipGasto,
								// TIPO			: tipGasto,
								centro: Ceco === undefined ? "" : Ceco,
								BASE_IMP: baseImp,
								IGV: IGV,
								INAFECTO: INAFECTO,
								TOTAL: TOTAL,
								IND_IMP: indImp,
								imp: "",
								validaciones1: false,
								validacionBase: false,
								validacionInafecto: true,
								validacionIndicador: true,							
							}],
							archivoAd: [],
							DeleteArchivo : []
						};

						array_estructura.push(JSON.parse(JSON.stringify(estructura)));
						
						// array_estructura.map(function(items_o){//27/07/2022
							
						// if(items_o.COD_TIPO_COMP === "KX"){
						// items_o.TIPODOCI = "DEXT";	
						
						// }else if((items_o.COD_TIPO_COMP  === "SK" || items_o.COD_TIPO_COMP  === "PM")){
							
						// items_o.TIPODOCI = "DNI";	
						// }else{
							
						// items_o.TIPODOCI = "RUC";	
						// }
						
						// items_o.desglose.map(function(xs){
						// 	if(xs.IND_IMP === "C0"){
								
						// 	xs.BASE_IMP ="0.00";
						// 	xs.IGV ="0.00";		
						// 	xs.imputacion.map(function(rz){
						// 	rz.IMP = xs.INAFECTO;
						// 	rz.IMP_TOTAL = xs.INAFECTO;
						
						// });	
							
						// 	}	
						// });
						
						// });

						keyComp++

					}

					comprobAnt = Serie + numComp;
					RucAnt =Ruc.toString();//21/07/2022
				});
				// var informacion = datas.concat(array_estructura);

				Proyect.setProperty("/ProductCollection" , array_estructura);

			} catch (e) {
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageBox.error("Error en el formato vuelva a intentarlo");
			}


			}else if (datas.length > 0) {
				keyComp = datas.length + 1;

				try {

					for (var i = dataExcel.length - 1; i >= 0; i--) {
						
						dataExcel[i].filaExcel = i+2;
						
						if (Object.keys(dataExcel[i]).length < 4) {
							dataExcel.splice(i, 1);
							
						}else if(Object.keys(dataExcel[i]).length < 13 && Object.keys(dataExcel[i]).length > 3){
							array_CamposVacios.push(dataExcel[i].filaExcel);
							dataExcel.splice(i, 1);
							
						}else{
						dataExcel[i]["__EMPTY_3"].toString().padStart(5, "0")  + "-" + dataExcel[i]["__EMPTY_4"].toString().padStart(9, "0");	
						Array.push(dataExcel[i]);	
						}
					}
					
					//Validacion de campos vacios en el excel 
				if(array_CamposVacios.length > 0){
				   sap.m.MessageBox.warning("Las filas " + array_CamposVacios.join(" , ") + " del excel cargado contienen campos vacios, porfavor verificar su documento.");
				   return;
				}	
				
				let array_estru = dataExcel.map(obj => obj["__EMPTY_3"].toString().padStart(5, "0") +"-"+ obj["__EMPTY_4"].toString().padStart(9, "0") + " "+ obj["__EMPTY_5"].toString());//21/07/2022
				let isDuplicate = array_estru.some((item, index) => index !== array_estru.indexOf(item))

				
				if (isDuplicate) {
					sap.m.MessageBox.warning("Existen Comprobantes duplicados en el adjunto");
					return;
				}

				let isDuplicateListaExcel = Array.filter((item, index) => datas.findIndex(obj1 => obj1.COMPROBANTE === item["__EMPTY_3"].toString().padStart(5, "0")  + "-" + item["__EMPTY_4"].toString().padStart(9, "0") && obj1.RUC === item["__EMPTY_5"].toString()) !== -1)

				if (isDuplicateListaExcel.length !== 0) {
					sap.m.MessageBox.warning("Existen Comprobantes duplicados en la lista con el adjunto");
					return;
				}
				
				dataExcel = Array ;
				
				dataExcel.forEach(function (comp, index) {

					if (comp.__EMPTY_1 === "Tipo de comprobante") {
						return;
					}
					
					var fechaCambio = comp["__EMPTY_2"].replaceAll("/", "").replaceAll(".", "");
					var fechaFormato = fechaCambio.substr(0, 2) + "/" + fechaCambio.substr(2, 2) + "/" + fechaCambio.substr(4, 4);
					var baseImp = comp["__EMPTY_9"];
					var glosa = comp["__EMPTY_8"];
					var IGV = comp["__EMPTY_10"];
					var INAFECTO = comp["__EMPTY_11"];
					var TOTAL = comp["__EMPTY_12"];
					var Ceco = comp["__EMPTY_13"].toString();
					var indImp = comp["__EMPTY_6"].split(" - ")[0];
					// var Moneda = comp["__EMPTY_6"];
					var Serie = comp["__EMPTY_3"].toString().padStart(5, "0");//cambio de 15/06/2022;
					var numComp = comp["__EMPTY_4"].toString().padStart(9, "0");
					// var razSoc			= comp["Razon social"];
					var Ruc = comp["__EMPTY_5"];
					var tipComp = comp["__EMPTY_1"];
					var CodComp = comp["__EMPTY_1"].split(" - ")[0];
					var tipGasto = comp["__EMPTY_7"].split(" - ")[0];

					if (baseImp === "") {
						baseImp = "0.00";
					} else {
						baseImp = parseFloat(baseImp).toFixed(2);
						if (isNaN(baseImp) || baseImp === "0") {
							baseImp = "0.00";
						}
					}

					if (IGV === "") {
						IGV = "0.00";
					} else {
						IGV = parseFloat(IGV).toFixed(2);
						if (isNaN(IGV) || IGV === "0") {
							IGV = "0.00";
						}
					}

					if (INAFECTO === "") {
						INAFECTO = "0.00";
					} else {
						INAFECTO = parseFloat(INAFECTO).toFixed(2);
						if (isNaN(INAFECTO) || INAFECTO === "0") {
							INAFECTO = "0.00";
						}
					}

					if (TOTAL === "") {
						TOTAL = "0.00";
					} else {
						TOTAL = parseFloat(TOTAL).toFixed(2);
						if (isNaN(TOTAL) || TOTAL === "0") {
							TOTAL = "0.00";
						}
					}

					if (comprobAnt !== Serie + numComp && (RucAnt !== Ruc.toString() || RucAnt === Ruc.toString())) {//21/07/2022
						// keyDesg = 1;
						
						var estructura = {
							//SCastillo
							NROD0     : solicitud,
							DOC_PAGO  : "",
							COD_SAP		: COD_SAP,
							//SCastillo
							keySeg		: keyComp,
							key			: keyComp,
							COMPROBANTE	: Serie + "-" + numComp,
							TIPO_COMP	: tipComp,
							COD_TIPO_COMP: CodComp,
							TIPO_PRUEBA	: CodComp,//16/08/2022
							//SCastillo
							TIPODOCI	: Ruc.toString().length > 8 ? "RUC" : "DNI",
							//SCastillo
							FECHA_COMP	: fechaFormato,
							FECHA_PRUEBA :fechaFormato,//16/08/2022
							RUC			: Ruc.toString(),
							RAZON_SOCIAL: "",
							WAERS		: moneda,
							KOSTL		: "",
							ESTADO		: "",
							//SCastillo
							GLOSA		: glosa,
							PRUEBA_GLOSA : glosa,//16/08/2022
							DATOS_SAP	:false ,
							iconComp	: "sap-icon://pending",
							EST_COMP	: "COMP. PEND. APR.",
							COD_EST_COMP: "CPA",
							stateComp	: "Warning",
							VALIDA_GRABADO:false,
							COMPROBANTE_ANTIGUO	:Serie + "-" + numComp,
							COMPROBANTE_PRUEBA  :Serie + "-" + numComp,//16/08/2022
							RUC_COPIA		: Ruc.toString(),
							VALIDAR_DATOS	:false,//01/09/2022
							//SCastillo
							//COMP. PEND. APR
							desglose: [{
								stateCeco: "Success",
								iconCeco: "sap-icon://sys-enter-2",
								POSIC: keyDesg,
								COMPROBANTE: Serie + "-" + numComp,
								COD_CONT: tipGasto,
								// TIPO			: tipGasto,
								centro: Ceco === undefined ? "" : Ceco,
								BASE_IMP: baseImp,
								IGV: IGV,
								INAFECTO: INAFECTO,
								TOTAL: TOTAL,
								IND_IMP: indImp,
								imp: "",
								validaciones1: false,
								validacionBase: false,
								validacionInafecto: true,
								validacionIndicador: true,							
							}],
							archivoAd: [],
							DeleteArchivo : []
						};

						array_estructura.push(JSON.parse(JSON.stringify(estructura)));
						
						// array_estructura.map(function(items_o){//27/07/2022
							
						// if(items_o.COD_TIPO_COMP === "KX"){
						// items_o.TIPODOCI = "DEXT";	
						
						// }else if((items_o.COD_TIPO_COMP  === "SK" || items_o.COD_TIPO_COMP  === "PM")){
							
						// items_o.TIPODOCI = "DNI";	
						// }else{
							
						// items_o.TIPODOCI = "RUC";	
						// }
						
						// items_o.desglose.map(function(xs){
						// 	if(xs.IND_IMP === "C0"){
								
						// 	xs.BASE_IMP ="0.00";
						// 	xs.IGV ="0.00";		
						// 	xs.imputacion.map(function(rz){
						// 	rz.IMP = xs.INAFECTO;
						// 	rz.IMP_TOTAL = xs.INAFECTO;
						
						// });	
							
						// 	}	
						// });
						
						// });

						keyComp++

					}

					comprobAnt = Serie + numComp;
					RucAnt =Ruc.toString();//21/07/2022
				});
				var informacion = datas.concat(array_estructura);

				Proyect.setProperty("/ProductCollection" , informacion);

			} catch (e) {
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageBox.error("Error en el formato vuelva a intentarlo");
			}
			}



		},

		selecTipo_Comprobante:function(){// 17.04.2025
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var datos_filtro =[];
			// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_CLASE_DOCSet"; //
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
			// 		var selectDoc = {
			// 			CLASE: "",
			// 			DENOMINACION: "---Seleccionar---"
			// 		}
			// 		datos.unshift(selectDoc);
					var datos=[{
						CLASE:"",
						DENOMINACION:"---Seleccionar---"
					},{
						CLASE:"FAC",
						DENOMINACION:"Facturas"
					},{
						CLASE:"BO",
						DENOMINACION:"Boletas"
					}
				]
					
					
					ModelProyect.setProperty("/TipoDocumento", datos);
			// 	},
			// 	error: function () {
			// 		MessageBox.error("Ocurrio un error al obtener los datos", {
			// 		actions: ["Aceptar"],
			// 					emphasizedAction: MessageBox.Action.OK,
			// 					onClose: function (sAction) {
			// 						if (sAction === "Aceptar") {
			// 						location.reload();
			// 						}
			// 						sap.ui.core.BusyIndicator.hide();
			// 						console.log(er);
			// 					}
			// 		});
			// 	}
			// });	
			
			
		},

		GuardarComprobanteCr:function(){ //17.04.2025
			var vista 			     = this.getView();
			var Proyect 		     = vista.getModel("Proyect");
			var sRegistroComprobante = Proyect.getProperty("/sRegistroComprobantes");
			var fecha_Comprobante  	 = Proyect.getProperty("/fecha_Comprobante1");
			var Key_comprobante 	 = Proyect.getProperty("/Key_comprobante");
			var tipoNif 			 = Proyect.getProperty("/tipoNif");
			var datostipoDoc         = Proyect.getProperty("/datostipoDoc");
			var Ruc 				 = Proyect.getProperty("/ruc");
			var Razon_Social		 = Proyect.getProperty("/razonSocial");
			var Monedas				 = Proyect.getProperty("/monedas");
			var Glosa                =Proyect.getProperty("/Glosa");
			var contador			 =0;
			var DataGlosa            =Proyect.getProperty("/DataGlosa")[0];
			var camposVacios         = false;
			var validarCampos        = this.Validarcampos();
			var ProductCollection    = Proyect.getProperty("/ProductCollection");
			var repite  = false;
			
			
			
			if(validarCampos === true){
				camposVacios=true;				
			}
			if(DataGlosa.TOTAL == "0.00"){
				camposVacios=true;
			}

			if(DataGlosa.IND_IMP == ""){
				camposVacios=true;
			}

			if(DataGlosa.TOTAL == "0.00"){
				camposVacios=true;
			}

            if(camposVacios == true){
				MessageBox.warning("Completar los campos obligatorios");
				return;
            }

			if(ProductCollection !== undefined){ //06/10/2024
				ProductCollection.forEach(function (items2) {
				
					if(items2.COMPROBANTE == sRegistroComprobante){
						repite = true;
					}
	
				});


				if(repite == true){
					MessageBox.warning("El comprobante ya fue registrado");//06/10/2024
					return;
				}			
		

				var estructura = {
					key				: arrayguardar_comp.length +1,
					keySeg			:arrayguardar_comp.length +1,
					NROD0			:"",
					DOC_PAGO		:"",
					COD_SAP			:"",
					ID_DOC_SRV		:"",
					COMPROBANTE		:sRegistroComprobante,
					COD_TIPO_COMP	: Key_comprobante,
					TIPO_COMP		: "",
					TIPODOCI    	:  tipoNif,
					FECHA_COMP		: fecha_Comprobante,
					TIPO_NIF		: "",
					RUC				: Ruc,
					RAZON_SOCIAL	: Razon_Social,
					WAERS			: Monedas,
					ESTADO			:"",
					GLOSA   		: Glosa,
					ORDEN_INT		: "",
					VIAJES			: "",
					REF_FACTURA		: "",
					EST_COMP		: "",
					COD_EST_COMP	: "",
					DOC_COMP			:"",
					DOC_CONT			:"",
					DOC_PAGO_SOLICITUD  :"",
					FECHA_CONT			:"",
					FECHA_COMPENSA		:"",
					desglose: [{	
					"COMPROBANTE":sRegistroComprobante,
					"POSIC": "1",
					"COD_CONT": DataGlosa.COD_CONT,
					"BASE_IMP": DataGlosa.BASE_IMP,
					"IGV": DataGlosa.IGV,
					"INAFECTO": DataGlosa.INAFECTO,
					"TOTAL": DataGlosa.TOTAL,
					"IND_IMP": DataGlosa.IND_IMP,
					"imp": "",
					
					}]
					
				}
				ProductCollection.push(estructura);
	
				
				// const informacion =ProductCollection.concat(arrayguardar_comp); // 22/04/2025
				
				
				Proyect.setProperty("/RegistroCompro" , sRegistroComprobante);
				Proyect.setProperty("/GuardarComrpobantes" , arrayguardar_comp);
				Proyect.setProperty("/ProductCollection",ProductCollection);
				Proyect.setProperty("/sRegistroComprobantes","");
				Proyect.setProperty("/fecha_Comprobante1","");
				Proyect.setProperty("/Key_comprobante","");
				Proyect.setProperty("/tipoNif","");
				Proyect.setProperty("/ruc","");
				Proyect.setProperty("/razonSocial","");
				Proyect.setProperty("/monedas","");
				Proyect.setProperty("/Glosa","");						
				this.AgregarComprobante.close();


			}else {

				var estructura = {
					key				: arrayguardar_comp.length +1,
					keySeg			:arrayguardar_comp.length +1,
					NROD0			:"",
					DOC_PAGO		:"",
					COD_SAP			:"",
					ID_DOC_SRV		:"",
					COMPROBANTE		:sRegistroComprobante,
					COD_TIPO_COMP	: Key_comprobante,
					TIPO_COMP		: "",
					TIPODOCI    	:  tipoNif,
					FECHA_COMP		: fecha_Comprobante,
					TIPO_NIF		: "",
					RUC				: Ruc,
					RAZON_SOCIAL	: Razon_Social,
					WAERS			: Monedas,
					ESTADO			:"",
					GLOSA   		: Glosa,
					ORDEN_INT		: "",
					VIAJES			: "",
					REF_FACTURA		: "",
					EST_COMP		: "",
					COD_EST_COMP	: "",
					DOC_COMP			:"",
					DOC_CONT			:"",
					DOC_PAGO_SOLICITUD  :"",
					FECHA_CONT			:"",
					FECHA_COMPENSA		:"",
					desglose: [{	
					"COMPROBANTE":sRegistroComprobante,
					"POSIC": "1",
					"COD_CONT": DataGlosa.COD_CONT,
					"BASE_IMP": DataGlosa.BASE_IMP,
					"IGV": DataGlosa.IGV,
					"INAFECTO": DataGlosa.INAFECTO,
					"TOTAL": DataGlosa.TOTAL,
					"IND_IMP": DataGlosa.IND_IMP,
					"imp": "",
					
					}]
					
				}
				arrayguardar_comp.push(estructura);
               
	
				Proyect.setProperty("/RegistroCompro" , sRegistroComprobante);
				Proyect.setProperty("/GuardarComrpobantes" , arrayguardar_comp);
				Proyect.setProperty("/ProductCollection",arrayguardar_comp);
				Proyect.setProperty("/sRegistroComprobantes","");
				Proyect.setProperty("/fecha_Comprobante1","");
				Proyect.setProperty("/Key_comprobante","");
				Proyect.setProperty("/tipoNif","");
				Proyect.setProperty("/ruc","");
				Proyect.setProperty("/razonSocial","");
				Proyect.setProperty("/monedas","");
				Proyect.setProperty("/Glosa","");						
				this.AgregarComprobante.close();
				arrayguardar_comp = [];

			}	
			
		
		},

		userlog:function(){
			var that=this;
			var vista = this.getView();
			var ModelProyect = vista.getModel("Proyect");
			sap.ui.core.BusyIndicator.show(0);
				$.ajax({
				type: "GET",
				url: "/services/userapi/attributes",
				dataType: "json",
				contentType: "application/json",
				async: true,
				headers: {
					"Accept": "application/json"
				},
				success: function (response) {
				
					ModelProyect.setProperty("/DatosName", response.name);
					ModelProyect.setProperty("/correouser", response.email);
					// self._oStorage.put('currentUser', response.id);
					that.infoaprobador();                              
				
				}
			});	
		},
		servicioIgv:function(){
		var oView = this.getView();
		var ModelProyect = oView.getModel("Proyect");
		// var url="/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_GET_IGVSet";
		// 	jQuery.ajax({
		// 		type: "GET",
		// 		dataType: 'json',
		// 		headers: {
		// 			"Accept": "application/json"
		// 		},
		// 		contentType: "application/json",
		// 		url: url,
		// 		async: true,
		// 		success: function (data, textStatus, jqXHR) {
		// 			var datos = data.d.results;
		// 			ModelProyect.setProperty("/IGV",datos[0].IGV);
					
		// 		},
		// 		error: function () {
		// 			MessageBox.error("Ocurrio un error al obtener los datos", {
		// 			actions: ["Aceptar"],
		// 						emphasizedAction: MessageBox.Action.OK,
		// 						onClose: function (sAction) {
		// 							if (sAction === "Aceptar") {
		// 							location.reload();
		// 							}
		// 							sap.ui.core.BusyIndicator.hide();
		// 							console.log(er);
		// 						}
		// 			});
		// 		}
			// });	
			sap.ui.core.BusyIndicator.hide();
		},
		
		ValidacionTipoCambio: function(){
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_TIPO_CAMBIOSet";
			
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
					
			// 		ModelProyect.setProperty("/TipoCambio", datos);

			// 	},
			// 	error: function () {
			// 		MessageBox.error("Ocurrio un error al obtener los datos del servicio ZET_TIPO_CAMBIOSet");
			// 	}
			// });	
				
			},
			
		filtroceco: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_CECOSet";
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
					
			// 		for (var i = datos.length - 1; i >= 0; i--) {
			// 		if (datos[i].CECO === "" && datos[i].NOMBRE === "") {
			// 				datos.splice(i, 1);
			// 		}
			// 		}	
					
			// 		ModelProyect.setProperty("/datosCeco", datos);

			// 	},
			// 	error: function () {
			// 		MessageBox.error("Ocurrio un error al obtener los datos", {
			// 		actions: ["Aceptar"],
			// 					emphasizedAction: MessageBox.Action.OK,
			// 					onClose: function (sAction) {
			// 						if (sAction === "Aceptar") {
			// 						location.reload();
			// 						}
			// 						sap.ui.core.BusyIndicator.hide();
			// 						console.log(er);
			// 					}
			// 		});
					
			// 	}
			// });
			sap.ui.core.BusyIndicator.hide();
		},

		pressAgregarComproCR:function(){ //17.04.2025
			var vista = this.getView();
			var Proyect = vista.getModel("Proyect");
			var that= this;
			var ProductCollection = Proyect.getProperty("/ProductCollection");
			var arrayEstructura =[];
			var cont = "";

			if(ProductCollection === undefined){
				cont = 0
			}else{
				cont = ProductCollection
			}


			var estructura = {
									key				: cont + 1,
									keySeg			:cont + 1,
									NROD0			:"",
									DOC_PAGO		:"",
									COD_SAP			:"",
									ID_DOC_SRV		:"",
									COMPROBANTE		: "",
				    				COD_TIPO_COMP	: "",
				    				TIPO_COMP		: "",
				    				TIPODOCI    	:  "",
				    				FECHA_COMP		: "",
				    				TIPO_NIF		: "",
				    				RUC				: "",
				    				RAZON_SOCIAL	: "",
				    				WAERS			: "",
				    				ESTADO			:"",
				    				GLOSA   		: "",
				    				ORDEN_INT		: "",
				    				VIAJES			: "",
				    				REF_FACTURA		: "",
				    				EST_COMP		: "",
				    				COD_EST_COMP	: "",
				    			    DOC_COMP			:"",
				    			    DOC_CONT			:"",
				    			    DOC_PAGO_SOLICITUD  :"",
				    			    FECHA_CONT			:"",
									FECHA_COMPENSA		:"",
									desglose: [{	
									COMPROBANTE:"",
									POSIC: 1,
									COD_CONT: "",
									centro: "",
									BASE_IMP: "0.00",
									IGV: "0.00",
									INAFECTO: "0.00",
									TOTAL: "0.00",
									IND_IMP: "",
									imp: ""}]
									
			};
			arrayEstructura.push(estructura);

			Proyect.setProperty("/AgregarComprobantes" , arrayEstructura);
			Proyect.setProperty("/DataGlosa" , arrayEstructura[0].desglose);
			Proyect.setProperty("/datostipoDoc" , models.oTipoDoc()); //18.06/2024
			Proyect.setProperty("/datosmoneda" , models.oMoneda()); //20.06/2024
			Proyect.setProperty("/editableBaseI", false);//07/09/2024
			Proyect.setProperty("/editableBaseIGV", false);//07/09/2024
			Proyect.setProperty("/editableInafecto", false);//07/09/2024

			if (!that.AgregarComprobante) {
				that.AgregarComprobante = sap.ui.xmlfragment("rendicionER.fragments.AgregarComprobante", that);
				vista.addDependent(that.AgregarComprobante);
			}
			that.AgregarComprobante.open();
		},

	
		infoaprobador:function(){
		var oView = this.getView();
		var ModelInputs = oView.getModel("Proyect");
		var correoUser	=	ModelInputs.getProperty("/correouser");
		var that=this;
		var correo_prueba="";
		var queryString 	= window.location.host;
		var urlPage ="";
		
		if(correoUser === "developer.scp1@talma.com.pe"){
		correo_prueba = "katia.nicho@talma.com.pe"	;
		}else{
		correo_prueba =correoUser;	
		}
		
			
			// 	var url="/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_COLABORADORSet?$filter=CORREO eq '"+ correo_prueba +"'"; 
			
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
					
			// 		if(datos.length > 0 &&  datos !== undefined){
			// 		ModelInputs.setProperty("/DatosDni", datos[0].DNI);
			// 		ModelInputs.setProperty("/COD_SAP", datos[0].COD_SAP);
			// 		ModelInputs.setProperty("/beneficiarios", "Beneficiario: " + datos[0].NOMBRES +" "+datos[0].APELLIDOS);
			// 		ModelInputs.setProperty("/Nombre_Beneficiario" ,datos[0].NOMBRES +" "+datos[0].APELLIDOS);//nombre del beneficiario
			// 		ModelInputs.setProperty("/tituloTalma","Rendición de Entregas a Rendir (ER)");
			// 		ModelInputs.setProperty("/txtCodBen","Código del Beneficiario");
			// 		ModelInputs.setProperty("/areaAprob", false);
			// 		ModelInputs.refresh(true);
					
			// 		//-----Cambios JRodriguez-----
			// 		//&& parametroApp === "true"
			// 		 if(datos[0].AREA !== "" && datos[0].AREA.includes("OBSERVACIONES") && parametroApp === "true" && ValidacionlevObs ===true){
					 	
			// 		 		ModelInputs.setProperty("/tituloTalma","Levantamiento de Observaciones");
			// 				ModelInputs.setProperty("/beneficiarios", datos[0].NOMBRES +" "+datos[0].APELLIDOS );
			// 				ModelInputs.setProperty("/txtCodBen","Código");
			// 				ModelInputs.setProperty("/areaAprob", true);
			// 				tipoUsr = "LO";
			// 				ModelInputs.setProperty("/tipo_usuario",tipoUsr);	
				
			        	
			// 				that.selectestado();
						

			// 		}else{
						
			// 			if(ValidacionRendiEr === true &&  parametroApp !== "true"){
			// 			tipoUsr = "";
			// 			ModelInputs.setProperty("/tipo_usuario",tipoUsr);
					
			// 			that.selectestado();	
			// 			}else{
							
			// 				if(queryString.includes("n8pid6w2h2")){
			// 					urlPage = "https://flpnwc-n8pid6w2h2.dispatcher.us2.hana.ondemand.com/sites?siteId=9a6f515e-eb45-4d6a-9a51-932c1dba144a&appState=lean#Shell-home";
			// 				}else{
			// 					urlPage = "https://flpnwc-dwc4zd7e0s.dispatcher.us2.hana.ondemand.com/sites?siteId=cd08e08d-5ca9-4e8b-a352-374cb609125d&appState=lean#Shell-home";
			// 				}
							
			// 				MessageBox.error("Tu usuario no tiene acceso a este aplicativo.", {
			// 				actions: ["Aceptar"],
			// 					emphasizedAction: MessageBox.Action.OK,
			// 					onClose: function (sAction) {
			// 						if (sAction === "Aceptar") {
			// 						window.open(urlPage, "_self","")
			// 						}
									
			// 						sap.ui.core.BusyIndicator.hide();
								
			// 					}
			// 		});
			// 			}
						
						
			// 		}
			// 	}else{
			// 		MessageBox.error("El usuario no se encuentra registrado en Sap .", {
			// 			actions: ["Aceptar"],
			// 					emphasizedAction: MessageBox.Action.OK,
			// 					onClose: function (sAction) {
			// 						if (sAction === "Aceptar") {
										
									
			// 						}
			// 						sap.ui.core.BusyIndicator.hide();
								
			// 					}
			// 		});	
			// 	}
				
			// 	},
			// 	error: function () {
			// 	MessageBox.error("Ocurrio un error al obtener los datos");
					
			// 	}
			// });	
		},
		selectestado:function(){
			var vista = this.getView();
			var Proyect=vista.getModel("Proyect");
			var that=this;
			//    var url= "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_ESTADOSSet";
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
					
			// 		Proyect.setProperty("/estadoSolic",datos);
			// 		//-----Cambios JRodriguez-----
			// 		//colocar AA como parámetro de función
			// 			that.onBuscar();
			// 		//----------------------------
			// 	},
			// 	error: function () {
			// 			MessageBox.error("Ocurrio un error al obtener los datos", {
			// 			actions: ["Aceptar"],
			// 					emphasizedAction: MessageBox.Action.OK,
			// 					onClose: function (sAction) {
			// 						if (sAction === "Aceptar") {
			// 						location.reload();
			// 						}
			// 						sap.ui.core.BusyIndicator.hide();
			// 						console.log(er);
			// 					}
			// 		});
			// 	}
			// });
        
		},
		onBuscar: function () {
			var vista = this.getView();
			var ModelInputss=vista.getModel("Proyect");
		    var DatosDni=ModelInputss.getProperty("/DatosDni");
		    var estadoSolic=ModelInputss.getProperty("/estadoSolic");
    //         var estados= "(EPOS1 eq 'PR' or EPOS1 eq 'PAR' or EPOS1 eq 'R' or EPOS1 eq 'RCH' or EPOS1 eq 'RP' or EPOS1 eq 'CER')";
    //         var datosSolic = [{"NROD0": "--- Seleccionar ---"}];
            
    //         sap.ui.core.BusyIndicator.show(0);
            
	//     	//-----Cambios JRodriguez-----
	// 	    //colocar AA como parámetro de función
	// 	    if(tipoUsr === "LO"){
	// 	    	estados = "(EPOS1 eq 'O')";
	// 	    	DatosDni = "";
	// 	    }
	// 	    //----------------------------
    //         var selectSolicitudER	= vista.byId("selectSolicitudER")
	// 		var seleccion			= selectSolicitudER.getSelectedItems();
	// 		if(seleccion !== ""){
	// 			var datosinf = seleccion.map(function(obj){
	//             var dataSoc			= obj.getBindingContext("Proyect").getPath();
	//  			var DataSelecSoc	= ModelInputss.getProperty(dataSoc);	
	//             return 	DataSelecSoc;
	//             });	
	//              var datosol="";
	//             var datossolic="";
	            
	//             if(datosol===""){
	//             datosol="NROD0 eq ''";	
	//             }
	           
	//             datosinf.forEach(function(its,i){
	// 	            if (i> 0) {
	// 					datosol += " or NROD0 eq '" + its.NROD0 + "'";
	// 					if (datosinf.length === i + 1) {
	// 						datosol = "(" + datosol + ")";
	// 					}
	// 				} else {
	// 					datosol = "NROD0 eq '" + its.NROD0 + "'";
	// 					// datossolic=its.ESTADO;
	// 				}
	//             });	
	//         }else{
	//         	datosol = "NROD0 eq ''";
	//         }
            
    //         var array=[];
    //         //ZFBDT ge '20151231' and ZFBDT le '20310101')
    //         //var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_SOLICITUD_DETSet?$filter=(ZFBDT ge '' and ZFBDT le '') and "+datosol+" and DNI eq '"+DatosDni+"' and BUKRS eq '' and LIFNR eq '' and BENEFICIARIO eq ''";
    //         var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_SOLICITUD_DETSet?$filter=(ZFBDT ge '' and ZFBDT le '') and "+estados+" and "+datosol+" and DNI eq '"+DatosDni+"' and BUKRS eq '' and LIFNR eq '' and BENEFICIARIO eq ''";
	// 		jQuery.ajax({
	// 			type: "GET",
	// 			cache: false,
	// 			headers: {
	// 				"Accept": "application/json"
	// 			},
	// 			contentType: "application/json",
	// 			url: url,
	// 			async: true,
	// 			success: function (data, textStatus, jqXHR) {
	// 				sap.ui.core.BusyIndicator.hide(0);
	// 				var datos = data.d.results;
	// 				//if(datos.length >0 && datos !== undefined){
					
	// 				datos.forEach(function(rs){
	// 					rs.Fecha=rs.ZFBDT.substring(6,8)+"/"+rs.ZFBDT.substring(4,6)+"/"+rs.ZFBDT.substring(0,4);
	// 					// array.push(rs);
	// 					// array.reverse();	
	// 				});
					
	// 				var datas=ModelInputss.getProperty("/DataComprobanteConfirmacion");
	// 					//-----Cambios JRodriguez-----
	// 				datos.forEach(function(items){
	// 					// if(items.EPOS1==="C"){
	// 					//  items.EPOS2="PR";
	// 					//  //Cambios de CR.
	// 					//  switch(items.EPOS2){
	// 					//  case "PR":
    //   //                  items.estado="Warning";
    //   //                  items.iconEstado="";
    //   //              	items.habilitado=false;
    //   //                  break;
    //   //               	}
    //   //               	ModelInputss.refresh(true);
	// 					// }else{
							
	// 					switch(items.EPOS1){
	// 					 case "PR":
    //                     items.estado="Warning";
    //                     items.iconEstado="";
    //                 	items.habilitado=false;
    //                     break;	
	// 					 case "O":
    //                     items.estado="Information";
    //                     items.iconEstado="sap-icon://document-text";
    //                 	items.habilitado=false;
    //                     break;
    //                      case "CER":
    //                     items.estado="Indication01";
    //                     items.iconEstado="";
    //                 	items.habilitado=true;
    //                     break;
    //                 	  case "PAR":
    //                     items.estado="Information";
    //                     items.iconEstado="";
    //                    items.habilitado=false;
    //                     break;
    //                     case "R":
    //                     items.estado="Success";
    //                     items.iconEstado="";
    //                     items.habilitado=false;
    //                     break;
    //                     case "RCH":
    //                     items.estado="Error";
    //                     items.iconEstado="sap-icon://error";
    //                     items.habilitado=false;
    //                     break;
                        
                     		
	// 				}
	// 				 		items.EPOS2 = items.EPOS1;
	// 					//}
						
	// 					estadoSolic.map(function(estados){
	// 						if(items.EPOS2 === estados.ESTADO){
	// 							items.descripcion = estados.DESCRIPCION ;      
	// 						}
	// 					});
						
	// 					items.IMP_RENDIDO = items.IMP_RENDIDO.replaceAll(" ", "");
					
	// 					if(items.IMP_RENDIDO === "" || parseFloat(items.IMP_RENDIDO) < 0.01 || items.IMP_RENDIDO === undefined){
	// 						items.IMP_RENDIDO="0.00";
	// 					}else{
	// 						items.IMP_RENDIDO=parseFloat(items.IMP_RENDIDO).toFixed(2);
	// 					}
						
	// 					var datosFiltros = {"NROD0": items.NROD0};
	// 					datosSolic.push(datosFiltros);
	// 				});	
	// 				//----------------------------
					
	// 				sap.ui.core.BusyIndicator.hide(0);
					
	// 				if(consBusc){
	// 					ModelInputss.setProperty("/Solicitudes",datosSolic);
	// 					consBusc = false; 
	// 				}
					
	// 				ModelInputss.setProperty("/ReporteHistoricoTable", datos);
	// 				ModelInputss.refresh(true);
	// 				ModelInputss.setProperty("/count", "(" + datos.length + ")");
					
	// 			//}
	// 			sap.ui.core.BusyIndicator.hide();
	// 			// else{
	// 			// 	ModelInputss.refresh(true);
	// 			// 	if(tipoUsr === ""){
	// 			// 	MessageBox.warning("El usuario no cuenta con solicitudes creadas .", {
	// 			// 		actions: ["Aceptar"],
	// 			// 				emphasizedAction: MessageBox.Action.OK,
	// 			// 				onClose: function (sAction) {
	// 			// 					if (sAction === "Aceptar") {
									
	// 			// 					}
	// 			// 					sap.ui.core.BusyIndicator.hide();
								
	// 			// 				}
	// 			// 	});	
	// 			// 	}else{
	// 			// 	MessageBox.warning("No tiene observaciones pendientes.", {
	// 			// 		actions: ["Aceptar"],
	// 			// 				emphasizedAction: MessageBox.Action.OK,
	// 			// 				onClose: function (sAction) {
	// 			// 					if (sAction === "Aceptar") {
									
	// 			// 					}
	// 			// 					sap.ui.core.BusyIndicator.hide();
								
	// 			// 				}
	// 			// 	});	
	// 			// 	}
	// 			// }
					
	// 			},
	// 			error: function () {
	// 				MessageBox.error("Ocurrio un error al obtener los datos");
	// 			}
	// 		});
		
		},
	
		selectSociedad: function () {
			var vista = this.getView();
			var modelo = vista.getModel("Proyect");
			// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_SOCIEDADSet";

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
			// 		var info={
			// 			BUKRS:" ",
			// 			BUTXT:"--- Seleccionar ---"
			// 		}
			// 		datos.unshift(info);

			// 		modelo.setProperty("/Sociedades", datos);
			// 	},
			// 	error: function () {
			// 		MessageBox.error("Ocurrio un error al obtener los datos", {
			// 		actions: ["Aceptar"],
			// 					emphasizedAction: MessageBox.Action.OK,
			// 					onClose: function (sAction) {
			// 						if (sAction === "Aceptar") {
			// 						location.reload();
			// 						}
			// 						sap.ui.core.BusyIndicator.hide();
			// 						console.log(er);
			// 					}
			// 		});
			// 	}
			// });
		},
			tipoGasto: function () {
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			// var url = "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_TIPO_GASTOSet";
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
			// 		ModelProyect.setProperty("/datosGastos", datos);
			// 	},
			// 	error: function () {
			// 		MessageBox.error("Ocurrio un error al obtener los datos", {
			// 		actions: ["Aceptar"],
			// 					emphasizedAction: MessageBox.Action.OK,
			// 					onClose: function (sAction) {
			// 						if (sAction === "Aceptar") {
			// 						location.reload();
			// 						}
			// 						sap.ui.core.BusyIndicator.hide();
			// 						console.log(er);
			// 					}
			// 		});
			// 	}
			// });
		},

		limpiar: function () {
			var that = this;
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			// ModelProyect.setProperty("/count",0);
			// ModelProyect.setProperty("/ReporteHistoricoTable",[]);
			// ModelProyect.setProperty("/ReporteHistorico",[]);
			// oView.byId("selectSolicitudER").setSelectedKey("");
		},
		onPressNavButton: function () {
			this.limpiar();
			this.oRouter.navTo("Home");
		},
		onPressSociedad:function(oEvent){
			var oView = this.getView();
			var ModelProyect = oView.getModel("Proyect");
			var Sociedades = oEvent.mParameters.selectedItem.mProperties.key;
			ModelProyect.setProperty("/pressSociedad",Sociedades);
		},
		
		
		onFilterSelect: function (oEvent) {
			var oBinding = this.byId("table").getBinding("items"),
				sKey = oEvent.getParameter("key"),
				aFilters = [];
			var count = 0;
			var data = this.getView().getModel("Proyect").getProperty("/ReporteHistorico");
			
			for (var i = 0; i < data.length; i++) {
			
				aFilters.push(data[i]);
				
			}
			
			count = aFilters.length;
			this.getView().getModel("Proyect").setProperty("/count", count);
			this.getView().getModel("Proyect").setProperty("/ReporteHistoricoTable", aFilters);
		},
		handleSelectionChange: function (oEvent) {
			var that					= this;
			var oView					= this.getView();
			var ModelProyect			= oView.getModel("Proyect");
			var productPath 			= oEvent.getSource().getBindingContext("Proyect").getPath(),
				product 				= productPath.split("/").slice(-1).pop();
			var Sociedades				=ModelProyect.getProperty("/Sociedades");
			var selected				= oView.getModel("Proyect").getProperty(productPath);
			var TipoDocumento			=ModelProyect.getProperty("/TipoDocumento");
			var datosGastos 			=ModelProyect.getProperty("/datosGastos");
			var contadores				=0;
			var mensajes				="";
			var arrayTablas				=[];
			var keyDesg					=1;
			var comprobAnt				= "";
			var indexAnt				 = 0;
			var keyComp					 = 1;
			var validar					=false;
			var importeRen				=0;
			var igv						=ModelProyect.getProperty("/IGV");
			var restaSaldo				=0;
			var estadoSolic				=ModelProyect.getProperty("/estadoSolic");
			var suma_ren				=0;
			var COD_SAP					=ModelProyect.getProperty("/COD_SAP");
			var codigo_sap				="";
			ModelProyect.setProperty("/datosComprobante",selected);
			sap.ui.core.BusyIndicator.show(0);
			
			if(tipoUsr === "LO"){
			codigo_sap ="";	
			}else{
			codigo_sap = COD_SAP;	
			}
			// var datos={
				
			// 	"NROD0": selected.NROD0,
			// 	"COD_REPO": "",
			// 	"COD_REEM": "",
			// 	"DOC_PAGO": "",
			// 	"NIVEL_AP": "",
			// 	"COD_SAP": codigo_sap,
			// 	"MENSAJE": "",
			// 	"ZET_VALIDA_SOLICITUDSet": [
			// 	{
			// 	   "NROD0": "",
			//       "COMPROBANTE": "",
			//       "POSIC": "",
			//       "TIPO_COMP": "",
			//       "FECHA_COMP": "",
			//       "RUC": "",
			//       "RAZON_SOCIAL": "",
			//       "WAERS": "",
			//       "IND_IMP": "",
			//       "TIPO_GASTO": "",
			//       "KOSTL": "",
			//       "BASE_IMP": "",
			//       "IGV": "",
			//       "INAFECTO": "",
			//       "TOTAL": "",
			//       "EST_SOLI": "",
			//       "EST_COMP": "",
			//       "ADJUNTO": "",
			//       "GLOSA": "",
			//       "DOC_PAGO": "",
			//       "COD_SAP": "",
			//       "FECHA_REG": "",
			//       "NIVEL_AP": "",
			//       "COD_CONT": "",
			//       "FECHA_APR": "",
			//       "IMP_RENDIDO": "",
			//       "COD_REPO": "",
			//       "COD_REEM": "",
			//       "ORDEN_INT": "",
			//       "VIAJES": "",
			//       "TIPO_NIF": "",
			//       "CUENTA_BANC": "",
			//       "LIBERADOR1": "",
			//       "LIBERADOR2": "",
			//       "FECHA_ENV": "",
			//       "REF_FACTURA": "",
			//       "EMAIL_AD_USOL":"",
			//       "COD_SAP_LIB2":"",
			//       "DOC_COMP":"",
			//       "DOC_CONT":"",
			//       "DOC_PAGO_SOLICITUD":"",
			//       "FECHA_CONT" :"",
			// 	  "FECHA_COMPENSA":"",
			      
			// 	}
			// 	]
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
			// 		url: "/ERP/sap/opu/odata/sap/ZOD_RENDICIONES_SRV/ZET_VALIDA_SOLICITUD_CABSet",
			// 		method: "POST",
			// 		headers: {
			// 			"x-CSRF-Token": token
			// 		},
			// 		async: true,
			// 		contentType: "application/json",
			// 		dataType: "json",
			// 		data: JSON.stringify(datos),
			// 	}).always(async function (data, status, response) {
			// 		var datos=data.d.ZET_VALIDA_SOLICITUDSet.results;
			// 		var mensaje=data.d.MENSAJE;
			// 		var numeroComprobante="";
			// 		for (var i = datos.length - 1; i >= 0; i--) {
			// 		if (datos[i].NROD0 === "") {
			// 				datos.splice(i, 1);
			// 		}
			// 		}
			// 		if(datos.length > 0){
					
			// 	//----------Modificado Por: Jeremy Rodriguez 18/02/2022--------------//
					
			// 		datos.map(function(items2){
						
			// 			var repite = false;
						
			// 			arrayTablas.map(function (comp, index) {
			// 				if(comp.COMPROBANTE === items2.COMPROBANTE && comp.RUC === items2.RUC){//21/07/2022
			// 					repite = true;
			// 					indexAnt = index;
			// 				}
			// 			});
					
			// 			TipoDocumento.forEach(function(objec){
			// 				if(objec.CLASE === items2.TIPO_COMP){
			// 				items2.descripcion = objec.DENOMINACION ;         
			// 				}
							
			// 			});
			// 				estadoSolic.map(function(objectos_01){
			// 				if( objectos_01.ESTADO  === items2.EST_COMP ){
			// 					items2.DES_ESTADO_COMP =objectos_01.DESCRIPCION;
			// 				}	
			// 				});
					
						
			// 			items2.POSIC		= (items2.POSIC*1).toString();
					
			// 			var fechaFormato	= items2.FECHA_COMP.substr(6,2) + "/" + items2.FECHA_COMP.substr(4,2) + "/" + items2.FECHA_COMP.substr(0,4);
			// 			var baseImp 		= items2.BASE_IMP.replaceAll(" ","");
			// 			var IGV 			= items2.IGV.replaceAll(" ","");
			// 			var INAFECTO		= items2.INAFECTO.replaceAll(" ","");
			// 			var TOTAL			= items2.TOTAL.replaceAll(" ","");
			// 			// var IND_IMP 		= items2.IND_IMP.replaceAll(" ","");
						
			// 			if(baseImp === ""){
			// 				baseImp = "0.00";
			// 			}else{
			// 				baseImp 	= parseFloat(baseImp).toFixed(2);
			// 				if(isNaN(baseImp) || baseImp === "0"){
			// 					baseImp = "0.00";
			// 				}
			// 			}
						
			// 			if(IGV === ""){
			// 				IGV = "0.00";
			// 			}else{
			// 				IGV 		= parseFloat(IGV).toFixed(2);
			// 				if(isNaN(IGV) || IGV === "0"){
			// 					IGV = "0.00";
			// 				}
			// 			}
						
			// 			if(INAFECTO === ""){
			// 				INAFECTO = "0.00";
			// 			}else{
			// 				INAFECTO	= parseFloat(INAFECTO).toFixed(2);
			// 				if(isNaN(INAFECTO) || INAFECTO === "0"){
			// 					INAFECTO = "0.00";
			// 				}
			// 			}
						
			// 			if(TOTAL === ""){
			// 				TOTAL = "0.00";
			// 			}else{
			// 				TOTAL		= parseFloat(TOTAL).toFixed(2);
			// 				if(isNaN(TOTAL) || TOTAL === "0"){
			// 					TOTAL = "0.00";
			// 				}
			// 			}
						
			// 			// if(IND_IMP === ""){
			// 			// 	IND_IMP = "0.00";
			// 			// }else{
			// 			// 	IND_IMP 	= parseFloat(IND_IMP);
			// 			// 	if(isNaN(IND_IMP) || IND_IMP === 0){
			// 			// 		IND_IMP = "0.00";
			// 			// 	}
			// 			// }
						
			// 			if(!repite){
							
			// 				var estructura = {
			// 					NROD0			:items2.NROD0,
			// 					DOC_PAGO		:items2.DOC_PAGO,
			// 					COD_SAP			:items2.COD_SAP,
			// 					ID_DOC_SRV		:items2.ID_DOC_SRV,
			// 					key				: keyComp,
			// 					keySeg			:keyComp,
			// 					COMPROBANTE		: items2.COMPROBANTE,
			//     				COD_TIPO_COMP	: items2.TIPO_COMP,
			//     				COPIA_COD_TIPO	: items2.TIPO_COMP,
			//     				TIPO_COMP		: items2.descripcion,
			//     				TIPODOCI    	:   "",
			//     				FECHA_COMP		: fechaFormato,
			//     				TIPO_NIF		: items2.TIPO_NIF,
			//     				RUC				: items2.RUC,
			//     				NIVEL_AP		:items2.NIVEL_AP,
			//     				KOSTL			: items2.KOSTL,
			//     				RAZON_SOCIAL	: items2.RAZON_SOCIAL,
			//     				COPIA_RAZON		: items2.RAZON_SOCIAL, //24/07/2022
			//     				WAERS			: items2.WAERS,
			//     				ESTADO			: items2.ESTADO,
			//     				GLOSA   		: items2.GLOSA,
			//     				COPIA_GLOSA		: items2.GLOSA,
			//     				ORDEN_INT		: items2.ORDEN_INT,// DE 16/06/2022
			//     				COPIA_ORDEN		:items2.ORDEN_INT,// DE 16/06/2022
			//     				VIAJES			: items2.VIAJES,// DE 16/06/2022
			//     				COPIA_VIAJES	: items2.VIAJES,// DE 16/06/2022
			//     				REF_FACTURA		: items2.REF_FACTURA,
			//     				COPIA_REFERENCIA :items2.REF_FACTURA,//16/06/2022
			//     				EST_COMP		: items2.DES_ESTADO_COMP,
			//     				COD_EST_COMP	: items2.EST_COMP,
			//     				HABILI_COMPRO	:  false,
			//     				COMPROBANTE_PRUEBA :"",
			//     				COMPROBANTE_EDITADO:"",//30/06/2022
			//     				COMPROBANTE_ANTIGUO :items2.COMPROBANTE,
			//     				COMPROBANTE1		:items2.COMPROBANTE,//27/07/2022
			//     				DATOS_SAP			:true ,
			//     				validacion_guardado :true,//30062022
			//     				RUC_COPIA			:items2.RUC,
			//     				RUC_PRUEBA			:items2.RUC,
			//     				RUC_EDITADO			:"",//30/06/2022
			//     				FECHA_ANTIGUA		:fechaFormato,
			//     				RUC_COPIA1			:"",
			//     				FECHA_PRUEBA		:"",
			//     				TIPO_COMPRO_ANTIGUO	:"",
			//     				COPIA_TIPO			:"",
			//     				TIPO_PRUEBA			:"",
			//     				PRUEBA_GLOSA		:"",
			//     				EMAIL_AD_USOL       :items2.EMAIL_AD_USOL,
			//     				COD_SAP_LIB2		:items2.COD_SAP_LIB2,
			//     				VALIDA_GRABADO		:false,//27/07/2022
			//     				VALIDAR_DATOS		:false, //01/09/2022
			//     				DOC_COMP			:items2.DOC_COMP,
			//     			    DOC_CONT			:items2.DOC_CONT,
			//     			    DOC_PAGO_SOLICITUD  :items2.DOC_PAGO_SOLICITUD,
			//     			    FECHA_CONT			:items2.FECHA_CONT,
			// 					FECHA_COMPENSA		:items2.FECHA_COMPENSA,
			    				
			// 					desglose: [{
			// 									stateCeco			: "",
			// 									iconCeco			: "",
			// 									POSIC				: items2.POSIC,
			// 									COMPROBANTE			: items2.COMPROBANTE,
			// 									COD_CONT			: items2.COD_CONT,
			// 									ANTIGUO_GASTO		: items2.COD_CONT,
			// 									centro				: "",
			// 									BASE_IMP			: baseImp,
			// 									ANTIGUA_BASE		: baseImp,
			// 									IGV					: IGV,
			// 									ANTIGUO_IGV			:IGV,
			// 									INAFECTO			: INAFECTO,
			// 									ANTIGUO_INAFECTO	:INAFECTO,
			// 									TOTAL				: TOTAL,
			// 									ANTIGUO_TOTAL		:TOTAL,
			// 									IND_IMP				: items2.IND_IMP,
			// 									ANTIGUO_IND			: items2.IND_IMP,
			// 									imp					: "",
			// 									CUENTA_BANC			: items2.CUENTA_BANC,
			// 									ANTIGUA_BASE		: baseImp,
			// 									ANTIGUO_INAFECTO	:INAFECTO,
			// 									ANTIGUO_CUENTA		: items2.CUENTA_BANC,
			// 									movilidad			: [],
			// 									imputacion			: [],
			// 								}],
			// 					archivoAd: []
			// 				};
			// 				arrayTablas.push(estructura);
			// 				keyComp++;
							
			// 			}else{
			// 				var desgloces = {
			// 					stateCeco			: "",
			// 					iconCeco			: "",
			// 					POSIC				: items2.POSIC,
			// 					COMPROBANTE			: items2.COMPROBANTE,
			// 					COD_CONT			: items2.COD_CONT,
			// 					centro				: "",
			// 					BASE_IMP			: baseImp,
			// 					IGV					: IGV,
			// 					INAFECTO			: INAFECTO,
			// 					TOTAL				: TOTAL,
			// 					IND_IMP				: items2.IND_IMP,
			// 					imp					: "",
			// 					CUENTA_BANC			: items2.CUENTA_BANC,
			// 					ANTIGUO_GASTO		: items2.COD_CONT,
			// 					ANTIGUA_BASE		: baseImp,
			// 					ANTIGUO_IGV			:IGV,
			// 					ANTIGUO_INAFECTO	:INAFECTO,
			// 					ANTIGUO_TOTAL		:TOTAL,
			// 					ANTIGUO_IND			: items2.IND_IMP,
			// 					ANTIGUO_CUENTA		: items2.CUENTA_BANC,
			// 					movilidad			: [],
			// 					imputacion			: []
			// 				};
			// 				arrayTablas[indexAnt].desglose.push(desgloces);
			// 			}
			// 			comprobAnt = items2.COMPROBANTE;
			// 		});
					
					
			// 		console.log(arrayTablas);
					
			// 		ModelProyect.refresh(true);
				
			// 	//------------------------------------------------------------------------//
					
			// 		var COD_SAP 		= ModelProyect.getProperty("/COD_SAP");
			// 		let  Comprobantes	= arrayTablas.map(obj=> obj.COD_SAP+"."+obj.NROD0 +"."+obj.FECHA_COMP.split("/")[2] + "." + obj.ID_DOC_SRV );
			// 		let	 Folders		= await that.BuscarFolder(Comprobantes);
					
			// 		if(Folders.length !== 0){
			// 		let ComprobantesSinAdjuntos	= Folders.filter(obj=> obj.exception === "objectNotFound" || obj.objects.length === 0 ) ;
					
			// 		// if (ComprobantesSinAdjuntos.length !== 0){
			// 		// MessageBox.error("Ocurrio un error al leer los datos");
			// 		// sap.ui.core.BusyIndicator.hide(0);					
			// 		// return ;
			// 		// }
					
			// 		}
					
			// 		// let Folders1 = Folders.filter(obj=> !obj.exception );
					
			// 		arrayTablas.map(function(obj,index){
			// 			Folders.map(function(obj2,index1){
							
			// 				if(!obj2.exception && index === index1){
			// 				obj2.objects.map(function(obj3){
							
			// 				const archivo = { 
			// 					Type	:obj3["object"]["properties"]["cmis:name"]["value"].split(".")[obj3["object"]["properties"]["cmis:name"]["value"].split(".").length-1],
			// 					Name	:that.DecodeUTF8(obj3["object"]["properties"]["cmis:name"]["value"]),
			// 					Base64	:""	 ,
			// 					Service :true
			// 				};
			// 				obj.archivoAd.push(JSON.parse(JSON.stringify(archivo)));	
							
			// 				});
							
			// 				obj.service = true ;
			// 				}
			// 			});
						
			// 			obj.DeleteArchivo = []; 
			// 		});
					
				
			// 		ModelProyect.setProperty("/DataComprobanteConfirmacion",arrayTablas);
			// 		ModelProyect.setProperty("/Comprobantes_sap",arrayTablas);
					
					
			// 		arrayTablas.forEach(function(rx){
			// 			if(rx.COD_TIPO_COMP === "D5"){  ////Cambios de Claudia
			// 			ModelProyect.setProperty("/Nombre_Boton","Registrar");	
			// 			}else{
			// 			ModelProyect.setProperty("/Nombre_Boton","Validar");	
			// 			}	
					
			// 			var base01		=0;	//--------------actualizado
			// 			var inafecto01	=0;
			// 			var Impuesto	=0;
			// 			rx.desglose.forEach(function(obj){
				
			// 			 base01		+=parseFloat(obj.BASE_IMP);
			// 			 inafecto01	+=parseFloat(obj.INAFECTO);
						
			// 			if(obj.IND_IMP === "C0"){//---------Cambios nuevos
			// 			base01		="0.00";//17/07/2022
			// 			Impuesto	="0.00";
			// 			rx.totales =  (inafecto01).toFixed(2);
			// 			}else{
			// 			Impuesto	+= parseFloat(obj.IGV);
			// 			rx.totales =  (parseFloat(base01) + parseFloat(Impuesto) + inafecto01).toFixed(2) ; //total por comprobante
			// 			}
						
					
				
			// 		});
					
			// 			if(Impuesto === "0.00"){
			// 			importeRen =parseFloat(inafecto01);
			// 			}else{
			// 			importeRen =parseFloat(suma_ren);
			// 			}
			// 		ModelProyect.refresh(true);	
			// 		suma_ren	+= parseFloat(rx.totales);// importe rendido
			// 		estadoSolic.map(function(objectos){
			// 			if(rx.COD_EST_COMP === "CPA"){
			// 				rx.iconComp	="sap-icon://pending";
			// 				rx.stateComp="Warning";            
			// 			}else if(rx.COD_EST_COMP === "CR" || rx.COD_EST_COMP === "CER"){
			// 				rx.iconComp	="sap-icon://decline";
			// 				rx.stateComp="Error";	
			// 			}else if(rx.COD_EST_COMP === "O"){
			// 				rx.iconComp	="sap-icon://vds-file";
			// 				rx.stateComp="Information";	
			// 			}else if(rx.COD_EST_COMP === "CA"){
			// 				rx.iconComp = "sap-icon://accept";
			// 				rx.stateComp = "Success";
			// 			}
					
			// 			ModelProyect.setProperty("/ESTADO_COMP"		,rx.EST_COMP);
					
			// 		});
					
			// 		if(rx.COD_EST_COMP === "CPA" || rx.COD_EST_COMP === "CR"){
			// 		rx.HABILI_COMPRO = true;	
			// 		}else{
			// 		rx.HABILI_COMPRO = false;	
			// 		}
				
			// 		});
			// 		///////// Cambios de Claudia ///////////////
			// 			var ImporteRendido	=suma_ren.toFixed(2);	
			// 			restaSaldo			=parseFloat(ImporteRendido) - parseFloat(selected.WRBTR) ;//cambio de 04/06/2022
			// 		var SaldoTotal			= restaSaldo.toFixed(2);
			// 			ModelProyect.setProperty("/ImporteRend"		,ImporteRendido);
			// 		ModelProyect.setProperty("/Saldo"		,SaldoTotal);
						
					
			// 		if(parseFloat(selected.WRBTR) < ImporteRendido){
			// 			ModelProyect.setProperty("/estado_saldo" ,"Success");	// cambio de 04/06/2022
			// 		}else if (ImporteRendido === "0.00"){
			// 			ModelProyect.setProperty("/estado_saldo" ,"None");		
			// 		}else{
			// 			ModelProyect.setProperty("/estado_saldo" ,"Error");	
			// 		}
			// 		///////// Cambios de Claudia ///////////////
					
					
			// 		}else{
						
						
			// 			ModelProyect.setProperty("/DataComprobanteConfirmacion",[]);
			// 			ModelProyect.setProperty("/ImporteRend"		,"0.00");
			// 			ModelProyect.setProperty("/Saldo"		,"0.00");
			// 			ModelProyect.setProperty("/Nombre_Boton","Validar");
			// 			ModelProyect.setProperty("/Comprobantes_sap",[]);
			// 			ModelProyect.refresh(true);
			// 		}
			// 		var Nombre_Boton					=ModelProyect.getProperty("/Nombre_Boton");
			// 		var selectKeyCECO					=ModelProyect.getProperty("/selectKeyCECO");
			// 		var datosCeco						=ModelProyect.getProperty("/datosCeco");
			// 		var descripcionceco = "";
					
			// 		if(selectKeyCECO === "---Seleccionar---" ||selectKeyCECO === undefined || selectKeyCECO===""){
			// 			ModelProyect.setProperty("/selectCeco","");
			// 		}else{
			// 			datosCeco.forEach(function(items){
			// 				if(items.CECO === selectKeyCECO){
			// 					 items.descripcionCeco=items.CECO+ "-"+items.NOMBRE;
			// 					 descripcionceco=items.descripcionCeco;
			// 				}
			// 			});
						
			// 			ModelProyect.setProperty("/selectCeco",descripcionceco);
			// 		}
					
			// 		Sociedades.forEach(function(obj){
			// 			if(obj.BUKRS=== selected.BUKRS){
			// 				selected.descripcionsociedad=obj.BUTXT;
			// 			}
			// 		});	
					 
			// 		// ModelProyect.setProperty("/DataComprobanteConfirmacion",desglose);
			// 		ModelProyect.setProperty("/descripcionSociedad", selected.BUKRS+"-"+selected.descripcionsociedad);
			// 		ModelProyect.setProperty("/DniUsua",selected.DNI);
			// 		ModelProyect.setProperty("/descripcionEmpleado",selected.NOMBRES +" "+ selected.APELLIDOS);
			// 		ModelProyect.setProperty("/moneda",selected.WAERS);
			// 		ModelProyect.setProperty("/importe",selected.WRBTR);
			// 		ModelProyect.setProperty("/solicitud",selected.NROD0);
			// 		ModelProyect.setProperty("/nroDocPago",selected.AUGBL);
			// 		ModelProyect.setProperty("/nroSap",selected.COD_SAP);
			// 		ModelProyect.setProperty("/descripcionEmpleados",selected.NOMBRES +" "+ selected.APELLIDOS);
			// 		ModelProyect.setProperty("/FECHA_ABON",selected.FECHA_ABON);
					
			// 		ModelProyect.refresh(true);	
			// 		sap.ui.core.BusyIndicator.hide(0);
			// 	 	that.oRouter.navTo("DetalleSolicitudConER");

			// 	});

			// });

		},
		
		BuscarFolder : async function (Sends){
			try {
			const AmbienteRepository = location.hostname.includes("n8pid6w2h2") ? "/cmis/0586704171cab1ea3b1f93d5/root/QAS/AdjuntosER/": "/cmis/0586704171cab1ea3b1f93d5/root/PRD/AdjuntosER/"	
			const results = await Promise.all(Sends.map(url=> 
			// "/sap/fiori/irequestbvregistrodocliq"+
				fetch(HostName+AmbienteRepository+ url,
				{
				method		:"GET",
				processData	:false,
				contentType	:false,
				}
				)
			)) 
			const finalData	   = await Promise.all(results.map(result => 
					result.json()));
				return 	finalData ;
				console.log(finalData);
			}
			catch(err) {
				console.log(err);
			}
			
		},
		
		pressSi:function(){
			var oView			= this.getView();
			var ModelProyect	=oView.getModel("Proyect");	
			var id2				=sap.ui.getCore().byId("id2").sId;
			
			if(id2 ){
				ModelProyect.setProperty("/seleccion_CECO",id2);	
				ModelProyect.setProperty("/enableCeco",true);	
			}
		},
		pressNo:function(){
			var oView			= this.getView();
			var that            =this;
			var ModelProyect	= oView.getModel("Proyect");
			var id1				=sap.ui.getCore().byId("id1").sId;
			if(id1){
				ModelProyect.setProperty("/selectKeyCECO", "");
				ModelProyect.setProperty("/seleccion_CECO", id1);
				ModelProyect.setProperty("/enableCeco", false);	
			}	
		},
		onAceptar_Ceco:function(oEvent){
		var oView							= this.getView();
		var ModelProyect					= oView.getModel("Proyect");
		var that            				=this;
		var seleccion_CECO  				=ModelProyect.getProperty("/seleccion_CECO");
		var selectKeyCECO					=ModelProyect.getProperty("/selectKeyCECO");
		var datosCeco						=ModelProyect.getProperty("/datosCeco");
		// var productPath 					= oEvent.getSource().getBindingContext("Proyect").getPath();
		// var selected						= oView.getModel("Proyect").getProperty(productPath);
		var DataComprobanteConfirmacion		=ModelProyect.getProperty("/DataComprobanteConfirmacion");
		var descripcionceco					="";
		sap.ui.core.BusyIndicator.show(0);
		datosCeco.forEach(function(items){
		if(items.CECO === selectKeyCECO){
		 items.descripcionCeco=items.CECO+ "-"+items.NOMBRE;
		 descripcionceco=items.descripcionCeco;
		}
	
		});
		if(seleccion_CECO === "id2"){
		if(selectKeyCECO === "---Seleccionar---" ||selectKeyCECO === undefined || selectKeyCECO===""){
		ModelProyect.setProperty("/selectCeco","");
		 ModelProyect.setProperty("/selectKeyagre","---Seleccionar---");
		MessageBox.error("Seleccionar el centro de costo .", {
		actions: [MessageBox.Action.OK],
		emphasizedAction: MessageBox.Action.OK,
		onClose: function (sAction) {
		}
		});	
		return;	
		}else{
		// items01.SELEC_CECO	=	descripcionceco;
		
		ModelProyect.setProperty("/selectCeco",descripcionceco);
		 ModelProyect.setProperty("/selectKeyagre",selectKeyCECO);
		sap.ui.core.BusyIndicator.hide(0);		
		that.oRouter.navTo("DetalleSolicitudConER");	
		}	
		
		}else {
		ModelProyect.setProperty("/selectCeco","");
		 ModelProyect.setProperty("/selectKeyagre","---Seleccionar---");
		sap.ui.core.BusyIndicator.hide(0);		
		that.oRouter.navTo("DetalleSolicitudConER");	
		}
	
		},
	
	});
});