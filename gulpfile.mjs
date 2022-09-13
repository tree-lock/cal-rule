import fs from 'fs-extra';
import inquirer from 'inquirer';
import util from 'util';
import { exec, spawnSync } from 'child_process';
import chalk from 'chalk';
import Prettier from 'prettier';
const execPromise = util.promisify(exec);

const npmPublish = (version) => {
  if (version.includes('beta')) {
    const command = 'npm publish --tag beta';
    console.log(command);
    return spawnSync(command, {
      stdio: 'inherit',
      shell: true
    });
  }
  const command = 'npm publish';
  console.log(command);
  return spawnSync(command, { stdio: 'inherit', shell: true });
};

/**
 * @param {string} oldVersion
 * @returns {Promise<string>}
 */
const checkVersion = async (oldVersion) => {
  if (oldVersion.includes('beta')) {
    const V = oldVersion.split('-beta.')[0];
    const B = Number(oldVersion.split('-beta.')[1]);
    const update = `${V}-beta.${B + 1}`;
    const publish = `${V}`;
    const { option } = await inquirer.prompt([
      {
        type: 'list',
        name: 'option',
        message: `当前版本为${oldVersion ?? '未定义'}，请选择更新级别`,
        choices: [
          { value: 'update', name: `更新当前测试(${update})` },
          { value: 'publish', name: `结束当前测试(${publish})` },
          { value: 'old', name: `不变更版本号(${oldVersion})` }
        ],
        default: 'update'
      }
    ]);
    if (option === 'update') {
      return update;
    } else if (option === 'publish') {
      return publish;
    } else {
      return oldVersion;
    }
  } else {
    const [H, N, S] = oldVersion.split('.').map((item) => Number(item));
    const B = '-beta.0';
    const small = `${H}.${N}.${S + 1}${B}`;
    const normal = `${H}.${N + 1}.0${B}`;
    const huge = `${H + 1}.0.0${B}`;
    const { option } = await inquirer.prompt([
      {
        type: 'list',
        name: 'option',
        message: `当前版本为${oldVersion ?? '未定义'}，请选择更新级别`,
        choices: [
          { value: 'small', name: `小版本测试(${small})` },
          { value: 'normal', name: `普通版本测试(${normal})` },
          { value: 'huge', name: `大版本测试(${huge})` },
          { value: 'old', name: `不变更版本号(${oldVersion})` }
        ]
      }
    ]);
    if (option === 'small') {
      return small;
    } else if (option === 'normal') {
      return normal;
    } else if (option === 'huge') {
      return huge;
    } else {
      return oldVersion;
    }
  }
};

async function changeVersion(version) {
  const packageFile = await fs.readJSON('./package.json');
  const versionFilePath = './src/version-config.ts';
  const versionDistPath = './dist/version-config.js';
  const configFileStr = (await fs.readFile(versionFilePath, 'utf-8'))
    .replace('/** 请勿手动修改本文件，本文件通过命令行自动生成 */\n*', '')
    .replace('export default ', '')
    .replace(/\/\*\*.*\*\/\n*/g, '');
  const configFile = JSON.parse(configFileStr);
  packageFile.version = version;
  configFile.version = version;
  const str = Prettier.format(
    `/** 请勿手动修改本文件，本文件通过命令行自动生成 */\nexport default ${JSON.stringify(
      configFile,
      null,
      2
    )}`,
    {
      'singleQuote': false,
      'trailingComma': 'none',
      'semi': false
    }
  );
  await Promise.all([
    fs.writeJSON('./package.json', packageFile, {
      spaces: 2
    }),
    fs.writeFile(versionFilePath, str),
    fs.writeFile(versionDistPath, str)
  ]);

  console.log(`.env, package.json 的版本号已更新为${version}`);
}

export async function publish() {
  // 是否已构建
  if (!fs.existsSync('./dist')) {
    console.log(`请先进行构建, ${chalk.cyan('npm run build')}`);
    return;
  }
  // 确认版本
  const packageFile = await fs.readJSON('./package.json');
  /** @type { string } */
  let version = packageFile.version;
  const oldVersion = packageFile.version;
  const checkedVersion = await checkVersion(version);
  if (checkedVersion) {
    if (version !== checkedVersion) {
      version = checkedVersion;
      await changeVersion(version);
    }
    const branch = (await execPromise('git rev-parse --abbrev-ref HEAD')).stdout.trim();
    if (branch === 'master') {
      // 判断是否是`master`分支，如果是，允许任意版本发布
      npmPublish(version);
      spawnSync(`git add . && git commit -m "build: release v${version}"`, {
        stdio: 'inherit',
        shell: true
      });
      if (!version.includes('beta')) {
        spawnSync(`git tag v${version}`, { stdio: 'inherit', shell: true });
        spawnSync(`git push origin --tags`, { stdio: 'inherit', shell: true });
      }
      return;
    } else {
      // beta版本
      if (!version.includes('beta')) {
        console.log(`当前分支为${chalk.yellow(branch)}, 非master分支只允许发布beta版本`);
        return await changeVersion(oldVersion);
      } else {
        npmPublish(version);
        return spawnSync(`git add . && git commit -m "build: release v${version}"`, {
          stdio: 'inherit',
          shell: true
        });
      }
    }
  }
}

export default publish;
