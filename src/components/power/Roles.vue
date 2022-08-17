<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card >
            <!-- 添加角色按钮区 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
        </el-card>
        <!-- 添加角色的对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-width="70px" >
                <el-form-item label="角色名" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改角色的对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <el-form :model="editForm"  ref="editFormRef" :rules="editFormRules" label-width="70px">
                <el-form-item label="角色名">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input v-model="editForm.roleDesc" ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限的对话框 -->
        <el-dialog
            title="提示"
            :visible.sync="setRightDialogVisible"
            width="50%"
            @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
        <el-table :data="roleList" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['dbbottom',i1 == 0 ?'dbtop':'']">
                        <!-- 渲染一级权限 -->
                        <el-col :span="5">
                            <el-tag closable @close='removeRightById(scope.row,item1.id)'>{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                            </el-col>
                        <!-- 渲染二级和三级权限 -->
                        <el-col :span="19" >
                            <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2 == 0 ? '':'dbtop']">
                                <el-col :span="6">
                                    <el-tag type="success" closable @close='removeRightById(scope.row,item2.id)'>{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                    <el-tag closable @close='removeRightById(scope.row,item3.id)' type="warning" v-for="(item3,i3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
             <el-table-column  label="角色名称" prop="roleName"></el-table-column>
            <el-table-column  label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column  label="操作">
                <template slot-scope="scope">
                    <el-button size='mini' type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                    <el-button size='mini' type="danger" icon="el-icon-delete"  @click="removeRoleById(scope.row.id)">删除</el-button>
                    <el-button size='mini' type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>

export default {
    data(){
        return {
            //所有角色列表数据
            roleList:[],
            addForm:{
                roleName:'',
                roleDesc:''
            },
            //控制添加用户表单的显示与隐藏
            addDialogVisible: false,
            addFormRules: {
                roleName:[
                    {
                        required:true,
                        message:'请输入角色名',
                        trigger:'blur'
                    }
                ],
            },
            editForm:{
                roleId:'',
                roleName:'',
                roleDesc:''
            },
            //控制修改角色对话框的显示与隐藏
            editDialogVisible:false,
            editFormRules: {
                roleName:[
                    {
                        required:true,
                        message:'请输入角色名',
                        trigger:'blur'
                    }
                ],
            },
            //控制分配权限的对话框
            setRightDialogVisible:false,
            //所有权限的数据
            rightsList:[],
            //树形控件的属性绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            //默认选中的节点id值
            defKeys:[],
            roleId:''
        }
    },
    created(){
        this.getRoleList()
    },
    methods:{
        //获取所有角色的列表
        async getRoleList(){
            const {data:res} = await this.$http.get('roles')
            if(res.meta.status !== 200){
                return this.$message.error('获取角色列表失败')
            }
            this.roleList = res.data
        },
        //监听添加角色对话框的关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        addRole(){
            //vaildate返回一个布尔值，代表预检验是否通过
            this.$refs.addFormRef.validate( async vaild =>{
                if(!vaild)return
                //可以发起添加用户的网络请求
                const {data:res} = await this.$http.post('roles',this.addForm)
                if(res.meta.status !== 201)return this.$message.error('添加用户失败')
                this.$message.success('添加用户成功')
                // 隐藏添加用户的对话框
                this.addDialogVisible = false
                //重新获取列表的数据
                this.getRoleList()

            })
        },
        async showEditDialog(id){
            this.editDialogVisible = true
            const {data:res} = await this.$http.get('roles/' + id)
            if(res.meta.status !== 200)return this.$message.error('查询角色信息失败')
            this.editForm = res.data
        },
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        editRoleInfo(){
             this.$refs.editFormRef.validate( async vaild =>{
                if(!vaild)return
                //可以发起添加用户的网络请求
                const {data:res} = await this.$http.put('roles/'+ this.editForm.roleId,
                {
                    roleName:this.editForm.roleName,
                    roleDesc:this.editForm.roleDesc
                })

                if(res.meta.status !== 200)return this.$message.error('更新用户失败')
                
                // 隐藏更新用户的对话框
                this.editDialogVisible = false
                //重新获取列表的数据
                this.getRoleList()
                this.$message.success('更新角色成功')

            })
        },
        async removeRoleById(id){
            //询问是否删除
            const comfirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
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
            const {data:res} = await this.$http.delete('roles/' + id)
            if(res.meta.status !== 200)return this.$message.error('删除角色失败！')
            this.$message.success('删除角色成功')
            this.getRoleList()
        },
        //根据Id删除对应的权限
        async removeRightById(role,rightId){
            //弹窗提示是否要删除
            const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(confirmResult !== 'confirm'){
                return this.$message.info('取消了删除')
            }
            const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if(res.meta.status !== 200){
                return this.$message.error('删除权限失败！')
            }
            role.children = res.data
        },
        //展示分配权限的对话框
        async showSetRightDialog(role){
            this.roleId = role.id
            //获取所有权限的数据
            const {data:res} = await this.$http.get('rights/tree')
            if(res.meta.status !== 200){
                return this.$mesasge.error('获取权限数据失败')
            }
            this.rightsList = res.data
            //递归获取三级节点的Id
            this.getLeafKeys(role,this.defKeys)
            //把获取到的权限数据保存到data中
            this.setRightDialogVisible = true

        },
        //通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
        getLeafKeys(node,arr){
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item => {
                this.getLeafKeys(item,arr)
            });

        },
        //监听分配权限对话框的关闭事件
        setRightDialogClosed(){
            this.defKeys = []
        },
        //点击为角色分配权限
        async allotRights(){
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            const idStr = keys.join(',')
            const {data:res}  = await this.$http.post(`roles/${this.roleId}/rights`,{ rids:idStr})
            if(res.meta.status !== 200){
                return this.$message.error('分配权限失败')
            }
            this.$message.success('分配权限成功')
            this.getRoleList()
            this.setRightDialogVisible = false
        }
        
    }   
}
</script>
<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.dbtop{
    border-top: 1px solid #eee;
}
.dbbottom{
    border-bottom: 1px solid #eee;
}
</style>