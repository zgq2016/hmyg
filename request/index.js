

// 1 同时发送出去的异步请求的个数
let ajaxTimes = 0;

export const request = (params) => {
  /* 
  1 因为首页是同时发送3个请求出去
  2 当某一个请求回来了就会关闭等待图标
  3 但是 后两个请求还没有回来，页面上已经没有等待图标。。。
  
  1 必须等待3个请求都回来了，再关闭 等待图标！！！
   */
  // 显示正在等待的图标
  wx.showLoading({
    title: "加载中。。。"
  });
  ajaxTimes++;

  // 统一的接口的前缀
  // const baseUrl = "https://api.zbztb.cn/api/public/v1";
  const baseUrl = "https://www.linweiqin.cn/api/public/v1";
  return new Promise((reslove, reject) => {
    wx.request({
      ...params,
      url: baseUrl + params.url,
      success: (result) => {
        reslove(result.data.message);
      },
      fail: (error) => {
        reject(error);
      },
      complete: () => {
        ajaxTimes--;
        if(ajaxTimes===0){
          // 同时发送出去的请求 都回来了
          wx.hideLoading();
        }
      }
    });
  })
}

