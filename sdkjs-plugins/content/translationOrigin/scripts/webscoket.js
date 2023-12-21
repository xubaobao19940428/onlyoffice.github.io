window.translationText = ''

class createWebSocket {
	_lockReconnect = false

	constructor(urlFunction, heartbeatInterval = 40000, reconnectInterval = 5000) {
		if (urlFunction instanceof Function) {
			this.urlFunction = urlFunction
		} else {
			throw new Error('urlFunction is not function')
		}
		this.heartbeatInterval = heartbeatInterval
		this.reconnectInterval = reconnectInterval
		this.ws = null
		this.heartbeatTimer = null
		// 初始化 WebSocket 连接
		this.connectWescoket()
	}
	/**
	 * @description websocket 连接事件
	 */
	connectWescoket() {
		try {
			if ('WebSocket' in window) {
				this.ws = new WebSocket(this.urlFunction())
			} else if ('MozWebSocket' in window) {
				this.ws = new MozWebSocket(urlFunction())
			} else {
				alert('当前浏览器不支持websocket协议,建议使用现代浏览器')
			}
			this.initEventHandle()
		} catch (e) {
			console.log(e)
			this.reconnectWebsocket()
		}
	}
	/**
	 * @description 初始化事件
	 */
	initEventHandle() {
		this.ws.addEventListener('close', this.closeFunction.bind(this))
		this.ws.addEventListener('error', this.errorFunction.bind(this))
		this.ws.addEventListener('open', this.openFunction.bind(this))
		this.ws.addEventListener('message', this.messageFunction.bind(this))
	}
	/**
	 * @description webscoket open 事件
	 * @param {*} event
	 */
	openFunction(event) {
		//心跳检测重置
		console.log('连接成功')
		// setTimeout(()=>{
		//     this.sendMessage(1, '1004', localStorage.getItem('xToken'), '心跳') // 发送心跳消息
		// },2000)

		this.startHeartbeat()
	}

	/**
	 * @description webscoket 重新连接机制
	 */
	reconnectWebsocket() {
		//加一个锁防止重复连接
		if (this._lockReconnect) return
		this._lockReconnect = true
		setTimeout(() => {
			this.connectWescoket()
			this._lockReconnect = false
		}, this.reconnectInterval)
	}

	/**
	 * @description webscoket 错误信息
	 * @param {*} error
	 */
	errorFunction(error) {
		console.log('连接出错', error)
		this.reconnectWebsocket()
	}

	/**
	 * @description 连接关闭事件
	 * @param {*} event
	 */
	closeFunction(event) {
		console.log(event)
		if (event.code == 4000) {
			console.log('自主关闭')
			this.stopHeartbeat()
		} else {
			console.log('连接关闭')
			this.reconnectWebsocket()
		}
	}

	/**
	 * @description 收到消息函数
	 * @param {*} event
	 */
	messageFunction(event) {
		//如果获取到消息，心跳检测重置
		//拿到任何消息都说明当前连接是正常
		if (event.data) {
			var data = JSON.parse(event.data)
			if (this.onMessageCallback) {
				this.onMessageCallback(data)
			}
			// console.log(data)
			// 音转文 1002文本解析
			if (data.msgType == 1002) {
				// 		window.Asc.scope.text = data.result
				// 		window.Asc.scope.bookName = data.index
				// 		window.Asc.plugin.callCommand(function () {
				// 			// var oDocument = Api.GetDocument()
				// 			// var oParagraph = oDocument.GetElement(Asc.scope.bookName - 1)
				// 			// var oInlineLvlSdt = Api.CreateInlineLvlSdt()
				// 			// oParagraph.AddInlineLvlSdt(oInlineLvlSdt)
				// 			// oInlineLvlSdt.AddText(Asc.scope.text)
				// 			// oInlineLvlSdt.SetTag('index' +Asc.scope.bookName)
				// 			// var aContentControls = oDocument.GetContentControlsByTag('index' + Asc.scope.bookName);
				// 			// console.log(aContentControls[0])
				// 			// var oBlockLvlSdt = Api.CreateBlockLvlSdt()
				// 			// oBlockLvlSdt.GetContent().GetElement(0).AddText('Block text content control')
				// 			// oBlockLvlSdt.SetTag('Tag 2')
				// 			// oDocument.AddElement(0, oBlockLvlSdt)
				// 			// var aContentControls = oDocument.GetContentControlsByTag('Tag 1')
				// 			// aContentControls[0].SetAlias('№1')
				// 			var oDocument = Api.GetDocument()
				//             var oParagraph = Api.CreateParagraph()
				//             console.log(oParagraph)
				// 			var oParagraph1 = oDocument.GetElement(Asc.scope.bookName)
				// 			if (oParagraph1) {
				// 				oParagraph1.Delete()
				// 				oParagraph1 = oDocument.GetElement(Asc.scope.bookName)
				// 				oParagraph1.AddText(Asc.scope.text)
				// 			} else {
				// 				oParagraph1.AddText(Asc.scope.text)
				// 			}
				// 			// var oRange = oDocument.GetBookmarkRange('index'+Asc.scope.bookName)
				// 			// if (oRange) {
				// 			// 	console.log('书签存在')
				// 			//     oRange.Delete()
				// 			//     var oRange1 = oDocument.GetRange(0, 9)
				// 			// 	oRange1.AddBookmark(Asc.scope.bookName)
				// 			//     oRange1.AddText(Asc.scope.text)
				// 			// } else {
				// 			// 	console.log('书签不存在')
				// 			// 	var oRange1 = oDocument.GetRange(0, 9)
				// 			// 	oRange1.AddBookmark(Asc.scope.bookName)
				// 			//     oRange1.AddText(Asc.scope.text)
				// 			// }
				// 			// oParagraph.AddText(Asc.scope.text)
				// 			oDocument.Push(oParagraph1)
				// 			// oDocument.InsertContent([oParagraph])
				// 		}, false)
			}
		}
		this.startHeartbeat()
	}

	/**
	 * @description 发送消息
	 * @param {*} data
	 */
	sendMessage(type, messageType, roomsId, message) {
		if (this.ws && this.ws.readyState == 1) {
			let obj = {
				msgId: '', //仅服务端下发的消息有msgId
				msgTag: type,
				msgType: messageType,
				msgTo: roomsId, //发送给谁
				msgBody: message, //消息
			}
			this.ws.send(JSON.stringify(obj))
		} else {
			console.log('连接关闭')
			this.reconnectWebsocket()
		}
	}

	/**
	 * @description 发送心跳重置心跳
	 */
	startHeartbeat() {
		if (this.heartbeatTimer) window.clearTimeout(this.heartbeatTimer)
		this.heartbeatTimer = window.setTimeout(() => {
			if (this.ws && this.ws.readyState === WebSocket.OPEN) {
				this.sendMessage(1, '1004', localStorage.getItem('xToken'), '心跳') // 发送心跳消息
			}
		}, this.heartbeatInterval)
	}

	/**
	 * @description 关闭心跳
	 */
	stopHeartbeat() {
		if (this.heartbeatTimer) {
			window.clearTimeout(this.heartbeatTimer)
		}
	}
}
