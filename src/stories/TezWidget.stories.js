import React, { useEffect, useState } from "react"
import { storiesOf } from "@storybook/react"
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import TezosDarkblockWidget from "../lib/TezWidget"

const stories = storiesOf("Tezos Darkblock Widget tester", module)

const cb = (param1) => {
  // console.log('cb', param1)
}

stories.add("App", () => {
  const Widget = () => {
    const [wallet, setWallet] = useState(null)
    const Tezos = new TezosToolkit("https://mainnet-tezos.giganode.io");

    const tezosWallet = new BeaconWallet({
      name: 'darkblock.io'
    });
    Tezos.setWalletProvider(tezosWallet);

    useEffect(async () => {
      await tezosWallet.clearActiveAccount();
      Tezos.setWalletProvider(tezosWallet);
      setWallet(tezosWallet)
    }, [])

    return (
      <div>
        {wallet && (
          <TezosDarkblockWidget
            contractAddress="KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS"
            tokenId="68015"
            wa={wallet}
            cb={cb}
            config={{
              customCssClass: "",
              debug: true,
              imgViewer: {
                showRotationControl: true,
                autoHideControls: true,
                controlsFadeDelay: true,
              },
            }}
          />
        )}
      </div>
    )
  }

  return <Widget />
})