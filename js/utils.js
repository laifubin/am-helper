/** 创建Excel */
function createExcel (data = [], title = ['asin', 'listing', 'title', 'dimensions', 'price', 'image', 'weight']) {
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

/** 下载文件 */
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

/** 复制文本 */
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

/** 延迟执行函数 */
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

/** 最大并行任务数量处理 */ 
class TaskQueue {
  constructor(completeFn) {
    this.completeFn = completeFn
    this.max = 5;
    this.taskList = [];
    this.unCompleteCount = 0
    setTimeout(() => {
      this.run();
    });
  }
  addTask(task) {
    this.taskList.push(task);
    this.unCompleteCount++
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
        this.unCompleteCount--
        let len = this.taskList.length;
        if(len) this.run();
        else if(len ==0 && this.unCompleteCount === 0){
          this.completeFn()
        }
      });
    }
  }
}