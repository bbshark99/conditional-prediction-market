pragma solidity ^0.5.0;

import {ERC20} from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import {ERC20Detailed} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import {ERC20Burnable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract DerivedToken is ERC20, ERC20Detailed, ERC20Burnable {
    constructor(uint256 initialSupply) public ERC20Detailed("DerivedToken", "USDx", 18) {
        _mint(msg.sender, initialSupply * 1e18);
    }
}
