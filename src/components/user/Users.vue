<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="box-card">
            <el-row :gutter="20">
                <el-col :span="9">
                    <el-input placeholder="请输入内容" clearable @clear="getUserList" class="input-with-select" v-model="queryInfo.query">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区域 -->
            <el-table :data="userlist" border stripe>
            <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username">
                </el-table-column>
                <el-table-column label="邮箱" prop="email">
                </el-table-column>
                <el-table-column label="电话" prop="mobile">
                </el-table-column>
                <el-table-column label="角色" prop="role_name">
                </el-table-column>
                <el-table-column label="状态" >
                <!-- 通过 Scoped slot 可以获取到 row, column, $index 和 store（table 内部的状态管理）的数据 -->
                    <template slot-scope="scope">
                        <el-switch
                            v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                    
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting"></el-button></el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
             <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户的对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"  type="password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改用户的对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" ></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
    
</template>
<script>
export default {
    data(){
        //验证邮箱的检验规则
        var checkEmail = (rules, value ,callback) =>{
            //验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            
            if(regEmail.test(value)){
                return callback()
            }
            callback(new Error('请输入合法的邮箱'))
        }
        // 验证手机号的检验规则
        var checkMobile = (rules, value ,callback) =>{
            // 验证手机号的正则表达式
            const regEmail = /^(0||86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if(regEmail.test(value)){
                return callback()
            }
            callback(new Error('请输入合法的手机号'))
        }
        return{
            //获取用户列表的参数对象
            queryInfo:{
                query:'',//搜索关键字
                pagenum:1,
                pagesize:2
            },
            userlist:[],//用户列表
            total:0,//总数据条数,
            //控制添加用户对话框的显示与隐藏
            addDialogVisible:false,
            //添加用户的表单数据
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''

            },
            //添加表单的验证规则对象
            addFormRules: {
                username:[
                    {
                        required:true,
                        message:'请输入用户名',
                        trigger:'blur'
                    },
                    {
                        min:3,
                        max:10,
                        message: '用户名的长度在3~10个字符之间',
                        trigger:'blur'
                    }
                ],
                password:[
                    {
                        required:true,
                        message:'请输入密码',
                        trigger:'blur'
                    },
                    {
                        min:6,
                        max:15,
                        message: '密码的长度在6~15个字符之间',
                        trigger:'blur'
                    }
                ],
                email:[
                    {
                        required:true,
                        message:'请输入邮箱',
                        trigger:'blur'
                    },
                    {
                        validator:checkEmail,
                        trigger:'blur'
                    }
                ],
                mobile:[
                    {
                        required:true,
                        message:'请输入电话号码',
                        trigger:'blur'
                    },
                    {
                        validator:checkMobile,
                        trigger:'blur'
                    }
                ]
            },
            //控制修改用户对话框的显示与隐藏
            editDialogVisible:false,
            //查询到的用户信息对象
            editForm:{
                id:'',
                username:'',
                email:'',
                mobile:''
            },
            //修改表单的检验规则对象
            editFormRules:{
                email: [
                    {
                        required:true,
                        message:'请输入邮箱',
                        trigger:'blur'
                    },
                    {
                        validator:checkEmail,
                        trigger:'blur'
                    }
                ],
                mobile:[
                    {
                        required:true,
                        message:'请输入电话号码',
                        trigger:'blur'
                    },
                    {
                        validator:checkMobile,
                        trigger:'blur'
                    }
                ]
            }
        }
    },
    created(){
        this.getUserList()//页面开始渲染之前就发起请求获取数据
    },
    methods:{
        async getUserList(){
            const { data:res } = await this.$http.get('users',{ params:this.queryInfo})
            if(res.meta.status !== 200)return this.$message.error('获取用户列表失败')
            this.userlist = res.data.users
            this.total = res.data.total
        },
        //监听pagesize 改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        //监听页码值 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        //监听switch开关状态的改变
        async userStateChanged(userInfo){
            const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if(res.meta.status != 200){
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error('更新用户状态失败')
            }
            this.$message.success('更新用户状态成功')
        },
        //监听添加用户对话框的关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        //点击按钮添加新用户
        addUser(){
            //vaildate返回一个布尔值，代表预检验是否通过
            this.$refs.addFormRef.validate( async vaild =>{
                if(!vaild)return
                //可以发起添加用户的网络请求
                const {data:res} = await this.$http.post('users',this.addForm)
                if(res.meta.status !== 201)return this.$message.error('添加用户失败')
                this.$message.success('添加用户成功')
                // 隐藏添加用户的对话框
                this.addDialogVisible = false
                //重新获取列表的数据
                this.getUserList()

            })
        },
        async showEditDialog(id){
            this.editDialogVisible = true
            const {data:res} = await this.$http.get('users/' + id)
            if(res.meta.status !== 200)return this.$message.error('查询用户信息失败')
            this.editForm = res.data
            console.log(this.editForm)
        },
        //监听修改用户对话框的关闭事件
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        //修改用户信息并提交
        editUserInfo(){
             this.$refs.editFormRef.validate( async vaild =>{
                if(!vaild)return
                //可以发起添加用户的网络请求
                const {data:res} = await this.$http.put('users/'+ this.editForm.id,
                {
                    email:this.editForm.email,
                    mobile:this.editForm.mobile
                })
                console.log(res.meta.status)
                if(res.meta.status !== 200)return this.$message.error('更新用户失败')
                
                // 隐藏更新用户的对话框
                this.editDialogVisible = false
                //重新获取列表的数据
                this.getUserList()
                this.$message.success('更新用户成功')

            })
        },
        //根据Id删除对应的用户值
        async removeUserById(id){
            //询问是否删除
            const comfirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err =>{
                return err
            })
            //如果用户取消了删除，则返回值为cancel
            if(comfirmResult !== 'confirm'){
                return this.$message.info('已经取消删除')
            }
            const {data:res} = await this.$http.delete('users/' + id)
            if(res.meta.status !== 200)return this.$message.error('删除用户失败！')
            this.$message.success('删除用户成功')
            this.getUserList()
        }
    }
}
</script>
<style lang="less" scoped>

</style>
