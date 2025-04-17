sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"rendicionER/model/models",
	"sap/ui/core/routing/HashChanger"
], function (UIComponent, Device, models,HashChanger) {
	"use strict";
	
		var navigationWithContext = {

	};
	
	return UIComponent.extend("rendicionER.Component", {

		metadata: {
			manifest: "json",
			config: {
				fullWidth: true
			}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			this.setModel(new sap.ui.model.json.JSONModel({contador : 0}), "contadorGlobal");
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.cargaInicial(),		"midata");
			
			try{
			  jQuery.sap.require("sap.ushell.cpv2.services.cloudServices.SiteService");
			}catch(oException){
			}
			
			HashChanger.getInstance().replaceHash("");	
			
			UIComponent.prototype.init.apply(this, arguments);
			
			this.getRouter().initialize();
			
			var oComponentData = this.getComponentData();

            if (oComponentData && oComponentData.startupParameters && oComponentData.startupParameters.levObs && oComponentData.startupParameters.levObs.length > 0) {
                this.setModel(new sap.ui.model.json.JSONModel({parametro : oComponentData.startupParameters.levObs[0]}), "parametroApp");
            }

            console.log(oComponentData);
	
			
		},
		
		createContent: function() {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}
			// var shell = new sap.m.Shell("shellRenER1",{
			// 	app: app
			// });
			
			return app;

			// return app;
		},

		getNavigationPropertyForNavigationWithContext: function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}
		
	});
});