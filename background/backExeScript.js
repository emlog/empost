//使用layer弹窗插件 详细见 https://layuion.com/docs/modules/layer.html
//Alert

// layer.alert('内容')

//Confirm

// layer.confirm('您是如何看待前端开发？', {
//   btn: ['重要','奇葩'] //按钮
// }, function(){
//   layer.msg('的确很重要', {icon: 1});
// }, function(){
//   layer.msg('也可以这样', {
//     time: 20000, //20s后自动关闭
//     btn: ['明白了', '知道了']
//   });
// });
 
 //Message

// layer.msg('一段提示信息');
 
 //墨绿深蓝风

// layer.alert('墨绿风格，点击确认看深蓝', {
//   skin: 'layui-layer-molv' //样式类名
//   ,closeBtn: 0
// }, function(){
//   layer.alert('偶吧深蓝style', {
//     skin: 'layui-layer-lan'
//     ,closeBtn: 0
//     ,anim: 4 //动画类型
//   });
// });
 
 //捕获页

// layer.open({
//   type: 1,
//   shade: false,
//   //title: false, //是否显示标题
//   content: $('.layer_notice'), //捕获的元素，注意：最好该指定的元素要存放在body最外层，否则可能被其它的相对元素所影响
//   cancel: function(){
//     layer.msg('捕获就是从页面已经存在的元素上，包裹layer的结构', {time: 5000, icon:6});
//   }
// });
 
//页面层

// layer.open({
//   type: 1,
//   skin: 'layui-layer-rim', //加上边框
//   area: ['420px', '240px'], //宽高
//   content: 'html内容'
// });
 
 //自定页

// layer.open({
//   type: 1,
//   skin: 'layui-layer-demo', //样式类名
//   closeBtn: 0, //不显示关闭按钮
//   anim: 2,
//   shadeClose: true, //开启遮罩关闭
//   content: '内容'
// });
 
//Tips

// layer.tips('Hi，我是tips', '吸附元素选择器，如#id');
 
 //iframe 层

// layer.open({
//   type: 2,
//   title: 'layer mobile页',
//   shadeClose: true,
//   shade: 0.8,
//   area: ['380px', '90%'],
//   content: 'mobile/' //iframe的url
// }); 
 
//iframe 层

// layer.open({
//   type: 2,
//   title: '很多时候，我们想最大化看，比如像这个页面。',
//   shadeClose: true,
//   shade: false,
//   maxmin: true, //开启最大化最小化按钮
//   area: ['893px', '600px'],
//   content: 'https://www.baidu.com/'
// });
 
//Loading

// var index = layer.load(0, {shade: false}); //0代表加载的风格，支持0-2
 
//Loading层

// var index = layer.load(1, {
//   shade: [0.1,'#fff'] //0.1透明度的白色背景
// });
 
//Tips

// layer.tips('我是另外一个tips，只不过我长得跟之前那位稍有些不一样。', '吸附元素选择器', {
//   tips: [1, '#3595CC'],
//   time: 4000
// });
 
 //Prompt

// layer.prompt({title: '输入任何口令，并确认', formType: 1}, function(pass, index){
//   layer.close(index);
//   layer.prompt({title: '随便写点啥，并确认', formType: 2}, function(text, index){
//     layer.close(index);
//     alert('演示完毕！您填写的的测试口令为：'+ pass +'<br>您最后写下了：'+ text);
//   });
// });
 
//tab 层

// layer.tab({
//   area: ['600px', '300px'],
//   tab: [{
//     title: 'TAB1', 
//     content: '内容1'
//   }, {
//     title: 'TAB2', 
//     content: '内容2'
//   }, {
//     title: 'TAB3', 
//     content: '内容3'
//   }]
// });
 
//图片层

// $.getJSON('test/photos.json?v='+new Date, function(json){
//   layer.photos({
//     photos: json //格式见API文档手册页
//     ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
//   });
// });
 
//显示自动关闭倒计秒数

// layer.alert('在标题栏显示自动关闭倒计秒数', {
//   time: 5*1000
//   ,success: function(layero, index){
//     var timeNum = this.time/1000, setText = function(start){
//       layer.title((start ? timeNum : --timeNum) + ' 秒后关闭', index);
//     };
//     setText(!0);
//     this.timer = setInterval(setText, 1000);
//     if(timeNum <= 0) clearInterval(this.timer);
//   }
//   ,end: function(){
//     clearInterval(this.timer);
//   }
// });
// layer.msg('发布成功！', {icon: 6,skin: 'layui-layer-lan',anim: 1});

layer.msg('发布成功！', {icon:6,skin: 'layui-layer-lan'
    ,anim: 4 //动画类型
  });