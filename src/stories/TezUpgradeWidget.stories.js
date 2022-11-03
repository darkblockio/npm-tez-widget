import React, { useEffect, useState } from "react"
import { storiesOf } from "@storybook/react"
import { TezosToolkit } from "@taquito/taquito"
import { BeaconWallet } from "@taquito/beacon-wallet"
import TezosUpgradeWidget from "../lib/TezUpgradeWidget"

const stories = storiesOf("Tezos Upgrade Widget", module)

const cb = (param1) => {
  // console.log('cb', param1)
}

stories.add("Add Content", () => {
  const Widget = () => {
    const [wallet, setWallet] = useState(null)
    const Tezos = new TezosToolkit("https://mainnet-tezos.giganode.io")
    const [loaded, setLoaded] = useState(false)

    const apiKey = "" //Darkblock API key goes here

    const tezosWallet = new BeaconWallet({
      name: "darkblock.io",
    })
    Tezos.setWalletProvider(tezosWallet)

    useEffect(async () => {
      try {
        await tezosWallet.clearActiveAccount()
        Tezos.setWalletProvider(tezosWallet)
        setWallet(tezosWallet)
        setLoaded(true)
      } catch (error) {
        console.log("error", error)
        setWallet(null)
        setLoaded(true)
      }
    }, [])

    return (
      <div style={{ maxWidth: "700px" }}>
        {loaded && (
          <TezosUpgradeWidget
            apiKey={apiKey}
            contractAddress="KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS"
            tokenId="68015"
            wa={wallet}
            cb={cb}
            config={{
              customCssClass: "custom-class",
              debug: true,
              imgViewer: {
                showRotationControl: true,
                autoHideControls: true,
                controlsFadeDelay: true,
              },
            }}
            dev={false}
          />
        )}
      </div>
    )
  }

  return <Widget />
})
