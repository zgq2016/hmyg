import { request } from "../../request/index.js";
import { getStorageCates, setStorageCates } from "../../utils/storage.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
/* 
1 页面的初次动态渲染
2 点击左侧菜单 菜单切换选中 同时 右侧的商品内容 切换显示 
  1 绑定点击事件
  2 左侧菜单的激活 在data中的 currentIndex
  3 右侧商品内容 跟着改变
3 切商品内容的时候 需要让右侧的容器的滚动条重新回到顶部吧
  设置滚动条的距离！！！
  1 以前的dom 可以直接操作 滚动条的属性 dom.scrollTop=0 
  2 scroll-view标签的 scrollTop 属性
  3 右侧内容切换的时候 再手动给它赋值即可 
4 使用小程序的本地存储技术（h5的本地存储 localStorage） 来添加缓存效果 
  0 复习一下 h5的本地存储的技术 
  1 web中的本地存储和小程序中的本地存储的使用区别 
  2 实现缓存的需求
    1 发送请求之前 先判断有没有缓存数据  
      1 假设存入存储中的对象 key='cates'   {time:Date.now(),data:接口的返回值 []}
    2 没有缓存数据 直接发送新请求 获取数据 同时吧新的输入存入到本地存储中  
    3 有缓存数据 并且数据 没有过期 我们自己定一个过期时间 ！！！！
      此时再使用 缓存数据 
 */
Page({
  data: {
    // 左侧的菜单数组
    leftMenuList: [],
    // 右侧 商品内容数组
    rightGoodsList: [],
    // 选中的菜单
    currentIndex: 0,
    // 右侧滚动条的距离
    scrollTop: 0
  },
  // 接口的返回值
  // 如果 这些数据不需要在页面中渲染，那么就没有必要放到data中
  // 因为 小程序中会对data的数据 进行传输 传输到视图层也就是 wxml中 
  Cates: [],
  onLoad() {
    // 1 发送请求之前 先判断 本地存储中有没有旧的数据
    // 默认值 空字符串 null  bool  都是false 
    let cates = getStorageCates();
    if (!cates) {
      // 没有数据 
      this.getCategoryList();
    } else {
      // 有数据  判断一下时间是否过期！！！ 
      // Date.now() 单位是毫秒   暂时定20s的过期时间！！！
      if (Date.now() - cates.time > 1000 * 20) {
        // 获取过期  重新发送请求来获取 
        this.getCategoryList();
      } else {
        // 数据没有过期 可以直接使用
        this.Cates = cates.data;
        let leftMenuList = this.Cates.map((v, i) => ({ cat_name: v.cat_name, cat_id: v.cat_id }));
        let rightGoodsList = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightGoodsList
        })
      }
    }

  },
  // 获取分类数据
  async getCategoryList() {
    const result = await request({ url: "/categories" });
    // 给全局参数 赋值
    this.Cates = result;
    // 把接口的数据存入到本地存储中 
    setStorageCates({ time: Date.now(), data: this.Cates });
    // map 返回新数组  
    let leftMenuList = this.Cates.map((v, i) => ({ cat_name: v.cat_name, cat_id: v.cat_id }));
    // 这个是大家电对象 里面的children 数组 
    let rightGoodsList = this.Cates[0].children;
    this.setData({
      leftMenuList,
      rightGoodsList
    })
  },
  // 左侧菜单的点击事件
  handleMenuChange(e) {
    const { index } = e.currentTarget.dataset;
    // 实现菜单的激活选中
    let rightGoodsList = this.Cates[index].children;
    this.setData({
      currentIndex: index,
      rightGoodsList,
      scrollTop: 0
    })
  }
})