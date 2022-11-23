import React, { useState, useEffect } from "react"
import { Upgrader, utils, upgradeMachine } from "@darkblock.io/shared-components"
import { useMachine } from "@xstate/react"
import signTypedData from "../utils/signTypedData"

const platform = "Tezos"

const TezosUpgradeWidget = ({
  apiKey = null,
  contractAddress,
  tokenId,
  wa = null,
  cb = null,
  config = {
    customCssClass: "",
    debug: false,
    imgViewer: {
      showRotationControl: true,
      autoHideControls: true,
      controlsFadeDelay: true,
    },
  },
  dev = false,
}) => {
  const [state, send] = useMachine(() => upgradeMachine(tokenId, contractAddress, platform, dev))
  const [address, setAddress] = useState(null)
  const [keyAddress, setKeyAddress] = useState(null)
  const [mediaURL, setMediaURL] = useState("")
  const [stackMediaURLs, setStackMediaURLs] = useState("")
  const [epochSignature, setEpochSignature] = useState(null)

  const callback = (state) => {
    if (config.debug) console.log("Callback function called from widget. State: ", state)

    if (typeof cb !== "function") return

    try {
      cb(state)
    } catch (e) {
      console.error("Callback function error: ", e)
    }
  }

  useEffect(() => {
    callback(state.value)
    if (!apiKey) {
      send({ type: "NO_APIKEY" })
    }
    if (!wa) {
      send({ type: "NO_WALLET" })
    } else {
      if (state.value === "idle") {
        send({ type: "FETCH_CREATOR" })
      }

      if (state.value === "started" && wa) {
        const connectWallet = async () => {
          let tezAddress = null
          let tezPublicKey = null

          const activeAccount = await wa.client.getActiveAccount()
          if (!activeAccount) {
            await wa.clearActiveAccount()
            let permissions = await wa.client.requestPermissions()
            tezAddress = permissions.address
            tezPublicKey = permissions.publicKey
          } else {
            tezAddress = activeAccount.address
            tezPublicKey = activeAccount.publicKey
          }

          if (tezAddress) {
            setAddress(tezAddress)
            setKeyAddress(tezPublicKey)
            state.context.wallet_address = tezAddress
            state.context.tezos_public_key = tezPublicKey

            send({ type: "CONNECT_WALLET" })
          } else {
            send({ type: "CONNECT_FAILED" })
          }
        }

        connectWallet()
      }

      if (state.value === "wallet_connected") {
        send({ type: "VERIFY_OWNER" })
      }

      if (state.value === "verify_owner") {
        verifyOwnership()
      }

      if (state.value === "signing") {
        signFileUploadData()
      }
    }
  }, [state.value])

  const verifyOwnership = async () => {
    let creatorDataWithOwner

    try {
      setTimeout(async () => {
        creatorDataWithOwner = await utils.getCreator(contractAddress, tokenId, platform, dev)

        if (
          creatorDataWithOwner &&
          creatorDataWithOwner.creator_address &&
          creatorDataWithOwner.creator_address.toLowerCase() === address.toLowerCase()
        ) {
          send({ type: "SUCCESS" })
        } else {
          send({ type: "FAIL" })
        }
      }, 1000)
    } catch {
      send({ type: "FAIL" })
    }
  }

  const signFileUploadData = async () => {
    let signatureData = `${state.context.platform}${state.context.nftData.nft.contract}:${state.context.nftData.nft.token}${state.context.fileHash}`
    let msmSignature = `You are interacting with the Darkblock Protocol.\n\nPlease sign to upgrade this NFT.\n\nThis request will not trigger a blockchain transaction or cost any fee.\n\nAuthentication Token: ${signatureData}`

    await signTypedData(msmSignature, wa)
      .then((response) => {
        state.context.signature = response
        send({ type: "SIGNING_SUCCESS" })
      })
      .catch(() => {
        state.context.signature = null
        send({ type: "SIGNING_FAIL" })
      })
  }

  return (
    <Upgrader
      apiKey={apiKey}
      state={state}
      config={config}
      authenticate={() => send({ type: "SIGN" })}
      reset={(value) => {
        if (value === "finished") {
          send({ type: "COMPLETE" })
        } else {
          send({ type: "RESET" })
        }
      }}
      dev={dev}
    />
  )
}

export default TezosUpgradeWidget
