import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
import { wxLogin } from "../../utils/asyncWx";

/* 
1 点击授权按钮
  1 获取用户信息 调用小程序 内置   getUserInfo
     要获取 signature iv rawData encryptedData 4个参数
  2 执行微信小程序登录 wx.login 返回
    code 属性
2 根据以上数据 调用第三方的登录  /v1/users/wxlogin  POST请求
  1 成功之后 返回 用户的token - 令牌 身份证。。 
  2 把token存入到本地存储中 方便在其他页面使用 
3 重新跳回到上一个页面
 */
Page({
  // 1 获取用户信息
  async getUserInfo(e) {
    // 1.1 获取用户的 signature iv rawData encryptedData 
    const { signature, iv, rawData, encryptedData } = e.detail;
    // 1.2 执行小程序的登录    
    const { code } = await wxLogin();
    let postParams = { signature, iv, rawData, encryptedData, code };
    // 2 发送请求到 第三方的服务器 来获取真正的token
    const { token } = await request({ url: "/users/wxlogin", data: postParams, method: "post" });
    // 2.2 存入token
    wx.setStorageSync('token', token);

    // 3 跳转到上一个页面
    wx.navigateBack({
      //  delta 上几个页面
      delta: 1
    });




  }
})