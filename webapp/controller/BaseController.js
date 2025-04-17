sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/UIComponent",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		"sap/ui/commons/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/core/Fragment",
		"sap/m/MessageBox",
	],
	function (Controller, UIComponent, t, n, r, ResourceModel, Fragment, MessageBox) {
		"use strict";
		var contadorRuc = 0;
		return Controller.extend("rendicionER.controller.BaseController", {

			onAfterRendering: function () {
				var oView = this.getView();
				var ModelProyect = oView.getModel("Proyect");
				var TipoCambio = oView.getModel("TipoCambio");
				console.log(TipoCambio);
				
				ModelProyect.setProperty("/KeyBeneficiario", "0");
				ModelProyect.setProperty("/KeySociedad","0");
				
				
				this.beneficiarioDatos();
			},
			
			DecodeUTF8: function(s){
	        for(var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
	            ((a = s[i][c](0)) & 0x80) &&
	            (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
	            o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
	        );
	        return s.join("");
	    	},
	

			beneficiarioDatos: function () {
				var that = this;
				var oView = this.getView();
				var ModelProyect = oView.getModel("Proyect");

				var modeloBeneficiarios = [{
					"keyBenef": "0",
					"beneficiario": "---Seleccionar---"
				}, {
					"keyBenef": "1",
					"beneficiario": "Jeremy Rodriguez"
				}, {
					"keyBenef": "2",
					"beneficiario": "Claudia Romero"
				}];

				ModelProyect.setProperty("/Beneficiario", modeloBeneficiarios);
			},

			getDataGlobalReporteEstado: function () {
				var that = this;
				var oView = this.getView();
				var ModelProyect = oView.getModel("Proyect");

				var ReporteEstado = [{
					codigoSociedad: "3200",
					descripcionSociedad: "Diveimport S.A.C.",
					solicitud: "10249",
					tipoRendicion: "Con ER",
					codigoEmpleado: "P2003081719",
					descripcionEmpleado: "PEREZ OSORIO",
					correo: "jrodriguez@ravaconsulting.com.pe",
					codigoSapProveedor: "0000000320000000",
					fechaSolicitud: "30/05/2021",
					moneda: "PEN",
					importe: "1000.00",
					importeR: "",
					saldo: "",
					codigoEstado: "05",
					descripcionEstado: "Rendido",
					iconEstado: "sap-icon://documents",
					estado: "None",
					centroUnico: "",
					centroMultiple: "001 - Lima",
					descripcionArea: "Gerencia General",
					fechaVencimiento: "05/06/2021",
					ruc: "15058321473"
				}, {
					codigoSociedad: "3200",
					descripcionSociedad: "Diveimport S.A.C.",
					solicitud: "10248",
					tipoRendicion: "Sin ER",
					codigoEmpleado: "P2003081719",
					descripcionEmpleado: "PEREZ OSORIO",
					correo: "kestefo@ravaconsulting.com.pe",
					codigoSapProveedor: "0000000320000000",
					fechaSolicitud: "30/05/2021",
					moneda: "PEN",
					importe: "1500.00",
					importeR: "",
					saldo: "",
					codigoEstado: "05",
					descripcionEstado: "Rendido",
					iconEstado: "sap-icon://documents",
					estado: "None",
					centroUnico: "",
					centroMultiple: "001 - Lima",
					descripcionArea: "Gerencia General",
					fechaVencimiento: "05/06/2021",
					ruc: "10705993233"
				}];

				for (var i = 0; i < ReporteEstado.length; i++) {
					var oProduct = ReporteEstado[i];
					oProduct.Available = oProduct.codigoEstado == "01" ? true : false;
					if (i === 1) {
						oProduct.NavigatedState = true;
					}
				}

				ModelProyect.setProperty("/ReporteEstado", ReporteEstado);

			},
			getDataReporteHistoricos: function () {
				var that = this;
				var oView = this.getView();
				var ModelProyect = oView.getModel("Proyect");

				var reporteHistorico = [{
					codigoSociedad: "3200",
					descripcionSociedad: "Diveimport S.A.C.",
					solicitud: "ER-10249",
					tipoRendicion: "Con ER",
					codigoEmpleado: "P2003081719",
					descripcionEmpleado: "PEREZ OSORIO",
					descripcionSolicitante: "PEREZ OSORIO",
					correo: "jrodriguez@ravaconsulting.com.pe",
					codigoSapProveedor: "73103030",
					fechaSolicitud: "07/06/2021",
					moneda: "PEN",
					importe: "1,000.00",
					importeR: "",
					saldo: "",
					CodProve:"123456000001",
					codigoEstado: "03",
					descripcionEstado: "Solicitud Aprobada",
					iconEstado: "sap-icon://loan",
					estado: "Success",
					centroUnico: "",
					centroMultiple: "001 - Lima",
					descripcionArea: "Gerencia General",
					fechaVencimiento: "05/06/2021",
					ruc: "15058321473",
					detalle: []
				}, {
					codigoSociedad: "3200",
					descripcionSociedad: "Diveimport S.A.C.",
					solicitud: "ER-10245",
					tipoRendicion: "Sin ER",
					CodProve:"123456000002",
					codigoEmpleado: "P2003081719",
					descripcionEmpleado: "PEREZ OSORIO",
					descripcionSolicitante: "PEREZ OSORIO",
					correo: "kestefo@ravaconsulting.com.pe",
					codigoSapProveedor: "73103030",
					fechaSolicitud: "30/05/2021",
					moneda: "PEN",
					importe: "1,500.00",
					importeR: "",
					saldo: "",
					codigoEstado: "05",
					descripcionEstado: "Solicitud Rendida",
					iconEstado: "sap-icon://documents",
					estado: "None",
					centroUnico: "",
					centroMultiple: "001 - Lima",
					descripcionArea: "Gerencia General",
					fechaVencimiento: "05/06/2021",
					ruc: "10705993233",
					detalle: []
				}];

				var count = reporteHistorico.length;
				for (var i = 0; i < reporteHistorico.length; i++) {
					var oProduct = reporteHistorico[i];
					oProduct.Available = oProduct.codigoEstado == "01" ? true : false;
					if (i === 1) {
						oProduct.NavigatedState = true;
					}
				}
				ModelProyect.setProperty("/count", count);
				ModelProyect.setProperty("/ReporteHistorico", reporteHistorico);
				ModelProyect.setProperty("/ReporteHistoricoTable", reporteHistorico);
			},

			validateSelected: function (id, codigo, descripcion, parameter) {
				if (this.getView().byId(id).getValueState() == "None") {
					if (codigo == "" || codigo == undefined) {
						utilUI.onMessageErrorDialogPress2("Campo no seleccionado  " + parameter);
						// this.getView().byId(id).setValueState("Error");
						// this.getView().byId(id).setValueStateText("Cambiar Campo");
						return true;
					} else {
						// this.getView().byId(id).setValueState("Success");
						return false;
					}
				} else if (this.getView().byId(id).getValueState() == "Error") {
					utilUI.onMessageErrorDialogPress2("Campo no seleccionado " + parameter);
					// this.getView().byId(id).setValueState("Error");
					return true;
				} else if (this.getView().byId(id).getValueState() == "Success") {
					return false;
				}
			},
			fnChangeInputsNotSelected: function (oEvent) {
				var value = oEvent.getSource().getSelectedItem().getKey();
				if (value == "" || value == undefined) {
					// oEvent.getSource().setValueState("None");
				} else {
					// oEvent.getSource().setValueState("Success");
				}
			},
			validateInputs: function (id, value, parameter) {
				if (this.getView().byId(id).getValueState() == "None") {

					if (value == "" || value == undefined) {
						utilUI.onMessageErrorDialogPress2("Campo vacio " + parameter);
						this.getView().byId(id).setValueState("Error");
						this.getView().byId(id).setValueStateText("Campo Vacio");
						return true;
					} else {
						this.getView().byId(id).setValueState("Success");
						return false;
					}

				} else if (this.getView().byId(id).getValueState() == "Error") {
					utilUI.onMessageErrorDialogPress2("Campo incorrecto " + parameter);
					this.getView().byId(id).setValueState("Error");
					return true;
				} else if (this.getView().byId(id).getValueState() == "Success") {
					return false;
				}
			},
			fnChangeInputsNotEmpty: function (oEvent) {
				var value = oEvent.getSource().getValue();
				if (value == "" || value == undefined) {
					oEvent.getSource().setValueState("Error");
					// oEvent.getSource().setValueStateText("Campo Vacio");
				} else {
					oEvent.getSource().setValueState("Success");
				}
			},
			fnChangeInputsNotEmptyEmail: function (oEvent) {

				const re =
					/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				var value = oEvent.getSource().getValue();

				re.test(value.toLowerCase());

				if (value == "" || value == undefined) {
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText("Campo Vacio");
				} else {
					if (!re.test(value.toLowerCase())) {
						oEvent.getSource().setValueState("Error");
						oEvent.getSource().setValueStateText("Correo Electronico Invalido");
					} else {
						oEvent.getSource().setValueState("Success");
					}
				}
			},

			fnNumber: function (oEvent) {
				var Objeto = oEvent.getSource();
				var val = Objeto.getValue();
				val = val.replace(/[^0-9,.]/g, '').replace(/,/g, '.');

				if (val == "") {
					Objeto.setValue("");
				} else {
					Objeto.setValue(val);
				}
			},

			formatCellTemp: function (sValue) {
				if (sValue != null && sValue != "") {
					var fecha = new Date(sValue.substr(0, 4) + "/" + sValue.substr(4, 2) + "/" + sValue.substr(6, 2));
					fecha.setHours(fecha.getHours());
					var fechaOC = this.formatosCellValidateoData(fecha.getDate()) + "." +
						this.formatosCellValidateNumbers((fecha.getMonth() + 1)) + "." +
						this.formatosCellValidateNumbers(fecha.getFullYear());
					return fechaOC;
				} else {
					return sValue;
				}
			},

			getDialogBlock: function (e) {
				var t = new sap.m.Dialog({
					title: "Información",
					type: "Message",
					afterOpen: function () {
						jQuery(".SuperApp").remove()
					},
					content: new sap.m.Text({
						text: e
					}),
					beginButton: new sap.m.Button({
						text: "OK"
					})
				});
				t.open();
				jQuery("#" + t.getId()).keydown(function (e) {
					e.preventDefault();
					return false
				})
			},
			getRouter: function () {
				return this.getOwnerComponent().getRouter()
			},
			getModel: function (e) {
				return this.getView().getModel(e)
			},
			setModel: function (e, t) {
				return this.getView().setModel(e, t)
			},
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle()
			},
			loadVariable: function (e) {
				var t = this.getModel("midata");
				return t.getProperty(e)
			},
			saveVariable: function (e, t) {
				var n = this.getModel("midata");
				n.setProperty(e, t)
			},
			loadConstante: function (e) {
				var t = this.getModel("i18n");
				return t.getProperty(e)
			},
			getYYYYMMDD: function (e) {
				var t = e.getDate();
				var n = e.getMonth() + 1;
				var r = e.getFullYear();
				if (t < 10) {
					t = "0" + t
				}
				if (n < 10) {
					n = "0" + n
				}
				var o = r + "-" + n + "-" + t;
				return o
			},
			getYYYYMMDDHHMMSS: function (e) {
				var t = e.getDate();
				var n = e.getMonth() + 1;
				var r = e.getFullYear();
				if (t < 10) {
					t = "0" + t
				}
				if (n < 10) {
					n = "0" + n
				}
				var o = r + "-" + n + "-" + t;
				var i = e.getHours();
				var u = e.getMinutes();
				var a = e.getSeconds();
				o = o + " " + this.getStrZero(i, 2) + ":" + this.getStrZero(u, 2) + ":" + this.getStrZero(a, 2);
				return o
			},
			getFechaNotNull: function (e) {
				var t = e;
				if (e === "" || e === undefined || e === null) {
					t = undefined
				}
				return t
			}
		})
	});