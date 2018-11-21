/**
 *  match config
 *  过滤蓝牙名称 如果你不需要可以改下代码 如果需要获取更多的名称也要改下代码 就一个if没什么难度 过滤方法是startsWith
 *  我这里测试用了两个条件 代表我只要设备名称开头是TL 或TK的设备才能显示出来 只支持大写 因为在过滤中我将设备名称转为大写后再对比的
 *var serUUID = 'f000c0e0-0451-4000-b000-000000000000'
  var notifyUUID = 'f000c0e1-0451-4000-b000-000000000000'
  var writeUUID = 'f000c0e1-0451-4000-b000-000000000000'

  jianhua
    'SERUUID': 'F000C0E0-0451-4000-B000-000000000000',
  'NOTIFYUUID': 'F000C0E1-0451-4000-B000-000000000000',
  'WRITEUUID': 'F000C0E2-0451-4000-B000-000000000000',
 *  
 */
module.exports = {
  // string config
  'NOT_BLE': '您的蓝牙未打开 请打开你的蓝牙后再进入该页面操作',
  'NOT_PERMISSION': '嘤嘤嘤 您的系统版本或微信版本过低 不支持蓝牙的使用',
  'SCANING': '设备扫描中...',
  'SCANED': '已停止扫描',
  'ALARM_TITLE': '告警提示',
  // uuid config
  'SERUUID': '00001802-0000-1000-8000-00805F9B34FB',
  'NOTIFYUUID': '00002A19-0000-1000-8000-00805F9B34FB',
  'WRITEUUID': '00002A06-0000-1000-8000-00805F9B34FB',
  //test data config
  'testData1': [0x01, 0x00, 0xff],
  'testData2': [0x55, 0xDD, 0x4A, 0x55, 0xDD, 0xFC, 0xA1, 0x59, 0xBD, 0x4B, 0x4B, 0x4B, 0x4B, 0x4B, 0x4B, 0x4B, 0x4B, 0x4B, 0x4A, 0x3D],
  // var config
  'STATE_DISCONNECTED': 0,
  'STATE_SCANNING': 1,
  'STATE_SCANNED': 2,
  'STATE_CONNECTING': 3,
  'STATE_CONNECTED': 4,
  'STATE_CONNECTING_ERROR': 6,
  'STATE_NOTIFY_SUCCESS': 7,
  'STATE_NOTIFY_FAIL': 8,
  // match config
  'CONDITION1': 'TK',
  'CONDITION2': 'HO'
}