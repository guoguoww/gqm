<template>
    <div class="changeBG">
        <signhead/>
        <div class="sign-li">
            <ul>
                <li>
                    <input placeholder="请输入手机号" type="text" v-model="user.mobile">
                    <i class="iconfont icon-ai54" v-if="user.mobile" @click="user.mobile=''"></i>
                </li>
                <li>
                    <input placeholder="请输入密码" :type="pwdshow?'text':'password'" v-model="user.password">
                    <i class="iconfont icon-kaiicon" v-if="pwdshow" @click="pwdshow=!pwdshow"></i>
                    <i class="iconfont icon-guanicon" v-else @click="pwdshow=!pwdshow"></i>
                </li>
            </ul>
            <div class="sign-but">
                <button @click="login">登录</button>
            </div>
            <div class="sign-reg">
                <dl>
                    <dt @click="$router.push('/register')">
                        <em>注册</em>
                    </dt>
                    <dd @click="$router.push('/forget')">
                        <em>忘记密码</em>
                    </dd>
                </dl>
            </div>

        </div>
    </div>
</template>

<script type="">
import signhead from "../public/sign-head";
export default {
    name: "login",
    data() {
        return {
            user:{
                mobile:'',
                password:'',
                terminal:'1',//设备类型
            },
            pwdshow:false
        };
    },
    components: {
        signhead
    },
    methods: {
        login(){
            if (!this.user.mobile) {
                this.$toast('请输入手机号码')
                return
            }
            if (!this.user.password) {
                this.$toast('请输入密码')
                return
            }
            this.$axios.post('api/user/login',this.user).then(res=>{
                if (!res.data.errorCode) {
                    this.$cookie.set('_auth',res.data.data.cookie)
                    localStorage.setItem('eyeState','false');
                    localStorage.setItem('eyeState1','false');
                    localStorage.setItem('eyeState2','false');
                    this.$toast('登录成功')
                    this.$router.replace(this.$route.query.redirect||'/')                    
                }
            }).catch(err=>{

            })
        }
    }
};
</script>

<style scoped lang="less">
div {
    .sign-li {
        /* float: left; */
        // width: 50%;
        padding: 0 3rem;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        li {
            border-bottom: 0.333px solid #dcdcdc;
            padding: 2.01rem 0 0.1rem;
            position: relative;
            input {
                width: 60%;
                height: 2.7rem;
                // font-size: 35px;
                padding-left: 1rem;
                outline: none;
                background-color: #fff;
            }
            > i {
                font-size: 1.5rem;
                color: #e3e3e3;
                position: absolute;
                top: 3rem;
                right: 1rem;
            }
        }
        .sign-but {
            padding-top: 4.5rem;
            button {
                width: 100%;
                height: 3rem;
                font-size: 1.12rem;
                background: #0088f1;
                outline: none;
                border-radius: 3px;
                color: #fff;
                border: 0;
                -webkit-box-shadow: 0 0.4rem 0.35rem #f3f3f3;
                box-shadow: 0 0.4rem 0.35rem #f3f3f3;
            }
        }
        .sign-reg {
            padding-top: 1.5rem;
            color: #b4b4b4;
            dl {
                display: flex;
                dt {
                    flex: 1;
                }
                em {
                    color: #0088f1;
                }
            }
        }
    }
}
</style>
