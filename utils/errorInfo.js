/**
 *错误码定义
 */
function getErrorInfo(code){
  var errorInfo = ''
  switch (code){
    case 0:
      errorInfo = '正常'
      break;
    case 10000:
      errorInfo = '未初始化蓝牙适配器'
      break;
    case 10001:
      errorInfo = '当前蓝牙适配器不可用 未初始化蓝牙适配器？ 或是你的手机蓝牙处于关闭状态'
      break;
    case 10002:
      errorInfo = '没有找到指定设备'
      break;
    case 10003:
      errorInfo = '连接失败'
      break;
    case 10004:
      errorInfo = '没有找到指定服务'
      break;
    case 10005:
      errorInfo = '没有找到指定特征值'
      break;
    case 10006:
      errorInfo = '当前连接已断开'
      break;
    case 10007:
      errorInfo = '当前特征值不支持此操作'
      break;
    case 10008:
      errorInfo = '其余所有系统上报的异常'
      break;
    case 10009:
      errorInfo = 'Android 系统特有，系统版本低于 4.3 不支持 BLE'
      break;
      default:
      errorInfo = '其他错误 可能本方法定义的错误码已更新不上官方的错误码 也可能是未知错误'
      break;
  }
  return errorInfo
}



module.exports = {
  getErrorInfo: getErrorInfo
}