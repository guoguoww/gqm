<template>
    <div id="app">
        <router-view ref="child" />
        <lg-preview></lg-preview>
        <footerC v-show="!$route.meta.hidenav"></footerC>
        <div class="intro" v-if="show&&$cookie.get('_auth')">
            <!-- intro -->
            <template v-if="ready">
                <div class="mark">
                    <div class="tips" :style="current.tips">
                        <div class="dot" :style="current.dot">
                            <div class="aa"></div>
                        </div>
                        <div class="des">
                            <p>{{step[now].text}}</p>
                        </div>

                    </div>
                </div>
                <button class="btn" @click="next" v-if="now!=step.length-1" :style="current.btn||{}">下一步</button>
                <button class="btn" @click="finish" :style="current.btn||{}" v-else>知道了</button>
            </template>
            <template v-else>
                <div class="loading">
                    <van-loading class="loading" color="black" />
                    <div class="mask"></div>
                </div>
            </template>
        </div>
        <Loading></Loading>
                <!-- 下单后弹出 -->
        <van-popup v-model="odshow" class="apppop">
            <van-cell-group>
                <h3>订单详情</h3>
                <van-cell title="合约" :value="od.symbol" />
                <van-cell title="订单号" :value="od.serialNo"  />
                <van-cell title="建仓时间" :value="od.buyTime" />
                <van-cell title="平仓时间" v-if="od.sellTime" :value="od.sellTime" />
                <van-cell title="平仓类型" v-if="od.sellTime" :value="od.sellType=='0'?'手动平仓':od.sellType=='1'?'止盈平仓':'止损平仓'" />
                <van-cell title="手数" :value="od.hands"  />
                <van-cell title="保证金" :value="od.orderPrice" />
                <van-cell title="手续费" :value="od.fee" />
                <van-cell title="开仓价" :value="od.buyPoint"  />
                <van-cell title="止盈价" :value="od.profitPoints" />
                <van-cell title="止损价" :value="od.lossPoints"  />
                <van-cell title="方向" :value="od.direction=='1'?'买跌':'买涨'"  />
                <van-cell title="浮动盈亏" v-if="od.fdyk" :value="od.fdyk" />
                <van-cell title="盈亏" v-if="od.difMoney" :value="od.difMoney" />
                <div class="btn1">
                    <button class="appbtn2" @click='odshow=false'>确定</button>
                </div>
            </van-cell-group>
        </van-popup>
    </div>  
</template>

<script>
import footerC from "./components/common/footer/ComFooter";
import Loading from "./components/common/Loading";
// import router from "./router/index";
export default {
    name: "App",
    components: {
        footerC,
        Loading
    },
    data() {
        return {
            now: 0, //当前步骤
            show: false,
            step: [
                //步骤
                {
                    el: ".index_type ul",
                    text: "这里是您的资产，可以通过资产划转灵活使用。",
                    tips: {
                        top: "-72%"
                    },
                    dot: {
                        bottom: "-63%"
                    },
                    script(self) {
                        self.$router.push("/");
                    }
                },
                {
                    el: ".cc-cont  div:first-child",
                    text: "这里可以买入充值，买到您的数字资产",
                    tips: {
                        bottom: "-133%"
                    },
                    dot: {
                        top: "-54%",
                        transform: "rotateX(180deg)"
                    },
                    script(self) {
                        // console.log(self);
                        self.$router.push("/c2c");
                    }
                },
                {
                    el: ".cc-cont  div:first-child",
                    text:
                        "这里可以卖出提现，交易员会将人民币转入您指定账户。(提示：提现需支付2%手续费给交易员)",
                    tips: {
                        bottom: "-183%"
                    },
                    dot: {
                        top: "-32%",
                        transform: "rotateX(180deg)"
                    },
                    script(self) {
                        self.$refs.child._data.tabactive = 0;
                        console.log(self.$refs.child._data.tabactive);
                    }
                },
                {
                    el: ".acc_tab ul li:nth-of-type(3)",
                    text: "买到的资产可以通过资产划转至合约账户",
                    tips: {
                        top: "183%"
                    },
                    dot: {
                        bottom: "102%",
                        transform: "rotateX(180deg)"
                    },
                    script(self) {
                        self.$router.push("/ccAccount?curTypeNum=0");
                    }
                },
                {
                    el: ".contract-nav",
                    text: "这里可以选择你的产品。",
                    tips: {
                        top: "317%"
                    },
                    dot: {
                        bottom: "102%",
                        transform: "rotateX(180deg)"
                    },
                    script(self) {
                        self.$store.commit('unready')
                        self.$router.push("/contract");
                    }
                },
                {
                    el: ".swiper",
                    text: "这里可以选择一手数量(提示：1USDT≈1美元)。",
                    tips: {
                        top: "218%"
                    },
                    dot: {
                        bottom: "102%",
                        transform: "rotateX(180deg)"
                    },
                    script(self) {
                        self.move();
                    }
                },
                {
                    el: ".charts-but",
                    text: "这里可以选择涨跌。",
                    tips: {
                        top: "-186%"
                    },
                    dot: {
                        bottom: "-126%"
                    },
                    script(self) {
                        self.move();
                        // self.$refs.child.orderpopup(0)
                    }
                },
                {
                    el: ".business-tab",
                    text: "这里可以选择平仓范围(提示：默认平仓赢100%;亏50%)",
                    tips: {
                        top: "-147%"
                    },
                    dot: {
                        bottom: "-41%"
                    },
                    btn: {
                        bottom: 0,
                        top: "10%"
                    },
                    script(self) {
                        self.$refs.child.orderpopup(0);
                        self.$refs.child.$nextTick(() => self.move(true));
                    }
                },
                {
                    el: ".business-num",
                    text: "这里可以增减你的保证金，然后确定下单。",
                    tips: {
                        top: "-174%"
                    },
                    dot: {
                        bottom: "-49%"
                    },
                    btn: {
                        bottom: 0,
                        top: "10%"
                    },
                    script(self) {
                        self.move(true);
                    }
                },
                {
                    el: ".userMenu li:nth-last-of-type(3)",
                    text:
                        "这里有您的专属二维码和推广链接，推荐给朋友赚取高额佣金(提示：可以获得平仓手续费的15%~35%)。",
                    tips: {
                        top: "-279%"
                    },
                    dot: {
                        bottom: "-41%"
                    },
                    script(self) {
                        self.$router.push("/user");
                    }
                },
                {
                    el: ".changeBG ul li:nth-last-of-type(1)",
                    text:
                        "这里可以申请成为交易员，不用推广也能赚取高额手续费。",
                    tips: {
                        top: "-268%"
                    },
                    dot: {
                        bottom: "-41%"
                    },
                    script(self) {
                        self.$router.push("/c2cMenu");
                    }
                },
                {
                    el: ".userMenu li:nth-last-of-type(2)",
                    text: "点击新手指引，可重新观看步骤。",
                    tips: {
                        top: "-209%"
                    },
                    dot: {
                        bottom: "-58%"
                    },
                    btn: {
                        bottom: 0,
                        top: "10%"
                    },
                    script(self) {
                        self.$router.push("/user");
                    }
                }
            ],
            odshow:false,
            od:{}
        };
    },
    created () {
        // console.warn(this.$route.path)
        
        // if (this.$route.path=='/') {
        //     this.$router.push("/contract")  
        // }
        // console.warn(this.user);
        
    },
    watch: {
        $route(v, o) {
            // console.log(v, o);
            // console.warn(v.path)
            // console.log(this.$store.state.ready);
            this.setTimer()
            this.$nextTick(() => this.move());
            if (v.query.start && v.path == "/" && o.path == "/user") {
                // this.$nextTick(()=>this.$store.commit('onready'))
                this.$nextTick(() => (this.show = true));
            }
            //判断是否第一次进入 
            if (
                v.path == "/" &&
                !window.localStorage.newbieguide &&
                this.$cookie.get("_auth")
            ) {
                window.localStorage.newbieguide = 1;
                this.show = true;
            }
        },
        ready(v) {
            this.$nextTick(() => this.move());
            console.log(v);
        },
        show(v){
            if (v==true) {
                console.warn(v);
                document.querySelector('html').style.overflow='hidden'
            }else{
                document.querySelector('html').style.overflow=''
            }
            
        }
    },
    computed: {
        ready() {
            console.log(this.$store.state.ready);
            return this.$store.state.ready;
        },
        current() {
            //当前步骤
            return this.step[this.now];
        }
    },
    updated() {
        // this.move()
    },
    methods: {
        getOption(el, hasparent) {
            //获取配置
            // console.log(el,el.offsetTop);
            var top = el.offsetTop;
            var left = el.offsetLeft;
            if (hasparent) {
                // console.log(hasparent,'hasparent');
                // console.log(el.offsetParent.offsetTop,el.offsetParent);
                top = el.offsetParent.offsetTop + el.offsetTop;
                // left=el.offsetParent.offsetLeft
            }
            return {
                w: el.offsetWidth,
                h: el.offsetHeight,
                top,
                bottom:
                    document.documentElement.clientHeight -
                    top -
                    el.offsetHeight,
                left,
                right:
                    document.documentElement.clientWidth - left - el.offsetWidth
            };
        },
        move(hasparent) {
            if (!this.show) {
                return;
            }
            // new Promise((resolve, reject)=>{
            //     console.log(document.querySelector('.index_type'));
            //     if (document.querySelector('.index_type')) {
            //         resolve()
            //     }
            // })
            // console.log(this.$store.state.ready);

            if (!this.ready) {
                return;
            }
            var el = document.querySelector(this.current.el);
            console.log(el);

            // var o=Object.assign(this.getOption(el),this.current)
            var o = this.getOption(el, hasparent);
            var btn = document.querySelector(".btn");
            // var w = el.offsetWidth;
            // var h = el.offsetHeight;
            // var top = el.offsetTop + 197;
            // var bottom = document.documentElement.clientHeight - top - h;
            // var left = el.offsetLeft;
            // var right = document.documentElement.clientWidth - left - w;
            console.log(o);
            var mark = document.querySelector(".mark");
            mark.style.height = o.h + "px";
            mark.style.width = o.w + "px";
            mark.style.borderWidth = `${o.top}px ${o.right}px ${o.bottom}px ${
                o.left
            }px`;
        },
        next() {
            //下一步
            // this.$router.push(this.current.next)
            this.now++;
            if (this.current.script) {
                this.current.script(this);
            }
        },
        finish() {
            this.show = false;
            this.now = 0;
        },
        setTimer(){
            if (this.timer) {
                clearInterval(this.timer)
            }
            this.getsell()
            this.timer=setInterval(()=>{
                this.getsell()
            },2000)
        },
        getsell(){//获取最新平仓
            if (!this.$cookie.get('_auth')) {
                return
            }
            console.log('查询最新平仓');
            this.$axios.post('api/trade/contract/recent').then(res=>{
                if (!res.data.errorCode) {
                    if (res.data.data[0]) {
                        if (sessionStorage.getItem('sellid')==res.data.data[0].id) {
                            // console.log('xiangtong',sessionStorage.getItem('sellid'),this.od.id);
                            return
                        }
                        this.od=res.data.data[0]
                        sessionStorage.sellid=res.data.data[0].id
                         this.$dialog.confirm({title: '温馨提示',message:'您有一条订单被平仓!点击查看订单详情'}).then(()=>{
                            this.odshow=true
                            
                        }).catch(()=>{})
                    }
                   
                }
            })
            
        }
    }
};
// a.offsetHeight
// a.offsetWidth
// a.offsetTop//到顶
// document.documentElement.clientHeight-a.offsetTop-a.offsetHeight//到底
// a.offsetLeft//到左
// document.documentElement.clientWidth - div.offsetLeft - div.offsetWidth
</script>

<style lang="less">
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    color: #2c3e50;
    background: #f7f8f9;
    /*padding-bottom: 61px;*/
    /*min-height: calc(100% - 61px);*/
    /*position: relative;*/
    /*overflow: hidden;*/
}
.changeBG {
    position: absolute;
    width: 100%;
    background: #fff;
    padding-bottom: 61px;
}
/*@media screen and (min-width: 640px){*/
/*#app {*/
/*max-width: 54rem;*/
/*margin: auto;*/
/*}*/
/*}*/
/* 新手指引 */
.mark {
    position: fixed;
    /* width: 302px;
    height: 35px; */
    top: 0;
    left: 0;
    /* border-width: 377px 36px 254px 37px; */
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.6);
    z-index: 99999;
}
.dot {
    box-sizing: content-box;
    width: 10px;
    height: 10px;
    border: 5px solid rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 10;
    position: absolute;
    transition: all 0.5s ease;
    left: 50%;
    transform: translateX(-50%);
    /* bottom: -63%; */
}
.dot::before {
    content: "";
    height: 56px;
    width: 1px;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.7);
    left: 50%;
    transform: translateX(-50%);
    top: 100%;
}
.btn {
    height: 40px;
    width: 15rem;
    border-radius: 5px;
    background: transparent;
    border: 2px solid #fff;
    color: #fff;
    font-weight: 500;
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000000;
}
.des {
    /* ; */
}
.des p {
    color: #fff;
}
.tips {
    position: absolute;
    width: 15rem;
    text-align: center;
    left: 50%;
    transform: translateX(-50%);
    transition: all 0.5s ease-out;
    /* top: -72% */
}
.aa {
    box-sizing: content-box;
    border: 10px solid rgba(0, 0, 0, 0.36);
    background: 0 0;
    border-radius: 60px;
    height: 50px;
    width: 50px;
    animation: jspulse 3s ease-out;
    animation-iteration-count: infinite;
    position: absolute;
    top: -30px;
    left: -30px;
    z-index: 1;
    opacity: 0;
}
@keyframes jspulse {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    25% {
        transform: scale(0);
        opacity: 0.1;
    }
    50% {
        transform: scale(0.1);
        opacity: 0.3;
    }
    75% {
        transform: scale(0.5);
        opacity: 0.5;
    }
    100% {
        transform: scale(1);
        opacity: 0;
    }
}
.loading .mask {
    top: 0;
    left: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    opacity: 0.6;
    background: #000;
    z-index: 99999;
}
.loading .loading {
    padding: 10px;
    border-radius: 3px;
    background-color: transparent;
    top: 50%;
    left: 50%;
    position: fixed;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}
/* // 下单后弹出详情 */

    .appbtn2{
            height: 30px;
        width: 15rem;
        border-radius: 7px;
        background: #3283fa;
        color: #fff;
        font-weight: 500;
    }
    .apppop{
        width: 70%;
        border-radius: 7px;
        padding: 1rem 0;
        .van-cell{
            padding: 5px 10px;
            color: #828282;
        }
        .btn1{
            width: 100%;
            text-align: center;
            margin-top: 1rem;
        }
        h3{
            text-align: center;
        }
    }
    .btnColor{
        display: inline-block;
        width: auto !important;
        background: #0088f1;
        color: #fff;
        padding: .3rem;
        border-radius: .3rem;
        font-size: 1rem;
    }


</style>
