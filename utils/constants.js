/**
 *  match config
 *  过滤蓝牙名称 如果你不需要可以改下代码 如果需要获取更多的名称也要改下代码 就一个if没什么难度 过滤方法是startsWith
 *  我这里测试用了两个条件 代表我只要设备名称开头是TL 或TK的设备才能显示出来 只支持大写 因为在过滤中我将设备名称转为大写后再对比的
 *  如果需要根据服务UUID过滤可以考虑改一下我的代码 只需要在扫描中添加一些参数就可以了 这个比较简单了
 * 
 *  CONNECTTIME 连接超时时间 单位ms  但是我测试了 好像没啥用啊.... 有瑕疵
 *  SCANTIME  扫描超时时间 单位ms 默认5秒
 *  
 */
module.exports = {
  // string config
  'NOT_BLE': '嘤嘤嘤 您的蓝牙未打开 请打开你的蓝牙后再进入该页面操作',
  'NOT_PERMISSION1': '嘤嘤嘤 您的系统版本过低 不支持蓝牙的使用',
  'NOT_PERMISSION2': '嘤嘤嘤 您的微信版本过低 不支持蓝牙的使用',
  'SCANING': '设备扫描中...',
  'SCANED': '已停止扫描',
  'ALARM_TITLE': '告警提示',
  // uuid config
  'SERUUID': '0000C000-0000-0000-B000-000000000000',
  'NOTIFYUUID': '0000C000-0000-0000-B000-000000000000',
  'WRITEUUID': '0000C000-0000-0000-B000-000000000000',
  //test data config
  'testData1': [0x01, 0x00, 0xff],
  // var config
  'STATE_DISCONNECTED': 0,
  'STATE_SCANNING': 1,
  'STATE_SCANNED': 2,
  'STATE_CONNECTING': 3,
  'STATE_CONNECTED': 4,
  'STATE_CONNECTING_ERROR': 6,
  'STATE_NOTIFY_SUCCESS': 7,
  'STATE_NOTIFY_FAIL': 8,
  'STATE_CLOSE_BLE': 9,
  'STATE_NOTBLE_SYSTEM_VERSION': 10,
  'STATE_NOTBLE_WCHAT_VERSION': 11,
  'STATE_INIT_SUCCESS': 12,
  // match config
  'CONDITION1': 'TK',
  'CONDITION2': 'HO',
  // scan connect config  unit:ms
  'CONNECTTIME': 5000,
  'SCANTIME': 5000,
}



