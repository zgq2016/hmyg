// 1 引入自己写异步请求的方法 promise
// 2 在微信小程序中引入 js文件的时候 建议 一定要把路径补充完整
import { request } from "../../request/index.js";

Page({
  data: {
    // 1 轮播图数组
    swiperList: [],
    // 2 分类导航数组
    navCateList: [],
    // 3 楼层数组
    floorList: []
  },
  onLoad() {
    this.getSwiperList();
    this.getNavCateList();
    this.getFloorList();
  },

  // 获取轮播图数据
  getSwiperList() {
    request({ url: '/home/swiperdata' })
      .then(result => {
        this.setData({
          swiperList: result
        })
      })
  },
  // 获取分类导航数据
  getNavCateList() {
    request({ url: '/home/catitems' })
      .then(result => {
        this.setData({
          navCateList: result
        })
      })
  },
  // 获取 楼层数据
  getFloorList() {
    request({ url: '/home/floordata' })
      .then(result => {
        this.setData({
          floorList: result
        })
      })

  }
})