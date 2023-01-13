// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract Airdrop is Initializable, AccessControlUpgradeable {
    // -------------------------------------------------
    // ACCESS CONTROL
    // -------------------------------------------------
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");

    function isAdmin(address account) public view virtual returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    function isOperator(address account) public view virtual returns (bool) {
        return hasRole(OPERATOR_ROLE, account);
    }

    function addOperator(address account) public virtual onlyAdmin {
        grantRole(OPERATOR_ROLE, account);
    }

    // -------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------
    function initialize(
        address _operator,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _eventAmount
    ) public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(OPERATOR_ROLE, DEFAULT_ADMIN_ROLE);
        addOperator(_operator);
        startTime = _startTime;
        endTime = _endTime;
        eventAmount = _eventAmount * 1e18; // ether to wei
    }

    // -------------------------------------------------
    // MODIFIER
    // -------------------------------------------------
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Restricted to admins.");
        _;
    }

    modifier onlyOperator() {
        require(isOperator(msg.sender), "Restricted to operators.");
        _;
    }

    // -------------------------------------------------
    // STATE VARIABLES
    // -------------------------------------------------
    mapping(address => uint256) allowList;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public eventAmount;

    // -------------------------------------------------
    // MAIN FUNCTIONS
    // -------------------------------------------------

    function enlist(address payable[] memory _list) public onlyOperator {
        for (uint256 i = 0; i < _list.length; i++) {
            allowList[_list[i]] = 1;
        }
    }

    function withdraw() public onlyAdmin {
        payable(msg.sender).transfer(address(this).balance);
    }

    function checkQualified(address _someOne) public view returns (uint256) {
        if (allowList[_someOne] == 1) {
            return 0;
        } else if (allowList[_someOne] == 2) {
            return 3;
        }
        return 4;
    }

    function checkSchedule(uint256 _time) public view returns (uint256) {
        if (_time < startTime) {
            return 1;
        } else if (_time >= endTime) {
            return 2;
        } else {
            return 0;
        }
    }

    function checkRemain() public view returns (uint256) {
        if (address(this).balance < eventAmount) {
            return 5;
        }
        return 0;
    }

    function checkClaimable(address claimer) public view returns (uint256) {
        uint256 err = checkSchedule(getTime());
        if (err != 0) {
            return err;
        }
        err = checkQualified(claimer);
        if (err != 0) {
            return err;
        }

        err = checkRemain();
        if (err != 0) {
            return err;
        }
        return 0;
    }

    event ClaimFailed(
        address indexed addr,
        uint256 indexed code,
        string message
    );

    function emitFailure(address _addr, uint256 _code) internal {
        string memory message = "Unknown error.";
        if (_code == 1) {
            message = "Event has not started yet";
        } else if (_code == 2) {
            message = "Event has ended";
        } else if (_code == 3) {
            message = "Address has claim";
        } else if (_code == 4) {
            message = "Address is not qualified";
        } else if (_code == 5) {
            message = "Run ouf of airdrop funds";
        }

        emit ClaimFailed(_addr, _code, message);
    }

    event Claimed(address indexed addr);

    function claim() public returns (uint256) {
        uint256 err = checkClaimable(msg.sender);
        if (err != 0) {
            emitFailure(msg.sender, err);
            return err;
        }

        allowList[msg.sender] = 2;
        payable(msg.sender).transfer(eventAmount);
        emit Claimed(msg.sender);
        return 0;
    }

    function getTime() public view returns (uint256) {
        return block.timestamp;
    }

    // -------------------------------------------------
    // FALLBACK FUNCTIONS
    // -------------------------------------------------
    receive() external payable {}

    fallback() external payable {}
}
