var errorInfo = require('../../utils/errorInfo.js');
var constants = require('../../utils/constants.js');
// pages/ble/ble.js



/** 
 * 只需要最简单的配置 傻瓜式使用 只要通过配置文件修改uuid 即可发送自己的数据至设备 √
 * 兼容ios  通过设备name(广播名),去获取deviceId去连接
 * 对当前用户的手机系统进行判断是否支持ble   √
 *   获取系统  及系统版本  √
 *   获取微信版本   √
 * 判断用户手机蓝牙是否打开  √
 * 错误码定义 √
 * 所有可变的配置抽取出来 统一配置参数 √
 * 连接函数需要抽取出来   √
 * 扫描方法抽取 √
 * ble 操作过程中希望所有状态都抽取出来 通过一个函数来分发 而不是在代码中到处修改 √
 * config文件编写 √
 * 希望能对ui有最小的侵入 用户可以定义显示的ui 这边只采用最简单的显示在dialog中 并且只显示了名称 √
 * 如果用户的场景不是手动点击连接 而是代码自动进行连接设备 可以调用_connectBle()传入device即可 √
 * 如果用户的场景不需要扫描 则不调用startScanBle()方法即可 这个方法只是断开当前正在连接的设备 开始扫描附近的外围设备 如果对你的逻辑有侵入 请自行修改 √
 *
 */
Page({
  /**
   * 页面的初始数据
   * bleItem 存放扫描到的设备
   * currentBle 当前设备正在连接的设备 用于连接时断开上一个连接的设备
   * titleText 没有太大作用 仅仅在dialog中显示一个动态的标题
   * systemInfo 系统信息 可以用来判断用户微信版本是否支持ble
   * time 连接超时时间 单位ms  但是我测试了 好像没啥用啊.... 有瑕疵
   */
  data: {
    bleItem: [],
    currentBle: null,
    titleText: "",
    systemInfo: [{
      system: '',
      version: '',
      platform: ''
    }],
    time:5000
  },

  /**
   * 测试发送数据
   */
  resetKey: function() {
    this._write(constants.testData2)
  },

  /**
   * 写入数据至设备 
   * data 16进制数组
   */
  _write: function(data) {
    var _this = this;
    let buffer = new ArrayBuffer(data.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < data.length; i++) {
      dataView.setUint8(i, data[i]) 
    }
    //写数据
    wx.writeBLECharacteristicValue({
      deviceId: _this.data.currentBle,
      serviceId: constants.SERUUID,
      characteristicId:constants.WRITEUUID,
      value: buffer,
      success: function(res) {
        _this._writeListener(true)
      },
      fail: function(res) {
        _this._writeListener(false, errorInfo.getErrorInfo(res.errCode))
      }
    })
  },

  /**
   * 扫描蓝牙  扫描时先断开连接 避免在连接时同时扫描 因为他们都比较消耗性能 容易导致卡顿等不良体验
   */
  startScanBle() {
    // 1.断开连接(如果有连接的话) 2.监听扫描事件 3.开始扫描
    //当前正在连接的设备 当前也可能没有设备连接
    var ble = this.data.currentBle
    if (ble != null) {
      console.log("有设备在连接中")
      //说明当前有设备在连接 需要执行断开操作
      wx.closeBLEConnection({
        deviceId: ble
      })
    } else {
      console.log("没有设备在连接中")
    }
    var _this = this
    //监听寻找到新设备的事件
    wx.onBluetoothDeviceFound(function(devices) {
      var bleDevice = devices.devices[0]
      //获取名称 效验名称
      var deviceName = bleDevice.name;
      //临时保存数据
      var tempObj = [];
      // 过滤 
      console.log(bleDevice.deviceId) //打印扫描到的mac地址
      if (deviceName.toUpperCase().startsWith(constants.CONDITION1) || deviceName.toUpperCase().startsWith(constants.CONDITION2)) {
        //临时保存之前数组中的数据 需要做到新扫描到的蓝牙是追加而不是替换
        tempObj = _this.data.bleItem
        tempObj.push(bleDevice)
        _this.setData({
          bleItem: tempObj
        })
      }
    })
    //扫描附近的外围设备
    wx.startBluetoothDevicesDiscovery({})
  },

  onReady: function() {
    this.Modal = this.selectComponent("#modal")
    var _this = this
    //初始化蓝牙适配器
    wx.openBluetoothAdapter({
      success: function(res) {
        console.log("初始化蓝牙适配器成功")
      },
      fail: function(err) {
        //在用户蓝牙开关未开启或者手机不支持蓝牙功能的情况下，调用 wx.openBluetoothAdapter 会返回错误（errCode=10001），表示手机蓝牙功能不可用
        if (err.errCode == 10001) {
          //此处可以执行你自己的逻辑
          showModal(constants.NOT_BLE)
        }
      }
    })
    //监听蓝牙适配器状态变化事件
    wx.onBluetoothAdapterStateChange(function(res) {
      if (res.discovering) {
        _this._bleStateListener(constants.STATE_SCANNING)
      } else {
        _this._bleStateListener(constants.STATE_SCANNED)
      }
    })
  },

  /**
   * 设备item的点击事件
   */
  bleItemClick(event) {
    //0.隐藏对话框 1.停止扫描 2.开始本次连接 
    this.Modal.hideModal();
    //获取当前item的下标id  通过currentTarget.id
    var id = event.currentTarget.id
    var device = this.data.bleItem[id]
    this._connectBle(device)
  },
  
  /**
   * 连接设备的函数 传入对象device即可 在该函数中连接成功后 就会启动监听特征变化用来获取数据
   */
  _connectBle:function(device){
    //获取到设备的mac地址
    var macAddress = device.deviceId
    console.log('本次连接的蓝牙deviceID为:' + macAddress)
    wx.stopBluetoothDevicesDiscovery({})
    //记录本次连接的设备 当再次扫描时 本次连接就需要断开 因为蓝牙的扫描和连接都需要高消耗 避免两个操作同时进行
    this.setData({
      currentBle: macAddress
    })
    var _this = this;
    //开始本次连接
    this._bleStateListener(constants.STATE_CONNECTING)
    wx.createBLEConnection({
      deviceId: macAddress,
      timeOut: _this.data.time,
      fail: function (err) {
        _this._bleStateListener(constants.STATE_CONNECTING_ERROR)
        //蓝牙已经断开连接了  那么当前连接设备要取消掉
        _this.data.currentBle = null
        console.log('连接失败 下面是连接失败原因')
        console.dir(err)
      }
    })
    //监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
    wx.onBLEConnectionStateChange(function (res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      if (res.connected) {
        _this._bleStateListener(constants.STATE_CONNECTED)
        //启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值
        wx.notifyBLECharacteristicValueChange({
          deviceId: macAddress,
          serviceId: constants.SERUUID,
          characteristicId: constants.NOTIFYUUID,
          state: true,
          success: function (res) {
            _this._bleStateListener(constants.STATE_NOTIFY_SUCCESS)
          },
          fail: function (res) {
            _this._bleStateListener(constants.STATE_NOTIFY_FAIL)
            console.log("开启监听失败 下面是开启监听失败的原因")
            console.dir(res)
          }
        })
        //监听低功耗蓝牙设备的特征值变化。必须先启用 notifyBLECharacteristicValueChange 接口才能接收到设备推送的 notification。
        wx.onBLECharacteristicValueChange(function (res) {
          //转换数据
          let buffer = res.value
          let dataView = new DataView(buffer)
          let dataResult = []
          for (let i = 0; i < dataView.byteLength; i++) {
            dataResult.push(dataView.getUint8(i).toString(16))
          }
          const result = dataResult
          _this._notifyListener(result)
        })
      } else {
        _this._bleStateListener(constants.STATE_DISCONNECTED)
        //蓝牙已经断开连接了  那么当前连接设备要取消掉
        _this.data.currentBle = null
      }
    })
  },

  /**
   * 隐藏弹窗 可以做停止扫描蓝牙的操作
   */
  _cancelEvent: function() {
    //停止搜寻附近的蓝牙外围设备
    wx.stopBluetoothDevicesDiscovery({})
  },

  /**
   * 停止扫描
   */
  _confirmEventFirst: function() {
    //停止搜寻附近的蓝牙外围设备
    wx.stopBluetoothDevicesDiscovery({})
  },

  /**
   * 在页面退出时 销毁蓝牙适配器
   */
  onUnload: function() {
    wx.closeBluetoothAdapter({
      success: function(res) {
        console.log("销毁页面 释放适配器资源")
      }
    })
  },

  /**
   * 获取系统及系统版本及微信版本
   *   iOS 微信客户端 6.5.6 版本开始支持，Android 6.5.7 版本开始支持  ble
   *    Android 8.0.0 -> res.system
   *    6.7.3 -> res.version
   *    android -> res.platform
   */
  onLoad: function() {
    try {
      // 同步获取系统信息 反之有异步 自己根据情况使用
      const res = wx.getSystemInfoSync()
      var tempPlatform = res.platform
      var tempVersion = res.version
      var tempSystem = res.system
      this.setData({
        'systemInfo[0].system': tempSystem,
        'systemInfo[0].version': tempVersion,
        'systemInfo[0].platform': tempPlatform
      })
      //判断用户当前的微信版本是否支持ble
      if (!checkPermission(tempPlatform, tempVersion, tempSystem)) {
        //此处可以执行一些自己的逻辑
        showModal(constants.NOT_PERMISSION)
      } 
    } catch (e) {
      // Do something when catch error
    }
  },
  
  /**
   * 发送数据结果 true or false
   *  如果为false msg是失败原因
   */
  _writeListener: function(result, msg) {
    //此处可以执行自己的逻辑 比如一些提示
    console.log(result ? '发送数据成功' : msg)
  },

  /**
   * 接收数据
   */
  _notifyListener: function(data) {
    console.log('接收到数据')
    console.dir(data)
  },

  /**
   * ble状态监听
   */
  _bleStateListener: function(state) {
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
    }
  },

  /**
   * 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。
   */
  getDevice:function(){
    wx.getBluetoothDevices({
      success: (devices)=> {
        console.dir(devices)
      },
    })
  }
})

/**
 * 判断微信客户端是否支持使用蓝牙API
 */
function checkPermission(platform, version, tempSystem) {
  if (platform === 'android') {
    //android 4.3才开始支持ble Android 8.0.0
    var systemVersion = tempSystem.substring(8, tempSystem.length)
    if (systemVersion >= '4.3.0') {
      return version >= '6.5.7' ? true : false
    } else {
      return false
    }
  } else if (platform === 'ios') {
    return version >= '6.5.6' ? true : false
  } else {
    return false
  }
}

/**
 * 对一些告警信息弹窗显示
 */
function showModal(content){
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