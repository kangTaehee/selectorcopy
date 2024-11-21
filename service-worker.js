chrome.commands.onCommand.addListener((command) => {
	if (command === "copy-css-selector") {
		console.log("Ctrl+Shift+Y 단축키가 눌렸습니다.");
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tab = tabs[0];
			if (tab) {
				chrome.scripting.executeScript({
					target: { tabId: tab.id },
					function: copyCssSelector,
				});
			}
		});
	}
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	debugger
	if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			function: copyCssSelector,
		});
	}
});

// content script에서 실행할 함수 정의
function copyCssSelector() {
	console.log("현재 요소의 CSS 선택자를 복사합니다.");
	// 여기에 CSS 선택자를 복사하는 로직 작성 가능
	(function () {
		let overitem = null
		document.addEventListener("mouseover", function (event) {
			overitem = event.target

		});

		document.addEventListener('keydown', function (event) {
			// 원하는 단축키 설정 (Ctrl + Alt + C)
			// if (event.ctrlKey && event.altKey && event.key === 'y') {
			if (event.ctrlKey && event.key === 'b') {
				// const element = document.querySelector(':hover'); // 현재 마우스가 올려진 요소
				const element = overitem;

				function getSelector(element) {
					let selector = "";

					// ID가 있으면 #id 형태로 반환
					if (element.id) {
						selector = `#${element.id}`;
					} else if (element.className) {
						// 클래스가 있으면 .class1.class2 형태로 반환
						const classNames = element.className.split(/\s+/).filter(Boolean);
						if (classNames.length > 0) {
							selector = `.${classNames.join('.')}`;
						}
					} else if (element.name) {
						// name 속성이 있으면 [name="value"] 형태로 반환
						selector = `[name="${element.name}"]`;
					} else {
						// Fallback: 태그 이름 반환
						selector = element.tagName.toLowerCase();
					}

					return selector;
				}

				function getFullSelector(element) {
					let parts = [];
					let current = element;

					while (current && current.tagName.toLowerCase() !== "body") {
						const currentSelector = getSelector(current);
						if (currentSelector) {
							parts.unshift(currentSelector); // 앞에 추가
							if (current.id) {
								break; // ID를 만나면 중단
							}
						}
						current = current.parentElement;
					}

					return parts.join(" > ");
				}

				const fullSelector = getFullSelector(element);
				console.log("Full selector:", fullSelector);
				copyTextToClipboard(fullSelector)
				// test
				let item = document.querySelectorAll(fullSelector)
				console.log(item)
				item.forEach(item => item.style.outline = "2px dashed red")
				let messege = `복사 갯수 : ${item.length}`
				console.log(messege);
				// await alert(messege)
				setTimeout(() => {
					alert(messege);
					// 스타일 제거
					item.forEach((item) => (item.style.outline = "unset"));
				}, 100);
				// (async function () {
				// 	// alert 메시지 표시 (사용자가 확인 버튼을 누를 때까지 기다림)
				// 	await new Promise((resolve) => {
				// 		alert(messege);
				// 		resolve();
				// 	});
				// 	// item.forEach((item) => (item.style.border = "unset"));
				// })();
				// test end

			}
		});

		function copyTextToClipboard(text) {
			if (text) {
				// const selector = generateUniqueSelector(text);
				navigator.clipboard.writeText(text).then(() => {
					console.log('CSS Selector 복사됨:', text);
				}).catch(err => {
					console.error('복사 실패:', err);
				});
			} else {
				console.log(text)
			}
		}



	}())
}

