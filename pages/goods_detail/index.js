/* 
1 点击轮播图 调出 图片预览功能
  1 绑定点击事件  
  2 wx-previewImage()
2 点击 "加入购物车"
  1 绑定点击事件
  2 加入购物车 的存储通过 本地存储实现 
    {
      商品A的id:{商品A的属性-数量},
      商品B的id:{商品B的属性-数量},
    }
  3 第一次点击加入按钮
    1 获取本地存储中的购物车数据 肯定是对象格式   wx.getStorageSync("cart")||{};
    2 判断一下该商品是否已经存在于 购物车数据中，
      1 不存在  
        a）给该商品对象添加一个 数量属性 =1   
        b）把该对象存入到本地存储 
        c）弹出了一个提示框 mask:true 
      1 已经存在了  获取到本地存储中的该商品对象 对数量++ 
        把该对象存入到本地存储  


*/
import { request } from "../../request/index.js";
import { getStorageCart,setStorageCart  } from "../../utils/storage.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
  data: {
    goodsObj: {}
  },
  // 全局变量 商品的完整信息
  GoodsInfo: {},
  onLoad: function (options) {
    // let msg="111-222-333-222";
    // // let newMsg=msg.replace('222','aaa');
    // let newMsg=msg.replace(/222/g,'aaa');
    // console.log(newMsg);


    this.getGoodsDetail(options.goods_id);
  },
  // 获取商品的详情数据
  async getGoodsDetail(goods_id) {
    const res = await request({ url: "/goods/detail", data: { goods_id } });
    this.GoodsInfo = res;
    this.setData({
      // 只存放要用到的数据
      goodsObj: {
        goods_name: res.goods_name,
        goods_price: res.goods_price,
        goods_introduce: res.goods_introduce.replace(/\.webp/g, '.jpg'),
        pics: res.pics
      }
    })
  }
  ,
  // 点击图片 进行大屏预览
  handlePreviewImage(e) {
    const { index } = e.currentTarget.dataset;
    const urls = this.data.goodsObj.pics.map(v => v.pics_big);
    const current = urls[index];
    wx.previewImage({
      current,
      urls
    });

  },
  // 加入购物车
  handleCartAdd() {
    console.count("用户点击的次数");
    // 该变量 要么是一个完整的对象 要么是一个空对象 
    let cart = getStorageCart() || {};

    // 判断要添加的商品 是否已经存在于 购物车对象中 
    if (cart[this.GoodsInfo.goods_id]) {
      // 已经有旧数据了
      cart[this.GoodsInfo.goods_id].num++;
    } else {
      // 第一次新增数据
      cart[this.GoodsInfo.goods_id] = this.GoodsInfo;
      cart[this.GoodsInfo.goods_id].num=1;
      cart[this.GoodsInfo.goods_id].checked=true;
    }

    setStorageCart(cart)
    wx.showToast({
      title: '添加成功',
      icon: 'none',
      // true 用户无法操作页面的按钮 遮罩层 蒙版  
      mask: true
    });

  }

})