#! /usr/bin/env node

const program = require('commander');
const figlet = require('figlet');
const chalk = require('chalk');
const inquirer = require('inquirer')


inquirer.prompt([
  {
    type: 'input', //type： input, number, confirm, list, checkbox ... 
    name: 'projectName', // key 名
    message: '定义你的项目名称', // 提示信息
    default: 'umi-temp' // 默认值
  },
  {
    type: 'input',
    name: 'author',
    message: '输入你的姓名',
    default: 'ld' 
  }
]).then(async(answers) => {
    require('../lib/create.js')(answers.projectName,answers.author)
})

program
  .on('--help', () => {
    console.log('\r\n' + figlet.textSync('liudong', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    }));
    console.log(`\r\n输入命令 ${chalk.cyan(`umi3-ld`)} 创建新的项目\r\n`)
  })

// 解析用户执行命令传入参数
program.parse(process.argv);