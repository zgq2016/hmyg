/* 
1 动态渲染的商品应该是 checked=true的这些商品 
2 获取订单编号
  1 先获取用户登录的token值
    0 判断有没有token
      1 如果没有token
        0 都是跳转到授权页面 进行获取 成功 再重新跳回 支付页面
        1 先获取用户信息
        2 执行小程序登录 获取 code属性 
      2 有token 直接走业务流程  
 */

import regeneratorRuntime from '../../lib/runtime/runtime';
// import { getSetting, openSetting, chooseAddress, showModal } from "../../utils/asyncWx";


Page({
  data: {
    address: {},
    cart: {},
    totalNum: 0,
    totalPrice: 0
  },
  // 页面切换显示的时候 触发 onShow
  onShow() {
    //  1 获取本地存储中的 收货地址数据  默认值 空字符串
    const address = wx.getStorageSync("address") || {};
    // 1 获取购物车数据
    const cart = wx.getStorageSync("cart") || {};
    // 2 把address存入到data中
    this.setData({ address });

    this.setCart(cart);
  },

  setCart(cart) {
    // 0 把购物车对象转成 数组 
    let cartArr = Object.values(cart);
    // every 会接收一个回调函数 当没有循化项都返回 true的时候 cartArr.every的返回值 才会是true 
    // every 当是空数组调用它的时候 返回值就是true 
    // 2 计算总价格 只计算了勾选的商品的价格 
    let totalPrice = 0;
    // 3 计算总数量 
    let totalNum = 0;
    cartArr.forEach(v => {
      if (v.checked) {
        totalPrice += v.num * v.goods_price;
        totalNum += v.num;
      }
    })
    this.setData({ cart, totalPrice, totalNum });
  },
  // 点击支付的按钮
  handleOrderPay() {
    // 1 获取token
    const token = wx.getStorageSync("token");
    // 2 判断是否存在
    if (!token) {
      // 跳转到授权页面
      wx.navigateTo({
        url: '/pages/auth/index'
      });
    }else{
      // 有token 直接写逻辑
      console.log("有 token");
    }

  }

})