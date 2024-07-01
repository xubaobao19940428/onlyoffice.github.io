;(async function (window, undefined) {
	var URL_TO_PLUGIN = 'http://192.168.0.58:5500/sdkjs-plugins/content/speech/'

	var xhrObj = new XMLHttpRequest()
	xhrObj.open('GET', URL_TO_PLUGIN + 'config.json', false)
	await xhrObj.send('')

	var configObj = JSON.parse(xhrObj.responseText)
	configObj.baseUrl = URL_TO_PLUGIN

	// var URL_TO_PLUGIN1 = 'http://192.168.0.58:55827/sdkjs-plugins/content/translationOrigin/'

	// var xhrObj1 = new XMLHttpRequest()
	// xhrObj1.open('GET', URL_TO_PLUGIN1 + 'config.json', false)
	// xhrObj1.send('')

	// var configObj1 = JSON.parse(xhrObj1.responseText)
	// configObj1.baseUrl = URL_TO_PLUGIN1

	window.Asc = window.Asc ? window.Asc : {}
	window.Asc.extensionPlugins = window.Asc.extensionPlugins ? window.Asc.extensionPlugins : []
	window.Asc.extensionPlugins.push(configObj)
	if (window.Asc.g_asc_plugins && window.Asc.g_asc_plugins.loadExtensionPlugins) {
		window.Asc.g_asc_plugins.loadExtensionPlugins(window.Asc.extensionPlugins)
		window.Asc.extensionPlugins = []
	}
})(window, undefined)
