(function(){
  /** 将浮窗添加到页面中 */
  const helperHtml = `
    <div id="main">
      <h3 class="title">Amazon Helper</h3>
      <div class="content">
        <div class="form-item">
          <label for="keyword">关键词</label>
          <input type="text" id="keyword">
        </div>
        <div class="form-item">
          <label for="link">链接</label>
          <input type="text" id="link">
        </div>
        <input type="button" value="提交">
      </div>
      <span class="author">@22023 by laifubin</span>
    </div>
    <div class="close"><span><<</span></div>
  `
  const el = document.createElement("div");
  el.setAttribute('id', 'am-helper')
  el.classList.add('open')
  el.innerHTML = helperHtml
  document.body.appendChild(el);

  /** 展开折叠浮窗 */
  const closeSpanEl = document.querySelector('#am-helper>.close>span')
  closeSpanEl.addEventListener('click', (e) => {
    const mainEl = document.querySelector('#am-helper')
    if (mainEl.classList.contains('open')) {
      mainEl.classList.remove('open')
      e.target.innerHTML = '>>'
      e.target.style.textAlign = 'center'
    } else {
      mainEl.classList.add('open')
      e.target.innerHTML = '<<'
      e.target.style.textAlign = 'left'
    }
  })
})()
