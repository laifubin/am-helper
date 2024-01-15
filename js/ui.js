/** 将浮窗添加到页面中 */
function createUI() {
  const helperHtml = `
  <div id="main">
    <h3 class="title">Amazon Helper</h3>
    <div class="content">

      <div class="lines"></div>

      <div class="form-item" id="site_wrap">
        <!--<label for="site">站点</label> 
        <select id="site" style="width: 100%">
          <option value=".com">US</option>
          <option value=".ca">CA</option>
        </select>
        <span class="label_name">SITE</span>
        -->
        <label class="label_name">SITE</label>
        <input type="radio" id="us" name="site" value=".com" checked />
        <label for="us">US</label>
        <input type="radio" id="ca" name="site" value=".ca"/>
        <label for="ca">CA</label>
      </div>
      <div class="form-item">
        <label for="asin">ASIN</label>
        <input type="text" id="asin" placeholder="多个以英文逗号或空格隔开">
      </div>
      <input id="submit" type="button" value="获取评论星级条数" >
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
  <div class="close"><div><span id="circle"></span></div></div>
  `
  const el = document.createElement("div");
  el.setAttribute('id', 'am-helper')
  el.classList.add('open')
  el.innerHTML = helperHtml
  document.body.appendChild(el);

  /** 展开折叠浮窗 */
  const closeEl = document.querySelector('#am-helper>.close>div')
  closeEl.addEventListener('click', (e) => {
    const mainEl = document.querySelector('#am-helper')
    if (mainEl.classList.contains('open')) {
      mainEl.classList.remove('open')
      // e.target.innerHTML = '>>'
      // e.target.style.textAlign = 'center'
    } else {
      mainEl.classList.add('open')
      // e.target.innerHTML = '<<'
      // e.target.style.textAlign = 'left'
    }
  })
}