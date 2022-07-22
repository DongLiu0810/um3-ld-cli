const path = require('path')

// fs-extra 是对 fs 模块的扩展，支持 promise 语法
const fs = require('fs-extra')
const inquirer = require('inquirer')
const Generator = require('./Generator')

module.exports = async function (name,author) {
  // 执行创建命令

  // 当前命令行选择的目录
  const cwd  = process.cwd();
  // 需要创建的目录地址
  const targetAir  = path.join(cwd, name)

  // 目录是否已经存在？
  if (fs.existsSync(targetAir)) {

      // 询问用户是否确定要覆盖
      let { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: '文件已经存在是否要覆盖:',
          choices: [
            {
              name: '是',
              value: true
            },{
              name: '否',
              value: false
            }
          ]
        }
      ])

      if (!action) {
        return;
      } else if (action === true) {
        // 移除已存在的目录
        console.log(`\r\nRemoving...`)
        await fs.remove(targetAir)
      }
    
  }

  // 创建项目
  const generator = new Generator(name,author, targetAir);

  // 开始创建项目
  generator.create()
}