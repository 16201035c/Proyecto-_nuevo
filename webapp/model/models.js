sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		oDataGastos : function () {
			var oModel=[
			{
			id:"1",
			descripcion:"Impresos"
			},{
			id:"2",
			descripcion:"Viajes"
			},{
			id:"3",
			descripcion:"Almuerzos"
			}

			]
			
			return oModel;
		},

		oDataIndicador : function () {
			var oModel=[
			{
			INDICADOR: "C0",
			NOMBRE:"Compras exoneradas"
			},{
			INDICADOR:"C2",
			NOMBRE:"Compras de bienes y servicios"
			},{
			INDICADOR:"C4",
			NOMBRE:""
			}

			]
			
			return oModel;
		},

		oTipoDoc : function(){
			var oModel=[
				{
				ID	: "",
				TIPO: "---Seleccionar---"
			  },{
				ID	: "01",
				TIPO: "DNI"
			 },{
				ID	: "02",
				TIPO: "RUC"
	
	
			 }
			]

			return oModel;
		},

		oMoneda : function(){
			var oModel=[
				{
				ID	: "01",
				MONEDA: "---Seleccionar---"
			  },{
				ID	: "02",
				MONEDA: "USD"
			  },{
				ID	: "03",
				MONEDA: "PEN"
			 }
			]

			return oModel;
		},

		
		cargaInicial : function() {
			/*eslint-disable*/
			var oData = {
				
				iconTabKey			:	"1",
				propEditable		:	false,
				infoEditable		:	true,
				cambios				:	false,
				setEditableEdit		:	false,
				setEditableView		:	true,
				btnGuardarVisible	:	false,
				primerDetalle		:	false,
				btnEliminarTabla	:	false,
				btnGuardarCambios	:	false,
				btnEliminarParametro:	false,
				btnAgregarParametro	:	false,
				editarParametroVisible		:	true,
				mensaje				:	"",
				datosUsuario : {
					"CODUSUARIO" 		:	"",
					"NOMUSUARIO" 		:	""
				},
				CategoriaSuperior : {
					"Id" 				:	"",
					"Descripcion" 		:	""
				},
				detalleMaestro : {
					"Id" 				:	"",
					"IdEstado" 			:	"",
					"FechaCreacion" 	:	"",
					"FechaModificacion" :	"",
					"CodigoTabla"		:	"",
					"Campo"				:	"",
					"DescripcionCampo" 	:	"",
					"CodigoSap"			:	"",
					"Orden"				:	"",
					"IdPadre"			:	""
				},
				botonesTablaPropiedades : {
					"btnEdit" 			:	true,
					"btnDelete" 		:	false,
					"btnAdd"			:	false
				},
				registroTabla : {
					"sIdTransaccion" 	:	"",
					"sAplicacion" 		:	"",
					"dFecha"			:	"",
					"sCodigoTabla"		:	"",
					"sDescripcionTabla"	:	"",
					"sUsuario"			:	""
				},
				registroParametro : {
					"sCampo" 			:	"",
					"sDescripcionCampo" :	"",
					"sCodigoSap"		:	"",
					"iOrden"			:	"",
					"iIdPadre"			:	""
				},
				editarParametro : {
					"sCampo" 			:	"",
					"sDescripcionCampo" :	"",
					"sCodigoSap"		:	"",
					"iOrden"			:	"",
					"iIdPadre"			:	"",
					"id"				:	"",
					"IdEstado"			:	"",
					"Estado"			:	"",
				}
			};
			
			var oModel = new JSONModel(oData);
        	return oModel;
		}
		

	};
});