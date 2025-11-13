import type { Project } from '@/types'

export const ERC20_TOKEN_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MyToken
 * @dev Simple ERC-20 Token implementation
 */
contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initialSupply * 10 ** uint256(_decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
}
`

export const DEPLOY_SCRIPT = `import { ethers } from 'ethers'

async function main() {
  // Configuration
  const tokenName = 'My Token'
  const tokenSymbol = 'MTK'
  const decimals = 18
  const initialSupply = 1000000 // 1 million tokens

  console.log('Deploying MyToken...')
  console.log('Parameters:', { tokenName, tokenSymbol, decimals, initialSupply })

  // TODO: Add deployment logic here
  // const MyToken = await ethers.getContractFactory('MyToken')
  // const token = await MyToken.deploy(tokenName, tokenSymbol, decimals, initialSupply)
  // await token.deployed()

  console.log('Token deployed successfully!')
  // console.log('Contract address:', token.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
`

export const README_CONTENT = `# My Token

A simple ERC-20 token implementation for NorChain.

## Features

- Standard ERC-20 functionality
- Transfer tokens
- Approve spending allowances
- Transfer from approved addresses

## Getting Started

### Compile

Click the "Compile" button in the Compiler panel to compile the contract.

### Deploy

1. Click the "Deploy" button in the toolbar
2. Enter the deployment parameters:
   - Token Name
   - Token Symbol
   - Decimals (usually 18)
   - Initial Supply
3. Confirm the transaction

### Interact

After deployment, you can interact with your token using the Contract Interaction panel.

## Testing

See \`tests/token.test.ts\` for test cases.

## License

MIT
`

export function createSampleProject(): Project {
  return {
    id: 'sample-erc20',
    name: 'My Token',
    description: 'ERC-20 Token Template',
    type: 'token',
    createdAt: new Date(),
    updatedAt: new Date(),
    files: [
      {
        id: '1',
        name: 'MyToken.sol',
        path: 'contracts/MyToken.sol',
        content: ERC20_TOKEN_CONTRACT,
        type: 'solidity',
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'deploy.ts',
        path: 'scripts/deploy.ts',
        content: DEPLOY_SCRIPT,
        type: 'typescript',
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'README.md',
        path: 'README.md',
        content: README_CONTENT,
        type: 'markdown',
        updatedAt: new Date(),
      },
    ],
    settings: {
      compilerVersion: '0.8.20',
      optimization: true,
      evmVersion: 'paris',
    },
  }
}
