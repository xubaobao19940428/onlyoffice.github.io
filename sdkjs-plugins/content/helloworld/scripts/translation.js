window.onload = (function () {
	var websocketHandler = null
	$.ajax({
		url: 'https://192.168.0.87:30070/trailv2/api/manager/history',
		data: {
			trailId: '170306353225880003000000001',
		},
		type: 'GET',
		dataType: 'json',
		success: function (res) {
			let transList = res.data.list
			let transBoxDom = document.getElementById('translationBox')
			for (let i = 0; i < transList.length; i++) {
				let divDom = document.createElement('div')
				divDom.className = 'translation-item'
				divDom.setAttribute('data-sentenceBeginTime', transList[i].sentenceBeginTime)
				divDom.innerHTML = `
                    <div class="translation-item-header">
                        <div class="translation-item-header-speaker">书记员：${timestampToTime(transList[i].sentenceBeginTime)}</div>
                        <div class="translation-item-header-title">
                            <span>${transList[i].result}</span>
                        </div>
                       
                    </div>`
				transBoxDom.appendChild(divDom)
			}
			smoothScroll('#translationBox')
		},
	})
	function timestampToTime(timestamp) {
		var date = new Date(timestamp)
		var Y = date.getFullYear() + '-'
		var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
		var D = (date.getDate() + 1 <= 10 ? '0' + date.getDate() : date.getDate()) + ' '
		var h = (date.getHours() + 1 <= 10 ? '0' + date.getHours() : date.getHours()) + ':'
		var m = (date.getMinutes() + 1 <= 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
		var s = date.getSeconds() + 1 <= 10 ? '0' + date.getSeconds() : date.getSeconds()
		return Y + M + D + h + m + s
	}
	//平滑的滚动
	function smoothScroll(target) {
		const targetElement = document.querySelector(target)
		const targetPosition = targetElement.scrollHeight
		const startPosition = targetElement.scrollTop
		const distance = targetPosition - startPosition
		const duration = 1000 // 滚动持续时间，单位为毫秒
		let startTimestamp = null
		function scrollAnimation(timestamp) {
			if (!startTimestamp) startTimestamp = timestamp
			const progress = timestamp - startTimestamp
			targetElement.scrollTo(0, easeInOutQuad(progress, startPosition, distance, duration))
			if (progress < duration) {
				requestAnimationFrame(scrollAnimation)
			}
		}
		function easeInOutQuad(t, b, c, d) {
			t /= d / 2
			if (t < 1) return (c / 2) * t * t + b
			t--
			return (-c / 2) * (t * (t - 2) - 1) + b
		}
		requestAnimationFrame(scrollAnimation)
	}
	//webscoket 连接
	websocketHandler = new createWebSocket(function () {
		return `wss://192.168.0.87:30070/trailv2/api/voice/msg?trailId=170306353225880003000000001`
	})

	// 设置接收到 WebSocket 消息时的回调函数
	websocketHandler.onMessageCallback = function (data) {
		handleWebSocketMessage(data)
	}

	function handleWebSocketMessage(data) {
		// 根据你的数据结构更新 OnlyOffice 文档
		if (data.msgType === '1002') {
            let transBoxDom = document.getElementById('translationBox')
			// 寻找具有相同 data-index 属性的元素
			var existingItem = document.querySelector('.translation-item[data-sentenceBeginTime="' + data.sentenceBeginTime + '"]')

			if (existingItem) {
				// 如果找到，更新 translation-item-header-title 的内容
				var titleElement = existingItem.querySelector('.translation-item-header-title span')
				if (titleElement) {
					titleElement.textContent = data.result
				}
			} else {
				// 如果未找到，创建一个新的 translation-item 元素并添加到 transBoxDom 中
				var divDom = document.createElement('div')
				divDom.className = 'translation-item'
				divDom.setAttribute('data-sentenceBeginTime', data.sentenceBeginTime)
				divDom.innerHTML = `
                <div class="translation-item-header">
                    <div class="translation-item-header-speaker">书记员：${timestampToTime(data.sentenceBeginTime)}</div>
                    <div class="translation-item-header-title">
                        <span>${data.result}</span>
                    </div>
                </div>`
				transBoxDom.appendChild(divDom)
			}
		}
	}
})()
