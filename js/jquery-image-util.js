/*!
 * jquery-image-util v1.0 (https://github.com/honguangli/jquery-image-util)
 * Copyright honguangli
 * Licensed under the MIT license
 */
(function($) {
  "use strict";
  /*!
   * 参数：
   * @$elem object 图片列表父节点
   * #expr string 选择器
   * @$window object 弹窗展示层，默认为window.top
   * @deep bool 深度遍历
   * 调用方法：
   *  $.startImageViewer($('#activity-small-image'));
   *  $.startImageViewer($('#activity-small-image'), 'img');
   *  $.startImageViewer($('#activity-small-image'), 'img', parent);
   *  $.startImageViewer($('#activity-small-image'), 'img', parent, true);
   */
  $.startImageViewer = function($elem, expr, $window, deep) {
    if (undefined === $window) {
      $window = window.top;
    }
    if (undefined === expr) {
      expr = 'img'
    }
    if (!deep) {
      $elem.children(expr).css('cursor', 'pointer');
    } else {
      $elem.find(expr).css('cursor', 'pointer');
    }
    $elem.on('click', expr, function() {
      const attrName = 'data-image-viewer-active';
      $(this).attr(attrName, 'on');
      const clickSrc = $(this).attr('src');
      let clickIndex = $(this).index();
      const images = [];
      if (!deep) {
        $elem.children(expr).css('cursor', 'pointer');
        $elem.children(expr).each(function(index, item) {
          images.push({
            src: $(item).attr('src'),
          });
        });
      } else {
        $elem.find(expr).css('cursor', 'pointer');
        $elem.find(expr).each(function(index, item) {
          images.push({
            src: $(item).attr('src'),
          });
          if ($(this).attr(attrName) === 'on') {
            clickIndex = index;
          };
        });
      }
      $(this).removeAttr(attrName);
      $window.$.openImagesViewer(images, clickIndex);
    })
  };

  // 利用viewer组件实现图片预览
  $.openImagesViewer = function(images, index, options) {
    if ($('.image-viewer-box').length === 0) {
      $('body').append('<div class="image-viewer-box"></div>');
    }
    const $box = $('.image-viewer-box');

    let html = [];
    html.push('<ul class="images" style="display: none;">');
    for (let i = 0; i < images.length; i++) {
      html.push('<li><img src="' + images[i].src + '"></li>');
    }
    html.push('</ul>');
    $box.html(html.join(''));

    const zIndex = 99999999;
    const viewerDefaultOpt = {
      container: '.image-viewer-box',
      zIndex: zIndex,
      title: false,
      toolbar: {
        'zoom-in': true,
        'zoom-out': true,
        'one-to-one': true,
        'reset': true,
        'prev': true,
        'play': false,
        'next': true,
        'rotate-left': true,
        'rotate-right': true,
        'flip-horizontal': true,
        'flip-vertical': true,
      }
    };

    const $images = $('.image-viewer-box .images');
    $images.viewer($.extend(true, viewerDefaultOpt, options));
    $images.find('img').eq(index).click();
  };

  // 图片上传样式组件
  const UploadWait = 0; // 等待上传
  const Uploading = 1; // 正在上传
  const UploadFinish = 2; // 已上传
  const UploadFailure = 500; // 上传失败
  const UploadSuccess = 200; // 上传成功

  let autoOid = 0;

  function ImageUpload(element, option) {
    const defaults = {
      mode: 0,             // 模式，0-自动上传，1-手动批量上传，2-手动批量+单独上传
      oid: null,           // 组件自增id
      rid: null,           // 组件自定义id
      size: 0,             // 允许图片最大数量，小于等于0时不限制
      images: [],          // 图片数据集合
      autoImageId: 0,      // 图片自增id
      data: [],            // 预设图片数据，["http://a.com/a.jpg", "http://b.cn/b.png"]
      preview: false,      // 是否启动图片预览插件
      uploadFun: null,     // 上传回调，选中图片上传时触发的回调方法
      deleteFun: null,     // 删除回调，删除已上传图片时触发的回调方法
      msgFun: null,        // 提示回调，插件执行过程中出现的提示回调方法
    };
    const self = this;
    self.options = $.extend(false, defaults, option);
    self.element = element;
    if (!$.isFunction(self.options.uploadFun)) {
      self.msg('upload function is necessary');
      return
    }
    if (!$.isFunction(self.options.deleteFun)) {
      self.msg('delete function is necessary');
      return
    }
    self.options.oid = autoOid++;
    if (null == self.options.rid) {
      self.options.rid = self.options.oid;
    }
    self.options.images = [];
    for (let i = 0, len = self.options.data.length; i < len; i++) {
      const img = self.options.data[i];
      self.options.images.push(createImageObj(self.options.autoImageId++, img, UploadFinish))
    }
    self.start();
    if (self.options.preview) {
      $.startImageViewer(self.element, '.upload-image', window.top, true);
    }
  }

  ImageUpload.prototype = {
    start: function() {
      const self = this;
      const $elem = self.element;
      $elem.attr('data-oid', self.options.oid);
      const html = [];
      html.push('<div class="upload-images-control">');
      html.push(
        '<a href="javascript:void(0);" class="select-a" title="选择图片">选择图片<input type="file" title="选择图片"></a>');
      html.push(
        '<a href="javascript:void(0);" class="eye-a" data-show="true" title="隐藏"><i class="fa fa-eye"></i></a>'
      );
      switch (self.options.mode) {
        case 1:
        case 2:
          html.push(
            '<a href="javascript:void(0);" class="upload-multi-a" title="批量上传"><i class="fa fa-upload"></i></a>'
          );
          break;
        default:
      }
      html.push('</div>');
      html.push('<div class="upload-images">');
      for (let i = 0, len = self.options.images.length; i < len; i++) {
        const imageObj = self.options.images[i];
        html.push('<div class="upload-image-item" data-id="' + imageObj.id + '">');
        html.push('<img class="upload-image" src="' + imageObj.src + '">');
        html.push('<div class="upload-image-indicator">');
        html.push('<p class="' + formatImageStatusClass(imageObj.status) + '"><i class="fa fa-circle"></i> ' +
          formatImageStatus(imageObj.status) + '</p>');
        html.push('</div>');
        html.push('<div class="upload-image-control">');
        html.push('<a href="javascript:void(0);" class="delete-a" title="删除图片"><i class="fa fa-trash"></i></a>');
        html.push('</div>');
        html.push('</div>');
      }
      html.push('</div>');
      $elem.append(html.join(''));
      $elem.on('click', '.select-a input[type="file"]', function() {
        if (self.options.size > 0 && self.options.size <= self.options.images.length) {
          self.msg('最多可选择' + self.options.size + '张图片');
          $(this).val('');
          return false
        }
      }).on('change', '.select-a input[type="file"]', function() {
        if (self.options.size > 0 && self.options.size <= self.options.images.length) {
          self.msg('最多可选择' + self.options.size + '张图片');
          $(this).val('');
          return false
        }

        const filePath = $(this).val(); //获取到input的value，里面是文件的路径
        const fileFormat = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
        const src = window.URL.createObjectURL(this.files[0]); //转成可以在本地预览的格式

        if (!fileFormat.match(/.png|.jpg|.jpeg|.gif/)) {
          self.msg('图片格式错误，图片格式必须为：png/jpg/jpeg/gif');
          $(this).val('');
          return false
        }

        const imageObj = createImageObj(self.options.autoImageId++, '', UploadWait, filePath, src, this.files[0]);
        appendItem($elem, self.options.oid, self.options.mode, imageObj);
        self.options.images.push(imageObj);

        switch (self.options.mode) {
          case 1:
          case 2:
            break;
          default:
            if ($.isFunction(self.options.uploadFun)) {
              imageObj.status = Uploading;
              renderItem($elem, self.options.oid, self.options.mode, imageObj);
              self.options.uploadFun(self.options.rid, imageObj.id, imageObj.originData);
            } else {
              self.msg('upload function is necessary');
            }
        }
      }).on('click', '.eye-a', function() {
        if ($(this).attr('data-show') === 'true') {
          $(this).attr('data-show', 'false');
          $(this).html('<i class="fa fa-eye-slash"></i>');
          $elem.children('.upload-images').css('display', 'none');
        } else {
          $(this).attr('data-show', 'true');
          $(this).html('<i class="fa fa-eye"></i>');
          $elem.children('.upload-images').css('display', 'flex');
        }
      }).on('click', '.upload-multi-a', function() {
        self.upload();
      }).on('click', '.upload-a', function() {
        const item = $(this).closest('.upload-image-item');
        const id = parseInt($(item).attr('data-id'));
        for (let i = 0, len = self.options.images.length; i < len; i++) {
          const imageObj = self.options.images[i];
          if (imageObj.id !== id) {
            continue
          }
          if (imageObj.status !== UploadWait && imageObj.status !== UploadFailure) {
            break
          }
          if ($.isFunction(self.options.uploadFun)) {
            imageObj.status = Uploading;
            renderItem($elem, self.options.oid, self.options.mode, imageObj);
            self.options.uploadFun(self.options.rid, imageObj.id, imageObj.originData);
          } else {
            self.msg('upload function is necessary');
          }
          break;
        }
      }).on('click', '.delete-a', function() {
        const item = $(this).closest('.upload-image-item');
        const id = parseInt($(item).attr('data-id'));
        for (let i = 0, len = self.options.images.length; i < len; i++) {
          const imageObj = self.options.images[i];
          if (imageObj.id !== id) {
            continue
          }
          self.options.images.splice(i, 1);
          break;
        }
        item.remove();
        if ($.isFunction(self.options.deleteFun)) {
          self.options.deleteFun(self.options.rid, self.val());
        } else {
          self.msg('delete function is necessary');
        }
      });
    },
    // 更新状态
    update: function(option) {
      const defaults = {
        id: -1,
        status: false,
        src: '',
      };
      option = $.extend(false, defaults, option);
      const self = this;
      const $elem = self.element;
      for (let i = 0, len = self.options.images.length; i < len; i++) {
        const imageObj = self.options.images[i];
        if (imageObj.id !== option.id) {
          continue
        }
        if (!option.status) {
          imageObj.status = UploadFailure;
        } else {
          imageObj.status = UploadSuccess;
          imageObj.originSrc = '';
          imageObj.originData = null;
        }
        imageObj.src = option.src;
        renderItem($elem, self.options.oid, self.options.mode, imageObj);
        break;
      }
    },
    // 批量上传
    upload: function() {
      const self = this;
      const $elem = self.element;
      const len = self.options.images.length;
      if (len === 0) {
        self.msg('请先选择图片');
        return
      }
      let wait = 0;
      let doing = 0;
      for (let i = 0; i < len; i++) {
        const imageObj = self.options.images[i];
        switch (imageObj.status) {
          case UploadWait:
          case UploadFailure:
            wait++;
            break
          case Uploading:
            doing++;
          case UploadFinish:
          case UploadSuccess:
          default:
            continue
        }
        if ($.isFunction(self.options.uploadFun)) {
          imageObj.status = Uploading;
          renderItem($elem, self.options.oid, self.options.mode, imageObj);
          self.options.uploadFun(self.options.rid, imageObj.id, imageObj.originData);
        } else {
          self.msg('upload function is necessary');
          return
        }
      }
      if (wait === 0 && doing === 0) {
        self.msg('已全部上传完成');
      } else if (doing > 0) {
        self.msg('图片正在上传');
      }
    },
    // 清除所有图片
    clear: function() {
      const self = this;
      const $elem = self.element;
      self.options.images = [];
      $elem.children('.upload-images').html('');
    },
    // 添加图片
    push: function(images) {
      const self = this;
      const $elem = self.element;
      for (let i = 0, len = images.length; i < len; i++) {
        const src = images[i];
        const imageObj = createImageObj(self.options.autoImageId++, src, UploadFinish);
        pushItem($elem, self.options.oid, self.options.mode, imageObj);
        self.options.images.push(imageObj);
      }
    },
    // 输出数据
    val: function() {
      const self = this;
      const l = [];
      for (let i = 0, len = self.options.images.length; i < len; i++) {
        if (self.options.images[i].status === UploadFinish ||
          self.options.images[i].status === UploadSuccess) {
          l.push(self.options.images[i].src);
        }
      }
      return l;
    },
    // 输出日志
    msg: function(msg) {
      const self = this;
      if ($.isFunction(self.options.msgFun)) {
        self.options.msgFun(self.options.rid, msg);
      } else {
        console.log("image-upload-msg", self.options.rid, msg);
      }
    }
  };

  function formatImageStatus(status) {
    switch (status) {
      case UploadWait:
        return '等待上传';
      case Uploading:
        return '正在上传';
      case UploadFinish:
        return '已上传';
      case UploadFailure:
        return '上传失败';
      case UploadSuccess:
        return '上传成功';
      default:
        return '状态异常';
    }
  }

  function formatImageStatusClass(status) {
    switch (status) {
      case UploadWait:
        return 'upload-default';
      case Uploading:
        return 'upload-doing';
      case UploadFinish:
        return 'upload-finish';
      case UploadFailure:
        return 'upload-failure';
      case UploadSuccess:
        return 'upload-success';
      default:
        return 'upload-warning';
    }
  }
  
  function createImageObj(id, src, status, name, originSrc, originData) {
    const self = this;
    if (undefined === name) name = '';
    if (undefined === originSrc) originSrc = '';
    if (undefined === originData) originData = null;
    return {
      "id": id, // 图片id，同一上传组件内图片id唯一
      "name": name, // 图片文件名
      "originSrc": originSrc, // 图片预览地址
      "originData": originData, // 图片数据
      "src": src, // 图片上传后返回地址
      "status": status, // 图片状态，0-等待上传，1-正在上传，2-上传失败，3-上传成功
    }
  }
  
  function pushItem($elem, oid, mode, imageObj) {
    const html = [];
    html.push('<div class="upload-image-item" id="upload-image-item-' + oid + '-' + imageObj.id + '" data-id="' + imageObj.id + '">');
    html.push('<img class="upload-image" src="' + imageObj.src + '">');
    html.push('<div class="upload-image-indicator">');
    html.push('<p class="' + formatImageStatusClass(imageObj.status) + '"><i class="fa fa-circle"></i> ' +
      formatImageStatus(imageObj.status) + '</p>');
    html.push('</div>');
    html.push('<div class="upload-image-control">');
    html.push('<a href="javascript:void(0);" class="delete-a" title="删除"><i class="fa fa-trash"></i></a>');
    html.push('</div>');
    html.push('</div>');
    $elem.children('.upload-images').append(html.join(''));
  }

  function appendItem($elem, oid, mode, imageObj) {
    const html = [];
    html.push('<div class="upload-image-item" id="upload-image-item-' + oid + '-' + imageObj.id + '" data-id="' + imageObj.id + '">');
    html.push('<img class="upload-image" src="' + imageObj.originSrc + '">');
    html.push('<div class="upload-image-indicator">');
    html.push('<p class="' + formatImageStatusClass(imageObj.status) + '"><i class="fa fa-circle"></i> ' +
      formatImageStatus(imageObj.status) + '</p>');
    html.push('</div>');
    html.push('<div class="upload-image-control">');
    switch (mode) {
      case 1:
        break;
      case 2:
        html.push('<a href="javascript:void(0);" class="upload-a" title="上传"><i class="fa fa-upload"></i></a>');
        break;
      default:
    }
    html.push('<a href="javascript:void(0);" class="delete-a" title="删除"><i class="fa fa-trash"></i></a>');
    html.push('</div>');
    html.push('</div>');
    $elem.children('.upload-images').append(html.join(''));
  }

  function renderItem($elem, oid, mode, imageObj) {
    const $item = $('#upload-image-item-' + oid + '-' + imageObj.id);
    if ($item.length === 0) {
      return
    }
    $item.find('.upload-image-indicator').html('<p class="' + formatImageStatusClass(imageObj.status) +
      '"><i class="fa fa-circle"></i> ' + formatImageStatus(imageObj.status) + '</p>');
    switch (imageObj.status) {
      case UploadSuccess:
        $item.children('.upload-image').attr('src', imageObj.src);
        $item.children('.upload-image-control').html(
          '<a href="javascript:void(0);" class="delete-a" title="删除"><i class="fa fa-trash"></i></a>');
        break;
      case UploadFailure:
        $item.children('.upload-image-control').html(
          '<a href="javascript:void(0);" class="upload-a" title="重新上传"><i class="fa fa-upload"></i></a>' +
          '<a href="javascript:void(0);" class="delete-a" title="删除"><i class="fa fa-trash"></i></a>');
        break;
      default:
        $item.children('.upload-image-control').html(
          '<a href="javascript:void(0);" class="delete-a" title="删除"><i class="fa fa-trash"></i></a>');
    }
  }

  $.fn.imageUpload = function(option) {
    const args = arguments;
    return this.each(function() {
      const self = $(this);
      let data = self.data('imageUpload');
      if (!data) {
        data = new ImageUpload(self, option);
        self.data('imageUpload', data)
      }
      if (typeof option === 'string') {
        data[option].apply(data, Array.prototype.slice.call(args, 1));
      }
    })
  };
})($);
