# 项目描述
一个基于 Solidity 的 Meme 代币项目，用于在区块链上实现 Meme 代币的发行与交易。
# 核心功能
    代币发行与转账
    交易税机制（默认2%）2%直接销毁
    交易限额控制（默认单笔交易不超过一个固定值）
    地址税收豁免（所有者）
    流动性添加支持（Uniswap）
    所有者权限管理
# 项目开发过程
    1.npx hardhat init
    2.npm install @openzeppelin/contracts
    //流动池（目前没做test）
    3.npm install @uniswap/v2-periphery
    4.npm install -D hardhat-deploy
    编写contracts
    每一行都有注释，详见注释
# 安装步骤
    npm install
# 运行测试
    npx hardhat test
