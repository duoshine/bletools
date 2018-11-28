var bletools = require('../../utils/bletools.js');
var constants = require('../../utils/constants.js');
// pages/ble/ble.js

Page({
  /**
   * 页面的初始数据  由于是变量配置在config中不方便更新ui 所以只能放在data中了 导致有一些侵入了 非我的本意 有瑕疵... 其余常量配置在constants.js中了
   * bleItem 存放扫描到的设备
   * titleText 没有太大作用 仅仅在dialog中显示一个动态的标题
   */
  data: {
    bleItem: [],
    titleText: ""
  },

  /**
   * 发送数据
   */
  resetKey: function() {
   bletools.write(constants.testData1)
  },

  /**
   * 扫描蓝牙 
   */
  startScanBle() {
    var tempArray = []
    bletools.startScanBle({
      success:device => {
        tempArray = this.data.bleItem
        tempArray.push(device)
        this.setData({
          bleItem: tempArray
        })
      }
    })
  },

  /**
   * 设备item的点击事件
   */
  bleItemClick(event) {
    this.Modal.hideModal();
    //获取当前item的下标id  通过currentTarget.id
    var id = event.currentTarget.id
    var device = this.data.bleItem[id]
    bletools.connectBle(device)
  },

  /**
   * 隐藏弹窗 可以做停止扫描蓝牙的操作
   */
  _cancelEvent: function() {
    bletools.stopBluetoothDevicesDiscovery()
  },

  /**
   * 停止扫描
   */
  _confirmEventFirst: function() {
    bletools.stopBluetoothDevicesDiscovery()
  },


  /**
   * 在页面退出时 销毁蓝牙适配器
   */
  onUnload: function() {
    bletools.clear();
  },

  
  onLoad: function() {
    //这个是我显示设备的dialog  用户如果不用dialog的话 不用写
    this.Modal = this.selectComponent("#modal")
    bletools.initBle(this)
  },

  /**
   * 发送数据结果 true or false
   * 如果为false msg是失败原因
   */
  writeListener: function(result, msg) {
    //此处可以执行自己的逻辑 比如一些提示
    console.log(result ? '发送数据成功' : msg)
  },

  /**
   * 接收数据 
   */
  notifyListener: function(data) {
    console.log('接收到数据')
    console.dir(data)
  },

  /**
   * ble状态监听
   */
  bleStateListener: function(state) {
    switch (state) {
      case constants.STATE_DISCONNECTED: //设备连接断开
        console.log('设备连接断开')
        break;
      case constants.STATE_SCANNING: //设备正在扫描
        this.setData({
          titleText: constants.SCANING
        })
        this.Modal.showModal();
        console.log('设备正在扫描')
        break;
      case constants.STATE_SCANNED: //设备扫描结束
        console.log('设备扫描结束')
        //改下ui显示
        this.setData({
          titleText: constants.SCANED
        })
        break;
      case constants.STATE_CONNECTING: //设备正在连接
        console.log('设备正在连接')
        break;
      case constants.STATE_CONNECTED: //设备连接成功
        console.log('设备连接成功')
        break;
      case constants.STATE_CONNECTING_ERROR: //连接失败
        console.log('连接失败')
        break;
      case constants.STATE_NOTIFY_SUCCESS: //开启notify成功
        console.log('开启notify成功')
        break;
      case constants.STATE_NOTIFY_FAIL: //开启notify失败
        console.log('开启notify失败')
        break;
      case constants.STATE_CLOSE_BLE: //蓝牙未打开 关闭状态
        showModal(constants.NOT_BLE)
        break;
      case constants.STATE_NOTBLE_WCHAT_VERSION: //微信版本过低 不支持ble
       showModal(constants.NOT_PERMISSION2)
        break;
      case constants.STATE_NOTBLE_SYSTEM_VERSION: //系统版本过低 不支持ble
       showModal(constants.NOT_PERMISSION1)
        break;
    }
  },
})

/**
 * 对一些告警信息弹窗显示
 */
function showModal(content) {
  wx.showModal({
    title: constants.ALARM_TITLE,
    content: content,
    showCancel: false,
    success(res) {
      if (res.confirm) {
        //回到上一页面
        wx.navigateBack({
          delta: 1
        })
      }
    }
  })
}
