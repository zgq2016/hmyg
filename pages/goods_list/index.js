/* 
1 发送请求 获取商品列表的数据 
2 上拉加载下一页 
  1 什么时候触发上拉加载下一页 也是 滚动条触底 才触发事件 
    onReachBottom 存在于小程序的页面 生命周期中！！！
  2 先判断 有没有下一页数据
    1 当前的页码  和 总页数 （未知）
      总页数 = Math.ceil(总的条数 / 页容量 ) 
              21 / 10= 2.1  Math.ceil(2.1)=3 
      当前的页码 >=  总页数  没有下一页数据 
    2 什么地方写获取总页数 
      接口请求成功之后 有了total属性之后就可以获取 
  3 有下一页数据 
    pagenum++;
    发送请求。。
      不能再对goodsList 全部替换 
      对旧的数组进行拼接 
  4 没有下页
    弹出提示。。
3 下拉刷新 
  1 触发下拉刷新的事件 
    1 需要在json文件中开启 运行下拉
    2 页面js中 添加 一个 下拉刷新事件
    3 可能需要在app.json文件中 修改下拉刷新的小圆点的颜色。。
  2 实现刷新
    1 重置 pagenum =1 
    2 重置 data中的数组 goodsList =[]
    3 重新发送请求！！
      1 pagenum =1 
      2 会对goodsList =[] 重新赋值！！
    4 当数据请求回来 需要手动的关闭 下拉刷新窗口。。。 wx.stopPullDownRefresh()
4 添加一个全局的正在加载中 效果
  1 效果是哪个代码决定 wx.showLoading wx.hideLoading
  2 思考在哪里进行调用会比较方便
    -1 axios 请求拦截器 
    0 封装过一个发送请求的代码 request 
    1 发送异步请求之前显示
    2 异步请求成功 就关闭 
5 将异步代码改成 更加优雅的 es 7 async语法 
  0 旧版本的微信和旧的手机 直接不要在原生的小程序中使用 es7 的语法！！！
  1 在方法的定义前 加一个 async 
  2 在async描述的方法内 发送的异步代码  在它的前面加一个 await 即可 
  3 容易报一个错误 运行环境不支持 es7 的代码 
  4 会用一个方法 来解决代码中报错的问题
    1 这个方法 不能解决所有的旧手机和旧微信的语法兼容问题 


 */

import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
  data: {
    // tabs标签的标题数组
    tabs: [
      { id: 0, title: "综合", isActive: true },
      { id: 1, title: "销量", isActive: false },
      { id: 2, title: "价格", isActive: false }
    ],
    // 页面要渲染的商品数组
    goodsList: []
  },
  // 全局 接口参数 
  QueryParams: {
    // 关键字  小米 。。 可以为空字符串
    query: "",
    // 分类id 
    cid: "",
    // 页码 
    pagenum: 1,
    // 页容量
    pagesize: 10
  },
  // 总页数
  TotalPages: 1,

  // onLoad 页面开始加载的时候触发  形参中可以获取到页面的url参数
  onLoad(options) {
    this.QueryParams.cid = options.cid;
    // 显示等待
    this.getGoodsList();
  },

  // 获取商品列表数据
  async getGoodsList() {
    const res = await request({ url: "/goods/search", data: this.QueryParams });
    this.TotalPages = Math.ceil(res.total / this.QueryParams.pagesize);
    this.setData({
      goodsList: [...this.data.goodsList, ...res.goods]
    })
    wx.stopPullDownRefresh();
  },

  // 滚动条触底 上拉加载下一页 事件
  onReachBottom() {
    //  1 先判断还有没有下一页数据
    if (this.QueryParams.pagenum >= this.TotalPages) {
      // 没有下一页数据
      console.log("没有下一页数据");
      wx.showToast({
        title: '没有下一页数据了',
        icon: 'none'
      });

    } else {
      // 还有下页数据
      // console.log("还有下页数据");
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },
  // 页面下拉刷新事件
  onPullDownRefresh() {
    // 1 重置 页码
    // 2 重置data中的数组
    // 3 重新发送请求

    this.QueryParams.pagenum = 1;
    this.setData({
      goodsList: []
    })
    this.getGoodsList();
  },



  // 改变tabs标签的选中效果
  handleTitleChange(e) {
    // 先获取子组件传递过来的数据
    const { index } = e.detail;
    // 获取源数组
    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    this.setData({ tabs });
  }
})