import React, { useEffect } from "react"
import { storiesOf } from "@storybook/react"
import { DAppClient, NetworkType } from "@airgap/beacon-sdk"
import TezosDarkblockWidget from "../lib/TezWidget"

const stories = storiesOf("Tezos Darkblock Widget", module)

stories.add("App", () => {
  const dAppClient = new DAppClient({ name: "Beacon Example" })
  const network = { type: NetworkType.MAINNET }

  const cb = (param1) => {
    console.log(param1)
  }

  const Widget = () => {
    useEffect(() => {
      const connect = async () => {
        const activeAccount = await dAppClient.getActiveAccount()
        console.log("dAppClient: ", dAppClient)
        console.log("dAppClient.connectionStatus: ", dAppClient.connectionStatus)
        console.log("activeAccount: ", activeAccount)
        if (!activeAccount) {
          console.log("Not connected")
          try {
            const permissions = await dAppClient.requestPermissions({ network })
            console.log("Got permissions", permissions.address)
          } catch (e) {
            console.log("Got error: ", e)
          }
        } else {
          console.log("Already connected:", activeAccount.address)
          const myAddress = activeAccount.address
          console.log("myAddress: ", myAddress)
        }

        console.log("dAppClient: ", dAppClient)
      }
      connect()
    }, [])

    return (
      <TezosDarkblockWidget
        contractAddress="KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS"
        tokenId="44635"
        wa={dAppClient}
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
    )
  }

  return (
    <div>
      <h1>Widget Tester</h1>
      <Widget />
    </div>
  )
})
