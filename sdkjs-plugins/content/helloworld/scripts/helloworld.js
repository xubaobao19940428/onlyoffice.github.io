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

	window.Asc.plugin.init = function () {
		websocketHandler = new createWebSocket(function () {
			return `wss://192.168.0.87:30070/trailv2/api/voice/msg?trailId=170306353225880003000000001`
		})
        console.log(window.Asc.plugin)
		// 设置接收到 WebSocket 消息时的回调函数
		websocketHandler.onMessageCallback = function (data) {
			handleWebSocketMessage(data)
		}

		function handleWebSocketMessage(data) {
			// 根据你的数据结构更新 OnlyOffice 文档
			if (data.msgType === '1002') {
				window.Asc.scope.text = '书记员：' + data.result
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
					window.Asc.plugin.callCommand(function () {
						var oDocument = Api.GetDocument()
						var oRun = Api.CreateRun()
						console.log('Asc.scope.isInsert', Asc.scope.isInsert)
						/// 将 index 转换为字符串，确保作为标识符使用
						var uniqueTag = 'Tag_' + Asc.scope.bookName
						// 标识是否找到了相同标识符的书签
						var foundBookmark = false

						// 遍历文档中的所有元素
						for (var i = 0; i < oDocument.GetElementsCount(); i++) {
							var oElement = oDocument.GetElement(i)
							// 判断元素是否存在并且是段落类型
							if (oElement) {
								var oParagraph = oElement

								// 获取段落的文本内容
								var paragraphText = oParagraph.GetText()

								// 检查文本内容中是否包含标识符
								if (paragraphText.indexOf(Asc.scope.replaceStringText) !== -1) {
									// 删除旧的段落
									oParagraph.Delete()

									// 创建新的段落并插入
									var oNewParagraph = Api.CreateParagraph()
									if (Asc.scope.isInsert === 0) {
										oNewParagraph.AddText(Asc.scope.text + '  ')
										oRun.AddText(Asc.scope.replaceStringText)
										oRun.SetColor(255, 111, 61)
										oRun.SetBold(true)
										oRun.SetHighlight('darkRed')
										oNewParagraph.AddElement(oRun)
									} else {
										oNewParagraph.AddText(Asc.scope.text)
									}

									oDocument.InsertContent([oNewParagraph])

									// 标记找到标识符并执行操作
									foundBookmark = true
									break
								}
							}
						}

						// 如果没有找到相同标识符的段落，创建一个新的段落并插入
						if (!foundBookmark) {
							var oParagraph = Api.CreateParagraph()
							oParagraph.AddText(Asc.scope.text + '  ')
							oRun.AddText(Asc.scope.replaceStringText)
							oRun.SetColor(255, 111, 61)
							oRun.SetBold(true)
							oRun.SetHighlight('darkRed')
							oParagraph.AddElement(oRun)
							// 插入新段落
							oDocument.InsertContent([oParagraph])
						}
					}, false)
				}

				// window.Asc.plugin.executeMethod('GetSelectedText', [{ Numbering: false, Math: false, TableCellSeparator: '\n', ParaSeparator: '\n', TabSymbol: String.fromCharCode(9) }], function (data) {
				// 		console.log(data)
				// 		sText = data
				// 		ExecTypograf(Asc.scope.text)
				// 	})

				// // 更新 OnlyOffice 文档，例如：
				// window.Asc.plugin.callCommand(function () {
				// 	if (Asc.scope.isInsert) {
				// 		var oDocument = Api.GetDocument()
				// 		var oParagraph = Api.CreateParagraph()
				// 		oParagraph.AddText(Asc.scope.text)
				// 		oDocument.InsertContent([oParagraph])
				// 	}

				// 	// var oDocument = Api.GetDocument()
				// 	// var oBlockLvlSdt = Api.CreateBlockLvlSdt()
				// 	// var oTag = oBlockLvlSdt.GetTag()
				// 	// console.log('oTag',oTag)
				// 	// if (oTag) {
				// 	// 	oBlockLvlSdt.AddText(Asc.scope.text)
				// 	//     oDocument.AddElement(0, oBlockLvlSdt)
				// 	// } else {
				// 	// 	oBlockLvlSdt.SetTag('Documents' + Asc.scope.bookName)
				// 	//     oBlockLvlSdt.AddText(Asc.scope.text)
				// 	// 	oDocument.AddElement(0, oBlockLvlSdt)
				// 	// }
				// }, false)

				// window.Asc.plugin.executeMethod('GetAllAddinFields', null, function (arrFields) {

				// 	let isCurrent = arrFields.filter((item) => {
				// 		return item.Value == `Document${data.index}`
				// 	})
				//     console.log('isCurrent',isCurrent)
				// 	if (!isCurrent.length) {
				// 		var oAddinFieldData = { FieldId: `Document${data.index}`, Value: 'Document' + data.index, Content: data.result }
				// 		window.Asc.plugin.executeMethod('AddAddinField', [oAddinFieldData])
				// 		// var arrDocuments = [
				// 		// 	{
				// 		// 		Props: {
				// 		// 			Id: data.index,
				// 		// 			Tag: 'Documeent' + data.index,
				// 		// 			Lock: 3,
				// 		// 		},
				// 		// 		Script: `var oParagraph = Api.CreateParagraph();oParagraph.AddText();Api.GetDocument().InsertContent([oParagraph]);`,
				// 		// 	},
				// 		// ]
				// 		// window.Asc.plugin.executeMethod('InsertAndReplaceContentControls', [arrDocuments])
				// 	} else {
				// 		arrFields.forEach(function (field) {
				// 			if (field.Value === `Document${data.index}`) {
				// 				window.Asc.plugin.executeMethod('ReplaceCurrentSentence', [field.Content, data.result])
				// 			}
				// 		})
				// 	}
				// })
			}
		}

		// var variant = 2
		// console.log('variant!', variant)
		// switch (variant) {
		// 	case 0: {
		// 		// serialize command as text
		// 		var sScript = 'var oDocument = Api.GetDocument();'
		// 		sScript += 'oParagraph = Api.CreateParagraph();'
		// 		sScript += "oParagraph.AddText('Hello world!');"
		// 		sScript += 'oDocument.InsertContent([oParagraph]);'
		// 		this.info.recalculate = true
		// 		this.executeCommand('close', sScript)
		// 		break
		// 	}
		// 	case 1: {
		// 		// call command without external variables
		// 		this.callCommand(function () {
		// 			var oDocument = Api.GetDocument()
		// 			var oParagraph = Api.CreateParagraph()
		// 			oParagraph.AddText('Hello world!')
		// 			oDocument.InsertContent([oParagraph])
		// 		}, true)
		// 		break
		// 	}
		// 	case 2: {

		// 		Asc.scope.text = text // export variable to plugin scope

		// 		this.callCommand(function () {
		// 			// // setInterval(() => {
		// 			// var oDocument = Api.GetDocument()
		// 			// var oParagraph = Api.CreateParagraph()
		// 			// console.log('Asc.scope.text', Asc.scope.text)
		// 			// oParagraph.AddText(Asc.scope.text) // or oParagraph.AddText(scope.text);
		// 			// oDocument.InsertContent([oParagraph])
		// 			// oDocument.save
		// 			// }, 1000)

		// 			///////////// 书签形式
		// 			var oDocument = Api.GetDocument()
		// 			var oParagraph = oDocument.GetElement(0)
		// 			// oParagraph.AddText('ONLYOFFICE Document Builder')
		// 			// var oRange1 = oDocument.GetRange(0, 9)
		// 			// oRange1.AddBookmark('01')
		// 			var oRange = oDocument.GetBookmarkRange('01')
		// 			if (oRange) {
		// 				console.log('书签存在')
		// 			} else {
		// 				console.log('书签不存在')
		// 			}
		// 			// var oRange2 = oDocument.GetRange(11, 18)
		// 			// oRange2.AddBookmark('Bookmark 2')
		// 			// var aBookmarks = oDocument.GetAllBookmarksNames()
		// 			// oParagraph.AddLineBreak()
		// 			// oParagraph.AddText('Bookmark names: ')
		// 			// for (let i = 0; i < 2; i++) {
		// 			// 	oParagraph.AddText(aBookmarks[i] + ',' + ' ')
		// 			// }
		// 		}, true)
		// 		break
		// 	}
		// 	default:
		// 		break
		// }
	}
	window.Asc.plugin.button = function (id) {}
})(window, undefined)
