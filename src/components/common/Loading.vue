<template>
    <div class="loading" v-show="loading">
        <van-loading class="loading" color="black" />
        <div class="mask"></div>
    </div>

</template>

<script type="">
export default {
    name: "",
    data() {
        return {};
    },
    components: {},
    computed: {
        loading(){
            // console.log(this.$store.state,this.$store.state.loading);     
            return this.$store.state.loading
        }
    }
};
</script>

<style scoped lang="">
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
</style>
