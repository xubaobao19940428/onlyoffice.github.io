;(function (window, undefined) {
	var websocketHandler = ''
	function GetQueryString(key) {
		var url = window.location.href //首先获取url
		if (url.indexOf('?') != -1) {
			//判断是否有参数
			var strSub = null
			var str = url.split('?') //根据？截取url
			var strs = str[1].split('&') //str[1]为获取？号后的字符串，并且根据&符号进行截取，得到新的字符串数组，这个字符串数组中有n个key=value字符串
			var value = ''
			for (var i = 0; i < strs.length; i++) {
				//遍历字符串数组
				strSub = strs[i].split('=') //取第i个key=value字符串，并用“=”截取获得新的字符串数组 这个数组里面第0个字符是key，第1个字符value
				if (strSub[0] == key) {
					//判断第0个字符与该方法的参数key是否相等，如果相等 则返回对应的值value。
					value = strSub[1]
				}
			}
			return value
		}

		return ''
	}
	function returnCurrentSpeaker(speaker) {
		let translationsList = JSON.parse(Cookies.get('transliterationList'))
		let speakerRole = ''
		translationsList.map((item) => {
			if (item.value == speaker) {
				speakerRole = item.label
			}
		})
		if (!speakerRole) speakerRole = speaker
		return speakerRole
	}
	// window.Asc.plugin.name = '停止转写'
	// console.log(window.Asc.plugin)
	window.Asc.plugin.init = function () {
		localStorage.setItem('instertElement', 0)
		this.callCommand(function () {
			var oDocument = Api.GetDocument()
			oDocument.SearchAndReplace({ searchString: '[正在转写中....]', replaceString: '。' })
		})
		// Cookies.set('instertElement', 0, { path: '/', domain: window.location.hostname })
		websocketHandler = new createWebSocket(function () {
			return `wss://${Cookies.get('onlyofficeHost')}:30070/trailv2/api/voice/msg?trailId=${Cookies.get('trailId')}`
		})
		console.log(window.Asc.plugin)
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
				//这个是第一个可行的方案
				if (data.result) {
					// 	if (!window.Asc.scope.isInsert) {
					// 		var oProperties = {
					// 			searchString: Asc.scope.replaceStringText,
					// 			replaceString: data.result,
					// 			matchCase: true,
					// 		}
					// 		//execute method for search and replace
					// 		window.Asc.plugin.executeMethod('SearchAndReplace', [oProperties])
					// 	} else {
					// 		window.Asc.plugin.callCommand(function () {
					// 			console.log('this', this)
					// 			// console.log(window.Asc.scope)
					// 			var oDocument = Api.GetDocument()
					// 			var oParagraph = Api.CreateParagraph()
					// 			oParagraph.AddText(Asc.scope.text)
					// 			oDocument.InsertContent([oParagraph])
					// 			// Asc.scope.TextArray.push(Asc.scope.bookName)

					// 			// Asc.scope.replaceStringText = Asc.scope.text
					// 		}, false)
					// 	}

					//现在实验第二种方案
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
									if (oParagraph.GetText) {
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
							}
							console.log('foundBookmark', foundBookmark)
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
	}
	window.Asc.plugin.button = function (id) {
		console.log(id)
	}
})(window, undefined)
