(function(window, undefined) {
	
	var URL_TO_PLUGIN = "https://xubaobao19940428.github.io/onlyoffice.github.io/sdkjs-plugins/content/helloworld/"

	var xhrObj = new XMLHttpRequest();
	xhrObj.open('GET', URL_TO_PLUGIN + "config.json", false);
	xhrObj.send('');

	var configObj = JSON.parse(xhrObj.responseText);
	configObj.baseUrl = URL_TO_PLUGIN;

	window.Asc = window.Asc ? window.Asc : {};
	window.Asc.extensionPlugins = window.Asc.extensionPlugins ? window.Asc.extensionPlugins : [];
	window.Asc.extensionPlugins.push(configObj);
	if (window.Asc.g_asc_plugins && window.Asc.g_asc_plugins.loadExtensionPlugins)
	{
		window.Asc.g_asc_plugins.loadExtensionPlugins(window.Asc.extensionPlugins);
		window.Asc.extensionPlugins = [];
	}	
})(window, undefined);