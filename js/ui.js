/** 将浮窗添加到页面中 */
function createUI() {
  const helperHtml = `
  <div id="main">
    <h3 class="title">Amazon Helper</h3>
    <div class="content">

      <div class="lines"></div>

      <div class="form-item">
        <label for="asin">ASIN</label>
        <input type="text" id="asin" placeholder="多个以英文逗号或空格隔开">
      </div>
      <input id="submit" type="button" value="获取评论星级条数" >
      <div id="starInfo" title="1星 2星 3星 4星 5星 全部"></div>
      <!--
      <div class="diyBtn">
        <span id="currentPage">获取当前页</span>
        <span id="2">获取当前查询所有结果</span>
      </div>
      <div class="lines"></div>
      

      
      <div class="form-item">
        <label for="link">链接</label>
        <input type="text" id="link" placeholder="请输入链接">
      </div>
      <input id="submit2" type="button" value="提交"> -->
    </div>
    <span class="author">copyright@laifubin by 2023</span>
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
}