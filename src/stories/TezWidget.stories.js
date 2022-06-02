import React, { useEffect, useState } from "react"
import { storiesOf } from "@storybook/react"
import { DAppClient, NetworkType } from "@airgap/beacon-sdk"
// import TezosDarkblockWidget from "../lib/TezWidget"
import TezosDarkblockWidget from "../../dist/index"

const stories = storiesOf("Tezos Darkblock Widget tester", module)

const dAppClient = new DAppClient({ name: "Beacon Example" })
const network = { type: NetworkType.MAINNET }

const cb = (param1) => {
  console.log(param1)
}

const connect = async () => {
  let activeAccount = await dAppClient.getActiveAccount()
  console.log("dAppClient: ", dAppClient)
  console.log("dAppClient.connectionStatus: ", dAppClient.connectionStatus)
  console.log("activeAccount: ", activeAccount)
  if (!activeAccount) {
    console.log("Not connected")
    try {
      const permissions = await dAppClient.requestPermissions({ network })
      console.log("Got permissions", permissions.address)
      console.log("Got permissions", permissions.publicKey)
    } catch (e) {
      console.log("Got error: ", e)
    }
  } else if (activeAccount.address) {
    console.log("Already connected:", activeAccount.address)
    const myAddress = activeAccount.address
    console.log("myAddress: ", myAddress)
  } else {
    console.log("activeAccount: ", activeAccount)
  }

  console.log("dAppClient: ", dAppClient)
}

stories.add("App", () => {
  const Widget = ({ wa }) => {
    const [connected, setConnected] = useState()

    useEffect(() => {
      console.log("event: ", wa.events)
    }, [wa.events.callbackMap.PERMISSION_REQUEST_SUCCESS])

    useEffect(() => {
      if (wa.connectionStatus) {
        setConnected(wa.connectionStatus)
        console.log("wa.connectionStatus: ", wa.connectionStatus)
      }

      console.log("wa: ", wa)
    }, [wa.connectionStatus])

    return (
      <div>
        <p>{connected}</p>

        <TezosDarkblockWidget
          contractAddress="KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS"
          tokenId="68015"
          wa={wa}
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
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => connect()}>connect</button>
      <button
        onClick={() => {
          console.log("disconnecting: ", dAppClient)
          dAppClient.disconnect()
        }}
      >
        disconnect
      </button>
      <button
        onClick={() => {
          dAppClient.getPeers().then((peers) => {
            if (peers.length > 0) {
              console.log("peers", peers)
            } else {
              console.log("no peers")
            }
          })
        }}
      >
        peers
      </button>
      {/* <button
        onClick={() => {
          dAppClient.on("PERMISSION_REQUEST_SUCCESS")
        }}
      >
        events
      </button> */}
      <h1>Widget Tester</h1>
      <p>{dAppClient.connectionStatus}</p>
      {dAppClient && <Widget wa={dAppClient} />}
    </div>
  )
})
