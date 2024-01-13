(function(){
  createUI()
  getReviews()

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
        downloadFile(createExcel(data), 'AMHelper.xlsx')
      }
    })
  })
})()

