// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Six-decimal USPC representation minted and burned by its LayerZero bridge.
contract USPCMonad is ERC20, AccessControl {
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    error InvalidAdmin();

    constructor(address admin) ERC20("USPC", "USPC") {
        if (admin == address(0)) revert InvalidAdmin();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external onlyRole(BRIDGE_ROLE) {
        _mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) external onlyRole(BRIDGE_ROLE) {
        _spendAllowance(from, _msgSender(), amount);
        _burn(from, amount);
    }
}
