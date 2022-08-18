import { char2Bytes, validateSignature } from "@taquito/utils"

const signTezosData = async (data, wallet) => {
  const activeAccount = await wallet.client.getActiveAccount()
  let address = null
  let permissions = null
  let signature = null

  if (activeAccount) {
    address = activeAccount.address
  } else {
    await wallet.clearActiveAccount()
    permissions = await wallet.client.requestPermissions()
    address = permissions.address
  }

  const payloadBytes = "0501" + char2Bytes(data)
  const payload = {
    signingType: "micheline",
    payload: payloadBytes,
    sourceAddress: address,
  }

  return new Promise((resolve, reject) => {
    try {
      const signData = async () => {
        const signedPayload = await wallet.client.requestSignPayload(payload)
        signature = encodeURIComponent(signedPayload.signature)
        const sigValidation = validateSignature(signature)

        if (!signedPayload && sigValidation === 3) {
          reject("error signing")
        } else {
          resolve(signature)
        }
      }
      signData()
    } catch (err) {
      reject(err)
    }
  })
}

export default signTezosData
