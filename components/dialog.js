// dialog/dialog.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '这里是默认标题'
    },

    cancelText: {
      type: String,
      value: '取消'
    },

    confirmText: {
      type: String,
      value: '确定'
    },

    backdrop: {
      type: Boolean,
      value: true
    },

    animated: {
      type: Boolean,
      value: true
    },

    //模态框大小(sm md)
    modalSize: {
      type: String,
      value: "md"
    },

    //动画时间(默认300)
    animationOption: {
      type: Object,
      value: {
        duration: 300
      }
    },


  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    animation: ''
  },


  ready: function () {
    this.animation = wx.createAnimation({
      duration: this.data.animationOption.duration,
      timingFunction: "linear",
      delay: 0
    });
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //modal隐藏
    hideModal: function (e) {
      if (e) {
        let type = e.currentTarget.dataset.type;
        if (type == 'mask' && !this.data.backdrop) {
          return;
        }
      }
      if (this.data.isShow) this._toggleModal();
    },

    //modal显示
    showModal: function () {
      if (!this.data.isShow) {
        this._toggleModal();
      }
    },

    //切换modal的显示还是隐藏
    _toggleModal: function () {
      if (!this.data.animated) {
        this.setData({
          isShow: !this.data.isShow
        })
      }
      else {
        let isShow = !this.data.isShow;
        this._executeAnimation(isShow);
      }


    },

    //根据需求执行动画
    _executeAnimation: function (isShow) {

      let animation = this.animation;
      if (isShow) {

        animation.opacity(0).step();

        this.setData({
          animationData: animation.export(),
          isShow: true
        })

        setTimeout(function () {
          animation.opacity(1).step()
          this.setData({
            animationData: animation.export()
          })
        }.bind(this), 50)
      }
      else {
        animation.opacity(0).step()
        this.setData({
          animationData: animation.export()
        })

        setTimeout(function () {
          this.setData({
            isShow: isShow
          })
        }.bind(this), this.data.animationOption.duration)

      }


    },
    //取消事件 向外部page 发送事件通知
    _cancelModal: function () {
      this.hideModal();
      this.triggerEvent("cancelEvent");
    },

    //确认事件
    _confirmModal: function () {
      this.triggerEvent("confirmEvent");
    }
  }
})

