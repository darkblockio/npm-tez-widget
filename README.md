# Darkblock.io React Component Library - Tezos

## Getting Started 🚀

Install Darkblock's React Component Library using `yarn` or `npm`

```
yarn add @darkblock.io/tez-widget
```

```
npm i @darkblock.io/tez-widget --save
```

Once the library is installed, import or require components into your codebase, i.e:

```
import "@darkblock.io/tez-widget"

require("@darkblock.io/tez-widget")
```

...

## Tezos Widget Component

### Input

- **contractAddress:** contractAddress
- **tokenId:** id of the NFT in Tezos
- **w3:\*** tezos wallet object
- **cb:** callback function to be triggered on the widget's state change (optional)
- **config:** config object (optional)

**cb** function example, the callback function will have the widget's state passed as a parameter:

```
const cb = (param) => {
  console.log(param)
}
```

**config** object's default value:

```
{
  customCssClass: "",             // pass here a class name you plan to use
  debug: false,                   // debug flag to console.log some variables
  imgViewer: {                    // image viewer control parameters
    showRotationControl: true,
    autoHideControls: true,
    controlsFadeDelay: true,
  },
}
```

### Example

```
import { TezosDarkblockWidget } from "@darkblock.io/tez-widget"

const Widget = () => {
  ...

  const contractAddress = 'nft contract address'
  const tokenId = 'nft token id'
  
  return (
    <TezosDarkblockWidget
      contractAddress={contractAddress}
      tokenId={tokenId
      w3={web3}
      cb={(p) => console.log(p)}
      config={config}
    />
  )
}

export default Widget

```

### Example

```
import { TezosUpgradeWidget } from "@darkblock.io/tez-widget"

const Widget = () => {
  const apiKey = '** contact darkblock for apikey **'
  const contractAddress = 'nft contract address'
  const tokenId = 'nft token id'

  return (
    <TezosUpgradeWidget
      apiKey={apiKey} 
      contractAddress={contractAddress}
      tokenId={tokenId
      w3={web3}
      cb={(p) => console.log(p)}
      config={config}
    />
  )
}

export default Widget

```