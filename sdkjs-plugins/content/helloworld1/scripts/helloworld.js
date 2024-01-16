var Ps
var PsTextArea
;(function (window, undefined) {
    console.log(window.Asc.plugin)
	var websocketHandler = ''
	var txt = ''
	function returnCurrentSpeaker(speaker) {
		let translationsList = JSON.parse(Cookies.get('transliterationList'))
		let speakerRole = ''
		translationsList.map((item) => {
			if (item.value == speaker) {
				speakerRole = item.label
			}
		})
		return speakerRole
	}

	let openTranslation = document.getElementById('translation-button-open')
	let closeTranslation = document.getElementById('translation-button-close')
	let inputBox = document.getElementById('tmpl-schoolBox-search-input')
	let clearVoice = document.getElementById('clear')
	window.Asc.plugin.init = function (text) {
		localStorage.setItem('instertElement', 0)
		$('#textarea').empty()
		let _this = this
		// inputBox.addEventListener('input',function($event){
		//     console.log($event.target.value)
		//     _this.callCommand(function () {
		//         var oDocument = Api.GetDocument()

		//     })
		// })

		_this.callCommand(function () {
			var oDocument = Api.GetDocument()
			oDocument.SearchAndReplace({ searchString: '[正在转写中....]', replaceString: '。' })
		})
		//语音播报代码
		txt = text
		savedDismiss = []
		function initVoice() {
			switch (window.Asc.plugin.info.editorType) {
				case 'word':
				case 'slide': {
					window.Asc.plugin.executeMethod('GetSelectedText', [{ Numbering: false, Math: false, TableCellSeparator: '\n', ParaSeparator: '\n', TabSymbol: String.fromCharCode(160) }], function (data) {
						txt = data === undefined ? '' : data.replace(/\r/g, ' ')

						ExecPlugin()
					})

					break
				}
				case 'cell':
					window.Asc.plugin.executeMethod('GetSelectedText', [{ Numbering: false, Math: false, TableCellSeparator: '\n', ParaSeparator: '\n', TabSymbol: String.fromCharCode(160) }], function (data) {
						console.log(11111)
						if (data == '') txt = txt.replace(/\r/g, ' ').replace(/\t/g, '\n')
						else if (data !== undefined) {
							txt = data.replace(/\r/g, ' ')
						}

						ExecPlugin()
					})
					break
			}
		}
		function processText(sTxt) {
			if (sTxt[sTxt.length - 1] === '\n') sTxt = sTxt.slice(0, sTxt.length - 1)

			var splittedParas = sTxt.split('\n')

			document.getElementById('textarea').innerText = sTxt

			return splittedParas
		}

		function ExecPlugin() {
			processText(txt)
		}
		window.Asc.plugin.onExternalMouseUp = function () {
			var evt = document.createEvent('MouseEvents')
			console.log('鼠标抬动了')
			evt.initMouseEvent('mouseup', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
			initVoice()
			document.dispatchEvent(evt)
		}
		//清空语音播报
		clearVoice.addEventListener(
			'click',
			function () {
				$('#textarea').empty()
			},
			false
		)
		window.Asc.plugin.button = function (id) {
			this.executeCommand('close', '')
		}

		//语音播报到此处结束
		websocketHandler = new createWebSocket(function () {
			return `wss://${Cookies.get('onlyofficeHost')}:30070/trailv2/api/voice/msg?trailId=${Cookies.get('trailId')}`
		})
		//开始转写
		openTranslation.addEventListener(
			'click',
			function () {
				// Cookies.set('instertElement', 0, { path: '/', domain: window.location.hostname })
				websocketHandler.connectWescoket()
				// 设置接收到 WebSocket 消息时的回调函数
				websocketHandler.onMessageCallback = function (data) {
					handleWebSocketMessage(data)
				}
				function handleWebSocketMessage(data) {
					// 根据你的数据结构更新 OnlyOffice 文档
					if (data.msgType === '1002') {
						window.Asc.scope.text = returnCurrentSpeaker(data.speaker) + '：' + data.result
						window.Asc.scope.bookName = data.index.toString()
						window.Asc.scope.isInsert = data.sentenceEndTime
						window.Asc.scope.replaceStringText = '[正在转写中....]'
						if (data.result) {
							window.Asc.plugin.callCommand(
								function () {
									var oDocument = Api.GetDocument()
									var oRun = Api.CreateRun()
									var oNormalStyle = oDocument.GetDefaultStyle('paragraph')
									/// 将 index 转换为字符串，确保作为标识符使用
									var uniqueTag = 'Tag_' + Asc.scope.bookName
									// 标识是否找到了相同标识符的书签
									var foundBookmark = false
									var instertElement = 0

									// 遍历文档中的所有元素
									for (let i = 0; i < oDocument.GetElementsCount(); i++) {
										var oElement = oDocument.GetElement(i)

										// 判断元素是否存在并且是段落类型
										if (oElement) {
											var oParagraph = oElement

											// 获取段落的文本内容
											var paragraphText = oParagraph.GetText()

											// 检查文本内容中是否包含标识符
											if (paragraphText.indexOf(Asc.scope.replaceStringText) !== -1) {
												// 删除旧的段落
												oParagraph.RemoveAllElements()

												// 创建新的段落并插入
												// var oNewParagraph = Api.CreateParagraph()
												if (Asc.scope.isInsert === 0) {
													oParagraph.SetStyle(oNormalStyle)
													oParagraph.AddText(Asc.scope.text + '  ')
													oRun.AddText(Asc.scope.replaceStringText)
													oRun.SetColor(255, 111, 61)
													oRun.SetBold(true)
													oRun.SetHighlight('darkRed')
													oParagraph.AddElement(oRun)
												} else {
													oParagraph.SetStyle(oNormalStyle)
													oParagraph.AddText(Asc.scope.text)
												}
												localStorage.setItem('instertElement', i)
												// Cookies.set('instertElement',i,{path:'/'})
												oDocument.InsertContent([oParagraph])

												// 标记找到标识符并执行操作
												foundBookmark = true
												break
											}
										}
									}
									// console.log('foundBookmark', foundBookmark)
									// 如果没有找到相同标识符的段落，创建一个新的段落并插入
									if (!foundBookmark) {
										var oParagraph = Api.CreateParagraph()
										oParagraph.SetStyle(oNormalStyle)
										oParagraph.AddText(Asc.scope.text + '  ')
										oRun.AddText(Asc.scope.replaceStringText)
										oRun.SetColor(255, 111, 61)
										oRun.SetBold(true)
										oRun.SetHighlight('darkRed')
										// 插入新段落
										oParagraph.AddElement(oRun)

										if (localStorage.getItem('instertElement') && localStorage.getItem('instertElement') != 0) {
											console.log(localStorage.getItem('instertElement'))
											oDocument.AddElement(Number(localStorage.getItem('instertElement')) + 1, oParagraph)
										} else {
											oDocument.InsertContent([oParagraph])
										}
									}
								},
								false,
								true,
								function () {}
							)
						}
					}
				}
			},
			false
		)
		//停止转写
		closeTranslation.addEventListener(
			'click',
			function () {
				websocketHandler.ws.close(4000)
				_this.callCommand(function () {
					localStorage.setItem('instertElement', 0)
					var oDocument = Api.GetDocument()
					oDocument.SearchAndReplace({ searchString: '[正在转写中....]', replaceString: '。' })
				})
			},
			false
		)
	}
	window.Asc.plugin.button = function (id) {
		console.log(id)
	}
	// window.Asc.plugin.name = '停止转写'
	// console.log(window.Asc.plugin)
})(window, undefined)
