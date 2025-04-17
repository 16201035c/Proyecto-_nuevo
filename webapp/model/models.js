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