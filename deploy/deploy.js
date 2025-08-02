module.exports = async function ({ getNamedAccounts, deployments }) {
    const { firstAccount, secondAccount} = await getNamedAccounts();
    const { deploy } = deployments;
    //如果npx hardhat deploy 则获取本地环境的账户
    //如果执行npx hardhat deploy --network sepolia 则获取sepolia网络的账户
    //console.log(`Deploying contracts with the account: ${firstAccount}`);
    //console.log(`Deploying contracts with the account: ${secondAccount}`);

    const meme = await deploy("MemeContract", {
        from: firstAccount,
        args: [1000, 2, 10000000000000000000n, 3],
        log: true,
    });
    console.log(`MemeContract deployed at ${meme.address}`);
}
//这是定义tags的方式
//npx hardhat deploy --tags MemeContract
//npx hardhat deploy --tags all
//这两种都可以
module.exports.tags = ["all","MemeContract"];