// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract MemeContract is ERC20, Ownable {

    IUniswapV2Router02 public immutable uniswapRouter;
    //这里使用默认名称，不由部署构建函数传参
    string public _name = "MemeToken";//后面要写test用例
    string public _symbol = "MEME";
    //代币税功能：实现交易税机制，对每笔代币交易征收一定比例的税费，并将税费分配给特定的地址或用于特定的用途。
    uint256 public taxRate; // 交易税率
    //交易限制功能：设置合理的交易限制，如单笔交易最大额度、每日交易次数限制等，防止恶意操纵市场。
    uint256 public maxTransactionAmount; // 单笔交易最大额度
    uint256 public dailyTransactionLimit; // 每日交易次数限制
    mapping(address => uint256) public dailyTransactionCount; // 记录每日交易次数
    mapping(address => uint256) public lastTransactionDay; // 记录上次交易的日期
    constructor(
        //address _uniswapRouter,
        uint256 _initialSupply, 
        uint256 _taxRate,
        uint256 _maxTransactionAmount,
        uint256 _dailyTransactionLimit
        ) ERC20(_name, _symbol) Ownable(msg.sender) {
        //uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        //创建时，设置初始供应量
        require(_initialSupply > 0, "Initial supply must be greater than 0");
        _mint(msg.sender, _initialSupply * (10 ** uint256(decimals())));
        taxRate = _taxRate;
        maxTransactionAmount = _maxTransactionAmount;
        dailyTransactionLimit = _dailyTransactionLimit; // 默认每日交易次数限制为100次
    }
    //允许用户转账代币
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        if (msg.sender == owner()) {
            _transfer(_msgSender(), recipient, amount);
            return true;
        }else{
            //这里可以添加每日交易次数限制逻辑
            uint256 today = block.timestamp / 1 days; // 获取当前时间戳的天数
            if (lastTransactionDay[msg.sender] < today) {
                // 如果上次交易日期小于今天，重置交易次数
                dailyTransactionCount[msg.sender] = 0;
                lastTransactionDay[msg.sender] = today;
            }
            require(dailyTransactionCount[msg.sender] < dailyTransactionLimit, "Daily transaction limit exceeded");
            dailyTransactionCount[msg.sender] += 1; // 增加交易次数 
            //例如，可以使用一个映射来记录每个地址的交易次数，并在每日重置交易次数。
            //require(, "Daily transaction limit exceeded");
            //判断收款地址，金额大于0，且不超过最大交易额度
            require(recipient != address(0), "Transfer to the zero address");
            require(amount > 0, "Transfer amount must be greater than 0");
            require(amount <= maxTransactionAmount, "Transfer amount exceeds the max transaction amount");
            //这里可以添加交易税逻辑
            uint256 tax = (amount * taxRate) / 100; // 计算税费
            uint256 amountAfterTax = amount - tax; // 扣除税费后的金额
            _transfer(_msgSender(), recipient, amountAfterTax);
            _burn(_msgSender(),tax); // 销毁税费部分
            //题目要求：并将税费分配给特定的地址或用于特定的用途。
            //将税费转给合约所有者

            //_transfer(_msgSender(), owner(), tax);
            return true;
        }
    }

    //允许合约所有者铸造新的代币
    //铸造代币可以增加总供应量，通常用于奖励用户或增加流通量。
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    //允许用户销毁自己的代币
    //销毁代币可以减少总供应量，通常用于减少通货膨胀或调整代币的流通量。
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function addLiquidity(uint256 tokenAmount, uint256 ethAmount) internal {
        _approve(address(this), address(uniswapRouter), tokenAmount);
        
        uniswapRouter.addLiquidityETH{value: ethAmount}(
            address(this),
            tokenAmount,
            0,
            0,
            owner(),
            block.timestamp
        );
    }
    function removeLiquidity(address lpToken, uint256 liquidity) internal {
        IERC20(lpToken).approve(address(uniswapRouter), liquidity);
        uniswapRouter.addLiquidityETH(
            address(this),
            liquidity,
            0,
            0,
            owner(),
            block.timestamp
        );
    }
}
