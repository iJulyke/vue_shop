<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src='../assets/heima.png' alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse? '64px':'200px'" >
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区 -->
                <el-menu
                background-color="#333744"
                text-color="#fff"
                active-text-color="#409BFF"
                :unique-opened="true"
                :collapse="isCollapse"
                :collapse-transition="false"
                :router='true'
                :default-active="this.$route.path">
                <!-- 一级菜单 -->
                <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                    <!-- 一级菜单的模板区 -->
                    <template slot="title">
                    <i :class="iconsObj[item.id]"></i>
                    <span>{{item.authName}}</span>
                    </template>
                <!-- 二级菜单 -->
                    <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
                        <template slot="title">
                        <i class="el-icon-menu"></i>
                        <span>{{subItem.authName}}</span>
                        </template>
                    </el-menu-item>
                </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
        </el-container>
</template>
<script>

export default {
    data(){
        //左侧菜单数据
        return {
            menuList:[],
            iconsObj:{
                '125':'iconfont icon-user',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao',
            },
            isCollapse:false
        }
    },
    created(){
        this.getMenuList()
    },
    methods:{
        logout(){
            window.sessionStorage.clear()
            this.$router.push('/login')
        },
        //获取所有的菜单
        async getMenuList(){
            const {data:res} = await this.$http.get('menus')
            if(res.meta.status !== 200)return this.$message.error(res.meta.msg)
            this.menuList = res.data
            console.log(this.menuList)
        },
        //点击按钮，切换菜单的折叠与展开
        toggleCollapse(){
            this.isCollapse = !this.isCollapse
        }
    }
}
</script>
<style lang = 'less' scoped>
.el-header {
    background-color: #373D41;
    display: flex;
    justify-content: space-between;
    padding: 10;
    align-items: center;
    color: #fff;
    font-size: 20px;
    >div{
        display: flex;
        align-items: center;
        span {
            margin-left: 15px;
        }
    }
}
.el-aside {
    background-color: #333744;
    .el-menu {
        border-right: 0px;
    }
}
.el-main {
    background-color: #eaedf1;
}
.home-container {
    height: 100%;
}
.iconfont{
    margin-right: 10px;
}
.toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color:white;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>