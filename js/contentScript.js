(function(){
  /** 引入SheetJS */
  // const scriptEl = document.createElement('script')
  // scriptEl.lang = "javascript"
  // scriptEl.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js'
  // document.head.appendChild(scriptEl)
  // scriptEl.onload = () => {
  //   window.XLSX = XLSX
  // }
 

  /** 将浮窗添加到页面中 */
  const helperHtml = `
    <div id="main">
      <h3 class="title">Amazon Helper</h3>
      <div class="content">

        <div class="lines"></div>
        <!--
        <div class="diyBtn">
          <span id="currentPage">获取当前页</span>
          <span id="2">获取当前查询所有结果</span>
        </div>
        <div class="lines"></div>
        -->

        <div class="form-item">
          <label for="keywords">关键词</label>
          <input type="text" id="keywords" placeholder="多个以英文逗号隔开">
        </div>
        <div class="form-item">
          <label for="link">链接</label>
          <input type="text" id="link" placeholder="请输入链接">
        </div>
        <input id="submit" type="button" value="pf">
        <!-- <input id="submit2" type="button" value="提交"> -->
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

  /** 获取评论条数 */
  // B08ZNHQ5D7 B08ZNF1RTN
  function getReviewsUrl(asin) {
    return `'https://www.amazon.com/product-reviews/${asin}/ref=cm_cr_arp_d_viewopt_sr?ie=UTF8&filterByStar=all_stars&reviewerType=all_reviews&formatType=current_format&pageNumber=1'`
  }
  const submitEl = document.querySelector('#am-helper #submit')
  submitEl.addEventListener('click', (e) => {
    const asinEl = document.querySelector('#am-helper #keywords')
    const asinStr = asinEl.value ?? ''
    const asinList = asinStr.split(',')
    const starEl = document.querySelector('#filter-info-section > div[data-hook=cr-filter-info-review-rating-count] ')
    const reviews = starEl.textContent.match(/[\d,]+/)[0].replace(',', '')
    const lisEl = document.querySelectorAll('#a-popover-2 li')
    console.log(starEl.textContent , asinStr)
   
  }) 

  /** 点击提交 */
  const currentPageEl = document.querySelector('#am-helper #currentPage')
  const lastDate = +new Date('2023-07-27 24:00:00')
  currentPageEl?.addEventListener('click', (e) => {
    const nowDate = Date.now()
    const isValid = nowDate - lastDate < 0

    let asin = []
    if(isValid) {
      const asinEls = document.querySelectorAll('div[data-asin][data-component-type="s-search-result"]');
      asin = Array.from(asinEls).map(el => el.getAttribute('data-asin'))
    }
    console.log(hex_md5('2US20211220'), 2323)
    chrome.runtime.sendMessage({ type: 'fetchSellerSpirit', data: asin, isValid, p:hex_md5('2US20211220') }, (res) => {
      if(res.length) {
        console.log('very good', res)
        const data = res.map(item => {
          const { asin, title, dimensions, price, image, weight } = item
          const listing = title.split(/\s+/)[1]
          return [asin, listing, title, dimensions, price, image, weight]
        })
        downloadFile(createExecl(data), 'AMHelper.xlsx')
      }
    })
  })



  function createExecl (data = [], title = ['asin', 'listing', 'title', 'dimensions', 'price', 'image', 'weight']) {
    // 模拟一些数据，这里使用二维数组表示表格数据
    data.unshift(title)

    // 创建一个工作簿对象
    const workbook = XLSX.utils.book_new();

    // 创建一个工作表对象
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // 将工作表添加到工作簿中
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 将工作簿转换为Excel文件的二进制数据
    const excelData = XLSX.write(workbook, { type: 'array' });
    return excelData
  }

  function downloadFile(blobData, fileName = Date.now() + '.xlsx') {
    // 创建一个Blob对象
    const blob = new Blob([blobData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    // 创建一个下载链接
    const url = URL.createObjectURL(blob);
    // 创建一个链接元素，并模拟点击来触发下载
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // 指定下载文件的名称
    document.body.appendChild(a);
    a.click();

    // 释放URL对象，以避免内存泄漏 c28d7fa457c4c6f893707dc376b83a95
    // 2US20211220
    URL.revokeObjectURL(url);
  }
})()

