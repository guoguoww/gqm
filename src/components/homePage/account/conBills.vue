<template>
  <div class="changeBG">
    <div class="head">
      <i class="iconfont icon-fanhui" @click="back"></i>
      <span>合约账单</span>
    </div>
    <div class="tabContent">
      <van-tabs  :swipe-threshold=5 v-model="tab">
      
        <van-tab v-for="(i,index) in title" :key="index">
          <div slot="title" >{{i}}</div>
          <div class="curOrderCon">
            <p class="curHold"><span>合约/方向</span><span>保证金/手续费</span><span>建仓价</span><span>{{tab==0?'浮动盈亏':'盈亏'}}</span><span>操作</span></p>
            <van-list v-model="l" :finished="f"  @load="load" >
              <van-cell v-for="(list,index) in tradelist" :key="index">
                <ul class="curOrderInfos" :class="list.difMoney>0?'red':'green'">
                  <li>
                    <span>{{list.pointPrice}}{{list.symbol.split('/')[0]}}/{{list.direction==0?'涨':'跌'}}</span>
                    <span>{{list.orderPrice}}/{{list.fee}}</span>
                    <span>{{list.buyPoint}}</span>
                    <span>{{(+list.difMoney).toFixed(2)}} </span>
                    <span @click="detailInfoBtn(index)" v-if="tab!=0">详情</span>
                    <span @click="sell(list.id)" v-else>平仓</span>
                    <!-- <span><em class="btnColor" @click="allUnwind(item.id)">平仓</em></span> -->
                  </li>
                </ul>
                <ul :class="{active1: curNum == index}" class="detailInfos">
                  <li>
                    <p><span>建仓时间：{{list.buyTime}}</span></p>
                    <p><span>手续费：{{list.fee}}</span><span>建仓价：{{list.buyPoint}}</span></p>
                    <p><span>手数: {{list.hands}}</span><span>合约/方向:{{(+list.eachNumber).toFixed(1)}}{{list.symbol.split('/')[0]}} /{{list.direction == '0'?'买涨':list.direction == '1'?'买跌':'无效方向'}}</span></p>
                    <p><span>止盈价：{{list.profitPoints||'--'}}</span><span>止损价：{{list.lossPoints||'--'}}</span></p>
                  </li>
                </ul>
              </van-cell>
            </van-list>
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <div class="more" @click="loadmore">
        <span v-if="totalNum==tradelist.length">没有更多数据</span>
        <span v-else>加载更多</span>
    </div>
    <!-- 下单后弹出 -->
    <!-- <van-popup v-model="odshow">
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
    </van-popup> -->
    <!-- <div class="total">
        <ul>
            <li>总盈亏:{{total.difMoney}}</li>
            <li>总保证金:{{total.orderPrice}}</li>
        </ul>
    </div> -->
    <!-- <van-dialog v-model="palshow" show-cancel-button :before-close="setpal">
      <div style="padding:1.3rem;">
        <div style="font-size:1rem; line-height:30px;display:flex;justify-content:center;margin-bottom:1rem;"> 
          <span>设置止盈点(%):</span>&nbsp;&nbsp;
          <van-stepper v-model="profitPoints" style="display: inline-block;" :min="10" :max="100" :step="10" />
        </div>
        <div style="font-size:1rem; line-height:30px;display:flex;justify-content:center;"> 
          <span>设置止损点(%):</span>&nbsp;&nbsp;
          <van-stepper v-model="lossPoints" style="display: inline-block;" :min="10" :max="70" :step="10" />
        </div>
      </div>
    </van-dialog> -->
    <div  v-if="mloading" class="m">
             <van-loading class="loading" color="white" />
            <div class="mask"></div>
    </div>
  </div>
</template>

<script>
export default {
    name: "conBills",
    data() {
        return {
            curNum: -1,
            tab:0,//tab选项
            palshow: false,//设置止盈止损是否显示
            lossPoints:50,
            profitPoints:50,
            pal:{//止盈止损参数
                tradeId:'',
                lossPoints:0.5,
                profitPoints:0.5
            },
            tradelist:[],//订单列表
            title:['目前持仓',"当日订单", "历史订单"],
            MarketTimer:null,//行情定时器
            total:{//总盈亏
                difMoney:0,
                orderPrice:0
            },
            l:false,
            f:true,
            totalNum:0,
            start:0,
            rows: 20,
            mloading:false,//loading 是否显示
            // odshow:false,//订单详情是否显示
            // od:{}//订单详情

        };
    },
    created() {
        this.gettrade()
        // window.addEventListener("scroll", this.scrollBottom);
    },
    destroyed() {
        // window.removeEventListener("scroll", this.scrollBottom);
    },
    methods: {
        // scrollBottom(){
        //   var t = document.documentElement.scrollTop || document.body.scrollTop;  //离上方的距离
        //   var h =window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; //可见宽度
        //   if( t >= document.documentElement.scrollHeight -h ) {
        //       this.loadmore()
        //   }
        // },
        setpal(action, done) {//设置止盈止损
          if (action=='cancel') {
            done()
            return
          }
          this.pal.lossPoints=this.lossPoints*0.01
          this.pal.profitPoints=this.profitPoints*0.01
          this.$axios.post('api/trade/contract/set_up_stop',this.pal).then(res=>{
                if (!res.data.errorCode){
                    this.$toast('设置成功');
                    this.start=0
                    this.tradelist=[]
                    this.gettrade();
                }
            })
            done();
          
        },
        back() {
            this.$router.go(-1);
        },
        /** */

        gettrade(){//获取交易列表
            this.mloading=true
            this.$axios.post('api/trade/contract/trade_query',{
                start:this.start,
                rows:this.rows,
                status:this.tab
            }).then(res=>{
                this.mloading=false
                // if (!res.data.page.data.length) {
                //     this.l = false;//更新完数据
                //     this.f = true;
                //     return;
                // }
                this.tradelist=[...this.tradelist,...res.data.page.data]
                // this.l = false;//更新完数据
                console.log(this.tradelist);
                this.totalNum = res.data.page.total;
                if (this.tab==0&&this.tradelist.length) {
                    this.setMarketTimer()
                    return 
                }
                this.gettotal()
                // if (this.tradelist.length >= this.totalNum) {//加载完成
                //     this.f = true;
                //     return;
                // }
            })
        },
        setMarketTimer(){//设置获取行情定时器
            if (!this.MarketTimer) {
                this.getMarket()
            }else{
                clearInterval(this.MarketTimer)
                this.getMarket()
            }
            this.MarketTimer=setInterval(()=>{
                this.getMarket()
            },1000)
        },
        getMarket(){//获取最新行情
            var codes=[]
            this.tradelist.map(i=>{
                codes.push(i.marketCode)
            })
            // console.log(codes=[...new Set(codes)].join(','));
           if (!codes.length) {
              return 
           }
            this.$axios.get(`api/market/latest_market?codes=${codes}`).then(res=>{
                this.tradelist.map(i=>{
                    res.data.data.map(item=>{
                        if (i.marketCode==item.code) {
                            this.$set(i,'price',item.price)
                        }
                        if(i.direction== '0'){//当前价 - 建仓价 （买涨）
                            this.$set(i , 'difMoney', Number(i.hands*((i.price) - (i.buyPoint) )* i.pointPrice).toFixed(2));
                        }else if (i.direction == '1'){//建仓价 - 当前价 （买跌）
                            this.$set(i , 'difMoney', Number(i.hands*((i.buyPoint) - (i.price) )* i.pointPrice).toFixed(2));
                        }
                        this.gettotal()
                    })
                })
            })
        },
        sell(id){//平仓
            this.$dialog.confirm({
            title: '确认平仓?',
            }).then(()=>{
                this.$axios.post(`api/trade/contract/do_sell?tradeId=${id}`).then(res=>{
                    if (!res.data.errorCode) {
                        this.$toast('平仓成功')
                        this.tradelist=[]
                        this.start=0
                        this.gettrade()
                        // this.od=res.data.data[0]
                        // this.odshow=true
                    }
                })
            }).catch(()=>{})
        },
        gettotal(){//获取总盈亏
            var difMoney='difMoney'
            if (this.tab==0) {
                difMoney='difMoney'
            }
            var total={
                difMoney:0,
                orderPrice:0
            }
            // console.warn(this[`conListInfos${this.tab}`]);
            
            this.tradelist.map(item=>{
                total.difMoney+=+(item[difMoney])
                total.orderPrice+=item.orderPrice
            })
            total.difMoney=total.difMoney.toFixed(2)
            this.total=total
        },
        load(){
            // this.start+=this.rows
            // setTimeout(() => {
            //     this.gettrade();
            // }, 900);
        },
        // 加载更多
        loadmore(){
            if (this.totalNum==this.tradelist.length) {
                return
            }
            this.mloading=true
            this.start+=this.rows
            this.gettrade()
        },
        detailInfoBtn(index) {
            this.curNum = this.curNum == index ? -1 : index;
        },
        /** */
    },
    beforeDestroy() {
        clearInterval(this.MarketTimer)
        this.MarketTimer=null
    },
    watch: {
        tab(v,o){
            console.log(v);
            clearInterval(this.MarketTimer)
            this.MarketTimer=null
            this.tradelist=[]
            this.totalNum=0
            this.start=0
            this.gettrade()
            this.curNum=-1
            this.total={//总盈亏
                difMoney:0,
                orderPrice:0
            }
        }

    }
};
</script>

<style scoped lang="less">
.total ul{
    display: flex;
    justify-content: space-around;
}
.head {
    height: 4rem;
    background: #0088f1;
    color: #fff;
    text-align: center;
    padding: 0 1.2rem;
    line-height: 4rem;
    font-size: 1.2rem;
}
.head i {
    position: absolute;
    color: #fff;
    left: 1.2rem;
    font-size: 1.4rem;
}
.curHoldCon,
.curOrderCon,
.hisOrderCon {
    padding: 0 1.2rem;
    background: #fff;
}
.curHold,
.curOrder,
.historyOrder {
    display: flex;
    justify-content: space-between;
    line-height: 2.5rem;
    /* padding: 0 15px; */
}
.curHoldInfos li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
}
.curHold span {
    /* width: 33.3%; */
    text-align: center;
}
.curHoldInfos span {
    /* width: 33.3%; */
    text-align: center;
    font-size: 1rem;
}
.green span{
    color: green;
  }
.red span{
    color: red;
  }
.van-cell {
    padding: 5px 0;
}
/* .curHoldInfos span:first-child,.curHold span:first-child {
    text-align: left;
  } */
.curHoldInfos span:last-child,
.curHold span:last-child {
    text-align: right;
}
.btnColor {
    display: inline-block;
    width: auto !important;
    background: #0088f1;
    color: #fff;
    padding: 0 0.3rem;
    border-radius: 0.3rem;
    font-size: 1rem;
}
.curOrderInfos li {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.curOrderInfos li span {
    display: inline-block;
    width: 17%;
    text-align: center;
}
.curOrder span:first-child {
    width: 20%;
}
.curOrderInfos li span:first-child {
    width: 25%;
    text-align: left;
}
.curOrderInfos li span:last-child {
    text-align: right;
    background: #0088f1;
    color: #fff;
    width: 12%;
    text-align: center;
    border-radius: 0.2rem;
}
.detailInfos {
    background: #efefef;
    padding: 0.5rem;
    display: none;
    border-radius: 0.2rem;
}
.detailInfos li p {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1rem;
}
.detailInfos li p:not(:first-child) span {
    display: inline-block;
    width: 50%;
}
.active1 {
    display: block;
}
.more {
    font-size: 1rem;
    text-align: center;
    padding-top: 0.5rem;
}
/* // 下单后弹出详情 */
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
