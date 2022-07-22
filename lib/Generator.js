const fs = require('fs')
const ora = require('ora')
const inquirer = require('inquirer')
const util = require('util')
const path = require('path')
const downloadGitRepo = require('download-git-repo') // 不支持 Promise
const chalk = require('chalk')
const spawn = require('cross-spawn')
const exist = util.promisify(fs.stat)
const figlet = require('figlet');

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  console.log('开始下载')
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    console.log('下载完成')
    return result; 
  } catch (error) {
    // 状态为修改为失败
    spinner.fail('下载失败');
  } 
}

async function install(options) {
  const cwd = options.cwd
  return new Promise((resolve, reject) => {
    const args = ['install', '--save', '--save-exact', '--loglevel', 'error']
    const child = spawn('npm', args, {
      cwd,
      stdio: ['pipe', process.stdout, process.stderr],
    })

    child.once('close', (code) => {
      if (code !== 0) {
        reject({
          'npm': `npm ${args.join(' ')}`,
        })
        return
      }
      resolve()
    })
    child.once('error', reject)
  })
}


class Generator {
  constructor (name,author, targetDir){
    // 目录名称
    this.name = name;
    // 作者
    this.author = author;
    // 创建位置
    this.targetDir = targetDir;

    // 改造 download-git-repo 支持 promise
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }


  async getType() {
    const { type } = await inquirer.prompt({
      name: 'type',
      type: 'list',
      choices: ['基础(umi3.0)','微服务(umi3.0-qiankun)'],
      message: '请选择项目模板类型'
    })
    return type;
  }

  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(type){
    let typeList = {
      '基础(umi3.0)':'projecttemp-umi',
      '微服务(umi3.0-qiankun)':'umi-qiankun',
    }
    
    const requestUrl = `DongLiu0810/${typeList[type]}`;
    // 2）调用下载方法
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      '请稍后，正在下载中......', // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
  }

  async create(){

    // 1）获取模板类型
    const type = await this.getType()

    // 3）下载模板到模板目录
    await this.download(type)

    const fileName = `${this.name}/package.json`
    if (await exist(fileName)) {
      const data = fs.readFileSync(fileName).toString()
      let json = JSON.parse(data);
      json.name = this.name;
      json.author = this.author;
       fs.writeFileSync(
              fileName,
              JSON.stringify(json, null, '\t'),
              'utf-8',
      )
      console.log(chalk.green('项目初始化完成'))
      console.log()
      console.log(chalk.yellowBright('开始安装依赖...'))
      // 安装依赖
      await install({
        cwd: path.join(process.cwd(), this.name)
      }).then(() => {
        console.log('\r\n' + figlet.textSync('liudong', {
          font: 'Ghost',
          horizontalLayout: 'default',
          verticalLayout: 'default',
          width: 80,
          whitespaceBreak: true
        }));
        console.log(chalk.green('依赖安装完成，快按照提示去体验吧'))
        console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
        console.log('  npm run start\r\n')
      })
    }

    
  }
}

module.exports = Generator;