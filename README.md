# jquery-image-util
jquery-image-util is a image preview, upload utils depend on jquery

## Basic Usages
```
<div id="image-preview">
  <img src="img/cat-1398627_1920.jpg"/>
  <img src="img/cat-1701156_1920.jpg" />
  <img src="img/cat-1796834_1920.jpg" />
  <img src="img/cat-238394_1920.jpg"/>
  <img src="img/birman-4670871_1920.jpg" />
  <img src="img/cat-2477895_640.jpg" />
  <img src="img/cat-2611190_1920.jpg" />
  <img src="img/cat-5295343_1280.jpg" />
</div>

<div class="upload-images-box" id="images"></div>

<!-- jquery -->
<script type="text/javascript" src="lib/jquery-3.5.1/jquery-3.5.1.min.js"></script>
<!-- viewer -->
<link rel="stylesheet" href="lib/viewer/css/viewer.min.css" />
<script type="text/javascript" src="lib/viewer/js/viewer.min.js"></script>
<!-- font-awesome -->
<link rel="stylesheet" href="lib/font-awesome-4.7.0/css/font-awesome.min.css">
<!-- jquery-image-util -->
<link rel="stylesheet" href="css/jquery-image-util.min.css" />
<script type="text/javascript" src="js/jquery-image-util.min.js"></script>
<script type="text/javascript">
  // image preview
  $.startImageViewer($('#image-preview'), 'img');
  
  // image upload
  // step-1 init
  const $images = $('#images');
  $images.imageUpload({
      mode: 0,             // upload mode: 0-auto, 1-multi, 2-multi,single
      rid: null,           // component custom id
      size: 0,             // maximum number of images allowed, no limit when less than or equal to 0
      data: [],            // preset picture data, demo: ["http://a.com/a.jpg", "http://b.cn/b.png"]
      preview: false,      // whether to start the image preview plugin
      uploadFun: null,     // upload callback function
      deleteFun: null,     // delete callback function
      msgFun: null,        // message callback function
    });
  // step-2
  // please implement upload function, delete function, and message function,
  // the imageUpload component will callback them.
  function imageUpload(rid, id, fileData) {
    // please implement upload function by ajax or another,
    // and notify imageUpload component when upload success or failure
    const formData = new FormData();
    formData.append('file', fileData);  //添加图片信息的参数
    $.ajax({
      url: '',
      type: 'post',
      cache: false,
      data: formData,
      processData: false,
      contentType: false,
      dataType: 'json',
      success: function (re) {
        $images.imageUpload('update', {id: id, status: true, src: 'img/cat-2477895_640.jpg'});
      },
      error: function (re) {
        $images.imageUpload('update', {id: id, status: false});
      }
    });
  }
  function imageDelete(rid, val) {
    // please implement delete callback function,
    // so that component could notify you when have deleted image.
    console.log(rid, JSON.stringify(val));
  }
  function imageMsg(rid, msg) {
    // please implement message callback function,
    // so that component could notify you when have new message.
    console.log(rid, msg);
  }
</script>
```

and you can use some methods

```
$images.imageUpload('update', {id: id, status: false}); // update image upload status
$images.data('imageUpload').val(); // get the uploaded images collection
```

## License
MIT License

## Contact
1947501227@qq.com