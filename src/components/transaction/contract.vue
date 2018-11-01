<template>
    <div class="">
        <!-- 余额 头 -->
        <div class="contract-head" style="pointer-events: auto;">
            <dl>
                <dt>
                    <span>{{this.coin}}余额：{{Number(money).toFixed(4)}}</span>
                </dt>
                <dd>
                    <router-link to="/c2c">充值</router-link>
                    <router-link to="/conBills">订单管理</router-link>
                </dd>
            </dl>
        </div>
        <!-- 什麼什麼合約 -->

        <div class="contract-nav">
            
            <div class="nav-list">
                <ul class="clearfix">
                    <li :class="{'nav-acts':index==navacts}" @click="navacts=index" v-for="(i,index) in typelist" :key="index">
                        <span>{{i}}合约</span>
                    </li>
                </ul>
            </div>

        </div>
        <!-- swiper -->
        <div class="swiper">
            <swiper :options="swiperOption" ref="mySwiper" @slideChange='slideChange()'>
                <!-- slides -->
                <swiper-slide v-for="(i,index) in list" :key="index">
                    <div class="icon">
                        <i class="iconfont" :class="`icon-icon${navacts+5}`"></i>
                    </div>
                    <div class="swiper-right">
                        <!-- <p class="swiper-right-coin-span">{{i.name}}</p> -->
                        <p class="swiper-right-coin-p">{{i.marginRate}} {{i.unitsCode}}/手</p>
                    </div>
                    <!-- <p class="swiper-coin-p">最小波动:{{i.minFluctuate}} {{i.unitsCode}} </p> -->
                    <!-- <p class="swiper-coin-p">波动1{{i.exchangeCode}}，盈亏{{i.pointPrice}}{{i.unitsCode}} </p> -->
                    <p class="swiper-coin-p">{{i.description.split('，')[0]}}, </p>
                    <p class="swiper-coin-p">{{i.description.split('，')[1]}} </p>
                </swiper-slide>
            </swiper>
        </div>
        <!-- echarts -->
        <div class="charts">
            <div class="charts-head">
                <dl>
                    <dd>
                        <span style="font-size: 1.3rem;">当前价：{{market.price}}</span>
                        <i v-if="up<0" class="iconfont icon-jiantou-copy-copy-copy"></i>
                        <i v-else class="iconfont icon-jiantou-copy-copy"></i>
                    </dd>
                </dl>
            </div>
            <div class="charts-can">
                <!-- <echart :klinedata='klinedata' v-if="this.klinedata.length" /> -->
                <div id="mchart"></div>
            </div>
            <div class="charts-tab clearfix">
                <span @click="intervalact=1">分时</span>
                <ul class="clearfix">
                    <li :class="{'charts-active':intervalact===i.code }" v-for="(i,index) in interval" :key="index" @click="intervalact=i.code">
                        {{i.name}}
                    </li>
                </ul>
            </div>
        </div>
        <!-- 買漲買跌 -->
        <div class="charts-but" style="pointer-events: auto;">
            <button class="rise" @click="orderpopup(0)">买涨
                <i class="iconfont icon-jiantou-copy-copy"></i>
            </button>
            <button class="fall" @click="orderpopup(1)">买跌
                <i class="iconfont icon-jiantou-copy-copy-copy"></i>
            </button>
        </div>
        <!-- 底下的不知道啥玩意 -->
        <div class="contract-order" style="pointer-events: auto;">
            <div class="order-head">
                <dl>
                    <dt>
                        总保证金： {{totalprofit.amount}} {{this.coin}}
                    </dt>
                    <dd>
                        浮动盈亏：
                        <em class="risefont">{{totalprofit.profit}} {{this.coin}}</em>
                    </dd>
                </dl>
            </div>
            <!-- 最新成交 -->
            <div class="coin-new">
              <h6>当前持仓</h6>
              <table border="0" cellpadding="0" cellspacing="0">
                <tbody>
                  <tr style="text-align:center;">
                    <!-- <td>价格</td> -->
                    <td>币种</td>
                    <td>手数/方向</td>
                    <td>时间</td>
                    <td>详情</td>
                    <td>操作</td>
                  </tr>
                  <tr v-for="(i,index) in latestdeal" :key="index">
                    <!-- <td>{{i.buyPoint }}</td> -->
                    <td>{{i.symbol}}</td>
                    <td>{{i.hands}}手/{{i.direction==0?'涨':'跌'}}</td>
                    <td>{{i.buyTime.split(' ')[1]}}</td>
                    <td><em class="btnColor" @click="look(index)">详情</em></td>
                    <td><em class="btnColor" @click="sell(i.id)">平仓</em></td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
        <!-- 买涨买跌弹出框 -->
        <transition name="popup">
            <div id="Business" v-show="popupshow">
                <div class="bus-cel">
                    <i class="iconfont icon-iconfontguanbi" @click="popupshow=false"></i>
                </div>
                <div class="business-num">
                    <dl>
                        <dt>
                            <span v-if="list[swiperindex]">所需保证金：{{earnestmoney}} {{this.coin}}</span>
                        </dt>
                        <dd>
                            <div class="num-but clearfix">
                                <span class="reduce" @click="orderlist.hands--">-</span>
                                <input type="number" min="0" v-model="orderlist.hands">
                                <span class="plus" @click="orderlist.hands++">+</span>
                            </div>
                            <p v-if="list[swiperindex]">平仓手续费：{{orderlist.hands*list[swiperindex].fee}} {{this.coin}}</p>
                        </dd>
                    </dl>
                </div>
                <div class="business-tab">
                    <div class="bus-tab-top clearfix">
                        <span>止盈</span>
                        <ul>
                            <li :class="{'red-active':orderlist.profitPoints===i.content}" @click="orderlist.profitPoints=i.content" v-for="(i,index) in StopProfit" :key="index">{{i.title}}</li>
                        </ul>
                    </div>
                    <div class="bus-tab-top clearfix">
                        <span>止损</span>
                        <ul>
                            <li :class="{'bus-active':orderlist.lossPoints===i.content}" @click="orderlist.lossPoints=i.content" v-for="(i,index) in TrailingStop" :key="index">{{i.title}}</li>
                        </ul>
                    </div>
                </div>
                <div class="busin-but">
                    <button class="rise" v-if="!orderlist.direction" @click="order">确定买涨</button>
                    <button class="fall" v-else @click="order">确定买跌</button>
                </div>
            </div>
        </transition>
        <!-- 下单后弹出 -->
        <van-popup v-model="odshow">
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
                    <button class="btn2" @click='odshow=false'>确定</button>
                </div>
            </van-cell-group>
        </van-popup>
    </div>
</template>

<script type="">
import "swiper/dist/css/swiper.css";

import { swiper, swiperSlide } from "vue-awesome-swiper";
// import echart from "./echart/index";
import line from "../../../static/js/line.js";

export default {
    name: "contract",
    data() {
        return {
            odshow:false,
            od:{//订单详情
                // buyPoint: 6770,
                // buyTime: "2018-10-17 16:44:43",
                // direction: "0",
                // eachNumber: "0.2000",
                // fee: 3,
                // hands: "1",
                // id: "223",
                // lossPoints: 6750,
                // marketCode: "HBBTCUSDT",
                // orderPrice: 20,
                // pointPrice: 0.5,
                // profitPoints: 6810,
                // serialNo: "HT153976588845461820",
                // status: "0",
                // symbol: "BTC/USDT",
                // userId: "37",
            },
            swiperOption: {
                //swiper配置
                effect: "coverflow", //切换方式
                slidesPerView: 3, //显示几个
                centeredSlides: true,
                coverflowEffect: {
                    rotate: 0, //3d旋转时Y轴的旋转角度
                    stretch: 0, //每个slide之间的拉伸值
                    depth: 20, //离y轴的距离 越大越小
                    modifier: 10, //旋转倍数
                    slideShadows: false //阴影
                },
                // initialSlide: 2, //初始选项
                observer: true, //监视器
                observeParents: true,
                // on:{
                //     slideChange: function(){
                //         console.log(this.activeIndex);//切换结束时，告诉我现在是第几个slide
                //     }
                // }
            },
            popupshow: false, //买涨买跌弹出框显示
            typelist: [], //类型列表
            navacts: 0, //navbar 选择
            list: [], //合约列表查询
            klinedata:[],//k线数据
            fsdata:[],//分时线数据
            fstime:[],//分时线时间
            line:new line(),//
            interval:[//k线区间
                {code:'1',name:'1分钟'},
                {code:'5',name:'5分钟'},
                // {code:'15',name:'15分钟'},
                {code:'30',name:'30分钟'},
                {code:'1h',name:'1小时'},
                {code:'1d',name:'日线'}],
            intervalact:1,//k线默认选择
            fstimer:null,//分时线定时器
            fsclear:false,//分时线清除
            orderlist:{//下单列表
                contractId:'',//合约ID
                direction:'',//方向 0:买涨 1:买跌
                hands:1,//手数
                lossPoints:'0.1',//止损点(如 50% 为0.5)
                profitPoints:'0.1'//止盈点(如 50% 为0.5)
            },
            lastdirection:null,//上次选择的方向
            StopProfit:['0.1','0.2','0.4','0.6','0.8','1'],//止盈
            TrailingStop:['0.1','0.3','0.4','0.5','0.6','0.7'],//止损
            swiperindex:0,//swiperindex
            markettimer:null,//行情定时器
            market:{},//当前行情
            up:1,//
            money:0,//coin余额
            totalprofit:{//总盈亏
                amount:0,
                profit:0
            },
            latestdeal:[],//最新成交
            marketall:[],//全部行情
        };
    },
    components: {
        swiper,
        swiperSlide,
        // echart
    },
    computed: {
        swiper() {//swiper对象            
            return this.$refs.mySwiper.swiper;
        },
        swiperactive(){//swiper当前选择选项卡
            return this.list[this.swiper.activeIndex]
        },
        earnestmoney(){//保证金
            return this.list[this.swiperindex].marginRate* this.orderlist.hands
        },
        coin(){//当前合约货币
            if (this.typelist.length) {
                return this.typelist[this.navacts].split('/')[1]
            }
           return '--'
        },
        // orderlist(){
        //     return {//下单列表
        //         contractId:this.swiperactive.id,//合约ID
        //         direction:'',//方向 0:买涨 1:买跌
        //         hands:'',//手数
        //         lossPoints:'',//止损点(如 50% 为0.5)
        //         profitPoints:''//止盈点(如 50% 为0.5)
        //     }
        // }
    },
    created() {
        this.gettype();
        this.getmoney()
        this.gettotalprofit()
        this.getlatestdeal()
        
    },
    beforeDestroy(){
        clearInterval(this.markettimer);
        clearInterval(this.fstimer);
        this.markettimer=null;
        this.fstimer=null;
        this.$store.commit('unready')
    },
    watch: {
        navacts() {//nav切换时重新请求列表
            this.getlist();
            this.setmarkettimer()
        },
        intervalact(){//k线选择变更时
            this.setfstimer(true);
        },
        'orderlist.hands'(v){//手数
            if (v<0) {
                this.orderlist.hands=0
            }
            if (v>this.list[this.swiperindex].sumHandsLimit) {
                this.orderlist.hands=this.list[this.swiperindex].sumHandsLimit
            }
        },
        coin(){
            this.getmoney()
        }
    },
    methods: {
        getStopProfit(){//获取止盈
            var arr=[]
            var maxprofit = 1*100
            var profitPoints = (+this.list[this.swiperindex].profitPoints).toFixed(1)
            this.orderlist.profitPoints=profitPoints
            for (let i = 20; i <= maxprofit; i+=20) {
                arr.push({
                    title:`${i}%`,
                    content:i/100
                })
            }
            arr.unshift({
                title:'默认',
                content:profitPoints
            })
            console.log(arr);
            this.StopProfit=arr
        },
        getTrailingStop(){//获取止损列表
            var arr=[]
            var maxloss = this.list[this.swiperindex].maxLossPoints*100
            var lossPoints = (+this.list[this.swiperindex].lossPoints).toFixed(1)
            this.orderlist.lossPoints=lossPoints
            for (let i = 30; i <= maxloss; i+=10) {
                arr.push({
                    title:`${i}%`,
                    content:i/100
                })
            }
            arr.unshift({
                title:'默认',
                content:lossPoints
            })
            console.log(arr);
            this.TrailingStop=arr
            // return arr
        },
        getmoney(){//获取账户余额
            if (this.$cookie.get('_auth')) {
                this.$axios.post(`api/assets/query?type=2`).then(res=>{
                    if (!res.data.errorCode) {
                        console.log(res);
                        res.data.data.forEach((item)=>{
                            console.log(item);
                            if (item.currencyCode==this.coin) {
                                this.money=item.amount
                            }
                        })
                    }
                })
            }
        },
        slideChange(){//列表切换
            this.swiperindex=this.swiper.activeIndex
            console.log(this.list[this.swiperindex])
            
        },
        gettype() {
            //获取合约类型
            this.$axios.post("api/trade/contract/type").then(res => {
                    if (!res.data.errorCode) {
                        this.typelist = res.data.data;
                        this.getlist();
                        console.log();
                    }
                }).catch(err => {
                    
                });
        },
        getlist() {
            //获取合约列表
            this.$axios.post(`api/trade/contract/list_query?contractType=${this.typelist[this.navacts]}`).then(res => {
                    if (!res.data.errorCode) {
                        this.list = res.data.data;
                        console.log(this.list);
                        this.setfstimer();
                        this.setmarkettimer()
                        this.getStopProfit()
                        this.getTrailingStop()
                        // this.$nextTick(()=>this.swiper.slideTo(1, 500, false))
                    }
                }).catch(err => {});
        },
        setfstimer(clear){//设置分时定时器
            if (this.intervalact===1) {
                if (this.fstimer) {//如果有定时器
                    clearInterval(this.fstimer)
                    this.fstimer=null
                    this.getkline(clear);
                }else{//没有调用一次
                    this.getkline(clear);
                }
                this.fstimer=setInterval(()=>{
                    this.getkline()
                },1*60*1000)
            }else{
                clearInterval(this.fstimer)
                this.fstimer=null
                this.getkline()
            }
        },
        setmarkettimer(){//行情定时器
            if (this.markettimer) {
                clearInterval(this.markettimer)
                this.markettimer=null
                this.getmarket()
            }else{
                this.getmarket()
            }
            this.markettimer=setInterval(()=>{
                this.getmarket()
                this.gettotalprofit()
            },1000)

        },
        getkline(clear) {//获取k线        
            this.$axios({
                url: "api/market/kline_data",
                method: "post",
                data: {
                    code: this.list[0].marketCode,
                    interval: this.intervalact,
                     rows:'50',
                    // beginTime:'',
                    // endTime:'',
                }
            }).then(res => {
                if (this.intervalact===1) {//分时
                    this.splitdata(res.data.data);
                    this.line.fsline(this.fstime,this.fsdata,'mchart',clear)
                    return
                }
                this.splitkdata(res.data.data);
                this.line.kline(this.klinedata,'mchart')
            });
        },
        splitdata(fsdata) {
            //分割分时线数据
            this.fstime=[]
            this.fsdata=[]
            for (var i = 0; i < fsdata.length; i++) {
                this.fstime.push(fsdata[i].time.split(" ")[1]);
                this.fsdata.push(fsdata[i].close); // 收盘
            }
        },
        splitkdata(klinedata) {//分割k线数据
            this.klinedata=[]
            for (var i = 0; i < klinedata.length; i++) {
                // this.kdate.push(klinedata[i].time);
                var arr = [];
                var date=klinedata[i].time.split(' ')[1]
                if (this.intervalact=='1d') {
                    date=klinedata[i].time.split(' ')[0]
                }
                arr.push(
                    date,
                    +klinedata[i].open,
                    +klinedata[i].close,
                    +klinedata[i].high,
                    +klinedata[i].low
                );                
                this.klinedata.push(arr);
            }
        },
        orderpopup(direction){//弹出下单框
            if (this.lastdirection!=null) {
                if (this.lastdirection==direction) {
                    this.popupshow=!this.popupshow
                }else{
                    this.popupshow=true
                }
            }else{
                this.popupshow=true
            }
            this.lastdirection=direction
            this.orderlist.direction=direction
            
        },
        order(){//下单
            if (!this.$cookie.get('_auth')) {
                this.$toast('请登录后下单')
                this.$router.push('/login')
                return
            }
            if (!this.money) {
                this.$toast('请充值后下单')
                this.$router.push('/c2c')
                return
            }
            if (!this.orderlist.hands) {
                this.$toast('委托数量错误')
                return
            }
            this.orderlist.contractId=this.list[this.swiperindex].id
            this.popupshow=false
            this.$axios({
                url:'api/trade/contract/place_order',
                method:'post',
                data:this.orderlist
            }).then(res=>{
                if (!res.data.errorCode) {
                    this.$toast('下单成功!')
                    this.gettotalprofit()
                    this.getlatestdeal()
                    this.od=res.data.data
                    this.odshow=true
                }
            })
        },
        getmarket(){//获取行情
            var marketCode=this.list[0].marketCode
            if (this.latestdeal.length) {
                var arr=[]
                arr.push(this.list[0].marketCode)
                this.latestdeal.map(i=>{
                    arr.push(i.marketCode)
                })
                marketCode=[...new Set(arr)].join(',')
                // console.log([...new Set(arr)].join(','));//es6数组去重
            }
            this.$axios.get(`api/market/latest_market?codes=${marketCode}`).then(res=>{
                if (!res.data.errorCode) {
                    this.marketall=res.data.data
                    this.selectMarket(res.data.data)
                    this.$nextTick(()=>this.$store.commit('onready'))                
                }
            }).catch(err=>{

            })
        },
        selectMarket(newData){//选择当前行情
            if (this.market.bp1) {
                newData.map(i=>{
                    if (i.code==this.list[0].marketCode) {
                        if (i.price<this.market.price) {
                            console.warn(i.price<this.market.price);
                            this.up=-1
                        }else if(i.price>this.market.price){
                            this.up=1
                        }
                    }
                })
            }
            this.marketall.forEach((i, index) => {
                if (i.code == this.list[0].marketCode) {
                    this.market = i;
                }
            });
        },
        gettotalprofit(){//获取总盈亏
            if (!this.$cookie.get('_auth')) {
                return
            }
            // this.$axios.post('api/trade/contract/statistics').then(res=>{
            //     // console.log(res);
            //     if (!res.data.errorCode) {
            //         this.totalprofit=res.data.data
            //     }
            // }).catch(err=>{

            // })
            var totalprofit={
                amount: 0,//保证金
                profit: 0,//手续费
                fees:0,//手续费
            }
             this.latestdeal.forEach((item,index)=>{
                this.marketall.forEach((i) => {
                    if (item.marketCode==i.code) {
                        this.$set(item,'price',i.price)
                    }
                    if(item.direction== '0'){//当前价 - 建仓价 （买涨）
                        this.$set(item , 'fdyk', Number(item.hands*((item.price) - (item.buyPoint) )* item.pointPrice).toFixed(2));
                    }else if (item.direction == '1'){//建仓价 - 当前价 （买跌）
                        this.$set(item , 'fdyk', Number(item.hands*((item.buyPoint) - (item.price) )* item.pointPrice).toFixed(2));
                    }
                })
                totalprofit.fees+=item.fee
                totalprofit.amount+=item.orderPrice
                totalprofit.profit+=(+item['fdyk'])
                
            })
            totalprofit.profit=totalprofit.profit.toFixed(4)
            Object.assign(this.totalprofit,totalprofit)
        },
        getlatestdeal(){//获取最新订单
            if (!this.$cookie.get('_auth')) {
                return
            }
            this.$axios.post(`api/trade/contract/trade_query?start=0&rows=5&status=0`).then(res=>{
                // console.warn(res);
                if (!res.data.errorCode) {
                    this.latestdeal=res.data.page.data
                }
            })
        },
        look(i){//打开最新行情
            // console.log(this.latestdeal[i],i);
            this.od=this.latestdeal[i]
            this.odshow=true
        },
        sell(id){//平仓
            this.$dialog.confirm({
            title: '确认平仓?',
            }).then(()=>{
                this.$axios.post(`api/trade/contract/do_sell?tradeId=${id}`).then(res=>{
                    if (!res.data.errorCode) {
                        this.$toast('平仓成功')
                        this.latestdeal=[]
                        this.getlatestdeal()
                        this.od=res.data.data[0]
                        // this.odshow=true
                        // this.$dialog.confirm({title: '平仓成功!是否查看订单详情?',}).then(()=>{
                        // }).catch(()=>{})
                    }
                })
            }).catch(()=>{})
        },
    }
};
</script>

<style scoped lang="less">
.van-hairline--top-bottom::after {
    border-width: 0;
}
#mchart{
    height: 100%;
    width: 100%;
}
.popup-enter-active,
.popup-leave-active {
    transition: transform 0.2s;
}
.popup-enter,
.popup-leave-to {
    transform: translateY(100%);
}
// 余额 头
.contract-head {
    height: 3.47rem;
    line-height: 3.47rem;
    background: #0088f1;
    dl {
        display: flex;
        padding: 0 1.2rem;
        dt {
            flex: 1;
            color: #fff;
            font-size: 1rem;
        }
        dd a {
            display: inline-block;
            padding: 0 0.86rem;
            height: 1.73rem;
            line-height: 1.73rem;
            background: #fff;
            color: #0088f1;
            border-radius: 0.43rem;
            // margin-left: 1.2rem;
            font-size: 1rem;
        }
        dd {
            flex: 1;
            text-align: right;
        }
    }
}
// 什麼什麼合約
.contract-nav {
    pointer-events: auto;
    padding: 0 1.15rem;
    background: #fff;
    height: 2.5rem;
    position: relative;
    border-bottom: 0.33px solid #e6e6e6;
    .nav-list {
        position: absolute;
        top: 0;
        left: 1.15 rem;
        right: 1.15 rem;
        bottom: 0;
        z-index: 1;
        overflow: hidden;
        top: 0;
        left: 0;
        right: 0;
        z-index: 99;
        overflow: hidden;
        position: absolute;
        ul{
            overflow: hidden;
            overflow-x: auto;
            height: 100%;
            /* padding-bottom: 15px; */
            /* box-sizing: content-box; */
            display: flex; 
            position: relative;
        }
        ul li {
            pointer-events: auto;
            float: left;
            width: 9.5rem;
            text-align: center;
            font-size: 11.66px;
            line-height: 2.5rem;
            font-size: 1rem;
            flex: 0 0 33.333%;
            span {
                line-height: 2.1rem;
                display: inline-block;
            }
        }
        ul .nav-acts {
            color: #0088f1;
            > span {
                border-bottom: 1px solid #0088f1;
            }
        }
    }
}
// swiper
.swiper {
    height: 5rem;
    .swiper-slide {
        border: 1px solid #ddf1ff;
        background: #f5fbfe;
        padding: 0 0.8rem;
        box-sizing: border-box;
        .icon{
            position: absolute;
        }
        div i {
            font-size: 2rem;
            color: #9eaab8;
            // position: relative;
            // top: 1.125rem;
            // left: 0.5rem;
        }
        .swiper-right {
            font-size: 0.38rem;
            color: #000;
            text-align: left;
            text-indent: 2rem;
            position: relative;
            // top: -2rem;
            right: -0.2rem;
            > p {
                margin-top: 0.3rem;
                font-size: 0.86rem;
            }
        }
        .swiper-coin-p {
            width: 100%;
            font-size: 0.86rem !important;
            // position: absolute;
            bottom: 0.625rem;
            text-align: left;
            left: 0rem;
            text-indent: 1rem;
        }
    }
}
// echarts
.charts {
    padding: 0 1.15rem 0.5rem;
    .charts-head {
        font-size: 10px;
        height: 1.3rem;
        line-height: 1.3rem;
        dl {
            display: flex;
            dd {
                -ms-flex: 1;
                -webkit-box-flex: 1;
                -webkit-flex: 1;
                flex: 1;
                text-align: right;
                color: #0088f1;
                > i {
                    font-size: 10px;
                    padding-left: 1px;
                }
            }
        }
    }
    .charts-can {
        height: 17rem;
        position: relative;
    }
    .charts-tab {
        span {
            display: inline-block;
            width: 3.58rem;
            height: 1.44rem;
            line-height: 1.44rem;
            text-align: center;
            float: left;
            margin-right: 1.15rem;
            font-size: 1rem;
        }
        ul {
            float: left;
            li {
                float: left;
                width: 3.58rem;
                height: 1.38rem;
                border-radius: 0.72rem;
                border: 0.66px solid #99d1ff;
                text-align: center;
                line-height: 1.38rem;
                font-size: 10px;
                color: #0088f1;
                margin-right: 0.75rem;
            }
            .charts-active {
                color: #fff !important;
                border: 0.66px solid #0088f1;
                background: #0088f1;
            }
        }
    }
}
// 買漲買跌
.charts-but {
    height: 3.93rem;
    background: #f9fafc;
    text-align: center;
    padding-top: 0.75rem;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    > button {
        width: 10.87rem;
        height: 2.6rem;
        border-radius: 5px;
        border: 0;
        outline: none;
        margin-right: 2.6rem;
        position: relative;
        color: #fff;
        font-size: 1.1rem;
        > i {
            position: absolute;
            top: 0.72rem;
            right: 2.6rem;
            font-size: 1rem;
        }
    }
    > button:last-child {
        margin-right: 0;
    }
    .fall {
        background: #0088f1 !important;
        color: #fff !important;
    }
    .rise {
        background: #ff3b3b !important;
        color: #fff !important;
    }
}
// 下面的不知道啥玩意
.contract-order {
    color: #787878;
    background: #f9fafc;
    .order-head {
        padding: 0 1.15rem;
        height: 2rem;
        line-height: 2rem;
        font-size: 1rem;
        dl {
            display: flex;
            dt {
                flex: 2.6;
            }
            dd {
                flex: 3;
                .risefont {
                    color: #ff3b3b !important;
                }
            }
        }
    }
}
// 最新成交
.coin-new {
    padding: 0 1.5rem;
    margin-bottom: 10rem;
    > h6 {
        border-bottom: 0.66px solid #d4d4d4;
        line-height: 2.66rem;
        font-size: 1.1rem;
    }
    > table {
        width: 100%;
        tr{
            text-align: center;
            //  padding-bottom: .3rem;
            
        }
        td{
           padding: .5rem 0;
        }
        tr:first-child td {
            font-size: 11.66px;
            line-height: 1.9rem;
            text-align: center;
            width: 20%;
        }
    }
}
//买涨买跌弹出框
#Business {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
    background: #fff;
    -webkit-box-shadow: 0 -4px 0.5rem #b0acaa;
    box-shadow: 0 -4px 0.5rem #b0acaa;
    padding: 0.5rem 1.15rem 1.15rem;
    transition-duration: 0.2s;
    .bus-cel {
        text-align: right;
        height: 1.73rem;
        > i {
            line-height: 1.44rem;
            display: inline-block;
            margin-top: -0.5rem;
        }
    }
    .business-num {
        border-bottom: 0.6px dashed #c8c8c8;
        padding-bottom: 1.15rem;
        dl {
            display: flex;
            dt {
                flex: 1;
                line-height: 2.89rem;
            }
            dd {
                flex: 1;
                text-align: right;
                .num-but {
                    display: inline-block;
                    height: 2rem;
                    line-height: 2rem;
                    border: 0.66px solid #0088f1;
                    border-radius: 0.5rem;
                    overflow: hidden;
                    > span {
                        display: inline-block;
                        width: 2.19rem;
                        height: 2rem;
                        text-align: center;
                        float: left;
                        -webkit-box-sizing: border-box;
                        box-sizing: border-box;
                    }
                    .reduce {
                        font-size: 20px;
                        border-right: 0.66px solid #0088f1;
                        line-height: 1.9rem;
                    }
                    .plus {
                        font-size: 20px;
                        border-left: 0.66px solid #0088f1;
                        line-height: 1.9rem;
                    }
                    > input {
                        float: left;
                        width: 4.86rem;
                        height: 2rem;
                        border: 0;
                        margin-top: 0.3px;
                        text-align: center;
                        outline: none;
                    }
                }
                > p {
                    font-size: 10px;
                    padding-top: 0.5rem;
                    color: #787878;
                }
            }
        }
    }
    .business-tab {
        .bus-tab-top {
            padding-top: 1.15rem;
            font-size: 11px;
            position: relative;
            > span {
                display: inline-block;
                width: 13%;
                line-height: 2.19rem;
                float: left;
                position: absolute;
                top: 1.15rem;
                left: 0;
            }
            > ul {
                float: left;
                margin-left: 13%;
                display: flex;
                width: 87%;
                border: 0.66px solid #e5e5e5;
                border-radius: 0.5rem;
                overflow: hidden;
                > li {
                    -ms-flex: 1;
                    -webkit-box-flex: 1;
                    -webkit-flex: 1;
                    flex: 1;
                    height: 2.14rem;
                    line-height: 2.14rem;
                    text-align: center;
                    border-right: 0.66px solid #e5e5e5;
                    box-sizing: border-box;
                    color: #000;
                }
                .red-active {
                    background: #ff3b3b;
                    color: #fff !important;
                }
                .bus-active {
                    background: #0088f1;
                    color: #fff !important;
                }
            }
        }
    }
    .busin-but {
        text-align: center;
        padding: 1.3rem 0 0.3rem;
        > button {
            width: 13.3rem;
            height: 2.31rem;
            color: #fff;
            outline: none;
            border-radius: 0.5rem;
            border: 0;
        }
        .fall {
            background: #0088f1 !important;
            color: #fff !important;
        }
        .rise {
            background: #ff3b3b !important;
            color: #fff !important;
        }
    }
    
}
// 下单后弹出详情
.btn2{
        height: 30px;
    width: 15rem;
    border-radius: 7px;
    background: #3283fa;
    color: #fff;
    font-weight: 500;
}
.van-popup{
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
