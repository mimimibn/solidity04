const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")
describe("test meme contract", function () {
    let meme, firstAccount, secondAccount
    //在每个测试用例之前执行的钩子函数
    beforeEach(async function () {
        //引用hardhat-deploy的fixture方法
        //如果没有传入参数，则会部署所有的合约
        await deployments.fixture("MemeContract")
        //获取部署的合约实例
        const memeContractDeploy = await deployments.get("MemeContract")
        //通过部署的合约地址获取合约实例
        meme = await ethers.getContractAt("MemeContract", memeContractDeploy.address)
        //获取部署的合约实例
        // We can use getNamedAccounts to get the accounts we defined in hardhat.config.js
        // this.accounts = await ethers.getNamedSigners()
        // this.firstAccount = this.accounts.firstAccount  
        // this.secondAccount = this.accounts.secondAccount
        firstAccount = await ethers.getSigner((await getNamedAccounts()).firstAccount)
        secondAccount = await ethers.getSigner((await getNamedAccounts()).secondAccount)
        // getNamedAccounts().then(accounts => {
        //     firstAccount = accounts.firstAccount
        //      secondAccount = accounts.secondAccount
        // })
    })
    //检查合约的owner是否是firstAccount
    it("check owner is firstAccount", async function () {
        console.log(`meme name is : ${await meme.owner()}`);
        console.log(`firstAccount is : ${firstAccount}`);
        assert.equal(await meme.owner(), firstAccount.address, "owner is not firstAccount")
    })
    it("管理员转账没有手续费,没有限制", async function () {
        const amount = ethers.parseUnits("100", 18); // 100个代币
        await meme.connect(firstAccount).transfer(secondAccount, amount)
        //检查转账后，secondAccount的余额是否为100
        const secondAccountBalance = await meme.balanceOf(secondAccount)
        console.log(`secondAccount balance is : ${secondAccountBalance}`);
        assert.equal(secondAccountBalance.toString(), amount.toString(), `secondAccount balance is not ${amount}`)
        //检查firstAccount是否是900
        const firstAccountBalance = await meme.balanceOf(firstAccount)
        console.log(`firstAccount balance is : ${firstAccountBalance}`);
        assert.equal(firstAccountBalance, 900 * (10 ** 18), "firstAccount balance is not 900")
    })
    it("测试普通用户转账是否收取税费、税费是否销毁", async function () {
        //默认给第二个账户100个代币
        await meme.connect(firstAccount).transfer(secondAccount, ethers.parseUnits("100", 18))
        //第二个账户转账给第一个账户5个代币
        //转账时会扣除2%的税费
        //税费会被销毁
        const amount = ethers.parseUnits("5", 18); // 5个代币
        await meme.connect(secondAccount).transfer(firstAccount, amount)
        //检查转账后，secondAccount的余额是否为95
        const secondAccountBalance = await meme.balanceOf(secondAccount)
        console.log(`secondAccount balance is : ${secondAccountBalance}`);
        assert.equal(secondAccountBalance, ethers.parseUnits("95", 18), "secondAccount balance is not 95")
        //检查firstAccount，会收到扣除税费的金额
        const firstAccountBalance = await meme.balanceOf(firstAccount)
        console.log(`firstAccount balance is : ${firstAccountBalance}`);
        const current = 900000000000000000000n - (amount * 2n / 100n) +  5000000000000000000n
        console.log(`firstAccount current balance is : ${current}`);
        assert.equal(firstAccountBalance, current, "firstAccount balance is 905")
        const totalSupply = await meme.totalSupply();
        console.log(`totalSupply balance is : ${totalSupply}`);
        const currentTotalSupply = 1000000000000000000000n - (amount * 2n / 100n)
        assert.equal(totalSupply, currentTotalSupply, "totalSupply is not " + currentTotalSupply.toString());
    });
    it("普通用户for循环多次转账，拦截最大交易次数", async function () {
        // 先给secondAccount 100个代币
        await meme.connect(firstAccount).transfer(secondAccount, ethers.parseUnits("100", 18));
        const amount = ethers.parseUnits("1", 18); // 每次转1个代币

        for (let i = 0; i < 3; i++) {
            await meme.connect(secondAccount).transfer(firstAccount, amount);
        }
        /**
         * 其中Daily transaction limit exceeded 是合约中设置的每日交易限制超过的错误信息
         * 
         * 或者是这样
         * await expect(
            meme.connect(secondAccount).transfer(firstAccount, amount)
            ).to.be.revertedWith("Daily transaction limit exceeded");
         */
        await assert.isRejected(
            meme.connect(secondAccount).transfer(firstAccount, amount),/Daily transaction limit exceeded/
        );
    });
});