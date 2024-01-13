

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   if(message.invalid) {
    createNotification({ message: message.text })
  }
    // if(message.isValid) {
    //   if(message.type === 'fetchSellerSpirit') {
    //     login('2022US2', message.p)
    //     // fetchSellerSpirit(message.data.join(',')).then(res => {
    //     //   sendResponse(res?.data ?? [])
    //     // })
    //   } 
    // } else {
    //   createNotification('提示', '试用已到期~')
    //   sendResponse([])
    // }
    return true
  }
)

const result = []
function fetchOriginHtml(asin) {
  const url = 'https://www.amazon.com/dp/' + asin + '?psc=1&_=' + Date.now()
  return fetch(url)
    .then(response => response.text())
    .then(data => {
      const item = {}
      const title = data.replace(/.*<title>Amazon.com: (.*) : Electronics<\/title>/, '$1')
      const listing = title.split(/\s+/)[1]

      const startString = data.replace(/<span id="acrPopover".*title="(.+)">/g, '$1')
      const start = startString?.split(/[\sa-z]+/).filter(Boolean).join('/')
      
      const infos = ['ASIN', 'Package Dimensions', 'Item Weight', 'Customer Reviews', 'Date First Available']
      infos.forEach(info => {
        const reg = new RegExp(`.*${info}.*?<td.*?> (.*?) <\/td>.*`, 'g')
        item[info] = data.replace(reg, '$1')
      })
      
      // const size = data.replace(/.*Package Dimensions.*?<td.*?> (.*?) <\/td>.*/, '$1')
      console.log("响应数据：", infos, start, listing);
      return { ...item, infos, start, listing }
    })
    .catch(error => {
      console.error("获取响应数据时发生错误：", error);
    });
}

function fetchSellerSpirit (asins) {
  const token = getStorage('mjjl_token') 
  // const url = "https://www.sellersprite.com/v2/extension/competitor-lookup/quick-view/US?asins=B0BQ356JNP&source=chrome&miniMode=false&withRelation=true&withSaleTrend=false&tk=642232.1037917&version=4.1.1&language=zh_CN&extension=lnbmbgocenenhhhdojdielgnmeflbnfb"
  const url = `https://www.sellersprite.com/v2/extension/asin/US?asins=${asins}&tk=412968.22477&version=4.1.1&language=zh_CN&extension=lnbmbgocenenhhhdojdielgnmeflbnfb&source=chrome`
  return fetch(url, {
    headers: {
      authority: 'www.sellersprite.com',
      scheme: 'https',
      accept: 'application/json',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9',
      'auth-token': token,
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      cookie: 'ecookie=S0tSgmhgJaEqxkvC_CN; JSESSIONID=29C08AA0B891695385EE733916313D13; _ga=GA1.1.920354382.1689817159; _ga_38NCVF2XST=GS1.1.1689817159.1.0.1689817159.0.0.0',
      pragma: 'no-cache',
      'random-token': '811081a2-3a82-402d-9619-87a10a6c7813',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'none',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    },
    credentials: 'include'
  })
  .then(res => {
   
    // ERR_NEED_RE_AUTHORIZED
    const data = res.text()
    if(typeof data === 'object') {
      data.then(res => {
        const data = JSON.parse(res.text())
        if(data.code === 'ERR_NEED_RE_AUTHORIZED') {
          console.log("===============");
          // login()
        }
      })
    } else {
      return JSON.parse(data)
    }
  })
  .catch((e) => {
    console.log("eeeeeeeeeeeeee", e);
  })
}


function login (email, password) {
  return fetch(`https://www.sellersprite.com/v2/extension/signin?email=${email}&password=${password}&tk=544990.936507&version=4.1.1&language=zh_CN&extension=lnbmbgocenenhhhdojdielgnmeflbnfb&source=chrome`, {
    "headers": {
      "accept": "application/json",
      "accept-language": "zh-CN,zh;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "random-token": "811081a2-3a82-402d-9619-87a10a6c7813",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "none"
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  }).then(res => res.json())
  .then(res => {
    setStorage('mjjl_email', res.data?.email)
    setStorage('mjjl_token', res.data?.token)
    return res
  })
}



function getStorage(key) {
  let result
  chrome.storage.local.get([key], function(result) {
    result = result.key
  });
  return result
}

function setStorage(key, value) {
  chrome.storage.local.set({[key]: value}, function(result) {
  })
}

// http://www.taodudu.cc/news/show-3829734.html?action=onClick
/** type: basic,image,simple,list */
function createNotification(options) {
  const { title = '', message, type = 'basic' } = options
  const notificationOptions = {
    type,
    iconUrl: "am.png",
    title,
    message
  };

  chrome.notifications.create('AMHelper' + Date.now(), notificationOptions);
}
