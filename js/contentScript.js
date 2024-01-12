(function(){
  /** 引入SheetJS */
  // const scriptEl = document.createElement('script')
  // scriptEl.lang = "javascript"
  // scriptEl.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js'
  // document.head.appendChild(scriptEl)
  // scriptEl.onload = () => {
  //   window.XLSX = XLSX
  // }

  function copy(textValue) {
    // 动态创建 textarea 标签
    const textarea = document.createElement('textarea')
    // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
    textarea.readOnly = 'readonly'
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    // 将要 copy 的值赋给 textarea 标签的 value 属性
    textarea.value = textValue
    // 将 textarea 插入到 body 中
    document.body.appendChild(textarea)
    // 选中值并复制
    textarea.select()
    const result = document.execCommand('Copy')
    if (result) {
      chrome.runtime.sendMessage({ copy: true, value: textValue })
    }
    document.body.removeChild(textarea)
  }
 

  /** 将浮窗添加到页面中 */
  const helperHtml = `
    <div id="main">
      <h3 class="title">Amazon Helper</h3>
      <div class="content">

        <div class="lines"></div>

        <div class="form-item">
          <label for="asin">ASIN</label>
          <input type="text" id="asin" placeholder="多个以英文逗号隔开">
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

  /** 获取评论条数 */
  // 请求函数
  function createTask(i) {
    return () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(i);
        }, 2000);
      });
    };
  }

  class TaskQueue {
    constructor() {
      this.max = 5;
      this.taskList = [];
      setTimeout(() => {
        this.run();
      });
    }
    addTask(task) {
      this.taskList.push(task);
    }
    run() {
      let len = this.taskList.length;
      
      if (!len) return false;
      
      let min = Math.min(this.max, len);
      for (let i = 0; i < min; i++) {
        // 开始占用一个任务的空间
        this.max--;
        let task = this.taskList.shift();
        task().then((res => {
          console.log('result:', res);
        })).catch(error => {
          throw new Error(error);
        }).finally(() => {
          // 释放一个任务空间
          this.max++;
          this.run();
        });
      }
    }
  }
  function reqIframe(asin, result) {
    return () => {
      return new Promise(async (resolve, reject) => {
        await wait(createIframe.bind(this, asin))
        document.getElementById(asin).addEventListener('load', async function(ev){
          result[asin] ??= []
          const asinArr = result[asin]
          let win = ev.target.contentWindow;
          const asinDoc = win.document
          for(let j = 5; j >= 0; j--) {
            await searchStar(j, asinDoc)
            const count = getStarCount(asinDoc)
            asinArr.push(count)
          }
          const first = asinArr[asinArr.length -1] - asinArr.slice(1, -1).reduce((p, c) => +p + +c)
          asinArr.splice(0, 1, first)
          console.log(asinArr)
          // removeIframe(asin)
            resolve(result);
        })

      });
    };
  }


  function createIframe(asin) {
    const src = `https://${location.host}/product-reviews/${asin}/ref=cm_cr_arp_d_viewopt_sr?ie=UTF8&filterByStar=all_stars&reviewerType=all_reviews&formatType=current_format&pageNumber=1`

    const elIframe = document.createElement("iframe");
    elIframe.setAttribute('id', asin)
    elIframe.setAttribute('src', src)
    elIframe.setAttribute('style', "width: 100%;height: 50%;opacity:1;position:fixed;top:0;pointer-events:none;z-index:999;border:2px solid red;")
    // const elHtml = `<iframe id="${asin}" style="width: 100%;height: 50%;opacity:1;position:fixed;top:0;pointer-events:none;z-index:999;border:2px solid red;" src="${url}"></iframe>`
    document.body.appendChild(elIframe)
  }
  function removeIframe(asin) {
    const iframe = document.getElementById(asin)
    document.body.removeChild(iframe)
  }
  function wait(fn, delay = 800) {
    return new Promise((resolve, reject) => {
      try {
        fn()
        setTimeout(() => {
          resolve()
        }, delay)
      } catch(e) {
        console.log(e)
        reject(e)
      }
    })
  }

  /** 所有星、1-5星筛选 */
  function searchStar(star, asinDoc) {
    return wait(() => {
      console.log(asinDoc, 12);
      asinDoc.getElementById('a-autoid-5-announce').click()
      // 0: 所有星 5:1 4:2 3:3 2:4 1:5
      // 1052 624 169 109 65 85 
      const el = asinDoc.getElementById('star-count-dropdown_' + star)
      el?.click()
    }, 800)
  }

   /** 获取评论数量 */ 
  function getStarCount(asinDoc) {
    const starEl = asinDoc.querySelector('#filter-info-section > div[data-hook=cr-filter-info-review-rating-count] ')
    const reviews = starEl.textContent.match(/[\d,]+/)[0].replace(',', '')
    return reviews ?? '-'
  }
  const submitEl = document.querySelector('#am-helper #submit')
  const starInfoEl = document.querySelector('#am-helper #starInfo')
  submitEl.addEventListener('click', async() => {
    const host = ['www.amazon.com', 'www.amazon.ca']
    if(!location.pathname.startsWith('/product-reviews/')||!host.includes(location.host)) {
      chrome.runtime.sendMessage({ invalidPage: true })
      return
    }
    starInfoEl.innerHTML = ''
    
    const asinEl = document.querySelector('#am-helper #asin')
    const asinStr = asinEl.value ?? ''
    const asinList = asinStr.split(',')
    // {asin1: [1星数量，2星数量，3星数量，4星数量，5星数量，所有星数量]}
    let result = {}
    const taskQueue = new TaskQueue();
    for(let i = 0; i < asinList.length; i++) {
      const asin = asinList[i]
      const task = reqIframe(asin, result);
      taskQueue.addTask(task);
      // await wait(createIframe.bind(this, asin))
      // document.getElementById(asin).addEventListener('load', async function(ev){
      //   result[asin] ??= []
      //   const asinArr = result[asin]
      //   for(let j = 5; j >= 0; j--) {
      //     await searchStar(j)
      //     const count = getStarCount(ev.target)
      //     asinArr.push(count)
      //   }
      //   const first = asinArr[asinArr.length -1] - asinArr.slice(1, -1).reduce((p, c) => +p + +c)
      //   asinArr.splice(0, 1, first)
      //   console.log(asinArr)
        // removeIframe(asin)
      // })
      console.log(result)
    }
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

