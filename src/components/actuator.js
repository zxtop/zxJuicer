import {Application,Container,Graphics,Sprite,Point} from 'pixi.js';
import {getAnimation,getSound,load,createSprite,getTexture} from '../loader';
import {TweenLite,TimeLine,TweenMax} from 'gsap';
import {AnswerInfo,Loading,Question} from 'xes-answer';
import {RenderPageByIndex} from 'xes-tem-render'

// import STEMTITLE from 'xes-subtitle';
// import GAME from "xes-game";


class Actuator {
    constructor() {
        this.pixiStage = null;  //game

        this.currentTarget = null;

        this.optionList = [];
        this.manAnimate = null;  //人物
        this.machineSprite = null; //榨汁机默认图片
        this.machineAnimate = null; //榨汁机动画
        this.arrowSprite = null; //箭头
    
        this.startPos = new Point(0,0);
        
        this.offsetPos = new Point(0,0);
        this.startCos = null;
        // this.dragFlag = [false,false,false];

        this.rightAnimate = null;
        this.rightAnswer = null;
        this.bg_audio = null;

        this.isDo = false;//判断是否有操作
        this.t = null; //背景音乐的时间
        this.begins = [];//存储初始位置
        this.dragFlag = false; //是否可以移动 点击为true,之后可移动  up后为false
        this.canTake = true; //为true && dragflag为false  可点击之后可移动
        this.complete = false;

        this.shifang = true;



        this.oplist = [{
            "image": {
                "image_name": "image_render_A",
                "img_info": "选项1(石榴)",
                "text": "A",
                "text_name": "选项1",
                "x": 294,
                "y": 578
            },
            "shadow": {
                "image_name": "image_fruits",
                "x": 320,
                "y": 710
            },
            "animate": {
                "animate_name": "animation_right_zhazhiji_1"
            },
            "x": 288,
            "y": 680
        }, {
            "image": {
                "image_name": "image_render_B",
                "img_info": "选项2(猕猴桃)",
                "text": "B",
                "text_name": "选项2",
                "x": 536,
                "y": 530
            },
            "shadow": {
                "image_name": "image_fruits",
                "x": 544,
                "y": 640
            },
            "animate": {
                "animate_name": "animation_right_zhazhiji_2"
            },
            "x": 510,
            "y": 620
        }, {
            "image": {
                "image_name": "image_render_C",
                "img_info": "选项3(橙子)",
                "text": "C",
                "text_name": "选项3",
                "x": 766,
                "y": 598
            },
            "shadow": {
                "image_name": "image_fruits",
                "x": 784,
                "y": 720
            },
            "animate": {
                "animate_name": "animation_right_zhazhiji_3"
            },
            "x": 742,
            "y": 684
        }]
    }
    exec(){
        this.init(store.state.pageNumber);
        stage.on('pointermove',this.moveTarget.bind(this));
        stage.on('pointerup',this.leaveMoveTarget.bind(this));
    }

    init(pageNum){ //初始化标题和背景音乐
        console.log("开始初始化第"+pageNum+"页内容");
        this.pixiStage = stage.getChildByName('GAME').getChildByName('GAME'+pageNum);
        RenderPageByIndex(pageNum);
        this.pixiStage.getChildByName("componentContainer").removeChildren();
        console.log(this.pixiStage);

        this.complete = true;

        //背景音乐
        let self = this;
        if(pageNum == 0){
             this.bg_audio = res['audio_bg_audio'].sound;
                this.bg_audio.playIng = true;
                if(this.bg_audio.playIng){
                    this.bg_audio.play();
                    this.bg_audio.playIng = false;
                    let instance = this.bg_audio.play();
                    instance.on('end',()=>{
                        self.complete = false;
                    })
            
                }
        }
       
        if(pageNum != 0){
            this.complete = false;
        }

     
     
        //答案
        
        this.rightAnswer = question.sources[pageNum].rightKey;
        //装载舞台内容项

        //添加人物元素
        this.manAnimate = getAnimation('animation_lili');
        this.manAnimate.state.setAnimation(1,'default_lili',true);
        this.manAnimate.x = 980;
        this.manAnimate.y = 690;
        this.pixiStage.addChild(this.manAnimate);

        // 画一个桌子
        let tableGraphics = new PIXI.Graphics();
        tableGraphics.lineStyle(1, 0x8c83cd);
        tableGraphics.beginFill(0x8c83cd, 1);
        tableGraphics.drawRect(298, 650, 1304, 100);
        this.pixiStage.addChild(tableGraphics);

        //绘制榨汁机元素
        this.machineSprite = new PIXI.Sprite.fromImage(res['image_zj'].url);
        this.machineSprite.x = 1140;
        this.machineSprite.y = 300;
        this.machineSprite.default = PIXI.Texture.fromImage('image_zj');
        this.machineSprite.hover = PIXI.Texture.fromImage('image_zj_hover');
        this.pixiStage.addChild(this.machineSprite);
        // 画个箭头
        this.arrowSprite = new PIXI.Graphics();
        this.arrowSprite.alpha = 0;
        this.arrowSprite.beginFill(0xd11900, 1);
        this.arrowSprite.moveTo(1352, 186);
        this.arrowSprite.lineTo(1380, 186);
        this.arrowSprite.lineTo(1380, 220);
        this.arrowSprite.lineTo(1395, 220);
        this.arrowSprite.lineTo(1365, 250);
        this.arrowSprite.lineTo(1337, 220);
        this.arrowSprite.lineTo(1352, 220);
        this.arrowSprite.lineTo(1352, 186);
        this.arrowSprite.endFill();
        this.pixiStage.addChild(this.arrowSprite);

        // 让箭头闪烁
        // let itemAnimate = new TimelineMax();
        // itemAnimate.fromTo(this.arrowSprite,1,{alpha:0},{alpha:0,ease:Power0.easeNone,repeat:-1});
        
        let option = question.sources[pageNum].option;
        
        option.forEach((item,index) => {
            //摆盘子
            let plateSprite = null;
            if(item.x == '' || item.y == ''){
                self.oplist.map((itemd,indexd)=>{
                    if(index == indexd){
                        plateSprite = new PIXI.Sprite.fromImage(res["image_panzi"].url);
                        plateSprite.x = itemd.x;
                        plateSprite.y = itemd.y;
                    }
                })
            }else{

                plateSprite = new PIXI.Sprite.fromImage(res["image_panzi"].url);
                plateSprite.x = item.x;
                plateSprite.y = item.y;
            }
            this.pixiStage.addChild(plateSprite);
            
            //放置阴影
            let shadowSprite = null;
            if(item.shadow.image_name == ''){
                self.oplist.map((itemd,indexd)=>{
                    if(index == indexd){
                        shadowSprite = new PIXI.Sprite.fromImage(res[itemd.shadow.image_name].url);
                        shadowSprite.x = itemd.shadow.x;
                        shadowSprite.y = itemd.shadow.y;
                    }
                })
            }else{
                shadowSprite = new PIXI.Sprite.fromImage(res[item.shadow.image_name].url);
                shadowSprite.x = item.shadow.x;
                shadowSprite.y = item.shadow.y;
            }
                
            this.pixiStage.addChild(shadowSprite);
            

            //放置水果
            let fruitSprite = null;
            if(item.image.image_name == ''){
                self.oplist.map((itemd,indexd)=>{
                    if(index == indexd){
                        fruitSprite = new PIXI.Sprite.fromImage(res[itemd.image.image_name].url);
                        fruitSprite.anchor.set(.5,.5);
                        fruitSprite.interactive = true;
                        fruitSprite.cursor = "pointer";
            
                        fruitSprite.x = itemd.image.x+fruitSprite.width/2;
                        fruitSprite.y = itemd.image.y+fruitSprite.height/2;
            
                        fruitSprite.shadow = shadowSprite;
                        fruitSprite.wLock = fruitSprite.width;
                        fruitSprite.hLock = fruitSprite.height;
                        fruitSprite.text = itemd.image.text;
            
                        fruitSprite.ids = index;
                        fruitSprite.success = false;
                        // fruitSprite.dragFlag = true;
                        fruitSprite.rightAnimate = itemd.animate.animate_name;                    }
                })
            }else{

                fruitSprite = new PIXI.Sprite.fromImage(res[item.image.image_name].url);
                fruitSprite.anchor.set(.5,.5);
                fruitSprite.interactive = true;
                fruitSprite.cursor = "pointer";
    
                fruitSprite.x = item.image.x+fruitSprite.width/2;
                fruitSprite.y = item.image.y+fruitSprite.height/2;
    
                fruitSprite.shadow = shadowSprite;
                fruitSprite.wLock = fruitSprite.width;
                fruitSprite.hLock = fruitSprite.height;
                fruitSprite.text = item.image.text;
    
                fruitSprite.ids = index;
                fruitSprite.success = false;
                // fruitSprite.dragFlag = true;
                fruitSprite.rightAnimate = item.animate.animate_name;
            }
            this.pixiStage.addChild(fruitSprite);
            this.optionList.push(fruitSprite);
            this.begins.push({
                x:item.image.x+fruitSprite.width/2,
                y:item.image.y+fruitSprite.height/2
            });

            fruitSprite.on('pointerover',this.overAndScale);
            fruitSprite.on('pointerout',this.outAndScale.bind(this));
            fruitSprite.on('pointerdown',this.getCurrentTarget.bind(this));

        });

    }

    overAndScale(e){
        let target = e.target;
        target.cursor = '-webkit-grab';
        TweenLite.to(target,.3,{width:target.wLock*1.05,height:target.hLock*1.05});
    }

    outAndScale(e){//缩放对象
        let target = e.currentTarget;
        target.cursor = 'pointer';
        TweenLite.to(target,.3,{width:target.wLock,height:target.hLock})
    }

    getCurrentTarget(e){//获取当前对象
       
        
        if(!this.complete && (this.currentTarget == null)){
            

            let _that = this;
            // _that.currentTarget ? _that.currentTarget == '': e.target;
            _that.currentTarget = e.target;
            // console.log('eeeee',_that.currentTarget.success);
            // _that.currentTarget.success = false;
            _that.currentTarget.cursor = '-webkit-grabbing';
            // console.log(_that.dragFlag,_that.canTake);

            if(!_that.dragFlag && _that.canTake){
                
                _that.dragFlag = true;
                //获取鼠标当前位置
                _that.startCos = e.data.getLocalPosition(_that.pixiStage);
        
                //获取初始位置
                _that.startPos.x = _that.currentTarget.x;
                _that.startPos.y = _that.currentTarget.y;
                // console.log(_that.startPos)
                
                //获取鼠标偏移量
                _that.offsetPos.x = _that.startCos.x - _that.startPos.x;
                _that.offsetPos.y = _that.startCos.y - _that.startPos.y;
                
                //缩小当前移动对象
                TweenLite.to(_that.currentTarget,.4,{width:_that.currentTarget.wLock,height:_that.currentTarget.hLock})
        }
        }
    }

    moveTarget(e){
        if(this.currentTarget&&this.dragFlag){
            let _that = this;
            let nowPos = e.data.getLocalPosition(_that.pixiStage);
            //提升当前对象的层级
            _that.pixiStage.setChildIndex(_that.currentTarget,_that.pixiStage.children.length-1);
            _that.currentTarget.shadow.alpha = 0;
            _that.currentTarget.x = nowPos.x - _that.offsetPos.x;
            _that.currentTarget.y = nowPos.y - _that.offsetPos.y;

            if(_that.currentTarget.x>20&&_that.currentTarget.x<1900&&_that.currentTarget.y>20&&_that.currentTarget.y<1060){
                if(
                    _that.currentTarget.x + _that.currentTarget.width/2 < _that.machineSprite.x ||
                    _that.currentTarget.x - _that.currentTarget.width/2 > (_that.machineSprite.x + _that.machineSprite.width) ||
                    _that.currentTarget.y + _that.currentTarget.height/2 < _that.machineSprite.y ||
                    _that.currentTarget.y - _that.currentTarget.height/2 > _that.machineSprite.y + _that.machineSprite.height
                ){
                    // console.log("没碰到了");
                    _that.machineSprite.texture = _that.machineSprite.default;
                    _that.currentTarget.success = false;
                    

                }else{
                    // console.log("碰到了");
                    _that.machineSprite.texture = _that.machineSprite.hover;
                    _that.currentTarget.success = true;
                    
                }
            }else{
                // this.dragFlag = false;
                

                _that.returnStartPos();
            }
        }
    }

    leaveMoveTarget(e){
        if(this.currentTarget&&!this.complete){
           
            this.currentTarget.cursor = '-webkit-grab';
           

            this.dragFlag = false;
            let self = this;        
        
            if(this.currentTarget.success){
                this.canTake = false;
                if(this.currentTarget.text == this.rightAnswer){
                    this.complete = true;
                    console.log("正确");                
                     self.machineSprite.texture = self.machineSprite.default;
                  
                    let itemAnimate = new TimelineMax();
                    itemAnimate.to( //水果渐隐
                        self.currentTarget,
                        .3,
                        {
                            alpha : 0,
                            ease:Power0.easeNone,
                            onComplete:()=>{
                                self.pixiStage.removeChild(self.currentTarget);
                            }
                        }
                    );
                    console.log(self.currentTarget.rightAnimate);
                    res['z_right_audio'].sound.play(); //播放榨汁机成功声音
                    self.machineAnimate = getAnimation(self.currentTarget.rightAnimate);//播放榨汁机动画
                    self.machineAnimate.state.setAnimation(1,'animation',false);
                    self.machineAnimate.x = this.machineSprite.x+this.machineSprite.width/2+32;
                    self.machineAnimate.y = this.machineSprite.y+this.machineSprite.height-43;
                    self.pixiStage.addChild(self.machineAnimate);


                    // setTimeout(()=>{
                        
                        let animate = self.manAnimate.state.setAnimation(1,'right_lili',false);

                        res['audio_right_audio'].sound.play();   //播放成功声音
                        setTimeout(() => {

                            self.canTake = true;
                            setTimeout(() => {
                                if(store.state.pageNumber<question.sources.length-1){//提交数据跳转下一页
                                    let answer = new AnswerInfo();
                                    answer.init({type: 0, useranswer:self.currentTarget.text, answer:self.rightAnswer, id:store.state.pageNumber, rightnum: 1, wrongnum: 0});
                                    store.dispatch('pushToPostArr', answer);
                                    
                                    self.pixiStage.children[2].stemAudioStr?self.pixiStage.children[2].stemAudioStr.pause():"";
                                    self.pixiStage.children[2].stemSoundAn?self.pixiStage.children[2].stemSoundAn.timeScale = 0:"";

                                    store.state.pageNumber++;
                                    self.currentTarget = null;
                                    self.init(store.state.pageNumber);
                                  
                                }else{//提交并结束
                                    let answer = new AnswerInfo();
    
                                    answer.init({type: 0, useranswer:self.currentTarget.text, answer:self.rightAnswer, id:store.state.pageNumber, rightnum: 1, wrongnum: 0});
                                    store.dispatch('pushToPostArr', answer);
                                    store.dispatch('postAnswer')
                                }
                            }, animate.animation.duration*1000);
                        }, 1000);   
                    // },1000)/
                }else{
                    

                    this.returnStartPos(); //水果返回
                    clearInterval(this.t); //停止其他音频
                    setTimeout(()=>{
                        let animate = this.manAnimate.state.setAnimation(1,'wrong_lili',false); //wrong lili
                        res['audio_wrong_audio'].sound.play();//播放错误声音
    
                        setTimeout(() => {
                            self.manAnimate.state.setAnimation(1,'default_lili',true);

                            self.canTake = true;
                            self.currentTarget == null;
                        }, animate.animation.duration*1000);
                    },1000)
       
                    let wrong_zhazhiji = getAnimation('animation_wrong_zhazhiji'); //wrong zhazhiji
                    res['z_wrong_audio'].sound.play(); //播放榨汁机错误声音
                    
                    wrong_zhazhiji.state.setAnimation(1,'animation',false);
                    wrong_zhazhiji.x = this.machineSprite.x+this.machineSprite.width/2+32;
                    wrong_zhazhiji.y = this.machineSprite.y+this.machineSprite.height-43;
                    this.machineSprite.alpha = 0;
                    this.pixiStage.addChild(wrong_zhazhiji);
                    let wrong_time = setTimeout(()=>{
                        this.machineSprite.alpha = 1;
                        this.pixiStage.removeChild(wrong_zhazhiji);
                    },900)
                }
                
            }else{
                this.returnStartPos(); //水果返回
            }
        }
    }

    returnStartPos(){
        if(this.currentTarget){
            let _that = this;
            _that.machineSprite.texture = _that.machineSprite.default;
            _that.currentTarget.shadow.alpha = 1;
            _that.currentTarget.success = false;
            
            TweenLite.to(_that.currentTarget,.4,{x:_that.begins[this.currentTarget.ids].x,y:_that.begins[this.currentTarget.ids].y,onComplete:function(){
                _that.currentTarget = null;
            }});
            
        }
    }
}
export {
    Actuator
};
