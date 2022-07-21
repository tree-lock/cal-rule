import fs from 'fs-extra';
import inquirer from 'inquirer';
import util from 'util';
import { exec, spawnSync } from 'child_process';
import chalk from 'chalk';
const execPromise = util.promisify(exec);

const npmPublish = (version) => {
  if (version.includes('beta')) {
    return spawnSync('npm publish --tag beta', {
      stdio: 'inherit',
      shell: true
    });
  }
  return spawnSync('npm publish', { stdio: 'inherit', shell: true });
};

export async function publish() {
  // 判断是否是`main`分支，如果是，执行发布，否则拒绝发布并提示只能在`main`分支上执行发布操作
  const branch = (await execPromise('git rev-parse --abbrev-ref HEAD')).stdout.trim();
  if (branch === 'main') {
    const branchError = await inquirer.prompt([
      {
        type: 'input',
        name: 'confirm',
        message: `确认直接在${chalk.redBright('main')}分支进行发布吗？`,
        default: false
      }
    ]);
    if (!branchError.confirm) {
      return;
    }
  }
  // 是否已构建
  if (!fs.existsSync('./dist')) {
    console.log(`请先进行构建, ${chalk.cyan('npm run build')}`);
    return;
  }
  // 确认版本
  const packageFile = await fs.readJSON('./package.json');
  /** @type { string } */
  let version = packageFile.version;
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'version',
      message: `请输入版本号，当前版本为${version ?? '未定义'}\n`,
      default: version
    }
  ]);
  if (answers.version) {
    // 修改文件版本
    if (version !== answers.version) {
      version = answers.version;
      const packageFile = await fs.readJSON('./package.json');
      const configFileStr = (await fs.readFile('./src/config.ts', 'utf-8'))
        .replace('export default ', '')
        .replace(/\/\*\*.*\*\/\n/g, '');
      const configFile = JSON.parse(configFileStr);
      packageFile.version = version;
      configFile.version = version;
      await Promise.all([
        fs.writeJSON('./package.json', packageFile, {
          spaces: 2
        }),
        fs.writeFile(
          './src/config.ts',
          `/** 请勿手动修改本文件，本文件通过命令行自动生成 */\nexport default ${JSON.stringify(
            configFile,
            null,
            2
          )}`
        ),
        fs.writeFile(
          './dist/config.js',
          `/** 请勿手动修改本文件，本文件通过命令行自动生成 */\nexport default ${JSON.stringify(
            configFile,
            null,
            2
          )}`
        )
      ]);
      console.log(`.env, package.json 的版本号已更新为${version}`);
    }
    if (branch === 'main') {
      return npmPublish(version);
    } else {
      console.log(
        `当前分支为${chalk.yellow(branch)}, 将在${chalk.greenBright('main')}分支上执行发布操作`
      );
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'switch',
          message: `是否进行自动跳转到main分支并进行版本合并当前分支？`,
          default: false
        }
      ]);
      if (!answers.switch) {
        return;
      } else {
        spawnSync(`git add . && git commit -m "build: release v${version}"`, {
          stdio: 'inherit',
          shell: true
        });
        spawnSync('git switch main', { stdio: 'inherit', shell: true });
        spawnSync('git merge develop', { stdio: 'inherit', shell: true });
        if (!version.includes('beta')) {
          spawnSync(`git tag v${version}`, { stdio: 'inherit', shell: true });
          spawnSync(`git push origin --tags`, { stdio: 'inherit', shell: true });
          spawnSync(`git push company --tags`, { stdio: 'inherit', shell: true });
        }
        npmPublish(version);
        spawnSync('git switch develop', { stdio: 'inherit', shell: true });
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'push',
            message: `是否将修改push到gitlab和github`,
            default: true
          }
        ]);
        if (answers.push) {
          spawnSync('git push --all', { stdio: 'inherit', shell: true });
          spawnSync('git push company develop:develop', { stdio: 'inherit', shell: true });
          return spawnSync('git push company main:master', { stdio: 'inherit', shell: true });
        }
      }
    }
  }
}

export default publish;
