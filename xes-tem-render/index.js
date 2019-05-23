'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.UploadAndRenderEle = UploadAndRenderEle;
exports.RenderAllData = RenderAllData;
exports.RenderElementByIndex = RenderElementByIndex;
exports.RenderPageByIndex = RenderPageByIndex;
exports.CopyAndRender = CopyAndRender;
exports.DeleteEleByName = DeleteEleByName;
exports.CopyPageAndRender = CopyPageAndRender;
exports.DeletElementByName = DeletElementByName;
exports.stemAudioPause = stemAudioPause;

var _pixi = require('pixi.js');

var _loader = require('@/loader');

var _DragElement = require('./DragElement');

var _DragElement2 = _interopRequireDefault(_DragElement);

var _xesEditorSubtitle = require('xes-editor-subtitle');

var _xesEditorSubtitle2 = _interopRequireDefault(_xesEditorSubtitle);

var _xesEditorGame = require('xes-editor-game');

var _xesEditorGame2 = _interopRequireDefault(_xesEditorGame);

var _xesPreviewSubtitle = require('xes-preview-subtitle');

var _xesPreviewSubtitle2 = _interopRequireDefault(_xesPreviewSubtitle);

var _xesPreviewGame = require('xes-preview-game');

var _xesPreviewGame2 = _interopRequireDefault(_xesPreviewGame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var resourceNameData = [];
var needData = [];

/**
 * UploadAndRenderEle
 * param index 当前页码下标 componentName 组件名称 res 上传资源resources allData 游离态得所有数据
 * 执行代码得上传回调，将上传得精灵图，序列图和动画资源按页码渲染到舞台上实现左右对照关联
 **/
function UploadAndRenderEle(index, componentName, res, allData) {
    //获取当前舞台容器
    var gameContainer = stage.getChildByName('GAME');
    //获取资源加载集
    !window.res[res.resourceName] ? PIXI.loader.add(res.resourceName, res.path) : "";
    //执行pixi得loader回调
    PIXI.loader.load(function (loader, resource) {
        //获取待渲染页面容器
        var mainContainer = index ? gameContainer.getChildByName('GAME' + index) : gameContainer.getChildByName('GAME0');
        //根据判断是否需要重新渲染组建容器
        var componentContainer = mainContainer.getChildByName('componentContainer') ? mainContainer.getChildByName('componentContainer') : new PIXI.Container();
        componentContainer.name = 'componentContainer';
        //获取当前容器下符合当前compontent的资源项
        var element = componentContainer.getChildByName(componentName);
        //初始化数据集
        var initData = {
            "show": true,
            "resource": resource,
            "resourceName": res.resourceName,
            "animationName":res.animationName,
            "name": componentName,
            "width": res.width,
            "height": res.height,
            "left": 0,
            "top": 0,
            "scale": 1,
            "loop": 0,
            "gameContainer": mainContainer,
            "zIndex": undefined
            //根据判断是否需要修改当前元素
        };if (element) {
            //移除舞台对应元素
            initData.left = element.x;
            initData.top = element.y;
            initData.zIndex = componentContainer.getChildIndex(element);
            componentContainer.removeChild(element);
            //重新创建该元素并挂载置舞台
            renderEleByType(initData, allData, true);
        } else {
            //创建该元素并挂载置舞台
            renderEleByType(initData, allData, true);
        }
    });
}

/**
 * RenderAllData
 * param editStatus 是否渲染当前项 allData 所有数据集
 * 执行代码得上传回调，将上传得精灵图，序列图和动画资源按页码渲染到舞台上实现左右对照关联
 **/
function RenderAllData() {
    var editStatus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var allData = arguments[1];

    var gameContainer = stage.getChildByName('GAME') ? stage.getChildByName('GAME') : new PIXI.Container();
    gameContainer.name = 'GAME';
    //遍历配置资源文件
    allData.sources.forEach(function (question, index) {
        //初始化公共部分的内容
        var game = null;
        var stemTitle = null;
        if (editStatus) {
            game = new _xesEditorGame2.default(question.bgImage, question.stemImg, res, index);
            stemTitle = new _xesEditorSubtitle2.default(question.subTitle, res);
        } else {
            game = new _xesPreviewGame2.default(question.bgImage, question.stemImg, res, index);
            stemTitle = new _xesPreviewSubtitle2.default(question.subTitle, res);
        }
        game.addChild(stemTitle);
        game.name = 'GAME' + index;
        game.visible = false;
        gameContainer.addChild(game);
        //初始化元素容器
        var componentContainer = new PIXI.Container();
        componentContainer.name = 'componentContainer';
        //按数据初始化页面个性部分的页面元素
        (0, _keys2.default)(question).forEach(function (key) {
            if (key != 'id' && key != 'bgImage' && key != 'subTitle' && key != 'stemImg' && key != 'rightKey') {
                var obj = {};
                resourceNameData = [];
                obj[key] = question[key];
                getResourceData(obj);
                resourceNameData.forEach(function (item, ids) {
                    var initData = {
                        "show": item.show,
                        "resource": res,
                        "resourceName": item.name || item.image_name || item.sprite_name || item.animate_name,
                        "name": item.componentName,
                        "animationName":item.animationName,
                        "width": item.width,
                        "height": item.height,
                        "left": item.x,
                        "top": item.y,
                        "scale": item.scale,
                        "loop": item.loop,
                        "gameContainer": game,
                        "zIndex": item.zIndex
                    };
                    renderEleByType(initData, allData, editStatus);
                });
            }
        });
    });

    if (editStatus) {
        
        var startBtnContainer = stage.getChildByName('START').children[0].getChildByName('startBgContainer');
        startBtnContainer.children.forEach(item=>{
            if (item && item.name != 'startBgImage') {
                new _DragElement2.default(item, function (x, y) {
                    needData = [];
                    getNeedData(allData, item.name);
                    needData[0].x = x.toFixed(1) ;
                    needData[0].y = y.toFixed(1) ;
                });
            }
        })
        //找到页面上的开始按钮
        var startBtn = stage.getChildByName('START').children[0].getChildByName('startBtnContainer').children[0];
        if (startBtn) {
            new _DragElement2.default(startBtn, function (x, y) {
                needData = [];
                getNeedData(allData, startBtn.name);
                needData[0].x = x.toFixed(1);
                needData[0].y = y.toFixed(1);
            });
        }
        //页面上的背景音频按钮
        var bgSoundBtn = stage.getChildByName('gameBgSound');
        if (bgSoundBtn) {
            new _DragElement2.default(bgSoundBtn, function (x, y) {
                needData = [];
                getNeedData(allData, 'gameBgSound');
                needData[0].x = x.toFixed(1);
                needData[0].y = y.toFixed(1);
            });
        }
    }

    stage.addChild(gameContainer);

    if (editStatus) {
        gameContainer.children.forEach(function (item, index) {
            //页面上的题干音频按钮
            var stemSoundBtn = stage.getChildByName('GAME').getChildByName("GAME" + index).getChildByName('STEMTITLE').children[0].getChildByName('stemSound');
            if (stemSoundBtn) {
                new _DragElement2.default(stemSoundBtn, function (x, y) {
                    needData = [];
                    getNeedData(allData.sources[index], 'stemSound');
                    needData[0].x = x.toFixed(1) ;
                    needData[0].y = y.toFixed(1) ;
                });
            }
            //页面上的背景图
            var gameBgContainer = stage.getChildByName('GAME').getChildByName("GAME" + index).getChildByName("gameContainer").getChildByName('gameBgContainer');
            gameBgContainer.children.forEach(item=>{
                if (item && item.name != 'gameBgImage') {
                    new _DragElement2.default(item, function (x, y) {
                        needData = [];
                        getNeedData(allData.sources[index], item.name);
                        
                        needData[0].x = x.toFixed(1) ;
                        needData[0].y = y.toFixed(1) ;
                    });
                }
            })
            //页面上的题干图
            var stemContainer = stage.getChildByName('GAME').getChildByName("GAME" + index).getChildByName("gameContainer").getChildByName('stemContainer');
            stemContainer.children.forEach(item=>{
                if (item) {
                    new _DragElement2.default(item, function (x, y) {
                        needData = [];
                        getNeedData(allData.sources[index], item.name);
                        needData[0].x = x.toFixed(1) ;
                        needData[0].y = y.toFixed(1) ;
                    });
                }
            })
            //页面上的题干图
            var stemText = stage.getChildByName('GAME').getChildByName("GAME" + index).getChildByName('STEMTITLE').children[0].getChildByName('stemText');
            if (stemText) {
                new _DragElement2.default(stemText, function (x, y) {
                    needData = [];
                    getNeedData(allData.sources[index], 'stemText');
                    needData[0].x = x.toFixed(1) ;
                    needData[0].y = y.toFixed(1) ;
                });
            }
        });
    }

    stage.addChild(gameContainer);
    stage.getChildByName('gameBgSound') ? stage.setChildIndex(stage.getChildByName('gameBgSound'), stage.children.length - 1) : "";
    RenderPageByIndex(0);
}

function RenderElementByIndex(index, allData) {
    var game = null;
    game = stage.getChildByName('GAME').getChildByName('GAME' + index);
    game.getChildByName('componentContainer').removeChildren();
    if (allData) {
        (0, _keys2.default)(allData.sources[index]).forEach(function (key, ids) {
            if (key != 'id' && key != 'bgImage' && key != 'subTitle' && key != 'stemImg' && key != 'rightKey') {
                resourceNameData = [];
                getResourceData(allData.sources[index][key]);
                for (var i = resourceNameData.length - 1; i >= 0; i--) {
                    var initData = {
                        "show": resourceNameData[i].show,
                        "resource": res,
                        "resourceName": resourceNameData[i].name || resourceNameData[i].image_name || resourceNameData[i].sprite_name || resourceNameData[i].animate_name,
                        "name": resourceNameData[i].componentName,
                        "animationName":resourceNameData[i].animationName,
                        "width": resourceNameData[i].width,
                        "height": resourceNameData[i].height,
                        "left": resourceNameData[i].x,
                        "top": resourceNameData[i].y,
                        "scale": resourceNameData[i].scale,
                        "loop": resourceNameData[i].loop,
                        "gameContainer": game,
                        "zIndex": resourceNameData[i].zIndex
                    };
                    renderEleByType(initData, allData, true);
                }
            }
        });
    }
}

function RenderPageByIndex(index) {
    var gameContainer = stage.getChildByName('GAME');
    gameContainer.children.forEach(function (item) {
        item.visible = false;
    });
    //获取当前下标的页面
    var game = gameContainer.getChildByName('GAME' + index);
    //将其置到舞台最高层
    // _that.gameContainer.setChildIndex(game,_that.gameContainer.children.length-1)
    game.visible = true;
}

function CopyAndRender(index, data, componentName, allData) {
    //获取当前页面
    var game = new _xesEditorGame2.default(data.bgImage, data.stemImg, res);
    var stemTitle = new _xesEditorSubtitle2.default(data.subTitle, res);
    game.addChild(stemTitle);
    game.name = 'GAME' + index;
    game.visible = false;
    stage.getChildByName('GAME').addChild(game);
    //初始化元素容器
    var componentContainer = new PIXI.Container();
    componentContainer.name = 'componentContainer';
    //按数据初始化页面个性部分的页面元素
    (0, _keys2.default)(data).forEach(function (key) {
        if (key != 'id' && key != 'bgImage' && key != 'subTitle' && key != 'stemImg') {
            var obj = {};
            obj[key] = data[key];
            resourceNameData = [];
            getResourceData(obj);
            resourceNameData.forEach(function (item) {
                var initData = {
                    "show": item.show,
                    "resource": res,
                    "resourceName": item.name || item.image_name || item.sprite_name || item.animate_name,
                    "name": item.componentName,
                    "animationName":item.animationName,
                    "width": item.width,
                    "height": item.height,
                    "left": item.x,
                    "top": item.y,
                    "scale": item.scale,
                    "loop": item.loop,
                    "gameContainer": game,
                    "zIndex": item.zIndex
                };
                renderEleByType(initData, allData, true);
            });
        }
    });
}

function DeleteEleByName(index, name) {
    //获取当前页面
    var gameContainer = stage.getChildByName('GAME');
    //获取当前页面
    var componentContainer = gameContainer.getChildByName('GAME' + index).getChildByName('componentContainer');
    componentContainer.getChildByName(name) ? componentContainer.removeChild(componentContainer.getChildByName(name)) : "";
}

function CopyPageAndRender(index, data, allData) {
    //获取当前页面
    //初始化公共部分的内容
    var game = new _xesEditorGame2.default(data.bgImage, data.stemImg, res);
    var stemTitle = new _xesEditorSubtitle2.default(data.subTitle, res);
    game.addChild(stemTitle);
    game.name = 'GAME' + index;
    game.visible = false;
    stage.getChildByName('GAME').addChild(game);
    //初始化元素容器
    var componentContainer = new _pixi.Container();
    componentContainer.name = 'componentContainer';
    //按数据初始化页面个性部分的页面元素
    (0, _keys2.default)(data).forEach(function (key) {
        if (key != 'id' && key != 'bgImage' && key != 'subTitle' && key != 'stemImg') {
            var obj = {};
            obj[key] = data[key];
            resourceNameData = [];
            getResourceData(obj);
            resourceNameData.forEach(function (item) {
                var initData = {
                    "show": item.show,
                    "resource": res,
                    "resourceName": item.name || item.image_name || item.sprite_name || item.animate_name,
                    "name": item.componentName,
                    "animationName":item.animationName,
                    "width": item.width,
                    "height": item.height,
                    "left": item.x,
                    "top": item.y,
                    "scale": item.scale,
                    "loop": item.loop,
                    "gameContainer": game,
                    "zIndex": item.zIndex
                };
                renderEleByType(initData, allData, true);
            });
        }
    });

    //页面上的题干音频按钮
    var stemSoundBtn = stage.getChildByName('GAME').getChildByName("GAME" + index).getChildByName('STEMTITLE').children[0].getChildByName('stemSound');
    if (stemSoundBtn) {
        new _DragElement2.default(stemSoundBtn, function (x, y) {
            needData = [];
            getNeedData(allData.sources[index], 'stemSound');
            needData[0].x = x.toFixed(1) ;
            needData[0].y = y.toFixed(1) ;
        });
    }
    //页面上的背景图
    var gameBgContainer = stage.getChildByName('GAME').getChildByName("GAME" + index).getChildByName("gameContainer").getChildByName('gameBgContainer');
    gameBgContainer.children.forEach(item=>{
        if (item && item.name != 'gameBgImage') {
            new _DragElement2.default(item, function (x, y) {
                needData = [];
                getNeedData(allData.sources[index], item.name);
                needData[0].x = x.toFixed(1) ;
                needData[0].y = y.toFixed(1) ;
            });
        }
    })
    //页面上的题干图
    var stemContainer = stage.getChildByName('GAME').getChildByName("GAME" + index).getChildByName("gameContainer").getChildByName('stemContainer');
    stemContainer.children.forEach(item=>{
        if (item) {
            new _DragElement2.default(item, function (x, y) {
                needData = [];
                getNeedData(allData.sources[index], item.name);
                needData[0].x = x.toFixed(1) ;
                needData[0].y = y.toFixed(1) ;
            });
        }
    })
    //页面上的题干图
    var stemText = stage.getChildByName('GAME').getChildByName("GAME" + index).getChildByName('STEMTITLE').children[0].getChildByName('stemText');
    if (stemText) {
        new _DragElement2.default(stemText, function (x, y) {
            needData = [];
            getNeedData(allData.sources[index], 'stemText');
            needData[0].x = x.toFixed(1) ;
            needData[0].y = y.toFixed(1) ;
        });
    }
}

function DeletElementByName(index, name) {
    var gameContainer = stage.getChildByName('GAME');
    //获取当前页面
    var componentContainer = gameContainer.getChildByName('GAME' + index).getChildByName('componentContainer');
    componentContainer.getChildByName(name) ? componentContainer.removeChild(componentContainer.getChildByName(name)) : "";
}

function stemAudioPause(index) {
    var game = stage.getChildByName('GAME').getChildByName('GAME' + index);
    if (game.children[1].stemAudioStr) {
        game.children[1].stemAudioStr.pause();
    }
    if (game.children[1].stemSound) {
        game.children[1].stemSound.timeScale = 0;
    }
}

function renderEleByType(obj, allData, editStatus) {
    //判断使用的资源集
    var resMap = obj.resource ? obj.resource : res;
    var element = null;
    var ids = parseInt(obj.gameContainer.name.substring(4));
    var componentContainer = obj.gameContainer.getChildByName('componentContainer') ? obj.gameContainer.getChildByName('componentContainer') : new PIXI.Container();
    componentContainer.name = 'componentContainer';
    //渲染舞台元素
    if (obj.resourceName) {
        if (obj.resourceName.indexOf('image') > -1 && (obj.show || obj.resourceName.indexOf('render') > -1)) {
            // 初始化图片精灵
            element = new PIXI.Sprite.fromImage(resMap[obj.resourceName].url);
            element.width = obj.width;
            element.height = obj.height;
            element.name = obj.name;
            element.copyName = obj.resourceName;
            element.x = parseFloat(obj.left);
            element.y = parseFloat(obj.top);
            element.interactive = true;
            element.cursor = 'grab';
            componentContainer.addChild(element);
            obj.zIndex == undefined ? componentContainer.setChildIndex(element, obj.zIndex) : "";

            if (allData && editStatus) {
                // new _DragElement2.default(element, function (x, y) {
                //     needData = [];
                //     getNeedData(allData.sources[ids], obj.name);
                //     needData[0].x = x.toFixed(1);
                //     needData[0].y = y.toFixed(1);
                // });
            }
        } else if (obj.resourceName.indexOf('sprite') > -1 && (obj.show || obj.resourceName.indexOf('render') > -1)) {
            // 初始化精灵序列图

            var frame = resMap[obj.resourceName].spritesheet;
            var frameArray = [];
            for (var i in frame.textures) {
                frameArray.push(frame.textures[i]);
            }
            element = new PIXI.extras.AnimatedSprite(frameArray);
            element.x = obj.left;
            element.y = obj.top;
            element.loop = obj.loop;
            element.name = obj.name;
            element.copyName = obj.resourceName;
            element.animationSpeed = 1;
            element.scale.set(obj.scale);
            element.play();
            element.interactive = true;
            element.cursor = 'grab';
            componentContainer.addChild(element);
            obj.zIndex == undefined ? componentContainer.setChildIndex(element, obj.zIndex) : "";
            if (allData && editStatus) {
                new _DragElement2.default(element, function (x, y) {
                    needData = [];
                    getNeedData(allData.sources[ids], obj.name);
                    needData[0].x = x.toFixed(1);
                    needData[0].y = y.toFixed(1);
                });
            }
        } else if (obj.resourceName.indexOf('animation') > -1 && (obj.show || obj.resourceName.indexOf('render') > -1)) {
            // 渲染动画元素
            element = (0, _loader.getAnimation)(obj.resourceName);
            if(obj.animationName&& element.state.hasAnimation(obj.animationName)){
                element.state.setAnimation(0, obj.animationName, true);
            }
            if(element.state.hasAnimation('animation')){
                element.state.setAnimation(0, 'animation', true);
            }
            // element.state.setAnimation(1, 'animation', true);
            element.update(0);
            element.x = obj.left;
            element.y = obj.top;
            element.name = obj.name;
            element.copyName = obj.resourceName;
            element.scale.set(obj.scale);
            element.interactive = true;
            element.cursor = 'grab';
            componentContainer.addChild(element);
            obj.zIndex == undefined ? componentContainer.setChildIndex(element, obj.zIndex) : "";
            if (allData && editStatus) {
                new _DragElement2.default(element, function (x, y) {
                    needData = [];
                    getNeedData(allData.sources[ids], obj.name);
                    needData[0].x = x.toFixed(1);
                    needData[0].y = y.toFixed(1);
                });
            }
        }
    }

    // obj.gameContainer?"":console.log(obj);

    obj.gameContainer ? obj.gameContainer.addChild(componentContainer) : "";
}

function getResourceData(data) {
    (0, _keys2.default)(data).forEach(function (item, index) {
        var values = (0, _values2.default)(data)[index];
        if (Object.prototype.toString.call(values) === "[object Object]") {
            if (values.hasOwnProperty('name') || values.hasOwnProperty('animate_name') || values.hasOwnProperty('image_name')) {
                resourceNameData.push(values);
            }
            getResourceData(values);
        } else if (Object.prototype.toString.call(values) === '[object Array]') {
            if (Object.prototype.toString.call(values[0]) === "[object Object]") {
                if (values.hasOwnProperty('name') || values.hasOwnProperty('animate_name') || values.hasOwnProperty('image_name')) {
                    resourceNameData.push(values);
                }
                getResourceData(values);
            }
        }
    });
}

function getNeedData(data, componentName) {
    (0, _keys2.default)(data).forEach(function (item, index) {
        var values = (0, _values2.default)(data)[index];
        if (Object.prototype.toString.call(values) === "[object Object]") {
            if (values.componentName == componentName && values.name != '') {
                needData.push(values);
            }
            getNeedData(values, componentName);
        } else if (Object.prototype.toString.call(values) === '[object Array]') {
            if (Object.prototype.toString.call(values[0]) === "[object Object]") {
                if (values.componentName == componentName && values.name != '') {
                    needData.push(values);
                }
                getNeedData(values, componentName);
            }
        }
    });
}