/** 获取评论星级数量并下载excel */
function getReviews() {
  const submitEl = document.querySelector('#am-helper #submit')
  submitEl.addEventListener('click', async(e) => {
    const siteEl = document.querySelector('#am-helper #site_wrap input[name=site]:checked')
    const asinEl = document.querySelector('#am-helper #asin')
    const asinStr = asinEl.value ?? ''
    const asinList = asinStr.split(/[,\s]+/).filter(Boolean)
    const site = siteEl?.value
    
    if(!asinStr&&!asinList.length) {
      chrome.runtime.sendMessage({ invalid: true, text: 'ASIN不能为空！' })
      return 
    }
    
    e.target.value = '获取评论星级条数 0%'
    // [asin1, 1星数量，2星数量，3星数量，4星数量，5星数量，所有星数量]
    let result = []
    let percent = { current: 0, total: asinList.length * 6 }
    const siteName = { com: 'US', ca: 'CA' }[site.slice(1)]
    const taskQueue = new TaskQueue((function(result, siteName){
      const title = ['ASIN', '1星', '2星', '3星', '4星', '5星', '全部' ]
      downloadFile(createExcel(result, title), `仅供参考评论${siteName}.xlsx`)
    }).bind(this, result, siteName));

    for(let i = 0; i < asinList.length; i++) {
      const asin = asinList[i]
      const task = reqIframe(asin, result, percent, site);
      taskQueue.addTask(task);
    }
  }) 
}

/** 获取评论条数 */
function reqIframe(asin, result, percent, site) {
  return () => {
    return new Promise(async (resolve, reject) => {
      await wait(createIframe.bind(this, asin, site))
      document.getElementById(asin).addEventListener('load', async function(ev){
        const asinArr = [asin]
        let win = ev.target.contentWindow;
        const asinDoc = win.document
        const el = document.querySelector('#am-helper #submit')

        if(!asinDoc.getElementById('a-autoid-5-announce')) {
          result.push(asinArr)
          resolve(result);
          removeIframe(asin)
          percent.current += 6
          el.value = '获取评论星级条数 ' + Math.round(percent.current*100 / percent.total) + '%'
          return
        }

        setTimeout(async () => {
          for(let j = 5; j >= 0; j--) {
            await searchStar(j, asinDoc)
            const count = getStarCount(asinDoc)
            asinArr.push(+count)
            percent.current++
            el.value = '获取评论星级条数 ' + Math.round(percent.current*100 / percent.total) + '%'
          }

          // asinArr[0]是asin code
          const first = asinArr[1]
          const last = asinArr[asinArr.length -1]
          const center = asinArr.slice(2, -1).reduce((p, c) => +p + +c)

          if(first + center > last) {
            asinArr.splice(1, 1 , last - center)
          }
          result.push(asinArr)
          resolve(result);
          setTimeout(() => {
            removeIframe(asin)
          }, 1000)
        }, 500)
      })

    });
  };
}

// B07GB4S9H5
// B08ZNF1RTN,B08ZNHQ5D7,B0CCP82QHP,B07GB4S9H5,B0C3CMPGZ7
/** 创建一个iframe窗口 */
function createIframe(asin, site, star = 0) {
  const starCount = ['all', 'one', 'two', 'three', 'four', 'five'][star]
  const src = `https://www.amazon${site}/product-reviews/${asin}/ref=cm_cr_arp_d_viewopt_fmt?ie=UTF8&filterByStar=${starCount}_stars&reviewerType=all_reviews&pageNumber=1&formatType=current_format#reviews-filter-bar`


  const elIframe = document.createElement("iframe");
  elIframe.setAttribute('id', asin)
  elIframe.setAttribute('src', src)
  elIframe.setAttribute('style', "width: 100%;height: 50%;opacity:0;position:fixed;top:0;pointer-events:none;z-index:999;border:2px solid red;")
  // const elHtml = `<iframe id="${asin}" style="width: 100%;height: 50%;opacity:1;position:fixed;top:0;pointer-events:none;z-index:999;border:2px solid red;" src="${url}"></iframe>`
  document.body.appendChild(elIframe)
}
/** 移除iframe窗口 */
function removeIframe(asin) {
  const iframe = document.getElementById(asin)
  document.body.removeChild(iframe)
}


/** 所有星、1-5星筛选 */
function searchStar(star, asinDoc) {
  return wait(() => {
    asinDoc.getElementById('a-autoid-5-announce')?.click()
    // 0: 所有星 5:1 4:2 3:3 2:4 1:5
    // 1052 624 169 109 65 85 
    const el = asinDoc.getElementById('star-count-dropdown_' + star)
    el?.click()
  }, 1000)
}

 /** 获取评论数量 */ 
function getStarCount(asinDoc) {
  const starEl = asinDoc.querySelector('#filter-info-section > div[data-hook=cr-filter-info-review-rating-count] ')
  const reviews = starEl?.textContent.match(/[\d,]+/)[0].replace(',', '')
  return reviews ?? 0
}
