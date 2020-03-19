/* 
1 点击按钮 获取收货地址
  1 wx.chooseAddress -> 弹出对话框
    1 点击允许  直接获取值就ok
    2 点击取消 。。下次再点击 就没有任何效果  
  1 先获取用户对该小程序的授予权限的信息  getSetting
    1 已经授权了
      授权返回值 是true   直接调用收货地址 接口代码  
    2 没有授权
      1 用户从来没有点击过 按钮  授权返回值 undefined 
      2 用户点击了取消 按钮 ， 授权返回值 false 
  2 假设授权信息 是 true 或者  undefined
    1 直接调用获取收货地址的api 
  2 假设授权信息 是false （用户明确不授权）
    1 诱导用户 打开 授权页面( wx.openSetting)。等用户重新给与权限之后
    2 再调用获取收货地址 
  3 获取到收货地址之后 需要把它存入到本地存储中
2 页面一打开的时候 判断 
  0 onLoad  onShow (我们要使用 )
  1 判断本地存储中有没有收货地址 如果有  把地址 赋给 data中的数据 
  2 此时 wxml页面就可以根据data中的数据 进行页面标签的显示和隐藏 
3 页面的数据动态渲染
  0 在购物车页面新增购物车商品的时候
    1 新增了数量 和  选中状态 
  1 要渲染收货地址 
  2 渲染购物车数据 
  3 渲染全选 总价格 和 购物总数量
    1 当用户手动的修改了 购买的数量 和 选中的状态 
      1 都会重新修改data中的cart对象，把cart对象重新赋值到本地存储中 
    2 经过分析  每当用户手动修改了  购买的数量 和 选中的状态 
      1 都需要修改data中的cart 和 缓存中的cart 
      2 都需要重新计算 总价格 和 购物总数量
    3 干脆封装一个方法
      1 修改 data和缓存数据
      2 顺便计算总价格。。。 
4 购物车单个商品的选中切换
  1 绑定change事件 给它父元素绑定 checkbox-group 同时传递参数 goods_id
  2 事件的回调
    1 获取要修改的购物车商品的 goods_id
    2 获取data中的cart对象 
    3 进行选中状态的取反  cart[goods_id].checked=!cart[goods_id].checked;
    4 调用封装好的  setCart方法即可 
    5 setCart 做了两件事
      1 根据传入的cart对象 来重新计算 总价格。。。
      2 把cart 设置到data中和缓存中 
5 点击全选的时候 所有的商品选中状态跟着改变
  1 绑定change事件 给它父元素绑定 checkbox-group
  2 获取data中的 isAllCheck属性 
  3 直接给isAllCheck属性 取反 
  4 要让页面的所有的商品 跟随改变
  5 把 修改后的cart又填充回 data和缓存中。。。 
6 修改数量功能
  1 给 + - 按钮绑定同一个事件 同时传递 操作符 +1 还是 -1  还需要传递要操作的商品的id
  2 获取data中的购物车对象cart
  3 根据 操作符 +1 还是 -1 
    cart[id].num+=操作符;
  4 当 当前点击的 -1 按钮 同时 购物车的数量等于 1的时候 
    1 弹窗 确认框 是否要删除
      1 取消 就什么都不做
      2 确定 就执行删除
  5 调用 this.setCart(cart);
7 结算按钮
  1 当拥有了收货地址和购买的商品的时候 直接跳转到 结算页面
  2 否则 主要收货地址和购买的商品 任意一个 不满足要求 都不能跳转 
 */

import regeneratorRuntime from '../../lib/runtime/runtime';
import { getSetting, openSetting, chooseAddress, showModal } from "../../utils/asyncWx";
Page({
  data: {
    address: {},
    cart: {},
    isAllChecked: false,
    totalNum: 0,
    totalPrice: 0,
    hasCart: false
  },
  // 获取收货地址
  async handleChooseAddress() {
    // const scopeAddress=result1.authSetting['scope.address'];

    // 1 获取授权信息
    const res1 = await getSetting();
    const scopeAddress = res1.authSetting['scope.address'];
    // 2 对授权信息判断
    if (scopeAddress === true || scopeAddress === undefined) {
      // 2.1直接调用获取收货地址的api
      // const res2=await chooseAddress();

    } else {
      // 2.2 诱导用户 打开授权页面
      await openSetting();
      // 2.3 获取收货地址
    }
    const address = await chooseAddress();
    // 拼接完整的地址
    address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;
    // 3 把收货地址存入到本地存储中 
    wx.setStorageSync('address', address);

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
  // 设置购物车数据 和 计算 总价格。。
  setCart(cart) {
    // 0 把购物车对象转成 数组 
    let cartArr = Object.values(cart);
    // 1 计算是否都选中了
    // every 会接收一个回调函数 当没有循化项都返回 true的时候 cartArr.every的返回值 才会是true 
    // every 当是空数组调用它的时候 返回值就是true 
    let isAllChecked = cartArr.length ? cartArr.every(v => v.checked) : false;
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

    // 4 购物车总是否 有数据
    let hasCart = cartArr.length > 0 ? true : false;
    this.setData({ cart, isAllChecked, totalPrice, totalNum, hasCart });
    // 防止数据改变了 刷新之后没有效果 所以也顺便存入到缓存中。
    wx.setStorageSync('cart', cart);
  },
  // 购物车选中切换
  handleCartCheck(e) {
    // 1 获取要操作的商品的id
    const { id } = e.currentTarget.dataset;
    //  2 获取data中的购物车对象
    let { cart } = this.data;
    // 3 把该购物车商品的选中状态进行取反
    cart[id].checked = !cart[id].checked;
    // 4 重新把cart的值填充会data和缓存中
    // this.setData({cart});
    // wx.setStorageSync('cart', cart);

    this.setCart(cart);


  },
  // 全选反选功能
  handleAllCheck() {
    // 1 获取data中的 全选属性和 购物车对象
    let { cart, isAllChecked } = this.data;
    // 2 给isAllChecked 取反
    isAllChecked = !isAllChecked;
    // 3 修改购物车总的商品的选中状态
    for (const key in cart) {
      // 对象有些属性是自己 有些是原型链上的！！
      // 当属性是自身的 就可以继续执行
      if (cart.hasOwnProperty(key)) {
        cart[key].checked = isAllChecked;
      }
    }
    // 4 调用setCart即可 
    this.setCart(cart);
  },
  // 购物车数量的编辑功能
  async handleCartNumEdit(e) {
    // 1 获取页面传递过来的参数
    let { id, operation } = e.currentTarget.dataset;
    // 2 获取data中的购物车对象
    let { cart } = this.data;


    // 4 判断正常的修改数量还是 删除判断

    if (operation === -1 && cart[id].num === 1) {
      // 弹窗 提示 是否要删除
      const res = await showModal({ content: "您确定要删除吗？" });
      if (res.confirm) {
        // 删除购物车中的商品  本质删除对象中的一个属性而已！！！
        delete cart[id];
        this.setCart(cart);
      }

    } else {
      // 3 修改要购买的商品的数量
      // operation = +1 或者 = -1
      // 5 让页面跟着发生改变
      cart[id].num += operation;
      this.setCart(cart);
    }

  },
  // 结算按钮的点击事件
  handlePay() {
    // 1 判断有 没有收货地址 和 购买的商品
    // hasCart 只表示 有没有商品 没有表示该商品是否选中 
    let { address, cart } = this.data;
    let cartArr = Object.values(cart);
    // 只要购物车 有一个 商品 被勾选了   这个变量的值 就应该为true
    // some 函数表示 数组中 有一个 返回是 true那么 整个some的返回值 就是true 
    let hasCheckedCart = cartArr.some(v=>v.checked);
    // 
    // 1 判断有没有收货地址
    if (!address.userName) {
      // 没有收货地址
      wx.showToast({
        title: '您还没有选择收货地址',
        icon: 'none',
        mask: true
      });
    } else if (!hasCheckedCart) {
      // 没有 选中要购买的商品 
      wx.showToast({
        title: '您还没有选购商品',
        icon: 'none',
        mask: true
      });
    } else {
      // 都满足条件
      wx.navigateTo({
        url: '/pages/pay/index'
      });
        
    }
  }
})