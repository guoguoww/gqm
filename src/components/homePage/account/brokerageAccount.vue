<template>
  <div class="changeBG">
    <div class="ccAccountC">
      <van-nav-bar
        title="佣金账户"
        left-arrow
        @click-left="$back"
      >
        <van-icon class="iconfont icon-fanhui" slot="left" />
      </van-nav-bar>
        <div>
            <ul class="ttitle">
                <li>推广人数:{{total.promotionTotal}}</li>
                <li>所获佣金:{{total.commissionTotal}}USDT</li>
                <li>
                    <router-link to="/assetTransfer?curType=3" style="color:red;">划转</router-link>
                </li>
            </ul>
        </div>
      <!-- <div class="accountC">
        <div class="accountBg">
          <p class="tit">合约总资产折合 (BTC)</p>
          <div v-show="eyeOpen">
            <p class="totalM" ref="total">{{total | number}}</p>
            <p class="zhM"><span ref="changeH">≈ {{changeH | number}}</span> <span>CNY</span></p>
          </div>
          <div v-show="!eyeOpen">
            <p class="totalM" ref="total">******</p>
            <p class="zhM"><span ref="changeH">******</span> <span>CNY</span></p>
          </div>
        </div>
        <i class="iconfont icon-yanjing" @click="changeEyeOpen" v-show="eyeOpen"></i>
        <i class="iconfont icon-yanjing-bi" @click="changeEyeCl" v-show="!eyeOpen"></i>
      </div> -->

      <!-- <div class="acc_tab">
        <ul>
          <li v-for="(item,index) of accTabs" :key="index" @click="tiaoZhuan(item.txt)">
            <img :src="item.url" alt="">
            <p>{{item.txt}}</p>
          </li>
        </ul>
      </div> -->
    </div>

    <div class="accList">
      <div class="accTitle">
        <span>手机号</span>
        <span>交易笔数</span>
        <span>交易时间</span>
        <span>所获佣金</span>
      </div>
      <ul class="accInfo">
        <li v-for='(i,index) in list' :key="index">
          <span>{{i.mobile }}</span>
          <span>{{i.tradeTotal}}</span>
          <span style="flex:2">{{i.lastTradeTime?i.lastTradeTime.split('.')[0]:`-` }}</span>
          <span>{{(+i.commission).toFixed(2)}}</span>

        </li>
      </ul>
    </div>
    <!--<div class="more" v-show="noData">-->
      <!--<span>没有更多数据</span>-->
    <!--</div>-->
  </div>
</template>

<script>
    export default {
      name: "brokerageAccount",
      data(){
        return {
          total:[],
          list:[
            {commission: "0.00000000", mobile: "18366582932", tradeTotal: "0"}
          ]
        }
      },
      created () {
        this.getpromotion()
      },
      mounted(){

        // this.curBZ = this.$route.query.curTypeNum;//获取当前币种的账户类型

        // //进入合约账户获取资产明细
        // this.assetDetail();

        // this.getSurveyQuery();//获取资产概况查询
      },
      methods: {
        getpromotion(){
          this.$axios.post('api/assets/promotion/query').then(res=>{
            this.total=res.data.data
            console.log(this.total);

          }).catch(err=>{

          })
          this.$axios.post(`api/assets/promotion/details?start=0&rows=100`).then(res=>{
            this.list=res.data.page.data
          })
        }
      },
    }
</script>

<style scoped>
.ttitle{
    display: flex;
    justify-content: space-around;
    margin: 0 auto;
    padding: 15px 0;
    border-bottom: 1px solid #ccc;
    width: 95%;
    margin-bottom: 15px;
}
  .ccAccountC {
    background: #f0f0f0;
    padding-bottom: .6rem;
  }
  /* .accountC {
    padding: 0 1.2rem;
    background: #fff;
    position: relative;
  }
  .accountC div.accountBg {
    background: url("../images/heyue.png") no-repeat 0 0;
    background-size: 100% 100%;
    color: #fff;
    height: 8rem;
    border-radius: .5rem;
    text-align: center;
  } */
  .accountBg .tit {
    font-size: 1rem;
    padding-top: 1rem;
    color: #d4e9ff;
  }
  .accountBg .totalM {
    font-size: 1.3rem;
    padding-top: 1rem;
    font-weight: bold;
    color: #fff;
  }
  .accountBg .zhM {
    font-size: 1rem;
    padding-top: .98rem;
    color: #d4e9ff;
  }
  .accountC i {
    position: absolute;
    right: 2rem;
    top: .4rem;
    color: #fff;
    font-size: 1.4rem;
    cursor: pointer;
  }
  .acc_tab {
    padding: 0 1.2rem;
    background: #fff;
  }
  .acc_tab ul {
    display: flex;
    justify-content: space-between;

  }
  .acc_tab ul li {
    padding: 1.4rem 0;
    flex: 1;
    text-align: center;
  }
  .acc_tab ul li img {
    max-width: 100%;
    height: 2.1rem;
    vertical-align: bottom;
  }
  .acc_tab ul li p {
    font-size: 1rem;
    padding-top: 0.4rem;
    color: #787878;
  }
  .accList {
    padding: 0 1.2rem;
    background: #fff;
  }
  .accTitle {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ececec;
    font-size: 1rem;
    color: #787878;
    height: 2.6rem;
    line-height: 2.6rem;
  }
  .accInfo li{
    display: flex;
    justify-content: space-between;
    height: 2.6rem;
    border-bottom: 1px solid #ececec;
    line-height: 2.6rem;
    color: #787878;
    padding: 0 .3rem;
    font-size: 1rem;
  }
  .accInfo li span{
    display: inline-block;
    /* width: 33%; */
    color: #000;
    flex: 1;
    text-align: center;
  }
  .accInfo li span:first-child{
    width: 20%;
    text-align: left;
  }
  .accInfo li span:last-child {
    text-align: right;
  }
  .accTitle em {
    display: inline-block;
    width: .6rem;
    height: .6rem;
    border: 1px solid #787878;
    margin-right: .5rem;
    vertical-align: middle;
  }
  .accTitle i {
    border: 1px solid #787878;
    font-size: .8rem;
  }
  .more {
    font-size: 1rem;
    text-align: center;
    padding-top: .5rem;
  }

</style>
