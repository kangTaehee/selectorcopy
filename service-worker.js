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
	if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			function: copyCssSelector,
		});
	}
});
let played = false;
// content script에서 실행할 함수 정의
function copyCssSelector() {
	// 이미 실행 중인지 확인하기 위해 전역 변수 사용
	if (window._cssSelectorInitialized) {
		console.log("이미 실행 되었습니다.");
		return;
	}
	window._cssSelectorInitialized = true;

	console.log("현재 요소의 CSS 선택자를 복사합니다.");
	let overitem = null; // 현재 마우스가 올려진 요소
	// mouseover 이벤트 디바운싱 추가
	const handleMouseOver = (event) => {
		overitem = event.target;
	};
	// 요소 하이라이트 함수 분리
	const highlightElements = (selector) => {
		try {
			const items = document.querySelectorAll(selector);
			if (items.length === 0) {
				alert('해당 선택자로 찾은 요소가 없습니다.');
				return;
			}

			items.forEach(item => item.style.outline = "2px dashed red");
			const message = `셀렉터 기준 요소 갯수: ${items.length}`;

			setTimeout(() => {
				alert(message);
				items.forEach(item => item.style.outline = "unset");
			}, 100);
		} catch (error) {
			console.error('하이라이트 처리 중 오류:', error);
		}
	};
	const handleKeyDown = async (event) => {
		if (event.ctrlKey && event.key === 'b') {
			if (!overitem) {
				alert('마우스로 복사할 대상을 선택해주세요');
				return;
			}
			try {
				const fullSelector = getFullSelector(overitem);
				await copyTextToClipboard(fullSelector);
				highlightElements(fullSelector);
			} catch (error) {
				console.error('처리 중 오류 발생:', error);
				alert('선택자 처리 중 오류가 발생했습니다.');
			}
		}
	};
	// 클립보드 복사 
	async function copyTextToClipboard(text) {
		if (!text) {
			console.warn('복사할 텍스트가 없습니다');
			return;
		}

		try {
			await navigator.clipboard.writeText(text);
			console.log('CSS Selector 복사됨:', text);
		} catch (err) {
			console.error('복사 실패:', err);
			throw new Error('클립보드 복사 실패');
		}
	}
	function getSelector(element) {
		if (!element || !element.tagName) return '';

		// ID가 있으면 #id 형태로 반환
		if (element.id) {
			return `#${element.id}`;
		}

		// 클래스가 있으면 .class1.class2 형태로 반환
		if (element.className && typeof element.className === 'string') {
			const classNames = element.className.split(/\s+/).filter(Boolean);
			if (classNames.length > 0) {
				return `.${classNames.join('.')}`;
			}
		}

		if (element.name) {
			// name 속성이 있으면 [name="value"] 형태로 반환
			return `[name="${element.name}"]`;
		}
		// Fallback: 태그 이름 반환
		return element.tagName.toLowerCase();
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
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener("mouseover", handleMouseOver);

}
