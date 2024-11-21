console.log('실행되니')
(function () {
  document.addEventListener('keydown', function (event) {
    // 원하는 단축키 설정 (Ctrl + Alt + C)
    if (event.ctrlKey && event.altKey && event.key === 'y') {
      const element = document.querySelector(':hover'); // 현재 마우스가 올려진 요소
      if (element) {
        const selector = generateUniqueSelector(element);
        navigator.clipboard.writeText(selector).then(() => {
          console.log('CSS Selector 복사됨:', selector);
        }).catch(err => {
          console.error('복사 실패:', err);
        });
      }
    }
  });

  // 고유한 CSS 선택자 생성 함수
  function generateUniqueSelector(element) {
    let path = [];
    while (element.parentNode) {
      let tag = element.tagName.toLowerCase();
      if (element.id) {
        path.unshift(`#${element.id}`);
        break;
      } else {
        let siblings = Array.from(element.parentNode.children).filter(e => e.tagName === element.tagName);
        let index = siblings.indexOf(element) + 1;
        path.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${index})` : tag);
        element = element.parentNode;
      }
    }
    return path.join(' > ');
  }

}())